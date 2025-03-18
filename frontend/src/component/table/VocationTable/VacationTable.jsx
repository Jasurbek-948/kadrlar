import React, { useEffect, useState } from "react";
import { Table, Spin, Empty, Button, Modal, DatePicker, message } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./VacationTable.css";
import moment from "moment";

const { RangePicker } = DatePicker;

const VacationTable = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [vacationDates, setVacationDates] = useState([null, null]); // Yangi holat qo'shildi

  // Tokenni olish uchun umumiy funksiya
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Tizimga kiring!", { position: "top-right", autoClose: 3000 });
      return null;
    }
    return token;
  };

  // API'dan ma'lumotlarni olish
  const fetchVacationData = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          toast.error("Tizimga qayta kiring! Token yaroqsiz.", { position: "top-right", autoClose: 3000 });
          return;
        }
        throw new Error("Ma'lumotlarni olishda xatolik yuz berdi");
      }

      const data = await response.json();
      const filteredEmployees = data.filter(
        (employee) => employee.vacationStatus && employee.vacationStatus !== "none"
      );
      console.log("Olingan xodimlar:", filteredEmployees);
      setEmployees(filteredEmployees);
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error(`❌ Xatolik: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacationData();
  }, []);

  // Ta'til muddatlarini yangilash uchun modal
  const showModal = (employee) => {
    setSelectedEmployee(employee);
    setVacationDates([
      employee.vacationStart ? moment(employee.vacationStart) : null,
      employee.vacationEnd ? moment(employee.vacationEnd) : null,
    ]);
    setIsModalVisible(true);
  };

  const handleUpdateVacation = async () => {
    if (!vacationDates[0] || !vacationDates[1]) {
      message.error("Iltimos, ta'til muddatlarini to'liq tanlang!");
      return;
    }

    const [startDate, endDate] = vacationDates;
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/employees/${selectedEmployee._id}/vacation`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vacationStatus: selectedEmployee.vacationStatus,
          vacationStart: startDate.toISOString(),
          vacationEnd: endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Serverda xatolik!");
      }

      const result = await response.json();
      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee._id === selectedEmployee._id
            ? {
                ...employee,
                vacationStart: result.vacationStart,
                vacationEnd: result.vacationEnd,
              }
            : employee
        )
      );
      toast.success("✅ Ta'til muddati muvaffaqiyatli yangilandi!", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsModalVisible(false);
      setSelectedEmployee(null);
      setVacationDates([null, null]);
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error(`❌ Xatolik: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedEmployee(null);
    setVacationDates([null, null]);
  };

  // Ant Design ustunlari
  const columns = [
    {
      title: "№",
      dataIndex: "index",
      render: (text, record, index) => index + 1,
      width: 50,
    },
    {
      title: "F.I.O",
      dataIndex: ["passportData", "fullName"],
      sorter: (a, b) => a.passportData.fullName.localeCompare(b.passportData.fullName),
      width: 200,
    },
    {
      title: "Telefon Raqami",
      dataIndex: ["passportData", "phoneNumber"],
      width: 150,
    },
    {
      title: "Bo'lim",
      dataIndex: ["jobData", "department"],
      sorter: (a, b) => a.jobData.department.localeCompare(b.jobData.department),
      width: 200,
    },
    {
      title: "Lavozim",
      dataIndex: ["jobData", "position"],
      sorter: (a, b) => a.jobData.position.localeCompare(b.jobData.position),
      width: 150,
    },
    {
      title: "Ta'til Turi",
      dataIndex: "vacationStatus",
      render: (text) => text || "Noma'lum",
      sorter: (a, b) => a.vacationStatus.localeCompare(b.vacationStatus),
      width: 200,
    },
    {
      title: "Ta'til Boshlanish Sanasi",
      dataIndex: "vacationStart",
      render: (date) => (date ? moment(date).format("DD.MM.YYYY") : "Noma'lum"),
      width: 150,
    },
    {
      title: "Ta'til Tugash Sanasi",
      dataIndex: "vacationEnd",
      render: (date) => (date ? moment(date).format("DD.MM.YYYY") : "Noma'lum"),
      width: 150,
    },
    {
      title: "Harakatlar",
      key: "actions",
      render: (text, record) => (
        <Button type="primary" onClick={() => showModal(record)}>
          Muddatni o'zgartirish
        </Button>
      ),
      width: 150,
    },
  ];

  return (
    <div className="vacation-table-container">
      <ToastContainer />
      <div className="table-header">
        <h2 style={{ textAlign: "center" }}>Mexnat Ta'tiliga Chiqgan Xodimlar</h2>
      </div>
      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="Ma'lumotlar yuklanmoqda..." />
        </div>
      ) : employees.length > 0 ? (
        <Table
          dataSource={employees}
          columns={columns}
          rowClassName={(record) =>
            record.vacationStatus !== "none" ? "row-on-vacation" : ""
          }
          rowKey={(record) => record._id}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          className="employee-table"
        />
      ) : (
        <div className="empty-message">
          <Empty description="Ta'tilda xodimlar mavjud emas" />
        </div>
      )}
      <Modal
        title="Ta'til Muddatini O'zgartirish"
        open={isModalVisible}
        onOk={handleUpdateVacation}
        onCancel={handleCancel}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <p>{selectedEmployee?.passportData.fullName} uchun ta'til muddatini belgilang:</p>
        <RangePicker
          format="DD.MM.YYYY"
          value={vacationDates}
          onChange={(dates) => {
            setVacationDates(dates || [null, null]);
          }}
          style={{ width: "100%", marginBottom: 16 }}
        />
      </Modal>
    </div>
  );
};

export default VacationTable;