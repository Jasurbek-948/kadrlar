import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Input, message, Spin, Select, Table, DatePicker } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Table.css";
import moment from "moment";

const { Option } = Select;
const { RangePicker } = DatePicker;

const EmployeeTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [departments, setDepartments] = useState([]); // Bo'limlarni saqlash
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isVacationModalVisible, setIsVacationModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedVacationStatus, setSelectedVacationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Tokenni olish
  const token = localStorage.getItem("token");

  // Bo'limlarni API orqali olish
  const fetchDepartments = async () => {
    if (!token) {
      message.error("Tizimga kiring!");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/departments", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          message.error("Tizimga qayta kiring! Token yaroqsiz.");
          navigate("/login");
          return;
        }
        throw new Error("Bo'limlarni olishda muammo yuz berdi");
      }
      const result = await response.json();
      setDepartments(result);
    } catch (error) {
      console.error("Xatolik:", error);
      message.error("Bo'limlarni olishda xatolik yuz berdi!");
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Tizimga kiring!");
      navigate("/login");
      return;
    }
  
    setLoading(true);
    try {
      console.log("Yuborilayotgan token:", token); // Tokenni log qilamiz
      const response = await fetch("http://localhost:5000/api/employees", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // To'g'ri format
        },
      });
      console.log("Server javobi statusi:", response.status); // Statusni log qilamiz
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server xatosi:", errorData);
        if (response.status === 401) {
          localStorage.removeItem("token");
          message.error("Tizimga qayta kiring! Token yaroqsiz.");
          navigate("/login");
          return;
        }
        if (response.status === 403) {
          message.error("Ruxsat etilmagan so'rov!");
          throw new Error("Ruxsat etilmagan so'rov");
        }
        throw new Error("Ma'lumotlarni olishda muammo yuz berdi");
      }
  
      const result = await response.json();
      console.log("Olingan ma'lumotlar:", result); // Ma'lumotlarni log qilamiz
      if (!Array.isArray(result)) {
        throw new Error("Serverdan noto'g'ri formatda ma'lumot keldi");
      }
      const updatedData = await Promise.all(
        result
          .filter((employee) => !employee.isArchived)
          .map(async (employee) => {
            if (
              employee.vacationStatus !== "none" &&
              employee.vacationEnd &&
              moment(employee.vacationEnd).isBefore(moment(), "day")
            ) {
              const response = await fetch(`http://localhost:5000/api/employees/${employee._id}/vacation`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  vacationStatus: "none",
                  vacationStart: null,
                  vacationEnd: null,
                }),
              });
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Serverda xatolik!");
              }
              const updatedEmployee = await response.json();
              return {
                ...employee,
                vacationStatus: updatedEmployee.vacationStatus,
                vacationStart: updatedEmployee.vacationStart,
                vacationEnd: updatedEmployee.vacationEnd,
              };
            }
            return employee;
          })
      );
      console.log("Yangilangan ma'lumotlar soni:", updatedData.length); // Yangilangan ma'lumotlarni log qilamiz
      setData(updatedData);
      setFilteredData(updatedData);
    } catch (error) {
      console.error("Xatolik:", error);
      message.error(`Server bilan bog'lanishda xatolik: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((employee) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        employee.passportData.fullName?.toLowerCase().includes(searchLower) ||
        employee.passportData.phoneNumber?.toLowerCase().includes(searchLower) ||
        employee.passportData.inn?.toLowerCase().includes(searchLower) ||
        employee.passportData.insp?.toLowerCase().includes(searchLower) ||
        employee.passportData.address?.toLowerCase().includes(searchLower) ||
        employee.passportData.passportNumber?.toLowerCase().includes(searchLower) ||
        employee.passportData.gender?.toLowerCase().includes(searchLower) ||
        employee.passportData.birthPlace?.toLowerCase().includes(searchLower) ||
        employee.passportData.nationality?.toLowerCase().includes(searchLower) ||
        employee.jobData.department?.toLowerCase().includes(searchLower) ||
        employee.jobData.grade?.toLowerCase().includes(searchLower) ||
        employee.jobData.salary?.toLowerCase().includes(searchLower) ||
        employee.jobData.employmentContract?.toLowerCase().includes(searchLower) ||
        employee.jobData.hireDate?.toLowerCase().includes(searchLower) ||
        employee.jobData.orderNumber?.toLowerCase().includes(searchLower) ||
        employee.jobData.position?.toLowerCase().includes(searchLower) ||
        employee.educationData.educationLevel?.toLowerCase().includes(searchLower) ||
        employee.educationData.institution?.toLowerCase().includes(searchLower) ||
        employee.educationData.specialty?.toLowerCase().includes(searchLower) ||
        employee.educationData.graduationYear?.toString().toLowerCase().includes(searchLower) ||
        employee.educationData.diplomaNumber?.toLowerCase().includes(searchLower) ||
        employee.educationData.academicTitle?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleVacationChange = async (value, id) => {
    if (!token) {
      message.error("Tizimga kiring!");
      navigate("/login");
      return;
    }

    setSelectedEmployee(data.find((employee) => employee._id === id));
    setSelectedVacationStatus(value);
    if (value !== "none") {
      setIsVacationModalVisible(true);
    } else {
      try {
        console.log("Yuborilayotgan vacationStatus:", value);
        const response = await fetch(`http://localhost:5000/api/employees/${id}/vacation`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vacationStatus: value,
            vacationStart: null,
            vacationEnd: null,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            throw new Error(`Server javobi noto'g'ri formatda: ${errorText}`);
          }
          throw new Error(errorData.error || "Serverda xatolik yuz berdi!");
        }

        const result = await response.json();
        setData((prevData) =>
          prevData.map((employee) =>
            employee._id === id
              ? { ...employee, vacationStatus: result.vacationStatus, vacationStart: null, vacationEnd: null }
              : employee
          )
        );
        message.success("Ta'til holati muvaffaqiyatli yangilandi!");
      } catch (error) {
        console.error("Xatolik:", error);
        message.error(`Xatolik: ${error.message}`);
      }
    }
  };

  const handleSaveVacationDates = async (dates) => {
    if (!token) {
      message.error("Tizimga kiring!");
      navigate("/login");
      return;
    }

    if (!dates || dates.length !== 2) {
      message.error("Iltimos, ta'til muddatlarini tanlang!");
      return;
    }

    const [startDate, endDate] = dates;
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${selectedEmployee._id}/vacation`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vacationStatus: selectedVacationStatus,
          vacationStart: startDate.toISOString(),
          vacationEnd: endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Serverda xatolik!");
      }

      const result = await response.json();
      setData((prevData) =>
        prevData.map((employee) =>
          employee._id === selectedEmployee._id
            ? {
                ...employee,
                vacationStatus: result.vacationStatus,
                vacationStart: result.vacationStart,
                vacationEnd: result.vacationEnd,
              }
            : employee
        )
      );
      message.success("Ta'til holati va muddati muvaffaqiyatli yangilandi!");
      setIsVacationModalVisible(false);
    } catch (error) {
      console.error("Xatolik:", error);
      message.error(`Xatolik: ${error.message}`);
    }
  };

  const getVacationOptions = (gender) => {
    const commonOptions = [
      { value: "none", label: "Tanlang" },
      { value: "mexnat tatili", label: "Mexnat ta'tili" },
      { value: "mexnatga layoqatsizlik davri", label: "Mexnatga layoqatsizlik davri" },
      { value: "ish xaqi saqlanmagan tatil", label: "Ish xaqi saqlanmagan tatil" },
      { value: "o'quv tatili", label: "O'quv ta'tili" },
      { value: "bir oylik xizmat", label: "Bir oylik xizmat" },
    ];

    if (gender === "Ayol") {
      return [
        ...commonOptions,
        { value: "homiladorlik va tug'ruqdan keyingi ta'til", label: "Homiladorlik va tug'ruqdan keyingi ta'til" },
        { value: "bola parvarish ta'tili", label: "Bola parvarish ta'tili" },
      ];
    }

    return commonOptions;
  };

  const showDeleteModal = (employee) => {
    console.log("Tanlangan xodim:", employee);
    setSelectedEmployee(employee);
    setIsDeleteModalVisible(true);
  };

  const handleArchive = async (employeeId) => {
    if (!token) {
      message.error("Tizimga kiring!");
      navigate("/login");
      return;
    }

    if (!employeeId || typeof employeeId !== "string") {
      toast.error("❌ Xodim ID si noto'g'ri!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/employees/archive/${employeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server xatosi:", errorData);
        throw new Error(errorData.message || "Arxivga ko'chirishda muammo yuz berdi!");
      }

      toast.success("✅ Xodim arxivga muvaffaqiyatli ko'chirildi!", {
        position: "top-right",
        autoClose: 3000,
      });

      fetchData(); // Ma'lumotlarni yangilash
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error(`❌ ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCancel = (modalType) => {
    if (modalType === "delete") setIsDeleteModalVisible(false);
    else if (modalType === "vacation") setIsVacationModalVisible(false);
    setSelectedEmployee(null);
    setSelectedVacationStatus(null);
  };

  const handleAddEmployee = () => {
    navigate("/add-employee");
  };

  const getDepartmentName = (department) => {
    const dept = departments.find((d) => d.name === department);
    return dept ? dept.name : "Noma'lum bo'lim";
  };

  const handleRowClick = (employee) => {
    navigate(`/detail/${employee._id}`);
  };

  const columns = [
    {
      title: "№",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "F.I.O",
      dataIndex: ["passportData", "fullName"],
      key: "fullName",
    },
    {
      title: "Telefon Raqami",
      dataIndex: ["passportData", "phoneNumber"],
      key: "phoneNumber",
    },
    {
      title: "Bo'lim",
      dataIndex: ["jobData", "department"],
      key: "department",
      render: (department) => getDepartmentName(department),
    },
    {
      title: "Lavozim",
      dataIndex: ["jobData", "position"],
      key: "position",
    },
    {
      title: "Ishga kirgan vaqti",
      dataIndex: ["jobData", "hireDate"],
      key: "position",
    },
    {
      title: "Mexnat Ta'tili",
      key: "vacationStatus",
      render: (_, record) => (
        <Select
          style={{ width: 200 }}
          value={record.vacationStatus || "none"}
          onClick={(e) => e.stopPropagation()} // Tugma bosilganda navigatsiya to'xtatilsin
          onChange={(value) => handleVacationChange(value, record._id)}
          dropdownStyle={{ maxHeight: 300 }}
        >
          {getVacationOptions(record.passportData.gender).map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "O'chirish",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          danger
          onClick={(e) => {
            e.stopPropagation(); // Tugma bosilganda navigatsiya to'xtatilsin
            showDeleteModal(record);
          }}
        >
          O'chirish
        </Button>
      ),
    },
  ];

  return (
    <div className="employee-container">
      <ToastContainer />
      <div className="table-header">
        <Input
          placeholder="Xodimni qidirish"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "300px", marginRight: "10px" }}
        />
        <Button type="primary" className="add-employee-btn" onClick={handleAddEmployee}>
          Xodim qo'shish
        </Button>
      </div>
      {loading ? (
        <div className="loader-container" style={{ position: "relative", minHeight: "200px", textAlign: "center" }}>
          <Spin size="large" tip="Ma'lumotlar yuklanmoqda..." spinning={loading} />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          bordered
          className="employee-table"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />
      )}
      <Modal
        title={<span style={{ color: "#1890ff" }}>Xodimni o'chirish</span>}
        open={isDeleteModalVisible}
        onOk={() => {
          if (!selectedEmployee?._id) {
            toast.error("❌ Xodim tanlanmadi yoki ID topilmadi!", {
              position: "top-right",
              autoClose: 3000,
            });
            return;
          }
          handleArchive(selectedEmployee._id);
        }}
        onCancel={() => handleCancel("delete")}
        okText="Tasdiqlash"
        cancelText="Bekor qilish"
      >
        <p>
          {selectedEmployee
            ? `${selectedEmployee.passportData.fullName} ni arxivga ko'chirishni tasdiqlaysizmi?`
            : "O'chiriladigan xodim tanlanmadi"}
        </p>
      </Modal>
      <Modal
        title={<span style={{ color: "#1890ff" }}>Ta'til Muddatini Belgilash</span>}
        open={isVacationModalVisible}
        onOk={() => handleSaveVacationDates(selectedEmployee?.vacationDates || [])}
        onCancel={() => handleCancel("vacation")}
        okText="Saqlash"
        cancelText="Bekor qilish"
        width={500}
      >
        <p>{selectedEmployee?.passportData.fullName} uchun ta'til muddatini belgilang:</p>
        <RangePicker
          format="DD.MM.YYYY"
          onChange={(dates) => {
            setSelectedEmployee((prev) => ({
              ...prev,
              vacationDates: dates,
            }));
          }}
          style={{ width: "100%", marginBottom: 16 }}
        />
      </Modal>
    </div>
  );
};

export default EmployeeTable;