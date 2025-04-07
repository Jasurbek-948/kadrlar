import React, { useState, useEffect } from 'react';
import './Classifier.scss';

const Classifier = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState({});

    useEffect(() => {
        fetch('http://localhost:5000/api/employee-counts')
            .then(response => response.json())
            .then(result => {
                setData(result.data);
                setTotal(result.total);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div className="classifier">
            <h2>“O‘zbekgidroenergo” AJ Andijon GES filiali xodimlarning yangilangan klassifikator bo‘yicha lavozim toifalariga taqsimlanishi</h2>
            <p className="date">31.12.2024-yil xolatiga</p>

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
                        <th colSpan="2">Shtat bo‘yicha</th>
                        <th colSpan="2">Amalda jami</th>
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
                        <th>shtat bo‘yicha</th>
                        <th>amalda</th>
                        <th>shtat bo‘yicha</th>
                        <th>amalda</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.department}</td>
                            <td>{item.boshqaruvShtat}</td>
                            <td>{item.boshqaruvAmalda}</td>
                            <td>{item.mutaxassisShtat}</td>
                            <td>{item.mutaxassisAmalda}</td>
                            <td>{item.texnikShtat}</td>
                            <td>{item.texnikAmalda}</td>
                            <td>{item.ishlabChiqarishShtat}</td>
                            <td>{item.ishlabChiqarishAmalda}</td>
                            <td>{item.xizmatShtat}</td>
                            <td>{item.xizmatAmalda}</td>
                            <td>{item.totalShtat}</td>
                            <td>{item.totalAmalda}</td>
                        </tr>
                    ))}
                    <tr className="total-row">
                        <td colSpan="2">Jami</td>
                        <td>{total.boshqaruvShtat}</td>
                        <td>{total.boshqaruvAmalda}</td>
                        <td>{total.mutaxassisShtat}</td>
                        <td>{total.mutaxassisAmalda}</td>
                        <td>{total.texnikShtat}</td>
                        <td>{total.texnikAmalda}</td>
                        <td>{total.ishlabChiqarishShtat}</td>
                        <td>{total.ishlabChiqarishAmalda}</td>
                        <td>{total.xizmatShtat}</td>
                        <td>{total.xizmatAmalda}</td>
                        <td>{total.totalShtat}</td>
                        <td>{total.totalAmalda}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Classifier;