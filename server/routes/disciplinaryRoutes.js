const express = require("express");
const router = express.Router();
const Disciplinary = require("../models/disciplinaryActionSchema");
const mongoose = require("mongoose");
const authenticateToken = require("../middleware/auth"); // Token tekshiruvi middleware

// Barcha jazo yozuvlarini olish uchun /api/disciplinary
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("GET /api/disciplinary so'rovi:", req.headers.authorization); // Debug log
    const disciplinaryRecords = await Disciplinary.find();
    res.status(200).json(disciplinaryRecords);
  } catch (error) {
    console.error("Jazo yozuvlarini olishda xatolik:", error.message);
    res.status(500).json({ error: "Server xatoligi!", details: error.message });
  }
});

// Yangi jazo yozuvi qo'shish
router.post("/add", authenticateToken, async (req, res) => {
  const { employeeId, fullName, position, orderDetails, orderDate, reason } = req.body;

  // 1-qadam: Majburiy maydonlarni tekshirish
  if (!employeeId || !fullName || !position || !orderDetails || !orderDate || !reason) {
    return res.status(400).json({ error: "Barcha maydonlar to'ldirilishi shart!" });
  }

  // 2-qadam: employeeId ni ObjectId ga aylantirishdan oldin validatsiya qilish
  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ error: "Noto'g'ri employeeId formati!" });
  }

  try {
    console.log("POST /api/disciplinary/add so'rovi:", req.body); // Debug log
    // 3-qadam: To'g'ri ObjectId yaratish
    const validEmployeeId = new mongoose.Types.ObjectId(employeeId);

    const disciplinaryData = new Disciplinary({
      employeeId: validEmployeeId, // To'g'ri ObjectId
      fullName,
      position,
      orderDetails,
      orderDate: new Date(orderDate),
      reason,
    });

    const savedDisciplinary = await disciplinaryData.save();
    res.status(201).json({ message: "Jazo muvaffaqiyatli qo'shildi!", data: savedDisciplinary });
  } catch (error) {
    console.error("Jazo qo'shishda xatolik:", error.message);
    res.status(500).json({ error: "Server xatoligi!", details: error.message });
  }
});

// Jazo yozuvini yangilash
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { employeeId, fullName, position, orderDetails, orderDate, reason } = req.body;

  // ID validatsiyasi
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Noto'g'ri ID formati!" });
  }

  // Agar employeeId berilgan bo'lsa, uning to'g'ri formatda ekanligini tekshirish
  if (employeeId && !mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ error: "Noto'g'ri employeeId formati!" });
  }

  try {
    console.log(`PUT /api/disciplinary/${id} so'rovi:`, req.body); // Debug log
    const updateData = {
      fullName,
      position,
      orderDetails,
      orderDate: orderDate ? new Date(orderDate) : undefined,
      reason,
    };

    // Agar employeeId berilgan bo'lsa, uni ObjectId ga aylantirib qo'shamiz
    if (employeeId) {
      updateData.employeeId = new mongoose.Types.ObjectId(employeeId);
    }

    const updatedDisciplinary = await Disciplinary.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDisciplinary) {
      return res.status(404).json({ message: "Jazo yozuvi topilmadi!" });
    }
    res.status(200).json({ message: "Jazo muvaffaqiyatli yangilandi!", data: updatedDisciplinary });
  } catch (error) {
    console.error("Jazo yangilashda xatolik:", error.message);
    res.status(500).json({ error: "Server xatoligi!", details: error.message });
  }
});

// Jazo yozuvini o'chirish
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Noto'g'ri ID formati!" });
  }

  try {
    console.log(`DELETE /api/disciplinary/${id} so'rovi:`); // Debug log
    const disciplinaryRecord = await Disciplinary.findByIdAndDelete(id);
    if (!disciplinaryRecord) {
      return res.status(404).json({ message: "Jazo yozuvi topilmadi!" });
    }
    res.status(200).json({ message: "Jazo muvaffaqiyatli o'chirildi!" });
  } catch (error) {
    console.error("Jazo o'chirishda xatolik:", error.message);
    res.status(500).json({ error: "Server xatoligi!", details: error.message });
  }
});

module.exports = router;