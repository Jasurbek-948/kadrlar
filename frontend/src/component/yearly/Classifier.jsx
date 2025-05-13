import React, { useState, useEffect } from "react";
import "./Classifier.css";

// Lavozimlarni toifalarga ajratish funksiyasi
const categorizePosition = (positionName) => {
    const name = positionName.toLowerCase();
    if (
        name.includes("direktor") ||
        name.includes("boshlig‘i") ||
        name.includes("o‘rinbosari") ||
        name.includes("bosh muhandis") ||
        name.includes("yetakchi")
    ) {
        return "Boshqaruv";
    }
    if (
        name.includes("muhandis") ||
        name.includes("mutaxassis") ||
        name.includes("menejer") ||
        name.includes("iqtisodchi") ||
        name.includes("yurist") ||
        name.includes("geodezist") ||
        name.includes("gidrolog")
    ) {
        return "Mutaxassis";
    }
    if (
        name.includes("texnik") ||
        name.includes("mashinist") ||
        name.includes("elektromontyor") ||
        name.includes("usta") ||
        name.includes("chilangar") ||
        name.includes("payvandchi") ||
        name.includes("tokar") ||
        name.includes("operator")
    ) {
        return "Texnik";
    }
    if (
        name.includes("farrosh") ||
        name.includes("haydovchi") ||
        name.includes("qorovul") ||
        name.includes("bog‘bon") ||
        name.includes("tibbiyot") ||
        name.includes("ombor mudiri")
    ) {
        return "Xizmat";
    }
    if (
        name.includes("ishlab chiqarish") ||
        name.includes("ekspluatasiya") ||
        name.includes("smena boshlig‘i")
    ) {
        return "Ishlab chiqarish";
    }
    return "Mutaxassis"; // Default sifatida Mutaxassis
};

const Classifier = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Tizimga kirish huquqingiz yo‘q. Iltimos, tizimga kiring.");
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch("http://localhost:5000/api/employee-counts", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        "Ma’lumotlarni yuklashda xatolik yuz berdi: " + response.statusText
                    );
                }
                return response.json();
            })
            .then((result) => {
                console.log("API javobi:", result);

                // Ma'lumotlarni saqlash va kategoriyalarga ajratish
                const categorizedData = Array.isArray(result.data)
                    ? result.data.map((item) => ({
                        ...item,
                        boshqaruvShtat: item.boshqaruvShtat || 0,
                        boshqaruvAmalda: item.boshqaruvAmalda || 0,
                        mutaxassisShtat: item.mutaxassisShtat || 0,
                        mutaxassisAmalda: item.mutaxassisAmalda || 0,
                        texnikShtat: item.texnikShtat || 0,
                        texnikAmalda: item.texnikAmalda || 0,
                        ishlabChiqarishShtat: item.ishlabChiqarishShtat || 0,
                        ishlabChiqarishAmalda: item.ishlabChiqarishAmalda || 0,
                        xizmatShtat: item.xizmatShtat || 0,
                        xizmatAmalda: item.xizmatAmalda || 0,
                        totalShtat: item.totalShtat || 0,
                        totalAmalda: item.totalAmalda || 0,
                    }))
                    : [];
                setData(categorizedData);
                setTotal(
                    result.total && typeof result.total === "object" ? result.total : {}
                );
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
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

    return (
        <div className="classifier-container">
            <div className="header-section">
                <h2>
                    “O‘zbekgidroenergo” AJ Andijon GES filiali xodimlarning yangilangan
                    klassifikator bo‘yicha lavozim toifalariga taqsimlanishi
                </h2>
                {/* <p className="date">31.12.2024-yil holatiga</p> */}
            </div>

            <table className="classifier-table">
                <thead>
                    <tr>
                        <th rowSpan={2}>№</th>
                        <th rowSpan={2}>Korxona nomi</th>
                        <th colSpan={2}>Boshqaruv</th>
                        <th colSpan={2}>Mutaxassis</th>
                        <th colSpan={2}>Texnik</th>
                        <th colSpan={2}>Ishlab chiqarish</th>
                        <th colSpan={2}>Xizmat</th>
                        <th colSpan={2}>Jami</th>
                    </tr>
                    <tr>
                        <th>Shtat</th>
                        <th>Amalda</th>
                        <th>Shtat</th>
                        <th>Amalda</th>
                        <th>Shtat</th>
                        <th>Amalda</th>
                        <th>Shtat</th>
                        <th>Amalda</th>
                        <th>Shtat</th>
                        <th>Amalda</th>
                        <th>Shtat</th>
                        <th>Amalda</th>
                    </tr>
                </thead>
                <tbody>
                    <td>1</td>
                    <td>Andijon GES filliali</td> 
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
                    <tr className="total-row">
                        <td>{2}</td>
                        <td>Jami</td>
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