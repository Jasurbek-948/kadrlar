import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Table } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddDocument from "./AddDocument";
import { fetchEmployees } from "../../../redux/slices/employeeSlice";


const EmployeeTable = () => {
  const dispatch = useDispatch();
  const { employees, status, error } = useSelector((state) => state.employees);
  const { isDarkMode } = useSelector((state) => state.theme);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (status === "failed" && error) {
      toast.error(`❌ Xatolik: ${error}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [status, error]);

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
    dispatch(fetchEmployees()); // Ma'lumotlarni yangilash
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
        <Button
          onClick={() => showModal(record._id)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md transition-colors"
        >
          Hujjat Qo'shish
        </Button>
      ),
    },
  ];

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <ToastContainer />
      <h2 className="text-2xl font-semibold text-blue-500 mb-5">
        Mavjud Xodimlar Ro'yxati
      </h2>
      <Table
        columns={columns}
        dataSource={employees.filter((employee) => !employee.isArchived)} // Arxivlangan xodimlarni chiqarmaymiz
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        bordered
        loading={status === "loading"}
        className={`${
          isDarkMode ? "ant-table-dark" : ""
        } rounded-lg overflow-hidden`}
      />
      <Modal
        title={
          <span className="text-lg font-semibold text-blue-500">
            Hujjat Qo'shish
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
        className={isDarkMode ? "ant-modal-dark" : ""}
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