import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartments, fetchEmployees } from '../../../redux/slices/employeeSlice';
import './Analitika.scss';

// Lavozimlarni toifalarga ajratish funksiyasi
const categorizePosition = (positionName) => {
    const name = positionName.toLowerCase();
    if (name.includes('direktor') || name.includes('boshlig‘i') || name.includes('o‘rinbosari') ||
        name.includes('bosh muxandis') || name.includes('yetakchi')) {
        return 'Rahbarlar';
    }
    if (name.includes('muhandis') || name.includes('mutaxassis') || name.includes('menejer') ||
        name.includes('iqtisodchi') || name.includes('yurist') || name.includes('geodezist') ||
        name.includes('gidrolog')) {
        return 'Mutaxassislar';
    }
    if (name.includes('texnik') || name.includes('mashinist') || name.includes('elektromontyor') ||
        name.includes('usta') || name.includes('chilangar') || name.includes('payvandchi') ||
        name.includes('tokar') || name.includes('operator')) {
        return 'Texnik xodimlar';
    }
    if (name.includes('farrosh') || name.includes('haydovchi') || name.includes('qorovul') ||
        name.includes('bog‘bon') || name.includes('tibbiyot') || name.includes('ombor mudiri')) {
        return 'Xizmat ko‘rsatuvchi xodimlar';
    }
    if (name.includes('ishlab chiqarish') || name.includes('ekspluatasiya') || name.includes('smena boshlig‘i')) {
        return 'Ishlab chiqarish xodimlari';
    }
    return 'Mutaxassislar'; // Default sifatida Mutaxassislar
};

