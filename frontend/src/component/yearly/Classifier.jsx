import React, { useState, useEffect } from 'react';
import './Classifier.css';

const Classifier = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Tizimga kirish huquqingiz yo‘q. Iltimos, tizimga kiring.');
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch('http://localhost:5000/api/employee-counts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ma’lumotlarni yuklashda xatolik yuz berdi: ' + response.statusText);
                }
                return response.json();
            })
            .then(result => {
                console.log('API javobi:', result);

                // Ma'lumotlarni saqlash
                setData(Array.isArray(result.data) ? result.data : []);
                setTotal(result.total && typeof result.total === 'object' ? result.total : {});
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError(error.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Ma’lumotlar yuklanmoqda...</div>;
    }

    if (error) {
        return <div>Xatolik: {error}</div>;
    }

    // Umumiy ma'lumotlarni tayyorlash (agar total obyekti bo'sh bo'lsa, data'dan hisoblaymiz)
    const aggregatedData = data.length > 0 ? data.reduce(
        (acc, curr) => {
            acc.boshqaruvShtat += curr.boshqaruvShtat || 0;
            acc.boshqaruvAmalda += curr.boshqaruvAmalda || 0;
            acc.mutaxassisShtat += curr.mutaxassisShtat || 0;
            acc.mutaxassisAmalda += curr.mutaxassisAmalda || 0;
            acc.texnikShtat += curr.texnikShtat || 0;
            acc.texnikAmalda += curr.texnikAmalda || 0;
            acc.ishlabChiqarishShtat += curr.ishlabChiqarishShtat || 0;
            acc.ishlabChiqarishAmalda += curr.ishlabChiqarishAmalda || 0;
            acc.xizmatShtat += curr.xizmatShtat || 0;
            acc.xizmatAmalda += curr.xizmatAmalda || 0;
            acc.totalShtat += curr.totalShtat || 0;
            acc.totalAmalda += curr.totalAmalda || 0;
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
    ) : total;

    return (
        <div className="classifier-container">
            <div className="header-section">
                <h2>“O‘zbekgidroenergo” AJ Andijon GES filiali xodimlarning yangilangan klassifikator bo‘yicha lavozim toifalariga taqsimlanishi</h2>
                {/* <p className="date">31.12.2024-yil holatiga</p> */}
            </div>

            <table className="classifier-table">
                <thead>
                    <tr>
                        <th rowSpan="2">№</th>
                        <th rowSpan="2">Korxonalar nomi</th>
                        <th colSpan="2">B - boshqaruv bo‘yicha</th>
                        <th colSpan="2">M - mutaxassis bo‘yicha</th>
                        <th colSpan="2">T - texnik bo‘yicha</th>
                        <th colSpan="2">I - ishlab chiqarish bo‘yicha</th>
                        <th colSpan="2">X - xizmat ko‘rsatuvchi bo‘yicha</th>
                        <th colSpan="21">Shtat bo‘yicha</th>
                        <th colSpan="21">Amalda jami</th>
                    </tr>
                    <tr>
                        <th>shtat bo‘yicha</th>
                        <th>amalda</th>
                        <th>shtat bo‘yicha</th>
                        <th>amalda</th>
                        <th>shtat bo‘yicha</th>
                        <th>amalda</th>
                        <th>shtat bo‘yicha</th>
                        <th>amalda</th>
                        <th>shtat bo‘yicha</th>
                        <th>amalda</th>
                      
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(aggregatedData).length > 0 ? (
                        <tr>
                            <td>1</td>
                            <td>Andijon GES filiali</td>
                            <td>{aggregatedData.boshqaruvShtat || 0}</td>
                            <td>{aggregatedData.boshqaruvAmalda || 0}</td>
                            <td>{aggregatedData.mutaxassisShtat || 0}</td>
                            <td>{aggregatedData.mutaxassisAmalda || 0}</td>
                            <td>{aggregatedData.texnikShtat || 0}</td>
                            <td>{aggregatedData.texnikAmalda || 0}</td>
                            <td>{aggregatedData.ishlabChiqarishShtat || 0}</td>
                            <td>{aggregatedData.ishlabChiqarishAmalda || 0}</td>
                            <td>{aggregatedData.xizmatShtat || 0}</td>
                            <td>{aggregatedData.xizmatAmalda || 0}</td>
                            <td>{aggregatedData.totalShtat || 0}</td>
                            <td>{aggregatedData.totalAmalda || 0}</td>
                        </tr>
                    ) : (
                        <tr>
                            <td colSpan="16">Ma’lumotlar topilmadi</td>
                        </tr>
                    )}
                    <tr className="total-row">
                        <td colSpan="2">Jami</td>
                        <td>{total.boshqaruvShtat || 0}</td>
                        <td>{total.boshqaruvAmalda || 0}</td>
                        <td>{total.mutaxassisShtat || 0}</td>
                        <td>{total.mutaxassisAmalda || 0}</td>
                        <td>{total.texnikShtat || 0}</td>
                        <td>{total.texnikAmalda || 0}</td>
                        <td>{total.ishlabChiqarishShtat || 0}</td>
                        <td>{total.ishlabChiqarishAmalda || 0}</td>
                        <td>{total.xizmatShtat || 0}</td>
                        <td>{total.xizmatAmalda || 0}</td>
                        <td>{total.totalShtat || 0}</td>
                        <td>{total.totalAmalda || 0}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Classifier;