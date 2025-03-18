const Employee = require("../models/Employee");
const positionsByDeparment = require("../config/positionsByDeparment");

const addEmployee = async (req, res) => {
  try {
    const { passportData, jobData, educationData } = req.body;

    if (!passportData || !jobData || !educationData) {
      return res.status(400).json({ error: "Barcha bo'limlar to'ldirilishi kerak!" });
    }

    const department = jobData.department;
    const position = jobData.position;

    // Bo'limni tekshirish
    const departmentData = positionsByDeparment[department];
    if (!departmentData) {
      return res.status(400).json({ error: "Noto'g'ri bo'lim tanlandi!" });
    }

    // Lavozimni tekshirish
    const positionData = departmentData.positions.find((pos) => pos.name === position);
    if (!positionData) {
      return res.status(400).json({ error: "Noto'g'ri lavozim tanlandi!" });
    }

    // Lavozim uchun xodimlar sonini hisoblash
    const countByPosition = await Employee.countDocuments({
      "jobData.department": department,
      "jobData.position": position,
    });

    if (countByPosition >= positionData.max) {
      return res.status(400).json({
        error: `Bu lavozim uchun maksimal xodimlar soni (${positionData.max}) yetib bo'lgan!`,
      });
    }

    // Bo'lim bo'yicha umumiy xodimlar sonini tekshirish
    const countByDepartment = await Employee.countDocuments({
      "jobData.department": department,
    });

    if (countByDepartment >= departmentData.maxEmployees) {
      return res.status(400).json({
        error: `Bu bo'lim uchun maksimal xodimlar soni (${departmentData.maxEmployees}) yetib bo'lgan!`,
      });
    }

    // Yangi xodimni qo'shish
    const newEmployee = new Employee({
      passportData,
      jobData,
      educationData,
      vacationStatus: {
        checked: false,
        vacationDays: 0,
      },
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (err) {
    console.error("Xodimni qo'shishda xatolik:", err);
    res.status(500).json({ error: "Xodimni qo'shishda xatolik!" });
  }
};


module.exports = {
  addEmployee,
};