// Yoshni hisoblash funksiyasi
const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date('2025-05-04'); // Current date as per context
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const Analitika = () => {
    const dispatch = useDispatch();
    const employees = useSelector((state) => state.employees.employees);
    const departmentsStatus = useSelector((state) => state.employees.departmentsStatus);
    const departmentsError = useSelector((state) => state.employees.departmentsError);
    const employeesStatus = useSelector((state) => state.employees.status);
    const employeesError = useSelector((state) => state.employees.error);

    // Yosh bo‘yicha filtr uchun holatlar
    const [minAge, setMinAge] = useState('');
    const [maxAge, setMaxAge] = useState('');

    // Bo‘limlar va xodimlarni olish
    useEffect(() => {
        if (departmentsStatus === 'idle') {
            dispatch(fetchDepartments());
        }
        if (employeesStatus === 'idle') {
            dispatch(fetchEmployees());
        }
    }, [departmentsStatus, employeesStatus, dispatch]);

    // Xodimlarni filtr qilish (yosh bo‘yicha)
    const filteredEmployees = employees.filter((emp) => {
        const age = calculateAge(emp.passportData?.birthDate);
        const min = minAge ? parseInt(minAge) : 0;
        const max = maxAge ? parseInt(maxAge) : 100;
        return age >= min && age <= max;
    });

    // Kategoriyalar bo‘yicha statistika hisoblash
    const calculateStats = (filteredEmps) => {
        const totalEmployees = filteredEmps.length;
        const womenCount = filteredEmps.filter((emp) => emp.passportData?.gender === 'Ayol').length;

        const categoryCounts = {
            Rahbarlar: { total: 0, women: 0 },
            Mutaxassislar: { total: 0, women: 0 },
            'Texnik xodimlar': { total: 0, women: 0 },
            'Xizmat ko‘rsatuvchi xodimlar': { total: 0, women: 0 },
            'Ishlab chiqarish xodimlari': { total: 0, women: 0 },
        };

        filteredEmps.forEach((emp) => {
            const category = categorizePosition(emp.jobData?.position || '');
            categoryCounts[category].total += 1;
            if (emp.passportData?.gender === 'Ayol') {
                categoryCounts[category].women += 1;
            }
        });

        return { totalEmployees, womenCount, categoryCounts };
    };

    // Ko‘rsatkichlar uchun ma'lumotlarni tayyorlash
    const tableData = [
        {
            no: '1',
            indicator: 'Jami Hodimlar soni',
            stats: calculateStats(filteredEmployees),
        },
        {
            no: '2',
            indicator: 'Yoshi Bo‘yicha',
            stats: { totalEmployees: 0, womenCount: 0, categoryCounts: {} }, // Placeholder for group header
        },
        {
            no: '2.A',
            indicator: '16-29 yosh',
            stats: calculateStats(filteredEmployees.filter((emp) => {
                const age = calculateAge(emp.passportData?.birthDate);
                return age >= 16 && age <= 29;
            })),
        },
        {
            no: '2.B',
            indicator: '30-39 yosh',
            stats: calculateStats(filteredEmployees.filter((emp) => {
                const age = calculateAge(emp.passportData?.birthDate);
                return age >= 30 && age <= 39;
            })),
        },
        {
            no: '2.C',
            indicator: '40-49 yosh',
            stats: calculateStats(filteredEmployees.filter((emp) => {
                const age = calculateAge(emp.passportData?.birthDate);
                return age >= 40 && age <= 49;
            })),
        },
        {
            no: '2.E',
            indicator: '60 yosh va undan kattalar',
            stats: calculateStats(filteredEmployees.filter((emp) => {
                const age = calculateAge(emp.passportData?.birthDate);
                return age >= 60;
            })),
        },
        {
            no: '3',
            indicator: 'Ma‘lumoti bo‘yicha',
            stats: { totalEmployees: 0, womenCount: 0, categoryCounts: {} }, // Placeholder
        },
        {
            no: '3.a',
            indicator: 'Oliy',
            stats: calculateStats(filteredEmployees.filter((emp) => emp.educationData?.educationLevel === 'Oliy')),
        },
        {
            no: '3.b',
            indicator: 'O‘rta-maxsus',
            stats: calculateStats(filteredEmployees.filter((emp) => emp.educationData?.educationLevel === 'O‘rta-maxsus')),
        },
        {
            no: '3.c',
            indicator: 'O‘rta va to‘liqsiz o‘rta',
            stats: calculateStats(filteredEmployees.filter((emp) =>
                emp.educationData?.educationLevel === 'O‘rta' || emp.educationData?.educationLevel === 'To‘liqsiz o‘rta')),
        },
        {
            no: '4',
            indicator: 'Ilmiy darajasi bo‘yicha',
            stats: { totalEmployees: 0, womenCount: 0, categoryCounts: {} }, // Placeholder
        },
        {
            no: '4.a',
            indicator: 'Fan nomzodi / PhD',
            stats: calculateStats(filteredEmployees.filter((emp) => emp.educationData?.academicTitle === 'Fan nomzodi' || emp.educationData?.academicTitle === 'PhD')),
        },
        {
            no: '4.b',
            indicator: 'Fan doktori DSc',
            stats: calculateStats(filteredEmployees.filter((emp) => emp.educationData?.academicTitle === 'DSc')),
        },
        {
            no: '5',
            indicator: 'Hisobot davrida malakasi oshirilganlar soni',
            stats: calculateStats(filteredEmployees.filter((emp) => emp.trainingStatus?.completed)), // Placeholder
        },
        {
            no: '6',
            indicator: 'Bolani parvarishlash ta‘tilidagilar soni',
            stats: calculateStats(filteredEmployees.filter((emp) => emp.vacationStatus === 'bolani parvarishlash ta‘tili')),
        },
        {
            no: '7',
            indicator: 'Hisobot davrida bola parvarishi ta‘tilidan qaytganlar soni',
            stats: calculateStats(filteredEmployees.filter((emp) => emp.vacationStatus === 'returned_from_maternity')), // Placeholder
        },
        {
            no: '8',
            indicator: 'Pensionerlar soni',
            stats: calculateStats(filteredEmployees.filter((emp) => calculateAge(emp.passportData?.birthDate) >= 65)), // Assumption: 65+ for pensioners
        },
        {
            no: '9',
            indicator: 'Nogironlar soni (II-guruh)',
            stats: calculateStats(filteredEmployees.filter((emp) => emp.disabilityStatus === 'II-guruh')), // Placeholder
        },
        {
            no: '10',
            indicator: 'Hisobot davrida ishga qabul qilinganlar soni',
            stats: calculateStats(filteredEmployees.filter((emp) => {
                const hireDate = new Date(emp.jobData?.hireDate);
                return hireDate >= new Date('2025-01-01') && hireDate <= new Date('2025-05-04'); // Assuming report period
            })),
        },
        {
            no: '10.a',
            indicator: 'OTMni tamomlagan bitiruvchilar',
            stats: calculateStats(filteredEmployees.filter((emp) => {
                const hireDate = new Date(emp.jobData?.hireDate);
                return hireDate >= new Date('2025-01-01') && hireDate <= new Date('2025-05-04') &&
                    emp.educationData?.educationLevel === 'Oliy' &&
                    emp.educationData?.graduationYear >= 2024;
            })),
        },
        {
            no: '10.b',
            indicator: 'Kollej (tehnikum) tamomlagan bitiruvchilar',
            stats: calculateStats(filteredEmployees.filter((emp) => {
                const hireDate = new Date(emp.jobData?.hireDate);
                return hireDate >= new Date('2025-01-01') && hireDate <= new Date('2025-05-04') &&
                    emp.educationData?.educationLevel === 'O‘rta-maxsus' &&
                    emp.educationData?.graduationYear >= 2024;
            })),
        },
        {
            no: '10.c',
            indicator: 'Boshqalar (a, b - bandlaridan tashqari)',
            stats: calculateStats(filteredEmployees.filter((emp) => {
                const hireDate = new Date(emp.jobData?.hireDate);
                return hireDate >= new Date('2025-01-01') && hireDate <= new Date('2025-05-04') &&
                    (emp.educationData?.educationLevel !== 'Oliy' &&
                        emp.educationData?.educationLevel !== 'O‘rta-maxsus' ||
                        emp.educationData?.graduationYear < 2024);
            })),
        },
        {
            no: '11',
            indicator: 'Hisobot davrida ishdan bo‘shaganlar soni',
            stats: calculateStats(employees.filter((emp) => {
                const archiveDate = new Date(emp.archiveDate);
                return emp.isArchived && archiveDate >= new Date('2025-01-01') && archiveDate <= new Date('2025-05-04');
            })),
        },
        {
            no: '11.a',
            indicator: 'Xodimlar soni (shtat) qisqarganligi hisobiga',
            stats: calculateStats(employees.filter((emp) => {
                const archiveDate = new Date(emp.archiveDate);
                return emp.isArchived && archiveDate >= new Date('2025-01-01') && archiveDate <= new Date('2025-05-04') &&
                    emp.terminationReason === 'shtat qisqarganligi';
            })),
        },
        {
            no: '11.b',
            indicator: 'Intizomiy jazo qo‘llanganligi oqibatida',
            stats: calculateStats(employees.filter((emp) => {
                const archiveDate = new Date(emp.archiveDate);
                return emp.isArchived && archiveDate >= new Date('2025-01-01') && archiveDate <= new Date('2025-05-04') &&
                    emp.terminationReason === 'intizomiy jazo';
            })),
        },
        {
            no: '11.c',
            indicator: 'Sud hukmi bilan',
            stats: calculateStats(employees.filter((emp) => {
                const archiveDate = new Date(emp.archiveDate);
                return emp.isArchived && archiveDate >= new Date('2025-01-01') && archiveDate <= new Date('2025-05-04') &&
                    emp.terminationReason === 'sud hukmi';
            })),
        },
        {
            no: '11.d',
            indicator: 'Boshqa sabablarga ko‘ra',
            stats: calculateStats(employees.filter((emp) => {
                const archiveDate = new Date(emp.archiveDate);
                return emp.isArchived && archiveDate >= new Date('2025-01-01') && archiveDate <= new Date('2025-05-04') &&
                    !['shtat qisqarganligi', 'intizomiy jazo', 'sud hukmi'].includes(emp.terminationReason);
            })),
        },
        {
            no: '12',
            indicator: 'Bo‘sh ish o‘rinlar soni',
            stats: { totalEmployees: 0, womenCount: 0, categoryCounts: {} }, // Placeholder: Requires department data
        },
        {
            no: '13',
            indicator: 'Qo\'shimcha ma‘lumot',
            stats: { totalEmployees: 0, womenCount: 0, categoryCounts: {} }, // Placeholder
        },
        {
            no: '13.a',
            indicator: 'Hisobot davrida yangi tashkil etilgan ish o‘rinlar soni',
            stats: { totalEmployees: 0, womenCount: 0, categoryCounts: {} }, // Placeholder
        },
        {
            no: '13.b',
            indicator: 'Hisobot davrida tashqi o‘rindoshlik asosida ishlayotganlar soni',
            stats: calculateStats(filteredEmployees.filter((emp) => emp.employmentType === 'tashqi o‘rindoshlik')), // Placeholder
        },
    ];

    if (departmentsStatus === 'loading' || employeesStatus === 'loading') {
        return <div>Yuklanmoqda...</div>;
    }

    if (departmentsStatus === 'failed') {
        return <div>Xatolik: {departmentsError}</div>;
    }

    if (employeesStatus === 'failed') {
        return <div>Xatolik: {employeesError}</div>;
    }

    return (
        <div>
            {/* Yosh bo‘yicha filtr uchun inputlar */}
            <div style={{ marginBottom: '20px' }}>
                <label>Yosh oralig‘i: </label>
                <input
                    type="number"
                    placeholder="Min yosh"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <input
                    type="number"
                    placeholder="Max yosh"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    style={{ padding: '5px' }}
                />
            </div>

            <table className="adaptive-table">
                <thead>
                    <tr>
                        <th rowSpan={2}>No</th>
                        <th rowSpan={2}>Ko‘rsatkichlar nomi</th>
                        <th rowSpan={2}>Jami</th>
                        <th colSpan={2}>Rahbarlar</th>
                        <th colSpan={2}>Mutaxassislar</th>
                        <th colSpan={2}>Texnik xodimlar</th>
                        <th colSpan={2}>Xizmat ko‘rsatuvchi xodimlar</th>
                        <th colSpan={2}>Ishlab chiqarish xodimlari</th>
                    </tr>
                    <tr>
                        <th>Jami</th>
                        <th>shundan ayollar</th>
                        <th>Jami</th>
                        <th>shundan ayollar</th>
                        <th>Jami</th>
                        <th>shundan ayollar</th>
                        <th>Jami</th>
                        <th>shundan ayollar</th>
                        <th>Jami</th>
                        <th>shundan ayollar</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row) => (
                        <tr key={row.no}>
                            <td>{row.no}</td>
                            <td>{row.indicator}</td>
                            <td>{row.stats.totalEmployees || 0}</td>
                            <td>{row.stats.categoryCounts?.Rahbarlar?.total || 0}</td>
                            <td>{row.stats.categoryCounts?.Rahbarlar?.women || 0}</td>
                            <td>{row.stats.categoryCounts?.Mutaxassislar?.total || 0}</td>
                            <td>{row.stats.categoryCounts?.Mutaxassislar?.women || 0}</td>
                            <td>{row.stats.categoryCounts?.['Texnik xodimlar']?.total || 0}</td>
                            <td>{row.stats.categoryCounts?.['Texnik xodimlar']?.women || 0}</td>
                            <td>{row.stats.categoryCounts?.['Xizmat ko‘rsatuvchi xodimlar']?.total || 0}</td>
                            <td>{row.stats.categoryCounts?.['Xizmat ko‘rsatuvchi xodimlar']?.women || 0}</td>
                            <td>{row.stats.categoryCounts?.['Ishlab chiqarish xodimlari']?.total || 0}</td>
                            <td>{row.stats.categoryCounts?.['Ishlab chiqarish xodimlari']?.women || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Analitika;