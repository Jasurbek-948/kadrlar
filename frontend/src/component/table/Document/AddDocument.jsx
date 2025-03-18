import React, { useState } from "react";
import { Button, message, Upload, Progress } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios"; // Axios qo'shildi

const AddDocument = ({ employeeId, onSuccess }) => {
  const [files, setFiles] = useState({
    cv: null,
    photo: null,
    passport: null,
    diplom: null,
  });
  const [uploadProgress, setUploadProgress] = useState(0); // Progress bar uchun

  const handleFileChange = (info, field) => {
    if (info.file.status === "removed") {
      setFiles((prev) => ({ ...prev, [field]: null }));
    } else {
      setFiles((prev) => ({ ...prev, [field]: info.file }));
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append("files", file.originFileObj || file);
    });
    ["CV", "Photo", "Passport", "Diplom"].forEach((name) =>
      formData.append("names", name)
    );

    const token = localStorage.getItem("token"); // Tokenni olish
    if (!token) {
      message.error("Tizimga kiring!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/employees/${employeeId}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Token qo'shildi
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted); // Progressni yangilash
          },
        }
      );

      if (response.status === 200) {
        message.success("✅ Hujjatlar muvaffaqiyatli yuklandi!");
        setUploadProgress(0); // Yuklash tugagach progressni 0 ga qaytarish
        onSuccess();
      } else {
        throw new Error("Server xatosi");
      }
    } catch (error) {
      console.error("Xatolik:", error.response?.data || error.message);
      message.error(
        `❌ Server bilan bog'lanishda xatolik: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  };

  const beforeUpload = (file) => {
    const isValidType = ["application/pdf", "image/jpeg", "image/png"].includes(
      file.type
    );
    if (!isValidType) {
      message.error("Faqat PDF, JPEG yoki PNG fayllarini yuklashingiz mumkin!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2; // 2MB dan kichik bo'lishi kerak
    if (!isLt2M) {
      message.error("Fayl hajmi 2MB dan kichik bo'lishi kerak!");
      return false;
    }
    return false; // Ant Design uploadni avtomatik boshlashni oldini oladi
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <Upload
          name="cv"
          beforeUpload={beforeUpload}
          onChange={(info) => handleFileChange(info, "cv")}
          accept=".pdf"
          showUploadList
          fileList={files.cv ? [files.cv] : []}
        >
          <Button icon={<UploadOutlined />}>CV (.pdf)</Button>
        </Upload>
        <Upload
          name="photo"
          beforeUpload={beforeUpload}
          onChange={(info) => handleFileChange(info, "photo")}
          accept="image/*"
          showUploadList
          fileList={files.photo ? [files.photo] : []}
        >
          <Button icon={<UploadOutlined />}>Rasm (image)</Button>
        </Upload>
        <Upload
          name="passport"
          beforeUpload={beforeUpload}
          onChange={(info) => handleFileChange(info, "passport")}
          accept=".pdf"
          showUploadList
          fileList={files.passport ? [files.passport] : []}
        >
          <Button icon={<UploadOutlined />}>Pasport (.pdf)</Button>
        </Upload>
        <Upload
          name="diplom"
          beforeUpload={beforeUpload}
          onChange={(info) => handleFileChange(info, "diplom")}
          accept=".pdf"
          showUploadList
          fileList={files.diplom ? [files.diplom] : []}
        >
          <Button icon={<UploadOutlined />}>Diplom (.pdf)</Button>
        </Upload>
      </div>
      {uploadProgress > 0 && (
        <Progress percent={uploadProgress} style={{ marginTop: "15px" }} />
      )}
      <Button
        type="primary"
        onClick={handleUpload}
        style={{ marginTop: "20px", width: "100%" }}
        disabled={Object.values(files).every((file) => !file)}
      >
        Yuklash
      </Button>
    </div>
  );
};

export default AddDocument;