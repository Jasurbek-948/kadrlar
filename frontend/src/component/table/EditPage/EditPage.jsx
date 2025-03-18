import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Steps, Form, Input, Select, Button, DatePicker as AntdDatePicker, Spin } from "antd";
import "react-toastify/dist/ReactToastify.css";
import "../AddEmployee/AddEmployePage.css";
import dayjs from "dayjs";

const { Step } = Steps;
const { Option } = Select;

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);

  const departments = [
    "Boshqaruv Apparati",
    "Buxgalteriya",
    "Inson resurslari bo'limi",
    "Yuristkonsul",
    "Mutaxassislar",
    "AKTni joriy etish va axborot xavfsizligi bo'limi",
    "Ishlab chiqarish bo'limi",
    "Gidromexanika sexi",
    "Tezkor dispecherlik hizmati bo'limi",
    "Avtomatika va rele himoyasi bo'limi",
    "Elektro sexi",
    "Suv omborini xavfsiz eksplatatsiya qilish boshqarmasi",
    "Mutaxassislar suv ombor",
    "To'g'on bo'limi",
    "Nazorat o'lchov qurilmalari va suvdan foydalanish bo'limi",
    "Inshoatlarni tiklash va nazorat qilish bo'limi",
    "Texnik xodimlar bo'limi",
    "Andijon-2 gidroelektrstansiyasi",
    "Kudash gidroelektrstansiyasi",
    "Xonobod mikro gidroelektrstansiyasi",
    "Xizmat ko'rsatuvchi hodimlar bo'limi",
  ];

  const [currentEmployeeCounts, setCurrentEmployeeCounts] = useState({});
  const [positionsByDepartment, setPositionsByDepartment] = useState({});

  // Tokenni olish uchun umumiy funksiya
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Tizimga kiring!", { position: "top-right", autoClose: 3000 });
      navigate("/login");
      return null;
    }
    return token;
  };

  // Xodim ma'lumotlarini olish
  const fetchEmployee = async () => {
    const token = getToken();
    if (!token) return;

    setFetchLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("fetchEmployee status:", response.status);
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          toast.error("Tizimga qayta kiring! Token yaroqsiz.", { position: "top-right", autoClose: 3000 });
          navigate("/login");
          return;
        }
        throw new Error("Xodim topilmadi!");
      }
      const employee = await response.json();
      console.log("Olingan xodim:", employee);
      setFormData(employee);
    } catch (error) {
      console.error("Server bilan bog'lanishda xatolik:", error);
      setError(error.message);
      toast.error(`❌ Server bilan bog'lanishda xatolik: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setFetchLoading(false);
    }
  };

  // Xodimlar sonini olish
  const fetchEmployeeCounts = async () => {
    const token = getToken();
    if (!token) return;

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
          navigate("/login");
          return;
        }
        throw new Error(`Server javobi: ${response.status} - ${response.statusText}`);
      }
      const employees = await response.json();
      const counts = {};

      employees.forEach((employee) => {
        const department = employee.jobData.department;
        const position = employee.jobData.position;
        if (!counts[department]) counts[department] = {};
        counts[department][position] = (counts[department][position] || 0) + 1;
      });

      setCurrentEmployeeCounts(counts);
    } catch (error) {
      console.error("Xodimlar sonini olishda xatolik:", error);
      toast.error(`❌ Server bilan bog'lanishda xatolik: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  // Bo'limlar va lavozimlarni olish
  const fetchDepartments = async () => {
    const token = getToken();
    if (!token) return;

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
          toast.error("Tizimga qayta kiring! Token yaroqsiz.", { position: "top-right", autoClose: 3000 });
          navigate("/login");
          return;
        }
        throw new Error("Bo'limlarni olishda xatolik!");
      }
      const data = await response.json();
      console.log("Bo'limlar va lavozimlar:", data);
      setPositionsByDepartment(data);
    } catch (error) {
      console.error("Departmentsni olishda xatolik:", error);
      toast.error(`❌ Bo'limlarni olishda xatolik: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    fetchEmployee();
    fetchEmployeeCounts();
    fetchDepartments();
  }, [id, navigate]);

  const validatePositionLimits = (department, position) => {
    const departmentData = positionsByDepartment[department];
    if (!departmentData) return false;

    const positionData = departmentData.positions.find((pos) => pos.name === position);
    if (!positionData) return false;

    const currentCount =
      (currentEmployeeCounts[department]?.[position] || 0) -
      (formData?.jobData.department === department && formData?.jobData.position === position ? 1 : 0);
    return currentCount < positionData.max;
  };

  // Formani formData bilan sinxronlashtirish
  useEffect(() => {
    if (formData) {
      form.setFieldsValue({
        fullName: formData.passportData.fullName,
        inn: formData.passportData.inn,
        insp: formData.passportData.insp,
        address: formData.passportData.address,
        passportSeries: formData.passportData.passportSeries,
        passportNumber: formData.passportData.passportNumber,
        issuedBy: formData.passportData.issuedBy,
        issuedDate: formData.passportData.issuedDate ? dayjs(formData.passportData.issuedDate) : null,
        birthDate: formData.passportData.birthDate ? dayjs(formData.passportData.birthDate) : null,
        gender: formData.passportData.gender,
        birthPlace: formData.passportData.birthPlace,
        nationality: formData.passportData.nationality,
        phoneNumber: formData.passportData.phoneNumber,
        department: formData.jobData.department,
        position: formData.jobData.position,
        grade: formData.jobData.grade,
        salary: formData.jobData.salary,
        employmentContract: formData.jobData.employmentContract,
        hireDate: formData.jobData.hireDate ? dayjs(formData.jobData.hireDate) : null,
        orderNumber: formData.jobData.orderNumber,
        educationLevel: formData.educationData.educationLevel,
        institution: formData.educationData.institution,
        specialty: formData.educationData.specialty,
        graduationYear: formData.educationData.graduationYear,
        diplomaNumber: formData.educationData.diplomaNumber,
        academicTitle: formData.educationData.academicTitle,
      });
    }
  }, [formData, form, currentStep]);

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
        [name]: value,
      },
    }));
    form.setFieldsValue({ [name]: value });
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
          issuedDate: formData.passportData.issuedDate,
          birthDate: formData.passportData.birthDate,
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
          hireDate: formData.jobData.hireDate,
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
        vacationStatus: formData.vacationStatus,
        documents: formData.documents,
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
        jobData: ["department", "position", "grade", "salary", "employmentContract", "hireDate", "orderNumber"],
        educationData: ["educationLevel", "institution", "specialty", "graduationYear", "diplomaNumber"],
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
          toast.error(error, { position: "top-right", autoClose: 3000 });
        });
        return;
      }

      const token = getToken();
      if (!token) return;

      setIsLoading(true);

      const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFormData),
      });

      if (response.ok) {
        toast.success("✅ Xodim muvaffaqiyatli yangilandi!", {
          position: "top-right",
          autoClose: 3000,
        });
        setTimeout(() => navigate("/"), 3000);
      } else {
        const errorData = await response.json();
        toast.error(`❌ Xatolik: ${errorData.message || errorData.error || "Ma'lumotlar yangilanmadi!"}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error(`❌ Xatolik: ${error.message || "Server bilan bog'lanishda xatolik yuz berdi."}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
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
      console.log("Validation failed:", error);
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
      title: "Qadam 1",
      content: (
        <Form form={form} layout="vertical">
          <h3>Passport Ma'lumotlarini Tahrirlash</h3>
          <div className="form-row">
            <div className="form-group">
              <Form.Item
                label="F.I.O."
                name="fullName"
                rules={[{ required: true, message: "Iltimos, F.I.O. ni kiriting!" }]}
              >
                <Input
                  value={formData?.passportData.fullName}
                  onChange={(e) => handleChange("passportData", "fullName", e.target.value)}
                  placeholder="F.I.O."
                />
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="INN"
                name="inn"
                rules={[
                  { required: true, message: "Iltimos, INN ni kiriting!" },
                  { pattern: /^\d{9}$/, message: "INN 9 raqamdan iborat bo'lishi kerak!" },
                ]}
              >
                <Input
                  value={formData?.passportData.inn}
                  onChange={(e) => handleChange("passportData", "inn", e.target.value)}
                  placeholder="123456789"
                  maxLength={9}
                />
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="INSP"
                name="insp"
                rules={[
                  { required: true, message: "Iltimos, INSP ni kiriting!" },
                  { pattern: /^\d{14}$/, message: "INSP 14 raqamdan iborat bo'lishi kerak!" },
                ]}
              >
                <Input
                  value={formData?.passportData.insp}
                  onChange={(e) => handleChange("passportData", "insp", e.target.value)}
                  placeholder="14141414141234"
                  maxLength={14}
                />
              </Form.Item>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <Form.Item
                label="Manzil"
                name="address"
                rules={[{ required: true, message: "Iltimos, manzilni kiriting!" }]}
              >
                <Input
                  value={formData?.passportData.address}
                  onChange={(e) => handleChange("passportData", "address", e.target.value)}
                  placeholder="Manzil"
                />
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="Pasport Seriyasi"
                name="passportSeries"
                rules={[
                  { required: true, message: "Iltimos, passport seriyasini kiriting!" },
                  { pattern: /^[A-Z]{2}$/, message: "Passport seriyasi 2 harfdan iborat bo'lishi kerak!" },
                ]}
              >
                <Input
                  value={formData?.passportData.passportSeries}
                  onChange={(e) => handleChange("passportData", "passportSeries", e.target.value)}
                  placeholder="Pasport Seriyasi (masalan: AB)"
                  maxLength={2}
                />
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="Pasport Raqami"
                name="passportNumber"
                rules={[
                  { required: true, message: "Iltimos, passport raqamini kiriting!" },
                  { pattern: /^\d{7}$/, message: "Passport raqami 7 raqamdan iborat bo'lishi kerak!" },
                ]}
              >
                <Input
                  value={formData?.passportData.passportNumber}
                  onChange={(e) => handleChange("passportData", "passportNumber", e.target.value)}
                  placeholder="Pasport Raqami"
                  maxLength={7}
                />
              </Form.Item>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <Form.Item
                label="Kim Tomonidan Berilgan"
                name="issuedBy"
                rules={[{ required: true, message: "Iltimos, kim tomonidan berilganligini kiriting!" }]}
              >
                <Input
                  value={formData?.passportData.issuedBy}
                  onChange={(e) => handleChange("passportData", "issuedBy", e.target.value)}
                  placeholder="Kim Tomonidan Berilgan"
                />
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="Berilgan Sana"
                name="issuedDate"
                rules={[{ required: true, message: "Iltimos, berilgan sanani kiriting!" }]}
              >
                <AntdDatePicker
                  value={formData?.passportData.issuedDate ? dayjs(formData.passportData.issuedDate) : null}
                  onChange={(date) => handleDateChange("passportData", "issuedDate", date)}
                  style={{ width: "100%" }}
                  placeholder="Berilgan Sana"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="Tug'ilgan Sana"
                name="birthDate"
                rules={[{ required: true, message: "Iltimos, tug'ilgan sanani kiriting!" }]}
              >
                <AntdDatePicker
                  value={formData?.passportData.birthDate ? dayjs(formData.passportData.birthDate) : null}
                  onChange={(date) => handleDateChange("passportData", "birthDate", date)}
                  style={{ width: "100%" }}
                  placeholder="Tug'ilgan Sana"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <Form.Item
                label="Jinsi"
                name="gender"
                rules={[{ required: true, message: "Iltimos, jinsni tanlang!" }]}
              >
                <Select
                  value={formData?.passportData.gender}
                  onChange={(value) => handleSelectChange("passportData", "gender", value)}
                  placeholder="Tanlang"
                >
                  <Option value="Erkak">Erkak</Option>
                  <Option value="Ayol">Ayol</Option>
                </Select>
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="Tug'ilgan joyi"
                name="birthPlace"
                rules={[{ required: true, message: "Iltimos, tug'ilgan joyni kiriting!" }]}
              >
                <Input
                  value={formData?.passportData.birthPlace}
                  onChange={(e) => handleChange("passportData", "birthPlace", e.target.value)}
                  placeholder="Tug'ilgan joyi"
                />
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="Millati"
                name="nationality"
                rules={[{ required: true, message: "Iltimos, millatni kiriting!" }]}
              >
                <Input
                  value={formData?.passportData.nationality}
                  onChange={(e) => handleChange("passportData", "nationality", e.target.value)}
                  placeholder="Millati"
                />
              </Form.Item>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <Form.Item
                label="Telefon Raqami"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Iltimos, telefon raqamini kiriting!" },
                  { pattern: /^\+998\d{9}$/, message: "Telefon raqami +998 bilan boshlanib, 9 raqamdan iborat bo'lishi kerak!" },
                ]}
              >
                <Input
                  value={formData?.passportData.phoneNumber}
                  onChange={(e) => handleChange("passportData", "phoneNumber", e.target.value)}
                  placeholder="+998901234567"
                  maxLength={13}
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      ),
    },
    {
      title: "Qadam 2",
      content: (
        <Form form={form} layout="vertical">
          <h3>Ish Joyi Bo'yicha Ma'lumotlarni Tahrirlash</h3>
          <div className="form-row">
            <div className="form-group">
              <Form.Item
                label="Bo'lim"
                name="department"
                rules={[{ required: true, message: "Iltimos, bo'limni tanlang!" }]}
              >
                <Select
                  value={formData?.jobData.department}
                  onChange={(value) => {
                    handleSelectChange("jobData", "department", value);
                    handleSelectChange("jobData", "position", "");
                  }}
                  placeholder="Bo'lim tanlang"
                  style={{ width: "100%" }}
                >
                  {departments.map((dep) => (
                    <Option key={dep} value={dep}>
                      {dep}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="Lavozimi"
                name="position"
                rules={[{ required: true, message: "Iltimos, lavozimni tanlang!" }]}
              >
                <Select
                  value={formData?.jobData.position}
                  onChange={(value) => {
                    if (validatePositionLimits(formData.jobData.department, value)) {
                      handleSelectChange("jobData", "position", value);
                    } else {
                      toast.error("Bu lavozim uchun xodimlar soni cheklangan!", {
                        position: "top-right",
                      });
                    }
                  }}
                  placeholder="Lavozim tanlang"
                  style={{ width: "100%" }}
                  disabled={!formData?.jobData.department}
                >
                  {positionsByDepartment[formData?.jobData.department]?.positions?.map((pos) => (
                    <Option key={pos.name} value={pos.name}>
                      {`${pos.name} (Mavjud: ${
                        pos.max -
                        (currentEmployeeCounts[formData?.jobData.department]?.[pos.name] || 0) +
                        (formData?.jobData.department === formData?.jobData.department &&
                        formData?.jobData.position === pos.name
                          ? 1
                          : 0)
                      })`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="Razryadi"
                name="grade"
                rules={[{ required: true, message: "Iltimos, razryadni kiriting!" }]}
              >
                <Input
                  value={formData?.jobData.grade}
                  onChange={(e) => handleChange("jobData", "grade", e.target.value)}
                  placeholder="Razryadi"
                />
              </Form.Item>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <Form.Item
                label="Maoshi"
                name="salary"
                rules={[
                  { required: true, message: "Iltimos, maoshni kiriting!" },
                  { pattern: /^\d+$/, message: "Maosh faqat raqamlardan iborat bo'lishi kerak!" },
                ]}
              >
                <Input
                  value={formData?.jobData.salary}
                  onChange={(e) => handleChange("jobData", "salary", e.target.value)}
                  placeholder="Maoshi"
                />
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="Bandlik Yo'llanmasi"
                name="employmentContract"
                rules={[{ required: true, message: "Iltimos, bandlik yo'llanmasini kiriting!" }]}
              >
                <Input
                  value={formData?.jobData.employmentContract}
                  onChange={(e) => handleChange("jobData", "employmentContract", e.target.value)}
                  placeholder="Bandlik Yo'llanmasi"
                />
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="Ishga Kirgan Sana"
                name="hireDate"
                rules={[{ required: true, message: "Iltimos, ishga kirgan sanani kiriting!" }]}
              >
                <AntdDatePicker
                  value={formData?.jobData.hireDate ? dayjs(formData.jobData.hireDate) : null}
                  onChange={(date) => handleDateChange("jobData", "hireDate", date)}
                  style={{ width: "100%" }}
                  placeholder="Ishga Kirgan Sana"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <Form.Item
                label="Buyruq Raqami"
                name="orderNumber"
                rules={[{ required: true, message: "Iltimos, buyruq raqamini kiriting!" }]}
              >
                <Input
                  value={formData?.jobData.orderNumber}
                  onChange={(e) => handleChange("jobData", "orderNumber", e.target.value)}
                  placeholder="Buyruq Raqami"
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      ),
    },
    {
      title: "Qadam 3",
      content: (
        <Form form={form} layout="vertical">
          <h3>Ta'lim Ma'lumotlari</h3>
          <div className="form-row">
            <div className="form-group">
              <Form.Item
                label="Ta'lim darajasi"
                name="educationLevel"
                rules={[{ required: true, message: "Iltimos, ta'lim darajasini tanlang!" }]}
              >
                <Select
                  value={formData?.educationData.educationLevel}
                  onChange={(value) => handleSelectChange("educationData", "educationLevel", value)}
                  placeholder="Ta'lim darajasini tanlang"
                  style={{ width: "100%" }}
                >
                  <Option value="Oliy">Oliy</Option>
                  <Option value="O'rta">O'rta</Option>
                  <Option value="O'rta maxsus">O'rta maxsus</Option>
                </Select>
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="O'quv yurti"
                name="institution"
                rules={[{ required: true, message: "Iltimos, o'quv yurtini kiriting!" }]}
              >
                <Input
                  value={formData?.educationData.institution}
                  onChange={(e) => handleChange("educationData", "institution", e.target.value)}
                  placeholder="O'quv yurti"
                />
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="Mutaxassislik"
                name="specialty"
                rules={[{ required: true, message: "Iltimos, mutaxassislikni kiriting!" }]}
              >
                <Input
                  value={formData?.educationData.specialty}
                  onChange={(e) => handleChange("educationData", "specialty", e.target.value)}
                  placeholder="Mutaxassislik"
                />
              </Form.Item>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <Form.Item
                label="Bitirgan Yili"
                name="graduationYear"
                rules={[
                  { required: true, message: "Iltimos, bitirgan yilni kiriting!" },
                  {
                    validator: (_, value) =>
                      value && (value < 1900 || value > new Date().getFullYear())
                        ? Promise.reject(
                            new Error(`Bitirish yili 1900 dan ${new Date().getFullYear()} gacha bo'lishi kerak!`)
                          )
                        : Promise.resolve(),
                  },
                ]}
              >
                <Input
                  type="number"
                  value={formData?.educationData.graduationYear}
                  onChange={(e) => handleChange("educationData", "graduationYear", e.target.value)}
                  placeholder="Bitirgan Yili"
                />
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item
                label="Diplom raqami"
                name="diplomaNumber"
                rules={[{ required: true, message: "Iltimos, diplom raqamini kiriting!" }]}
              >
                <Input
                  value={formData?.educationData.diplomaNumber}
                  onChange={(e) => handleChange("educationData", "diplomaNumber", e.target.value)}
                  placeholder="Diplom raqami"
                />
              </Form.Item>
            </div>
            <div className="form-group">
              <Form.Item label="Ilmiy Unvoni" name="academicTitle">
                <Input
                  value={formData?.educationData.academicTitle}
                  onChange={(e) => handleChange("educationData", "academicTitle", e.target.value)}
                  placeholder="Ilmiy unvoni kiriting"
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      ),
    },
  ];

  if (fetchLoading) return <Spin tip="Ma'lumotlar yuklanmoqda..." />;
  if (error) return <div>Xatolik: {error}</div>;
  if (!formData) return <div>Xodim ma'lumotlari topilmadi!</div>;

  return (
    <div className="add-employee-container">
      <ToastContainer />
      <h2>Xodim Ma'lumotlarini Tahrirlash</h2>
      <div className="step-container">
        <Steps current={currentStep}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="step-content">{steps[currentStep].content}</div>
        <div className="form-actions">
          <Button className="add-btn back" onClick={handleGoBack} disabled={isLoading}>
            Ortga Qaytish
          </Button>
          {currentStep > 0 && (
            <Button className="add-btn" onClick={prevStep}>
              Oldingi
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button className="add-btn" onClick={nextStep}>
              Keyingi
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button className="add-btn" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Yuklanmoqda..." : "Saqlash"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPage;