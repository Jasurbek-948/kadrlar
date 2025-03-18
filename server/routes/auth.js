const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Token tekshiruv middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(403).json({ error: "Token kiritilmadi" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token tekshiruvida xatolik:", error);
    return res.status(403).json({ error: "Noto'g'ri yoki yaroqsiz token!" });
  }
};

// Register Route
router.post("/register", async (req, res) => {
  const { username, password, country, isBusiness } = req.body;
  try {
    console.log("Register so'rov:", req.body);
    if (!username || !password || !country) {
      return res.status(400).json({ error: "Username, password va country kiritilishi shart!" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Bu username allaqachon mavjud!" });
    }

    const user = new User({
      username,
      password, // Parol hash qilinadi (pre hook orqali)
      country,
      isBusiness: isBusiness || false,
    });

    await user.save();
    res.status(201).json({ message: "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi!" });
  } catch (error) {
    console.error("Register xatosi:", error);
    res.status(500).json({ error: "Server xatoligi!" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log("Login so'rov:", req.body);
    if (!username || !password) {
      return res.status(400).json({ error: "Username va password kiritilishi shart!" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.log("Foydalanuvchi topilmadi:", username);
      return res.status(400).json({ error: "Noto'g'ri username yoki parol!" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Parol mos kelmadi:", password);
      return res.status(400).json({ error: "Noto'g'ri username yoki parol!" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, country: user.country },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("Token generatsiya qilindi:", token);
    res.json({ token, user: { username: user.username, country: user.country } });
  } catch (error) {
    console.error("Login xatosi:", error);
    res.status(500).json({ error: "Server xatoligi!" });
  }
});

// Muhofaza qilinadigan router (test uchun)
router.get("/protected-route", authenticateToken, (req, res) => {
  res.json({ message: "Muvaffaqiyatli kirildi", user: req.user });
});

module.exports = router;