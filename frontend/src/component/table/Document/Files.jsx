import React, { useState, useEffect } from "react";
import { message } from "antd"; // `message` ni import qilamiz
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/files.scss";

const Files = ({ employeeId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      const token = localStorage.getItem("token"); // Tokenni olish
      if (!token) {
        setError("Tizimga kiring!");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/employees/${employeeId}/documents`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Token qo'shildi
          },
        });
        console.log("Server javobi statusi:", response.status); // Statusni log qilamiz
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            setError("Tizimga qayta kiring! Token yaroqsiz.");
            toast.error("Tizimga qayta kiring! Token yaroqsiz.", {
              position: "top-right",
              autoClose: 3000,
            });
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || `Server xatosi: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Olingan hujjatlar:", data); // Ma'lumotlarni log qilamiz
        setFiles(data.documents || []);
      } catch (err) {
        console.error("Hujjatlarni olishda xatolik:", err);
        setError(err.message || "Server bilan ulanishda xatolik yuz berdi.");
        toast.error(`❌ Xatolik: ${err.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [employeeId]);

  // Faylni yuklab olish funksiyasi
  const downloadFile = (filePath) => {
    if (!filePath) {
      message.error("Fayl yo'li noto'g'ri!");
      return;
    }
    try {
      const fullUrl = `http://localhost:5000${filePath.startsWith("/") ? "" : "/"}${filePath}`; // To'liq URL
      const link = document.createElement("a");
      link.href = fullUrl;
      link.setAttribute("download", ""); // Faylni yuklab olish
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Faylni yuklab olishda xatolik:", error);
      message.error("Faylni yuklab olishda xatolik yuz berdi!");
    }
  };

  return (
    <div className="files-container">
      <ToastContainer />
      <h1>Fayllarni Yuklab Olish</h1>
      <div className="file-list">
        {loading ? (
          <p>Yuklanmoqda...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : files.length > 0 ? (
          files.map((file, index) => (
            <div className="file-card" key={index}>
              <h3>{file.fileName || file.name || "Noma'lum fayl"}</h3>
              <button onClick={() => downloadFile(file.filePath)}>Yuklab olish</button>
            </div>
          ))
        ) : (
          <p>Fayllar mavjud emas</p>
        )}
      </div>
    </div>
  );
};

export default Files;