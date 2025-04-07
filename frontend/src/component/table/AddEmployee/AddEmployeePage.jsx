import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Steps, Form, Input, Select, Button, DatePicker as AntdDatePicker } from "antd";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import { fetchDepartments, fetchEmployeeCounts, addEmployee, resetAddState } from "../../../redux/slices/employeeSlice";

const { Step } = Steps;
const { Option } = Select;

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { departments, employeeCounts, addStatus, addError, departmentsStatus, employeeCountsStatus } = useSelector(
    (state) => state.employees
  );
  const { isDarkMode } = useSelector((state) => state.theme);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [inspError, setInspError] = useState(null); // INPS xato xabari uchun state

  const [formData, setFormData] = useState({
    passportData: {
      fullName: "",
      inn: "",
      insp: "",
      address: "",
      passportSeries: "",
      passportNumber: "",
      issuedBy: "",
      issuedDate: null,
      birthDate: null,
      gender: "",
      birthPlace: "",
      nationality: "",
      phoneNumber: "",
    },
    jobData: {
      department: "",
      position: "",
      grade: "",
      salary: "",
      employmentContract: "",
      hireDate: null,
      orderNumber: "",
    },
    educationData: {
      educationLevel: "",
      institution: "",
      specialty: "",
      graduationYear: "",
      diplomaNumber: "",
      academicTitle: "",
    },
  });

  // Real vaqtda INPS tekshirish funksiyasi
  const checkInsp = async (insp) => {
    if (!insp || insp.length !== 14) {
      setInspError("INSP 14 raqamdan iborat bo'lishi kerak!");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/employees/check-insp/${insp}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.status === 404) {
        setInspError("Serverda INPS tekshirish endpoint’i topilmadi!");
        return;
      }
      if (!response.ok) {
        setInspError(data.message);
      } else {
        setInspError(null);
      }
    } catch (error) {
      setInspError("INPS tekshirishda xatolik: Server bilan bog‘lanishda muammo!");
    }
  };

  useEffect(() => {
    const insp = formData.passportData.insp;
    if (insp.length > 0) {
      const debounce = setTimeout(() => {
        checkInsp(insp);
      }, 500); // 500ms kechikish bilan tekshirish
      return () => clearTimeout(debounce);
    } else {
      setInspError(null);
    }
  }, [formData.passportData.insp]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Tizimga kiring!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
      return;
    }

    dispatch(fetchDepartments());
    dispatch(fetchEmployeeCounts());

    return () => {
      dispatch(resetAddState());
    };
  }, [dispatch, navigate]);

  useEffect(() => {
    if (addStatus === "succeeded") {
      toast.success("✅ Xodim muvaffaqiyatli qo'shildi!", {
        position: "top-right",
        autoClose: 3000,
      });
      form.resetFields();
      setFormData({
        passportData: {
          fullName: "",
          inn: "",
          insp: "",
          address: "",
          passportSeries: "",
          passportNumber: "",
          issuedBy: "",
          issuedDate: null,
          birthDate: null,
          gender: "",
          birthPlace: "",
          nationality: "",
          phoneNumber: "",
        },
        jobData: {
          department: "",
          position: "",
          grade: "",
          salary: "",
          employmentContract: "",
          hireDate: null,
          orderNumber: "",
        },
        educationData: {
          educationLevel: "",
          institution: "",
          specialty: "",
          graduationYear: "",
          diplomaNumber: "",
          academicTitle: "",
        },
      });
      setCurrentStep(0);
      setTimeout(() => navigate("/"), 3000);
    } else if (addStatus === "failed" && addError) {
      toast.error(`❌ Xatolik: ${addError}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [addStatus, addError, navigate, form]);

  const validatePositionLimits = (department, position) => {
    if (!department || !position) return false;
    const departmentData = departments[department];
    if (!departmentData || !departmentData.positions) return false;

    const positionData = departmentData.positions.find((pos) => pos.name === position);
    if (!positionData) return false;

    const currentCount = employeeCounts[department]?.[position] || 0;
    return currentCount < positionData.max;
  };

  const handleChange = (section, name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [name]: value,
      },
    }));
    form.setFieldsValue({ [name]: value });
  };

  const handleSelectChange = (section, name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [name]: value ?? "",
      },
    }));
    form.setFieldsValue({ [name]: value ?? "" });
  };

  const handleDateChange = (section, name, date) => {
    setFormData((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [name]: date ? date.format("YYYY-MM-DD") : null,
      },
    }));
    form.setFieldsValue({ [name]: date });
  };

  const handleSubmit = async () => {
    try {
      // INPS real vaqtda tekshirilgan va xato mavjud bo‘lsa, formani yuborishni to‘xtatamiz
      if (inspError) {
        toast.error(inspError, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      await form.validateFields();

      const formValues = form.getFieldsValue();
      const updatedFormData = {
        passportData: {
          fullName: formValues.fullName || formData.passportData.fullName,
          inn: formValues.inn || formData.passportData.inn,
          insp: formValues.insp || formData.passportData.insp,
          address: formValues.address || formData.passportData.address,
          passportSeries: formValues.passportSeries || formData.passportData.passportSeries,
          passportNumber: formValues.passportNumber || formData.passportData.passportNumber,
          issuedBy: formValues.issuedBy || formData.passportData.issuedBy,
          issuedDate: formData.passportData.issuedDate || null,
          birthDate: formData.passportData.birthDate || null,
          gender: formValues.gender || formData.passportData.gender,
          birthPlace: formValues.birthPlace || formData.passportData.birthPlace,
          nationality: formValues.nationality || formData.passportData.nationality,
          phoneNumber: formValues.phoneNumber || formData.passportData.phoneNumber,
        },
        jobData: {
          department: formValues.department || formData.jobData.department,
          position: formValues.position || formData.jobData.position,
          grade: formValues.grade || formData.jobData.grade,
          salary: formValues.salary || formData.jobData.salary,
          employmentContract: formValues.employmentContract || formData.jobData.employmentContract,
          hireDate: formData.jobData.hireDate || null,
          orderNumber: formValues.orderNumber || formData.jobData.orderNumber,
        },
        educationData: {
          educationLevel: formValues.educationLevel || formData.educationData.educationLevel,
          institution: formValues.institution || formData.educationData.institution,
          specialty: formValues.specialty || formData.educationData.specialty,
          graduationYear: formValues.graduationYear || formData.educationData.graduationYear,
          diplomaNumber: formValues.diplomaNumber || formData.educationData.diplomaNumber,
          academicTitle: formValues.academicTitle || formData.educationData.academicTitle,
        },
      };

      const requiredFields = {
        passportData: [
          "fullName",
          "inn",
          "insp",
          "address",
          "passportSeries",
          "passportNumber",
          "issuedBy",
          "issuedDate",
          "birthDate",
          "gender",
          "birthPlace",
          "nationality",
          "phoneNumber",
        ],
        jobData: [
          "department",
          "position",
          "grade",
          "salary",
          "employmentContract",
          "hireDate",
          "orderNumber",
        ],
        educationData: [
          "educationLevel",
          "institution",
          "specialty",
          "graduationYear",
          "diplomaNumber",
        ],
      };

      const errors = [];
      Object.keys(requiredFields).forEach((section) => {
        requiredFields[section].forEach((field) => {
          if (!updatedFormData[section][field] || updatedFormData[section][field] === "") {
            errors.push(`${section}.${field} maydoni to'ldirilmagan!`);
          }
        });
      });

      if (errors.length > 0) {
        errors.forEach((error) => {
          toast.error(error, {
            position: "top-right",
            autoClose: 3000,
          });
        });
        return;
      }

      dispatch(addEmployee(updatedFormData));
    } catch (error) {
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleGoBack = () => {
    navigate("/");
  };

  const nextStep = async () => {
    try {
      await form.validateFields();
      const formValues = form.getFieldsValue();

      setFormData((prevState) => {
        let updatedData = { ...prevState };

        if (currentStep === 0) {
          updatedData.passportData = {
            fullName: formValues.fullName || prevState.passportData.fullName,
            inn: formValues.inn || prevState.passportData.inn,
            insp: formValues.insp || prevState.passportData.insp,
            address: formValues.address || prevState.passportData.address,
            passportSeries: formValues.passportSeries || prevState.passportData.passportSeries,
            passportNumber: formValues.passportNumber || prevState.passportData.passportNumber,
            issuedBy: formValues.issuedBy || prevState.passportData.issuedBy,
            issuedDate: formValues.issuedDate
              ? formValues.issuedDate.format("YYYY-MM-DD")
              : prevState.passportData.issuedDate,
            birthDate: formValues.birthDate
              ? formValues.birthDate.format("YYYY-MM-DD")
              : prevState.passportData.birthDate,
            gender: formValues.gender || prevState.passportData.gender,
            birthPlace: formValues.birthPlace || prevState.passportData.birthPlace,
            nationality: formValues.nationality || prevState.passportData.nationality,
            phoneNumber: formValues.phoneNumber || prevState.passportData.phoneNumber,
          };
        }

        if (currentStep === 1) {
          updatedData.jobData = {
            department: formValues.department || prevState.jobData.department,
            position: formValues.position || prevState.jobData.position,
            grade: formValues.grade || prevState.jobData.grade,
            salary: formValues.salary || prevState.jobData.salary,
            employmentContract: formValues.employmentContract || prevState.jobData.employmentContract,
            hireDate: formValues.hireDate
              ? formValues.hireDate.format("YYYY-MM-DD")
              : prevState.jobData.hireDate,
            orderNumber: formValues.orderNumber || prevState.jobData.orderNumber,
          };
        }

        if (currentStep === 2) {
          updatedData.educationData = {
            educationLevel: formValues.educationLevel || prevState.educationData.educationLevel,
            institution: formValues.institution || prevState.educationData.institution,
            specialty: formValues.specialty || prevState.educationData.specialty,
            graduationYear: formValues.graduationYear || prevState.educationData.graduationYear,
            diplomaNumber: formValues.diplomaNumber || prevState.educationData.diplomaNumber,
            academicTitle: formValues.academicTitle || prevState.educationData.academicTitle,
          };
        }

        return updatedData;
      });

      setCurrentStep(currentStep + 1);
    } catch (error) {
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: "Passport ma'lumotlari",
      content: (
        <Form form={form} layout="vertical" className="space-y-4">
          <h3 className="text-xl font-semibold text-blue-500 mb-4">
            Passport Ma'lumotlarini Kiritish
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="F.I.O."
              name="fullName"
              rules={[{ required: true, message: "Iltimos, F.I.O. ni kiriting!" }]}
            >
              <Input
                value={formData.passportData.fullName}
                onChange={(e) => handleChange("passportData", "fullName", e.target.value)}
                placeholder="F.I.O."
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
            <Form.Item
              label="INN"
              name="inn"
              rules={[
                { required: true, message: "Iltimos, INN ni kiriting!" },
                { pattern: /^\d{9}$/, message: "INN 9 raqamdan iborat bo'lishi kerak!" },
              ]}
            >
              <Input
                value={formData.passportData.inn}
                onChange={(e) => handleChange("passportData", "inn", e.target.value)}
                placeholder="INN"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
            <Form.Item
              label="INSP"
              name="insp"
              rules={[
                { required: true, message: "Iltimos, INSP ni kiriting!" },
                { pattern: /^\d{14}$/, message: "INSP 14 raqamdan iborat bo'lishi kerak!" },
              ]}
              validateStatus={inspError ? "error" : ""}
              help={inspError}
            >
              <Input
                value={formData.passportData.insp}
                onChange={(e) => handleChange("passportData", "insp", e.target.value)}
                placeholder="INSP"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Manzil"
              name="address"
              rules={[{ required: true, message: "Iltimos, manzilni kiriting!" }]}
            >
              <Input
                value={formData.passportData.address}
                onChange={(e) => handleChange("passportData", "address", e.target.value)}
                placeholder="Manzil"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
            <Form.Item
              label="Pasport Seriyasi"
              name="passportSeries"
              rules={[
                { required: true, message: "Iltimos, passport seriyasini kiriting!" },
                { pattern: /^[A-Z]{2}$/, message: "Passport seriyasi 2 harfdan iborat bo'lishi kerak!" },
              ]}
            >
              <Input
                value={formData.passportData.passportSeries}
                onChange={(e) => handleChange("passportData", "passportSeries", e.target.value)}
                placeholder="Pasport Seriyasi (masalan: AB)"
                maxLength={2}
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
            <Form.Item
              label="Pasport Raqami"
              name="passportNumber"
              rules={[
                { required: true, message: "Iltimos, passport raqamini kiriting!" },
                { pattern: /^\d{7}$/, message: "Passport raqami 7 raqamdan iborat bo'lishi kerak!" },
              ]}
            >
              <Input
                value={formData.passportData.passportNumber}
                onChange={(e) => handleChange("passportData", "passportNumber", e.target.value)}
                placeholder="Pasport Raqami"
                maxLength={7}
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Kim Tomonidan Berilgan"
              name="issuedBy"
              rules={[{ required: true, message: "Iltimos, kim tomonidan berilganligini kiriting!" }]}
            >
              <Input
                value={formData.passportData.issuedBy}
                onChange={(e) => handleChange("passportData", "issuedBy", e.target.value)}
                placeholder="Kim Tomonidan Berilgan"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
            <Form.Item
              label="Berilgan Sana"
              name="issuedDate"
              rules={[{ required: true, message: "Iltimos, berilgan sanani kiriting!" }]}
            >
              <AntdDatePicker
                value={formData.passportData.issuedDate ? dayjs(formData.passportData.issuedDate) : null}
                onChange={(date) => handleDateChange("passportData", "issuedDate", date)}
                className={`w-full ${isDarkMode ? "ant-picker-dark" : ""}`}
                placeholder="Berilgan Sana"
                format="YYYY-MM-DD"
              />
            </Form.Item>
            <Form.Item
              label="Tug'ilgan Sana"
              name="birthDate"
              rules={[{ required: true, message: "Iltimos, tug'ilgan sanani kiriting!" }]}
            >
              <AntdDatePicker
                value={formData.passportData.birthDate ? dayjs(formData.passportData.birthDate) : null}
                onChange={(date) => handleDateChange("passportData", "birthDate", date)}
                className={`w-full ${isDarkMode ? "ant-picker-dark" : ""}`}
                placeholder="Tug'ilgan Sana"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Jinsi"
              name="gender"
              rules={[{ required: true, message: "Iltimos, jinsni tanlang!" }]}
            >
              <Select
                value={formData.passportData.gender ?? ""}
                onChange={(value) => handleSelectChange("passportData", "gender", value)}
                placeholder="Tanlang"
                className={isDarkMode ? "ant-select-dark" : ""}
              >
                <Option value="Erkak">Erkak</Option>
                <Option value="Ayol">Ayol</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Tug'ilgan joyi"
              name="birthPlace"
              rules={[{ required: true, message: "Iltimos, tug'ilgan joyni kiriting!" }]}
            >
              <Input
                value={formData.passportData.birthPlace}
                onChange={(e) => handleChange("passportData", "birthPlace", e.target.value)}
                placeholder="Tug'ilgan joyi"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
            <Form.Item
              label="Millati"
              name="nationality"
              rules={[{ required: true, message: "Iltimos, millatni kiriting!" }]}
            >
              <Input
                value={formData.passportData.nationality}
                onChange={(e) => handleChange("passportData", "nationality", e.target.value)}
                placeholder="Millati"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Telefon Raqami"
              name="phoneNumber"
              rules={[
                { required: true, message: "Iltimos, telefon raqamini kiriting!" },
                { pattern: /^\+998\d{9}$/, message: "Telefon raqami +998 bilan boshlanib, 9 raqamdan iborat bo'lishi kerak!" },
              ]}
            >
              <Input
                value={formData.passportData.phoneNumber}
                onChange={(e) => handleChange("passportData", "phoneNumber", e.target.value)}
                placeholder="+998901234567"
                maxLength={13}
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
          </div>
        </Form>
      ),
    },
    {
      title: "Ish joyi bo'yicha ma'lumotlari",
      content: (
        <Form form={form} layout="vertical" className="space-y-4">
          <h3 className="text-xl font-semibold text-blue-500 mb-4">
            Ish Joyi Bo'yicha Ma'lumotlarni Kiritish
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Bo'lim"
              name="department"
              rules={[{ required: true, message: "Iltimos, bo'limni tanlang!" }]}
            >
              <Select
                value={formData.jobData.department ?? ""}
                onChange={(value) => {
                  handleSelectChange("jobData", "department", value);
                  handleSelectChange("jobData", "position", "");
                }}
                placeholder="Bo'lim tanlang"
                className={isDarkMode ? "ant-select-dark" : ""}
              >
                {Object.keys(departments).map((dep) => (
                  <Option key={dep} value={dep}>
                    {dep}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Lavozimi"
              name="position"
              rules={[{ required: true, message: "Iltimos, lavozimni tanlang!" }]}
            >
              <Select
                value={formData.jobData.position ?? ""}
                onChange={(value) => {
                  if (validatePositionLimits(formData.jobData.department, value)) {
                    handleSelectChange("jobData", "position", value);
                  } else {
                    toast.error("Bu lavozim uchun xodimlar soni cheklangan!", {
                      position: "top-right",
                      autoClose: 3000,
                    });
                  }
                }}
                placeholder="Lavozim tanlang"
                disabled={!formData.jobData.department}
                className={isDarkMode ? "ant-select-dark" : ""}
              >
                {formData.jobData.department && departments[formData.jobData.department]?.positions
                  ? departments[formData.jobData.department].positions.map((pos) => (
                      <Option key={pos.name} value={pos.name}>
                        {`${pos.name} (Mavjud: ${pos.max - (employeeCounts[formData.jobData.department]?.[pos.name] || 0)})`}
                      </Option>
                    ))
                  : null}
              </Select>
            </Form.Item>
            <Form.Item
              label="Razryadi"
              name="grade"
              rules={[{ required: true, message: "Iltimos, razryadni kiriting!" }]}
            >
              <Input
                value={formData.jobData.grade}
                onChange={(e) => handleChange("jobData", "grade", e.target.value)}
                placeholder="Razryadi"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Maoshi"
              name="salary"
              rules={[
                { required: true, message: "Iltimos, maoshni kiriting!" },
                { pattern: /^\d+$/, message: "Maosh faqat raqamlardan iborat bo'lishi kerak!" },
              ]}
            >
              <Input
                value={formData.jobData.salary}
                onChange={(e) => handleChange("jobData", "salary", e.target.value)}
                placeholder="Maoshi"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
            <Form.Item
              label="Bandlik Yo'llanmasi"
              name="employmentContract"
              rules={[{ required: true, message: "Iltimos, bandlik yo'llanmasini kiriting!" }]}
            >
              <Input
                value={formData.jobData.employmentContract}
                onChange={(e) => handleChange("jobData", "employmentContract", e.target.value)}
                placeholder="Bandlik Yo'llanmasi"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
            <Form.Item
              label="Ishga Kirgan Sana"
              name="hireDate"
              rules={[{ required: true, message: "Iltimos, ishga kirgan sanani kiriting!" }]}
            >
              <AntdDatePicker
                value={formData.jobData.hireDate ? dayjs(formData.jobData.hireDate) : null}
                onChange={(date) => handleDateChange("jobData", "hireDate", date)}
                className={`w-full ${isDarkMode ? "ant-picker-dark" : ""}`}
                placeholder="Ishga Kirgan Sana"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Buyruq Raqami"
              name="orderNumber"
              rules={[{ required: true, message: "Iltimos, buyruq raqamini kiriting!" }]}
            >
              <Input
                value={formData.jobData.orderNumber}
                onChange={(e) => handleChange("jobData", "orderNumber", e.target.value)}
                placeholder="Buyruq Raqami"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
          </div>
        </Form>
      ),
    },
    {
      title: "Mutaxassisligi bo'yicha ma'lumotlari",
      content: (
        <Form form={form} layout="vertical" className="space-y-4">
          <h3 className="text-xl font-semibold text-blue-500 mb-4">
            Ta'lim Ma'lumotlari
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Ta'lim darajasi"
              name="educationLevel"
              rules={[{ required: true, message: "Iltimos, ta'lim darajasini tanlang!" }]}
            >
              <Select
                value={formData.educationData.educationLevel ?? ""}
                onChange={(value) => handleSelectChange("educationData", "educationLevel", value)}
                placeholder="Ta'lim darajasini tanlang"
                className={isDarkMode ? "ant-select-dark" : ""}
              >
                <Option value="Oliy">Oliy</Option>
                <Option value="O'rta">O'rta</Option>
                <Option value="O'rta maxsus">O'rta maxsus</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="O'quv yurti"
              name="institution"
              rules={[{ required: true, message: "Iltimos, o'quv yurtini kiriting!" }]}
            >
              <Input
                value={formData.educationData.institution}
                onChange={(e) => handleChange("educationData", "institution", e.target.value)}
                placeholder="O'quv yurti"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
            <Form.Item
              label="Mutaxassislik"
              name="specialty"
              rules={[{ required: true, message: "Iltimos, mutaxassislikni kiriting!" }]}
            >
              <Input
                value={formData.educationData.specialty}
                onChange={(e) => handleChange("educationData", "specialty", e.target.value)}
                placeholder="Mutaxassislik"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Bitirgan Yili"
              name="graduationYear"
              rules={[
                { required: true, message: "Iltimos, bitirgan yilni kiriting!" },
                {
                  validator: (_, value) =>
                    value && (value < 1900 || value > new Date().getFullYear())
                      ? Promise.reject(
                          new Error(
                            `Bitirish yili 1900 dan ${new Date().getFullYear()} gacha bo'lishi kerak!`
                          )
                        )
                      : Promise.resolve(),
                },
              ]}
            >
              <Input
                type="number"
                value={formData.educationData.graduationYear}
                onChange={(e) => handleChange("educationData", "graduationYear", e.target.value)}
                placeholder="Bitirgan Yili (masalan, 2023)"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
            <Form.Item
              label="Diplom raqami"
              name="diplomaNumber"
              rules={[{ required: true, message: "Iltimos, diplom raqamini kiriting!" }]}
            >
              <Input
                value={formData.educationData.diplomaNumber}
                onChange={(e) => handleChange("educationData", "diplomaNumber", e.target.value)}
                placeholder="Diplom raqami (masalan, D123456)"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
            <Form.Item label="Ilmiy Unvoni" name="academicTitle">
              <Input
                value={formData.educationData.academicTitle}
                onChange={(e) => handleChange("educationData", "academicTitle", e.target.value)}
                placeholder="Ilmiy unvoni (ixtiyoriy)"
                className={isDarkMode ? "ant-input-dark" : ""}
              />
            </Form.Item>
          </div>
        </Form>
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
      <h2 className="text-2xl font-semibold text-blue-500 mb-6">
        Yangi Xodim Qo'shish
      </h2>
      <div className="space-y-6">
        <Steps current={currentStep} className={isDarkMode ? "ant-steps-dark" : ""}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div>{steps[currentStep].content}</div>
        <div className="flex justify-between">
          <Button
            onClick={handleGoBack}
            disabled={addStatus === "loading"}
            className={`${
              isDarkMode
                ? "bg-gray-600 hover:bg-gray-700 text-white"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            } font-semibold py-2 px-4 rounded-md transition-colors`}
          >
            Ortga Qaytish
          </Button>
          <div className="space-x-3">
            {currentStep > 0 && (
              <Button
                onClick={prevStep}
                className={`${
                  isDarkMode
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-gray-500 hover:bg-gray-600 text-white"
                } font-semibold py-2 px-4 rounded-md transition-colors`}
              >
                Oldingi
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button
                onClick={nextStep}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Keyingi
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button
                onClick={handleSubmit}
                disabled={addStatus === "loading" || inspError}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                {addStatus === "loading" ? "Yuklanmoqda..." : "Xodim Qo'shish"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeePage;