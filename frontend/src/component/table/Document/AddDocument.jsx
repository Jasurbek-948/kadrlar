import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Upload, Progress } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { uploadDocuments, resetUploadState } from "../redux/slices/employeeSlice";
import { uploadDocuments, resetUploadState } from "../../../redux/slices/employeeSlice";

const AddDocument = ({ employeeId, onSuccess }) => {
  const dispatch = useDispatch();
  const { uploadStatus, uploadError, uploadProgress } = useSelector(
    (state) => state.employees
  );
  const { isDarkMode } = useSelector((state) => state.theme);
  const [files, setFiles] = useState({
    cv: null,
    photo: null,
    passport: null,
    diplom: null,
  });

  useEffect(() => {
    if (uploadStatus === "succeeded") {
      toast.success("✅ Hujjatlar muvaffaqiyatli yuklandi!", {
        position: "top-right",
        autoClose: 3000,
      });
      setFiles({ cv: null, photo: null, passport: null, diplom: null }); // Fayllarni tozalash
      dispatch(resetUploadState()); // Redux state’ni tozalash
      onSuccess();
    } else if (uploadStatus === "failed" && uploadError) {
      toast.error(`❌ Xatolik: ${uploadError}`, {
        position: "top-right",
        autoClose: 3000,
      });
      dispatch(resetUploadState());
    }
  }, [uploadStatus, uploadError, dispatch, onSuccess]);

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

    dispatch(uploadDocuments({ employeeId, formData }));
  };

  const beforeUpload = (file) => {
    const isValidType = ["application/pdf", "image/jpeg", "image/png"].includes(file.type);
    if (!isValidType) {
      toast.error("Faqat PDF, JPEG yoki PNG fayllarini yuklashingiz mumkin!", {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2; // 2MB dan kichik bo'lishi kerak
    if (!isLt2M) {
      toast.error("Fayl hajmi 2MB dan kichik bo'lishi kerak!", {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    }
    return false; // Ant Design uploadni avtomatik boshlashni oldini oladi
  };

  return (
    <div
      className={`p-5 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <ToastContainer />
      <div className="flex flex-col gap-4">
        <Upload
          name="cv"
          beforeUpload={beforeUpload}
          onChange={(info) => handleFileChange(info, "cv")}
          accept=".pdf"
          showUploadList
          fileList={files.cv ? [files.cv] : []}
        >
          <Button
            icon={<UploadOutlined />}
            className="flex items-center justify-center w-full p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            CV (.pdf)
          </Button>
        </Upload>
        <Upload
          name="photo"
          beforeUpload={beforeUpload}
          onChange={(info) => handleFileChange(info, "photo")}
          accept="image/*"
          showUploadList
          fileList={files.photo ? [files.photo] : []}
        >
          <Button
            icon={<UploadOutlined />}
            className="flex items-center justify-center w-full p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Rasm (image)
          </Button>
        </Upload>
        <Upload
          name="passport"
          beforeUpload={beforeUpload}
          onChange={(info) => handleFileChange(info, "passport")}
          accept=".pdf"
          showUploadList
          fileList={files.passport ? [files.passport] : []}
        >
          <Button
            icon={<UploadOutlined />}
            className="flex items-center justify-center w-full p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Pasport (.pdf)
          </Button>
        </Upload>
        <Upload
          name="diplom"
          beforeUpload={beforeUpload}
          onChange={(info) => handleFileChange(info, "diplom")}
          accept=".pdf"
          showUploadList
          fileList={files.diplom ? [files.diplom] : []}
        >
          <Button
            icon={<UploadOutlined />}
            className="flex items-center justify-center w-full p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Diplom (.pdf)
          </Button>
        </Upload>
      </div>
      {uploadProgress > 0 && (
        <Progress percent={uploadProgress} className="mt-4" />
      )}
      <Button
        onClick={handleUpload}
        disabled={Object.values(files).every((file) => !file) || uploadStatus === "loading"}
        className={`mt-5 w-full p-2 rounded-md text-white ${
          uploadStatus === "loading"
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {uploadStatus === "loading" ? "Yuklanmoqda..." : "Yuklash"}
      </Button>
    </div>
  );
};

export default AddDocument;