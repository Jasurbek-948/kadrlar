import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Spin, Empty, Button, Modal, DatePicker, message } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { fetchEmployees, updateVacationStatus } from "../../../redux/slices/employeeSlice";
import {
  setIsModalVisible,
  setSelectedEmployee,
  setVacationDates,
} from "../../../redux/slices/vacationTableSlice";

const { RangePicker } = DatePicker;

const VacationTable = () => {
  const dispatch = useDispatch();
  const { employees, status: employeeStatus, error: employeeError } = useSelector(
    (state) => state.employees
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector((state) => state.theme);
  const { isModalVisible, selectedEmployee, vacationDates } = useSelector(
    (state) => state.vacationTable
  );

  const filteredEmployees = employees.filter(
    (employee) => employee.vacationStatus && employee.vacationStatus !== "none"
  );

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Tizimga kiring!", { position: "top-right", autoClose: 3000 });
      return;
    }

    dispatch(fetchEmployees());
  }, [dispatch, isAuthenticated]);

  const showModal = (employee) => {
    dispatch(setSelectedEmployee(employee));
    dispatch(
      setVacationDates([
        employee.vacationStart ? moment(employee.vacationStart) : null,
        employee.vacationEnd ? moment(employee.vacationEnd) : null,
      ])
    );
    dispatch(setIsModalVisible(true));
  };

  const handleUpdateVacation = async () => {
    if (!vacationDates[0] || !vacationDates[1]) {
      message.error("Iltimos, ta'til muddatlarini to'liq tanlang!");
      return;
    }

    const [startDate, endDate] = vacationDates;
    if (!isAuthenticated) {
      toast.error("Tizimga kiring!", { position: "top-right", autoClose: 3000 });
      return;
    }

    dispatch(
      updateVacationStatus({
        id: selectedEmployee._id,
        vacationStatus: selectedEmployee.vacationStatus,
        vacationStart: startDate.toISOString(),
        vacationEnd: endDate.toISOString(),
      })
    ).then((result) => {
      if (result.error) {
        toast.error(`❌ Xatolik: ${result.payload}`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.success("✅ Ta'til muddati muvaffaqiyatli yangilandi!", {
          position: "top-right",
          autoClose: 3000,
        });
        dispatch(setIsModalVisible(false));
        dispatch(setSelectedEmployee(null));
        dispatch(setVacationDates([null, null]));
      }
    });
  };

  const handleCancel = () => {
    dispatch(setIsModalVisible(false));
    dispatch(setSelectedEmployee(null));
    dispatch(setVacationDates([null, null]));
  };

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
        <Button
          type="primary"
          onClick={() => showModal(record)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          Muddatni o'zgartirish
        </Button>
      ),
      width: 150,
    },
  ];

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <ToastContainer />
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center">Mexnat Ta'tiliga Chiqgan Xodimlar</h2>
      </div>
      {employeeStatus === "loading" ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spin size="large" tip="Ma'lumotlar yuklanmoqda..." />
        </div>
      ) : employeeStatus === "failed" ? (
        <p className="text-center text-red-500">{employeeError}</p>
      ) : filteredEmployees.length > 0 ? (
        <Table
          dataSource={filteredEmployees}
          columns={columns}
          rowClassName={(record) =>
            record.vacationStatus !== "none" ? "bg-blue-50" : ""
          }
          rowKey={(record) => record._id}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          className={`${isDarkMode ? "ant-table-dark" : ""}`}
        />
      ) : (
        <div className="flex justify-center items-center min-h-[200px]">
          <Empty description="Ta'tilda xodimlar mavjud emas" />
        </div>
      )}
      <Modal
        title={<span className="text-blue-500">Ta'til Muddatini O'zgartirish</span>}
        open={isModalVisible}
        onOk={handleUpdateVacation}
        onCancel={handleCancel}
        okText="Saqlash"
        cancelText="Bekor qilish"
        okButtonProps={{ className: "bg-blue-500 hover:bg-blue-600" }}
        cancelButtonProps={{ className: "bg-gray-300 hover:bg-gray-400" }}
      >
        <p>{selectedEmployee?.passportData?.fullName} uchun ta'til muddatini belgilang:</p>
        <RangePicker
          format="DD.MM.YYYY"
          value={vacationDates}
          onChange={(dates) => {
            dispatch(setVacationDates(dates || [null, null]));
          }}
          className="w-full p-2 border rounded-md mb-4"
        />
      </Modal>
    </div>
  );
};

export default VacationTable;