import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message } from "antd";
import moment from "moment";
import Files from "../Document/Files";
import "./DetailPage.css";

const DetailPage = () => {
  const { id } = useParams(); // trackingId o'rniga id ishlatamiz
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      // ID ni tekshirish
      if (!id || id === "undefined") {
        message.error("Xodim ID si noto'g'ri yoki topilmadi!");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token"); // Tokenni olish
      if (!token) {
        message.error("Tizimga kiring!");
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Token qo'shildi
          },
        });
        console.log("Server javobi statusi:", response.status); // Statusni log qilamiz
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server xatosi: ${response.status} - ${response.statusText}`);
        }
        const result = await response.json();
        console.log("Olingan xodim ma'lumotlari:", result); // Ma'lumotlarni log qilamiz
        setEmployee(result);
      } catch (error) {
        console.error("Server bilan bog'lanishda xatolik:", error);
        message.error(error.message || "Server bilan bog'lanishda xatolik yuz berdi!");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  const handleEdit = () => {
    if (!employee?._id) {
      message.error("Xodim ma'lumotlari topilmadi!");
      return;
    }
    navigate(`/edit/${employee._id}`); // Edit sahifasiga yo'naltirish
  };

  if (loading) {
    return (
      <div className="detail-container">
        <Spin tip="Ma'lumotlar yuklanmoqda..." />
        <button onClick={() => navigate("/")} className="back-btn">
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="detail-container">
        <h2>Xodim ma'lumotlari topilmadi!</h2>
        <button onClick={() => navigate("/")} className="back-btn">
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <h2>{employee.passportData.fullName} haqida to'liq ma'lumot</h2>

      {/* Passport Ma'lumotlari */}
      <section className="info-card">
        <h3>Passport Ma'lumotlari</h3>
        <p><strong>F.I.O:</strong> {employee.passportData.fullName || "Noma'lum"}</p>
        <p><strong>Telefon:</strong> {employee.passportData.phoneNumber || "Noma'lum"}</p>
        <p><strong>INN:</strong> {employee.passportData.inn || "Noma'lum"}</p>
        <p><strong>INSP:</strong> {employee.passportData.insp || "Noma'lum"}</p>
        <p><strong>Manzil:</strong> {employee.passportData.address || "Noma'lum"}</p>
        <p><strong>Pasport Seriyasi:</strong> {employee.passportData.passportSeries || "Noma'lum"}</p>
        <p><strong>Pasport Raqami:</strong> {employee.passportData.passportNumber || "Noma'lum"}</p>
        <p><strong>Kim Tomonidan Berilgan:</strong> {employee.passportData.issuedBy || "Noma'lum"}</p>
        <p>
          <strong>Berilgan Sana:</strong>{" "}
          {employee.passportData.issuedDate
            ? moment(employee.passportData.issuedDate).format("DD.MM.YYYY")
            : "Noma'lum"}
        </p>
        <p>
          <strong>Tug'ilgan Sana:</strong>{" "}
          {employee.passportData.birthDate
            ? moment(employee.passportData.birthDate).format("DD.MM.YYYY")
            : "Noma'lum"}
        </p>
        <p><strong>Jinsi:</strong> {employee.passportData.gender || "Noma'lum"}</p>
        <p><strong>Tug'ilgan Joyi:</strong> {employee.passportData.birthPlace || "Noma'lum"}</p>
        <p><strong>Millati:</strong> {employee.passportData.nationality || "Noma'lum"}</p>
      </section>

      {/* Ish Joyi Ma'lumotlari */}
      <section className="info-card">
        <h3>Ish Joyi Ma'lumotlari</h3>
        <p><strong>Bo'lim:</strong> {employee.jobData.department || "Noma'lum"}</p>
        <p><strong>Lavozimi:</strong> {employee.jobData.position || "Noma'lum"}</p>
        <p><strong>Razryadi:</strong> {employee.jobData.grade || "Noma'lum"}</p>
        <p><strong>Maoshi:</strong> {employee.jobData.salary || "Noma'lum"}</p>
        <p><strong>Bandlik Yo'llanmasi:</strong> {employee.jobData.employmentContract || "Noma'lum"}</p>
        <p>
          <strong>Ishga Kirgan Vaqti:</strong>{" "}
          {employee.jobData.hireDate
            ? moment(employee.jobData.hireDate).format("DD.MM.YYYY")
            : "Noma'lum"}
        </p>
        <p><strong>Buyruq Raqami:</strong> {employee.jobData.orderNumber || "Noma'lum"}</p>
        <p><strong>Ish Tajribasi:</strong> {employee.jobData.experience || "Noma'lum"}</p>
      </section>

      {/* Ma'lumoti */}
      <section className="info-card">
        <h3>Ma'lumoti</h3>
        <p><strong>Ma'lumoti:</strong> {employee.educationData.educationLevel || "Noma'lum"}</p>
        <p>
          <strong>Qaysi O'quv Yurtini Tamomlagan:</strong>{" "}
          {employee.educationData.institution || "Noma'lum"}
        </p>
        <p><strong>Mutaxassisligi:</strong> {employee.educationData.specialty || "Noma'lum"}</p>
        <p><strong>Bitirgan Yili:</strong> {employee.educationData.graduationYear || "Noma'lum"}</p>
        <p><strong>Diplom Raqami:</strong> {employee.educationData.diplomaNumber || "Noma'lum"}</p>
      </section>

      {/* Hujjatlar */}
      <section className="info-card">
        <h3>Hujjatlar</h3>
        <Files employeeId={id} />
      </section>

      <button className="back-btn" onClick={() => navigate("/")}>
        Bosh sahifaga qaytish
      </button>
      <div className="action-buttons">
        <button onClick={handleEdit} className="edit-btn">
          Tahrirlash
        </button>
      </div>
    </div>
  );
};

export default DetailPage;