import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Yearly.scss';

const Yearly = () => {
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Tizimga kirish talab qilinadi. Iltimos, login qiling.');
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/employees', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setEmployees(response.data);
                setError(null);
            } catch (error) {
                setError('Xatolik yuz berdi.');
            }
        };
        fetchEmployees();
    }, []);

    const nationalities = [
        "o'zbeklar", "ruslar", "tatarlar", "qozoqlar", "qoraqalpoqlar", "koreyslar", "ukrainlar",
        "tojiklar", "uyg'urlar", "belaruslar", "armanlar", "yaxudiylar", "qirg'izlar",
        "dungan", "nemis", "turkman", "turonlik", "bolgar"
    ];

    const mapNationality = (backendNationality) => {
        const normalizedBackendNationality = backendNationality?.toLowerCase().replace("ozbek", "o'zbeklar");
        return nationalities.find(nat => nat.toLowerCase() === normalizedBackendNationality) || backendNationality;
    };

    const calculateNationalityData = () => {
        const data = nationalities.map((nationality) => {
            const totalEmployees = employees.filter(
                (emp) => {
                    const mappedNationality = mapNationality(emp.passportData?.nationality);
                    return mappedNationality?.toLowerCase() === nationality.toLowerCase();
                }
            ).length;

            const leaders = employees.filter(
                (emp) => {
                    const mappedNationality = mapNationality(emp.passportData?.nationality);
                    return (
                        mappedNationality?.toLowerCase() === nationality.toLowerCase() &&
                        emp.jobData?.position?.toLowerCase().includes("boshlig'i")
                    );
                }
            ).length;

            const specialists = employees.filter(
                (emp) => {
                    const mappedNationality = mapNationality(emp.passportData?.nationality);
                    return (
                        mappedNationality?.toLowerCase() === nationality.toLowerCase() &&
                        emp.jobData?.position?.toLowerCase().includes("mutaxassis")
                    );
                }
            ).length;

            const technicalStaff = employees.filter(
                (emp) => {
                    const mappedNationality = mapNationality(emp.passportData?.nationality);
                    return (
                        mappedNationality?.toLowerCase() === nationality.toLowerCase() &&
                        emp.jobData?.position?.toLowerCase().includes("muhandis")
                    );
                }
            ).length;

            const serviceStaff = employees.filter(
                (emp) => {
                    const mappedNationality = mapNationality(emp.passportData?.nationality);
                    return (
                        mappedNationality?.toLowerCase() === nationality.toLowerCase() &&
                        emp.jobData?.position?.toLowerCase().includes("xizmat")
                    );
                }
            ).length;

            const workingStaff = employees.filter(
                (emp) => {
                    const mappedNationality = mapNationality(emp.passportData?.nationality);
                    return (
                        mappedNationality?.toLowerCase() === nationality.toLowerCase() &&
                        !emp.jobData?.position?.toLowerCase().includes("boshlig'i") &&
                        !emp.jobData?.position?.toLowerCase().includes("mutaxassis") &&
                        !emp.jobData?.position?.toLowerCase().includes("muhandis") &&
                        !emp.jobData?.position?.toLowerCase().includes("xizmat")
                    );
                }
            ).length;

            return {
                nationality,
                total: totalEmployees,
                percentage: totalEmployees > 0 ? ((totalEmployees / employees.length) * 100).toFixed(1) : 0,
                leaders,
                specialists,
                technicalStaff,
                serviceStaff,
                workingStaff,
            };
        });

        return data;
    };

    const nationalityData = calculateNationalityData();

    const totalEmployees = employees.length;
    const totalLeaders = employees.filter((emp) =>
        emp.jobData?.position?.toLowerCase().includes("boshlig'i")
    ).length;
    const totalSpecialists = employees.filter((emp) =>
        emp.jobData?.position?.toLowerCase().includes("mutaxassis")
    ).length;
    const totalTechnicalStaff = employees.filter((emp) =>
        emp.jobData?.position?.toLowerCase().includes("muhandis")
    ).length;
    const totalServiceStaff = employees.filter((emp) =>
        emp.jobData?.position?.toLowerCase().includes("xizmat")
    ).length;
    const totalWorkingStaff = employees.filter(
        (emp) =>
            !emp.jobData?.position?.toLowerCase().includes("boshlig'i") &&
            !emp.jobData?.position?.toLowerCase().includes("mutaxassis") &&
            !emp.jobData?.position?.toLowerCase().includes("muhandis") &&
            !emp.jobData?.position?.toLowerCase().includes("xizmat")
    ).length;

    return (
        <div className="yearly">
            <h2>“O‘zbekgidroenergo” AJ Andijon GES filialida ishlayotgan xodimlarning milliy tarkibi</h2>
            <p className="date">31.12.2024-yil xolatiga</p>

            {error && (
                <div className="error-message">
                    {error}
                    {error.includes('tizimga kiring') && (
                        <button onClick={() => window.location.href = '/login'}>
                            Tizimga kirish
                        </button>
                    )}
                </div>
            )}

            {!error && (
                <table className="nationality-table">
                    <thead>
                        <tr>
                            <th rowSpan="2">№</th>
                            <th rowSpan="2">Millatlar nomi</th>
                            <th colSpan="2">Xodimlar jami</th>
                            <th colSpan="2">Rahbarlar</th>
                            <th colSpan="2">Mutaxassislar</th>
                            <th colSpan="2">Texnik xodimlar</th>
                            <th colSpan="2">Xizmat ko'rsatuvchi xodimlar</th>
                            <th rowSpan="2">Ishlab chiqarish xodimlari</th>
                        </tr>
                        <tr>
                            <th>Soni</th>
                            <th>shundan, ayollar</th>
                            <th>%</th>
                            <th>Jami</th>
                            <th>shundan, ayollar</th>
                            <th>Jami</th>
                            <th>shundan, ayollar</th>
                            <th>Jami</th>
                            <th>shundan, ayollar</th>
                            <th>Jami</th>
                            <th>shundan, ayollar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nationalityData.map((data, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{data.nationality}</td>
                                <td>{data.total}</td>
                                <td>
                                    {
                                        employees.filter(
                                            (emp) => {
                                                const mappedNationality = mapNationality(emp.passportData?.nationality);
                                                return (
                                                    mappedNationality?.toLowerCase() === data.nationality.toLowerCase() &&
                                                    emp.passportData?.gender?.toLowerCase() === "ayol"
                                                );
                                            }
                                        ).length
                                    }
                                </td>
                                <td>{data.percentage}%</td>
                                <td>{data.leaders}</td>
                                <td>
                                    {
                                        employees.filter(
                                            (emp) => {
                                                const mappedNationality = mapNationality(emp.passportData?.nationality);
                                                return (
                                                    mappedNationality?.toLowerCase() === data.nationality.toLowerCase() &&
                                                    emp.jobData?.position?.toLowerCase().includes("boshlig'i") &&
                                                    emp.passportData?.gender?.toLowerCase() === "ayol"
                                                );
                                            }
                                        ).length
                                    }
                                </td>
                                <td>{data.specialists}</td>
                                <td>
                                    {
                                        employees.filter(
                                            (emp) => {
                                                const mappedNationality = mapNationality(emp.passportData?.nationality);
                                                return (
                                                    mappedNationality?.toLowerCase() === data.nationality.toLowerCase() &&
                                                    emp.jobData?.position?.toLowerCase().includes("mutaxassis") &&
                                                    emp.passportData?.gender?.toLowerCase() === "ayol"
                                                );
                                            }
                                        ).length
                                    }
                                </td>
                                <td>{data.technicalStaff}</td>
                                <td>
                                    {
                                        employees.filter(
                                            (emp) => {
                                                const mappedNationality = mapNationality(emp.passportData?.nationality);
                                                return (
                                                    mappedNationality?.toLowerCase() === data.nationality.toLowerCase() &&
                                                    emp.jobData?.position?.toLowerCase().includes("muhandis") &&
                                                    emp.passportData?.gender?.toLowerCase() === "ayol"
                                                );
                                            }
                                        ).length
                                    }
                                </td>
                                <td>{data.serviceStaff}</td>
                                <td>
                                    {
                                        employees.filter(
                                            (emp) => {
                                                const mappedNationality = mapNationality(emp.passportData?.nationality);
                                                return (
                                                    mappedNationality?.toLowerCase() === data.nationality.toLowerCase() &&
                                                    emp.jobData?.position?.toLowerCase().includes("xizmat") &&
                                                    emp.passportData?.gender?.toLowerCase() === "ayol"
                                                );
                                            }
                                        ).length
                                    }
                                </td>
                                <td>{data.workingStaff}</td>
                            </tr>
                        ))}
                        <tr className="total-row">
                            <td colSpan="2">Jami</td>
                            <td>{totalEmployees}</td>
                            <td>
                                {
                                    employees.filter(
                                        (emp) => emp.passportData?.gender?.toLowerCase() === "ayol"
                                    ).length
                                }
                            </td>
                            <td>100%</td>
                            <td>{totalLeaders}</td>
                            <td>
                                {
                                    employees.filter(
                                        (emp) =>
                                            emp.jobData?.position?.toLowerCase().includes("boshlig'i") &&
                                            emp.passportData?.gender?.toLowerCase() === "ayol"
                                    ).length
                                }
                            </td>
                            <td>{totalSpecialists}</td>
                            <td>
                                {
                                    employees.filter(
                                        (emp) =>
                                            emp.jobData?.position?.toLowerCase().includes("mutaxassis") &&
                                            emp.passportData?.gender?.toLowerCase() === "ayol"
                                    ).length
                                }
                            </td>
                            <td>{totalTechnicalStaff}</td>
                            <td>
                                {
                                    employees.filter(
                                        (emp) =>
                                            emp.jobData?.position?.toLowerCase().includes("muhandis") &&
                                            emp.passportData?.gender?.toLowerCase() === "ayol"
                                    ).length
                                }
                            </td>
                            <td>{totalServiceStaff}</td>
                            <td>
                                {
                                    employees.filter(
                                        (emp) =>
                                            emp.jobData?.position?.toLowerCase().includes("xizmat") &&
                                            emp.passportData?.gender?.toLowerCase() === "ayol"
                                    ).length
                                }
                            </td>
                            <td>{totalWorkingStaff}</td>
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Yearly;