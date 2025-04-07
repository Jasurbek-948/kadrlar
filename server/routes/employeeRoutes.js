const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const upload = require("../config/multerConfig");
const positionsByDepartment = require("../config/positionsByDepartment");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const authenticateToken = require("../middleware/auth");
                     
// Barcha xodimlarni olish (arxivlanmaganlar)
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("GET /api/employees so'rovi:", req.headers.authorization);
    const employees = await Employee.find({ isArchived: false });
    console.log("Topilgan xodimlar soni:", employees.length);
    if (employees.length === 0) {
      console.log("Arxivlanmagan xodimlar topilmadi");
      return res.status(200).json([]);
    }
    res.status(200).json(employees);
  } catch (err) {
    console.error("Xodimlarni olishda xatolik:", err.message);
    res.status(500).json({ error: "Xodimlarni olishda xatolik!", details: err.message });
  }
});

// ID bo'yicha xodimni olish
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    console.log(`GET /api/employees/${req.params.id} so'rovi:`);
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Xodim topilmadi!" });
    res.status(200).json(employee);
  } catch (err) {
    console.error("Xodimni olishda xatolik:", err.message);
    res.status(500).json({ error: "Server xatoligi", details: err.message });
  }
});

// Xodim ma'lumotlarini to'liq yangilash
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    console.log(`PUT /api/employees/${req.params.id} so'rovi:`, req.body);
    const { id } = req.params;
    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Xodim topilmadi!" });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error("Xodimni yangilashda xatolik:", error.message);
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: validationErrors.join(" ") });
    }
    if (error.message.includes("Bunday xodim oldin ro‘yxatdan o‘tgan")) {
      return res.status(400).json({ message: "Bunday xodim oldin ro‘yxatdan o‘tgan!" });
    }
    res.status(500).json({ message: "Serverda xatolik yuz berdi!", details: error.message });
  }
});

// Xodimning ta'til holatini yangilash
router.put("/:id/vacation", authenticateToken, async (req, res) => {
  try {
    console.log(`PUT /api/employees/${req.params.id}/vacation so'rovi:`, req.body);
    const { vacationStatus, vacationStart, vacationEnd } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Xodim topilmadi!" });
    }

    const validVacationStatuses = [
      "none",
      "mexnat tatili",
      "mexnatga layoqatsizlik davri",
      "ish xaqi saqlanmagan tatil",
      "o'quv tatili",
      "bir oylik xizmat",
      "homiladorlik va tug'ruqdan keyingi ta'til",
      "bola parvarish ta'tili",
    ];

    if (!vacationStatus || !validVacationStatuses.includes(vacationStatus)) {
      return res.status(400).json({
        error: `${vacationStatus || "undefined"} is not a valid enum value for vacationStatus!`,
      });
    }

    const restrictedStatuses = ["homiladorlik va tug'ruqdan keyingi ta'til", "bola parvarish ta'tili"];
    if (restrictedStatuses.includes(vacationStatus) && employee.passportData.gender !== "Ayol") {
      return res.status(400).json({
        error: "Homiladorlik va tug'ruqdan keyingi ta'til yoki bola parvarish ta'tili faqat jinsi Ayol bo'lgan xodimlar uchun mavjud!",
      });
    }

    if (vacationStart && vacationEnd) {
      const startDate = new Date(vacationStart);
      const endDate = new Date(vacationEnd);
      if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
        return res.status(400).json({
          error: "Noto'g'ri ta'til muddati: Boshlanish sanasi tugash sanasidan oldin bo'lishi kerak!",
        });
      }
      employee.vacationStart = startDate;
      employee.vacationEnd = endDate;
    } else if (vacationStatus !== "none" && (!vacationStart || !vacationEnd)) {
      return res.status(400).json({
        error: "Ta'til muddati (boshlanish va tugash sanasi) kiritilishi kerak!",
      });
    } else if (vacationStatus === "none") {
      employee.vacationStart = null;
      employee.vacationEnd = null;
    }

    employee.vacationStatus = vacationStatus;
    await employee.save();

    res.status(200).json({
      vacationStatus: employee.vacationStatus,
      vacationStart: employee.vacationStart,
      vacationEnd: employee.vacationEnd,
    });
  } catch (error) {
    console.error("Ta'til holatini yangilashda xatolik:", error.message);
    res.status(500).json({ error: "Server xatoligi yuz berdi!", details: error.message });
  }
});

router.get("/check-insp/:insp", async (req, res) => {
  try {
    const { insp } = req.params;
    const employee = await Employee.findOne({ "passportData.insp": insp });
    if (employee) {
      return res.status(400).json({ message: "Bunday xodim oldin ro‘yxatdan o‘tgan!" });
    }
    res.status(200).json({ message: "INPS noyob!" });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi!" });
  }
});

