import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './quarter.scss';

const Quarter = () => { // Filtrlarni props sifatida olib tashladik
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

                console.log('Backenddan kelgan ma\'lumotlar:', response.data);

                setEmployees(response.data);
                setError(null);
            } catch (error) {
                console.error('Xodimlarni olishda xatolik:', error);
                if (error.response) {
                    if (error.response.status === 403) {
                        if (error.response.data.error === "Token muddati tugagan. Qayta tizimga kiring!") {
                            setError('Token muddati tugagan. Iltimos, qayta tizimga kiring.');
                            localStorage.removeItem('token');
                        } else {
                            setError('Noto\'g\'ri token. Iltimos, qayta tizimga kiring.');
                            localStorage.removeItem('token');
                        }
                    } else {
                        setError('Ma\'lumotlarni olishda xatolik yuz berdi.');
                    }
                } else {
                    setError('Server bilan bog\'lanishda xatolik yuz berdi.');
                }
            }
        };
        fetchEmployees();
    }, []);

    return (
        <div className="quarter">
            <h2>“Andijon GES” filiali direktorining o‘rinbosarlari va boshqaruv xodimlari to‘g‘risida ma’lumot</h2>

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
                <table className="employee-table">
                    <thead>
                        <tr>
                            <th>T/R</th>
                            <th>F.I.Sh.</th>
                            <th>Rasm</th>
                            <th>Egallagan lavozimlari, qachondan, qaysi yili va qayerda ishlaydi</th>
                            <th>Tug‘ilgan yili va joyi</th>
                            <th>Ma’lumoti, qachon, qayeri, qaysi yo‘nalishda tamomlagan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee, index) => ( // filteredEmployees o'rniga employees ishlatildi
                            <tr key={employee._id}>
                                <td>{index + 1}</td>
                                <td>{employee.passportData.fullName}</td>
                                <td className="image-cell">
                                    {employee.documents && employee.documents.length > 0 ? (
                                        <img
                                            src={`http://localhost:5000${employee.documents.find(doc => doc.fileName === 'Photo')?.filePath || employee.documents[0].filePath}`}
                                            alt={employee.passportData.fullName}
                                            className="employee-image"
                                        />
                                    ) : (
                                        <div className="no-image">Rasm mavjud emas</div>
                                    )}
                                </td>
                                <td>
                                    {employee.jobData.position}, {employee.jobData.department},{' '}
                                    {new Date(employee.jobData.hireDate).getFullYear()} yildan
                                </td>
                                <td>
                                    {new Date(employee.passportData.birthDate).getFullYear()} yil,{' '}
                                    {employee.passportData.birthPlace}
                                </td>
                                <td>
                                    {employee.educationData.educationLevel},{' '}
                                    {employee.educationData.graduationYear} yil,{' '}
                                    {employee.educationData.institution},{' '}
                                    {employee.educationData.specialty}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Quarter;