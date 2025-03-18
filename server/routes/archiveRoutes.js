const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// Xodimni arxivlash
router.put("/archive/:id", async (req, res) => {
    const { id } = req.params;
  
    // ObjectId ni tekshirish
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Noto'g'ri xodim ID formati!" });
    }
  
    try {
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(404).json({ message: "Xodim topilmadi!" });
      }
  
      employee.isArchived = true;
      await employee.save();
  
      res.status(200).json({ message: "Xodim arxivga ko'chirildi!" });
    } catch (error) {
      console.error("Xatolik:", error);
      res.status(500).json({ error: error.message || "Server xatoligi!" });
    }
  });

// Arxivlangan xodimlarni olish
router.get("/employees/archived", async (req, res) => {
  try {
    const archivedEmployees = await Employee.find({ isArchived: true });
    res.status(200).json(archivedEmployees);
  } catch (error) {
    console.error("Arxiv ma'lumotlarini olishda xatolik:", error);
    res.status(500).json({ error: "Arxiv ma'lumotlarini olishda xatolik" });
  }
});

module.exports = router;