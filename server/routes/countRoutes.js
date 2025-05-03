const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const authenticateToken = require("../middleware/auth");
const positionsByDepartment = require("../config/positionsByDepartment");

router.get("/", authenticateToken, async (req, res) => {
    try {
        console.log("GET /api/employee-counts so'rovi:", req.headers.authorization);

        // Faol xodimlarni olish
        const employees = await Employee.find({ isArchived: false });
        console.log("Faol xodimlar soni:", employees.length);

        // Xodimlarni bo'lim va lavozim bo'yicha guruhlash
        const counts = {};
        employees.forEach((employee) => {
            const department = employee.jobData.department;
            const position = employee.jobData.position;
            if (!counts[department]) counts[department] = {};
            counts[department][position] = (counts[department][position] || 0) + 1;
        });
        console.log("Hisoblangan xodimlar soni (amalda):", counts);

        // Bo‘limlarni array formatida tayyorlash
        const data = Object.keys(positionsByDepartment).map(department => {
            const deptData = positionsByDepartment[department];
            const maxEmployees = deptData.maxEmployees || 0; // Shtat bo'yicha maksimal son
            const actualEmployees = counts[department] ? Object.values(counts[department]).reduce((sum, count) => sum + count, 0) : 0; // Amalda xodimlar soni

            // Bo‘limni qaysi toifaga tegishli ekanligini aniqlash
            const isBoshqaruv = department.toLowerCase().includes('boshqaruv') || department.toLowerCase().includes('direktor');
            const isMutaxassis = department.toLowerCase().includes('mutaxassis') || department.toLowerCase().includes('muhandis');
            const isTexnik = department.toLowerCase().includes('texnik') || department.toLowerCase().includes('texnologik');
            const isIshlabChiqarish = department.toLowerCase().includes('ishlab chiqarish') || department.toLowerCase().includes('sex') || department.toLowerCase().includes('gidro');
            const isXizmat = department.toLowerCase().includes('xizmat') || department.toLowerCase().includes('farrosh') || department.toLowerCase().includes('qorovul');

            return {
                department: department,
                boshqaruvShtat: isBoshqaruv ? maxEmployees : 0,
                boshqaruvAmalda: isBoshqaruv ? actualEmployees : 0,
                mutaxassisShtat: isMutaxassis ? maxEmployees : 0,
                mutaxassisAmalda: isMutaxassis ? actualEmployees : 0,
                texnikShtat: isTexnik ? maxEmployees : 0,
                texnikAmalda: isTexnik ? actualEmployees : 0,
                ishlabChiqarishShtat: isIshlabChiqarish ? maxEmployees : 0,
                ishlabChiqarishAmalda: isIshlabChiqarish ? actualEmployees : 0,
                xizmatShtat: isXizmat ? maxEmployees : 0,
                xizmatAmalda: isXizmat ? actualEmployees : 0,
                totalShtat: maxEmployees,
                totalAmalda: actualEmployees,
            };
        });

        // Jami hisoblash
        const total = data.reduce(
            (acc, curr) => {
                acc.boshqaruvShtat += curr.boshqaruvShtat;
                acc.boshqaruvAmalda += curr.boshqaruvAmalda;
                acc.mutaxassisShtat += curr.mutaxassisShtat;
                acc.mutaxassisAmalda += curr.mutaxassisAmalda;
                acc.texnikShtat += curr.texnikShtat;
                acc.texnikAmalda += curr.texnikAmalda;
                acc.ishlabChiqarishShtat += curr.ishlabChiqarishShtat;
                acc.ishlabChiqarishAmalda += curr.ishlabChiqarishAmalda;
                acc.xizmatShtat += curr.xizmatShtat;
                acc.xizmatAmalda += curr.xizmatAmalda;
                acc.totalShtat += curr.totalShtat;
                acc.totalAmalda += curr.totalAmalda;
                return acc;
            },
            {
                boshqaruvShtat: 0,
                boshqaruvAmalda: 0,
                mutaxassisShtat: 0,
                mutaxassisAmalda: 0,
                texnikShtat: 0,
                texnikAmalda: 0,
                ishlabChiqarishShtat: 0,
                ishlabChiqarishAmalda: 0,
                xizmatShtat: 0,
                xizmatAmalda: 0,
                totalShtat: 0,
                totalAmalda: 0,
            }
        );

        // Ma'lumotlarni to'g'ri formatda qaytarish
        res.status(200).json({ data, total });
    } catch (error) {
        console.error("Xodimlar sonini hisoblashda xatolik:", error.message);
        res.status(500).json({ message: "Xodimlar sonini hisoblashda xatolik!", details: error.message });
    }
});

module.exports = router;