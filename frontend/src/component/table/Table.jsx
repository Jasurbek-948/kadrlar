import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Input, Spin, Select, Table, DatePicker, ConfigProvider, message } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import {
  fetchEmployees,
  updateVacationStatus,
  archiveEmployee,
  fetchDepartments,
  setSearchTerm,
  setIsDeleteModalVisible,
  setIsVacationModalVisible,
  setSelectedEmployee,
  setSelectedVacationStatus,
  setLoading,
} from "../../redux/slices/employeeSlice";

const { Option } = Select;
const { RangePicker } = DatePicker;

const EmployeeTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector((state) => state.theme);
  const {
    employees,
    status: employeeStatus,
    error: employeeError,
    departments,
    departmentsStatus: deptStatus,
    departmentsError: deptError,
    searchTerm,
    isDeleteModalVisible,
    isVacationModalVisible,
    selectedEmployee,
    selectedVacationStatus,
    loading,
  } = useSelector((state) => state.employees);

  // Use Ant Design's message hook
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!isAuthenticated) {
      return; // Rely on ProtectedRoute for navigation
    }

    dispatch(fetchDepartments());
    dispatch(fetchEmployees());
  }, [dispatch, isAuthenticated]);

  // Memoize filtered employees
  const filtered = useMemo(() => {
    if (!employees) return [];
    return employees.filter((employee) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        employee.passportData?.fullName?.toLowerCase().includes(searchLower) ||
        employee.passportData?.phoneNumber?.toLowerCase().includes(searchLower) ||
        employee.passportData?.inn?.toLowerCase().includes(searchLower) ||
        employee.passportData?.insp?.toLowerCase().includes(searchLower) ||
        employee.passportData?.address?.toLowerCase().includes(searchLower) ||
        employee.passportData?.passportNumber?.toLowerCase().includes(searchLower) ||
        employee.passportData?.gender?.toLowerCase().includes(searchLower) ||
        employee.passportData?.birthPlace?.toLowerCase().includes(searchLower) ||
        employee.passportData?.nationality?.toLowerCase().includes(searchLower) ||
        employee.jobData?.department?.toLowerCase().includes(searchLower) ||
        employee.jobData?.grade?.toLowerCase().includes(searchLower) ||
        employee.jobData?.salary?.toLowerCase().includes(searchLower) ||
        employee.jobData?.employmentContract?.toLowerCase().includes(searchLower) ||
        employee.jobData?.hireDate?.toLowerCase().includes(searchLower) ||
        employee.jobData?.orderNumber?.toLowerCase().includes(searchLower) ||
        employee.jobData?.position?.toLowerCase().includes(searchLower) ||
        employee.educationData?.educationLevel?.toLowerCase().includes(searchLower) ||
        employee.educationData?.institution?.toLowerCase().includes(searchLower) ||
        employee.educationData?.specialty?.toLowerCase().includes(searchLower) ||
        employee.educationData?.graduationYear?.toString().toLowerCase().includes(searchLower) ||
        employee.educationData?.diplomaNumber?.toLowerCase().includes(searchLower) ||
        employee.educationData?.academicTitle?.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm, employees]);

  const handleVacationChange = async (value, id) => {
    if (!isAuthenticated) {
      messageApi.error("Tizimga kiring!");
      return;
    }

    const employee = employees.find((emp) => emp._id === id);
    dispatch(setSelectedEmployee(employee));
    dispatch(setSelectedVacationStatus(value));

    if (value !== "none") {
      dispatch(setIsVacationModalVisible(true));
    } else {
      dispatch(
        updateVacationStatus({
          id,
          vacationStatus: value,
          vacationStart: null,
          vacationEnd: null,
        })
      ).then((result) => {
        if (result.error) {
          messageApi.error(`Xatolik: ${result.payload}`);
        } else {
          messageApi.success("Ta'til holati muvaffaqiyatli yangilandi!");
        }
      });
    }
  };

  const handleSaveVacationDates = async (dates) => {
    if (!isAuthenticated) {
      messageApi.error("Tizimga kiring!");
      return;
    }

    if (!dates || dates.length !== 2) {
      messageApi.error("Iltimos, ta'til muddatlarini tanlang!");
      return;
    }

    const [startDate, endDate] = dates;
    dispatch(
      updateVacationStatus({
        id: selectedEmployee._id,
        vacationStatus: selectedVacationStatus,
        vacationStart: startDate.toISOString(),
        vacationEnd: endDate.toISOString(),
      })
    ).then((result) => {
      if (result.error) {
        messageApi.error(`Xatolik: ${result.payload}`);
      } else {
        messageApi.success("Ta'til holati va muddati muvaffaqiyatli yangilandi!");
        dispatch(setIsVacationModalVisible(false));
      }
    });
  };

  const getVacationOptions = (gender) => {
    const commonOptions = [
      { value: "none", label: "Tanlang" },
      { value: "mexnat tatili", label: "Mexnat ta'tili" },
      { value: "mexnatga layoqatsizlik davri", label: "Mexnatga layoqatsizlik davri" },
      { value: "ish xaqi saqlanmagan tatil", label: "Ish xaqi saqlanmagan ta'til" },
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
    dispatch(setSelectedEmployee(employee));
    dispatch(setIsDeleteModalVisible(true));
  };

  const handleArchive = (employeeId) => {
    if (!employeeId || typeof employeeId !== "string") {
      toast.error("❌ Xodim ID si noto'g'ri!", {
        position: "top-right",
        autoClose: 3000,
        toastId: `archive-error-${employeeId}`, // Prevent duplicate toasts
      });
      return;
    }

    dispatch(archiveEmployee(employeeId)).then((result) => {
      if (result.error) {
        toast.error(`❌ ${result.payload}`, {
          position: "top-right",
          autoClose: 3000,
          toastId: `archive-error-${employeeId}`,
        });
      } else {
        toast.success("✅ Xodim arxivga muvaffaqiyatli ko'chirildi!", {
          position: "top-right",
          autoClose: 3000,
          toastId: `archive-success-${employeeId}`,
        });
        dispatch(setIsDeleteModalVisible(false));
      }
    });
  };

  const handleCancel = (modalType) => {
    if (modalType === "delete") {
      dispatch(setIsDeleteModalVisible(false));
    } else if (modalType === "vacation") {
      dispatch(setIsVacationModalVisible(false));
    }
    dispatch(setSelectedEmployee(null));
    dispatch(setSelectedVacationStatus(null));
  };

  const handleAddEmployee = () => {
    navigate("/add-employee");
  };

  const getDepartmentName = (department) => {
    const dept = departments[department];
    return dept ? department : "Noma'lum bo'lim";
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
      className: "text-center text-sm",
    },
    {
      title: "F.I.O",
      dataIndex: ["passportData", "fullName"],
      key: "fullName",
      className: "font-medium text-base",
    },
    {
      title: "Telefon Raqami",
      dataIndex: ["passportData", "phoneNumber"],
      key: "phoneNumber",
      className: "text-sm",
    },
    {
      title: "Bo'lim",
      dataIndex: ["jobData", "department"],
      key: "department",
      render: (department) => getDepartmentName(department),
      className: "text-sm",
    },
    {
      title: "Lavozim",
      dataIndex: ["jobData", "position"],
      key: "position",
      className: "text-sm",
    },
    {
      title: "Ishga kirgan vaqti",
      dataIndex: ["jobData", "hireDate"],
      key: "hireDate",
      className: "text-sm",
    },
    {
      title: "Mexnat Ta'tili",
      key: "vacationStatus",
      render: (_, record) => (
        <Select
          className="w-48"
          value={record.vacationStatus || "none"}
          onClick={(e) => e.stopPropagation()}
          onChange={(value) => handleVacationChange(value, record._id)}
          dropdownStyle={{ maxHeight: 300 }}
        >
          {getVacationOptions(record.passportData?.gender).map((option) => (
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
            e.stopPropagation();
            showDeleteModal(record);
          }}
          className={`bg-error hover:bg-red-500 text-white font-medium rounded-lg px-3 py-1 transition-colors duration-200 shadow-soft hover:shadow-deep`}
        >
          O'chirish
        </Button>
      ),
    },
  ];

  // Don't render if not authenticated
  if (!isAuthenticated) return null;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer: isDarkMode ? "#1F2937" : "#ffffff",
          colorText: isDarkMode ? "#d1d5db" : "#1f2937",
          colorBorder: isDarkMode ? "#374151" : "#d1d5db",
          colorPrimary: "#1D4ED8",
          borderRadius: 8,
        },
        components: {
          Table: {
            headerBg: isDarkMode ? "#374151" : "#F3F4F6",
            headerColor: isDarkMode ? "#d1d5db" : "#1f2937",
            rowHoverBg: isDarkMode ? "#4b5563" : "#f9fafb",
          },
          Modal: {
            contentBg: isDarkMode ? "#1F2937" : "#ffffff",
            headerBg: isDarkMode ? "#1F2937" : "#ffffff",
            titleColor: isDarkMode ? "#d1d5db" : "#1f2937",
          },
          Select: {
            optionSelectedBg: isDarkMode ? "#4b5563" : "#e5e7eb",
          },
          Input: {
            colorBgContainer: isDarkMode ? "#374151" : "#ffffff",
            colorText: isDarkMode ? "#d1d5db" : "#1f2937",
          },
          DatePicker: {
            colorBgContainer: isDarkMode ? "#374151" : "#ffffff",
            colorText: isDarkMode ? "#d1d5db" : "#1f2937",
          },
        },
      }}
    >
      {contextHolder}
      <div className={`p-6 ${isDarkMode ? "bg-background-dark text-gray-200" : "bg-background-light text-gray-900"} rounded-xl shadow-deep`}>
        <ToastContainer
          theme={isDarkMode ? "dark" : "light"}
          position="top-right"
          autoClose={3000}
        />
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <Input
            placeholder="Xodimni qidirish"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className={`w-full sm:w-72 p-3 border rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200 ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900"}`}
          />
          <Button
            type="primary"
            onClick={handleAddEmployee}
            className={`w-full sm:w-auto bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg px-5 py-2.5 transition-all duration-200 shadow-soft hover:shadow-deep ${isDarkMode ? "bg-blue-500 hover:bg-blue-600" : ""}`}
          >
            Xodim qo'shish
          </Button>
        </div>
        {employeeStatus === "loading" || loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Spin size="large" />
          </div>
        ) : employeeStatus === "failed" ? (
          <p className="text-center text-error font-medium text-lg">{employeeError}</p>
        ) : (
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            bordered
            scroll={{ x: "max-content" }}
            className={`rounded-lg overflow-hidden shadow-soft ${isDarkMode ? "ant-table-dark" : ""}`}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              className: `cursor-pointer transition-colors duration-150 ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`,
            })}
          />
        )}
        <Modal
          title={<span className="text-primary text-xl font-semibold">Xodimni o'chirish</span>}
          open={isDeleteModalVisible}
          onOk={() => {
            if (!selectedEmployee?._id) {
              toast.error("❌ Xodim tanlanmadi yoki ID topilmadi!", {
                position: "top-right",
                autoClose: 3000,
                toastId: `archive-error-no-id`,
              });
              return;
            }
            handleArchive(selectedEmployee._id);
          }}
          onCancel={() => handleCancel("delete")}
          okText="Tasdiqlash"
          cancelText="Bekor qilish"
          okButtonProps={{
            className: "bg-primary hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-1 transition-colors duration-200 shadow-soft hover:shadow-deep",
          }}
          cancelButtonProps={{
            className: "bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg px-4 py-1 transition-colors duration-200 shadow-soft hover:shadow-deep",
          }}
          className={`${isDarkMode ? "dark-modal" : ""}`}
        >
          <p className="text-base">
            {selectedEmployee
              ? `${selectedEmployee.passportData?.fullName} ni arxivga ko'chirishni tasdiqlaysizmi?`
              : "O'chiriladigan xodim tanlanmadi"}
          </p>
        </Modal>
        <Modal
          title={<span className="text-primary text-xl font-semibold">Ta'til Muddatini Belgilash</span>}
          open={isVacationModalVisible}
          onOk={() => handleSaveVacationDates(selectedEmployee?.vacationDates || [])}
          onCancel={() => handleCancel("vacation")}
          okText="Saqlash"
          cancelText="Bekor qilish"
          width={500}
          okButtonProps={{
            className: "bg-primary hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-1 transition-colors duration-200 shadow-soft hover:shadow-deep",
          }}
          cancelButtonProps={{
            className: "bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg px-4 py-1 transition-colors duration-200 shadow-soft hover:shadow-deep",
          }}
          className={`${isDarkMode ? "dark-modal" : ""}`}
        >
          <p className="text-base mb-4">
            {selectedEmployee?.passportData?.fullName} uchun ta'til muddatini belgilang:
          </p>
          <RangePicker
            format="DD.MM.YYYY"
            onChange={(dates) => {
              dispatch(
                setSelectedEmployee({
                  ...selectedEmployee,
                  vacationDates: dates,
                })
              );
            }}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary transition-all duration-200 ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900"}`}
          />
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default EmployeeTable;