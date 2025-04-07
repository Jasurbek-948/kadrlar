// routes/countRoutes.js
const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const authenticateToken = require("../middleware/auth");

router.get("/", authenticateToken, async (req, res) => {
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