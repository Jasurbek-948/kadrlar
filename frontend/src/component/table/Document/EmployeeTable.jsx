import React, { useState, useEffect } from "react";
import { Modal, Button, Table, message } from "antd";
import { ToastContainer, toast } from "react-toastify";
import AddDocument from "./AddDocument";
import "react-toastify/dist/ReactToastify.css";
import "./EmployeeTable.css";

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const fetchEmployees = async () => {
    const token = localStorage.getItem("token"); // Tokenni olish
    if (!token) {
      message.error("Tizimga kiring!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Token qo'shildi
        },
      });
      console.log("Server javobi statusi:", response.status); // Statusni log qilamiz
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          message.error("Tizimga qayta kiring! Token yaroqsiz.");
          return;
        }
        throw new Error(`Server xatosi: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Olingan xodimlar:", data); // Ma'lumotlarni log qilamiz
      setEmployees(data);
    } catch (error) {
      console.error("Xodimlarni olishda xatolik:", error);
      message.error(error.message || "Server bilan bog'lanishda xatolik yuz berdi!");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const showModal = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedEmployeeId(null);
  };

  const handleDocumentUploadSuccess = () => {
    toast.success("✅ Hujjatlar muvaffaqiyatli yuklandi!", {
      position: "top-right",
      autoClose: 3000,
    });
    handleCancel();
    fetchEmployees(); // Ma'lumotlarni yangilash uchun qayta chaqirish
  };

  const columns = [
    {
      title: "F.I.O",
      dataIndex: ["passportData", "fullName"],
      key: "fullName",
    },
    {
      title: "Bo'lim",
      dataIndex: ["jobData", "department"],
      key: "department",
    },
    {
      title: "Lavozim",
      dataIndex: ["jobData", "position"],
      key: "position",
    },
    {
      title: "Maoshi",
      dataIndex: ["jobData", "salary"],
      key: "salary",
    },
    {
      title: "Hujjat Qo'shish",
      key: "action",
      render: (_, record) => (
        <Button className="add-doc-btn" onClick={() => showModal(record._id)}>
          Hujjat Qo'shish
        </Button>
      ),
    },
  ];

  return (
    <div className="employee-container">
      <ToastContainer />
      <h2 style={{ color: "#1890ff", marginBottom: "20px" }}>Mavjud Xodimlar Ro'yxati</h2>
      <Table
        columns={columns}
        dataSource={employees}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        bordered
        className="employee-table"
      />
      <Modal
        title={<span style={{ color: "#1890ff" }}>Hujjat Qo'shish</span>}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        {selectedEmployeeId && (
          <AddDocument
            employeeId={selectedEmployeeId}
            onSuccess={handleDocumentUploadSuccess}
          />
        )}
      </Modal>
    </div>
  );
};

export default EmployeeTable;