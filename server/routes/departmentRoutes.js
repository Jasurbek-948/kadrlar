const express = require("express");
const router = express.Router();
const positionsByDepartment = require("../config/positionsByDepartment");
const authenticateToken = require("../middleware/auth"); // Token tekshiruvi middleware

// Barcha bo'limlarni olish
router.get("/", authenticateToken, (req, res) => {
  try {
    console.log("GET /api/departments so'rovi:", req.headers.authorization); // Debug log
    const departments = Object.keys(positionsByDepartment).map((dept) => ({
      name: dept,
      positions: positionsByDepartment[dept].positions.map((pos) => ({
        name: pos.name,
        max: pos.max,
      })),
      maxEmployees: positionsByDepartment[dept].maxEmployees,
    }));
    res.status(200).json(departments);
  } catch (error) {
    console.error("Bo'limlarni olishda xatolik:", error.message);
    res.status(500).json({ error: "Server xatoligi yuz berdi!", details: error.message });
  }
});

module.exports = router;