// Yangi xodim qo'shish
router.post("/", authenticateToken, async (req, res) => {
  try {
    console.log("POST /api/employees so'rovi:", req.body);
    const { passportData, jobData, educationData } = req.body;

    if (!passportData || !jobData || !educationData) {
      return res.status(400).json({ error: "Barcha bo'limlar (passportData, jobData, educationData) to'ldirilishi kerak!" });
    }

    const requiredFields = {
      passportData: ["fullName", "inn", "insp", "address", "passportSeries", "passportNumber", "issuedBy", "issuedDate", "birthDate", "gender", "birthPlace", "nationality", "phoneNumber"],
      jobData: ["department", "position", "grade", "salary", "employmentContract", "hireDate", "orderNumber"],
      educationData: ["educationLevel", "institution", "specialty", "graduationYear", "diplomaNumber"],
    };

    const errors = [];
    Object.keys(requiredFields).forEach((section) => {
      requiredFields[section].forEach((field) => {
        if (!req.body[section][field] || req.body[section][field] === "") {
          errors.push(`${section}.${field} maydoni to'ldirilmagan!`);
        }
      });
    });

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const department = jobData.department;
    const position = jobData.position;

    const departmentData = positionsByDepartment[department];
    if (!departmentData) {
      return res.status(400).json({ error: "Noto'g'ri bo'lim tanlandi!" });
    }

    const positionData = departmentData.positions.find((pos) => pos.name === position);
    if (!positionData) {
      return res.status(400).json({ error: "Noto'g'ri lavozim tanlandi!" });
    }

    const departmentCount = await Employee.countDocuments({
      "jobData.department": department,
      isArchived: false,
    });
    if (departmentCount >= departmentData.maxEmployees) {
      return res.status(400).json({
        error: `Ushbu bo'lim uchun maksimal xodimlar soni (${departmentData.maxEmployees}) yetib bo'lgan!`,
      });
    }

    const positionCount = await Employee.countDocuments({
      "jobData.department": department,
      "jobData.position": position,
      isArchived: false,
    });
    if (positionCount >= positionData.max) {
      return res.status(400).json({
        error: `Bu lavozim uchun maksimal xodimlar soni (${positionData.max}) yetib bo'lgan!`,
      });
    }

    const newEmployee = new Employee({
      passportData,
      jobData,
      educationData,
      vacationStatus: "none",
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (err) {
    console.error("Xodimni qo'shishda xatolik:", err.message);
    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({ error: validationErrors.join(" ") });
    }
    if (err.message.includes("Bunday xodim oldin ro‘yxatdan o‘tgan")) {
      return res.status(400).json({ error: "Bunday xodim oldin ro‘yxatdan o‘tgan!" });
    }
    res.status(500).json({ error: "Serverda xatolik yuz berdi!", details: err.message });
  }
});

// Hujjatlarni qo'shish uchun API
router.post("/:id/documents", authenticateToken, upload.array("files", 10), async (req, res) => {
  try {
    console.log(`POST /api/employees/${req.params.id}/documents so'rovi:`, req.body);
    const { id } = req.params;
    const { names } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    if (!Array.isArray(names) || names.length !== files.length) {
      return res.status(400).json({ message: "Document names must match the number of files." });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const documents = files.map((file, index) => ({
      fileName: names[index],
      filePath: `/uploads/${file.filename}`,
      uploadedAt: new Date(),
    }));

    if (documents.some((doc) => !doc.fileName || !doc.filePath)) {
      return res.status(400).json({ message: "Invalid fileName or filePath in documents." });
    }

    employee.documents.push(...documents);
    await employee.save();

    res.status(200).json({ message: "Documents added successfully.", employee });
  } catch (error) {
    console.error("Hujjat qo'shishda xatolik:", error.message);
    res.status(500).json({ message: "Server error.", details: error.message });
  }
});

// Fayllarni olish
router.get("/:id/documents", authenticateToken, async (req, res) => {
  try {
    console.log(`GET /api/employees/${req.params.id}/documents so'rovi:`);
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.status(200).json({ documents: employee.documents });
  } catch (error) {
    console.error("Hujjatlarni olishda xatolik:", error.message);
    res.status(500).json({ message: "Server error.", details: error.message });
  }
});

// Fayllarni o'chirish
router.delete("/:id/documents/:fileName", authenticateToken, async (req, res) => {
  try {
    console.log(`DELETE /api/employees/${req.params.id}/documents/${req.params.fileName} so'rovi:`);
    const { id, fileName } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const documentIndex = employee.documents.findIndex((doc) => doc.fileName === fileName);
    if (documentIndex === -1) {
      return res.status(404).json({ message: "Document not found." });
    }

    const [removedDocument] = employee.documents.splice(documentIndex, 1);
    await employee.save();

    const filePath = path.join(__dirname, "..", removedDocument.filePath);
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Failed to delete file: ${filePath}`, err.message);
    });

    res.status(200).json({ message: "Document deleted successfully.", document: removedDocument });
  } catch (error) {
    console.error("Hujjatni o'chirishda xatolik:", error.message);
    res.status(500).json({ message: "Server error.", details: error.message });
  }
});

// Xodimni arxivga ko'chirish
router.put("/archive/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Noto'g'ri xodim ID formati!" });
  }

  try {
    console.log(`PUT /api/employees/archive/${id} so'rovi:`);
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Xodim topilmadi!" });
    }

    employee.isArchived = true;
    employee.archiveDate = new Date();
    await employee.save();

    res.status(200).json({ message: "Xodim arxivga ko'chirildi!" });
  } catch (error) {
    console.error("Xodimni arxivga ko'chirishda xatolik:", error.message);
    res.status(500).json({ error: "Server xatoligi!", details: error.message });
  }
});

// Xodimlar sonini hisoblash endpoint’i
router.get("/employee-counts", authenticateToken, async (req, res) => {
  try {
    console.log("GET /api/employee-counts so'rovi:", req.headers.authorization);
    const employees = await Employee.find({ isArchived: false });
    console.log("Faol xodimlar soni:", employees.length);

    const counts = {};
    employees.forEach((employee) => {
      const department = employee.jobData.department;
      const position = employee.jobData.position;
      if (!counts[department]) counts[department] = {};
      counts[department][position] = (counts[department][position] || 0) + 1;
    });

    console.log("Hisoblangan xodimlar soni:", counts);
    res.status(200).json(counts);
  } catch (error) {
    console.error("Xodimlar sonini hisoblashda xatolik:", error.message);
    res.status(500).json({ message: "Xodimlar sonini hisoblashda xatolik!", details: error.message });
  }
});

module.exports = router;