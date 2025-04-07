import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Steps, Form, Input, Select, Button, DatePicker as AntdDatePicker, Spin } from "antd";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import { fetchEmployeeById, updateEmployee, clearCurrentEmployee } from "../../../redux/slices/employeeSlice";
import { fetchDepartments, fetchEmployeeCounts } from "../../../redux/slices/employeeSlice";
import { setCurrentStep, resetCurrentStep } from "../../../redux/slices/employeeSlice";

const { Step } = Steps;
const { Option } = Select;

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentEmployee, fetchStatus, updateStatus, fetchError, updateError } = useSelector(
    (state) => state.employees
  );
  const { departments: positionsByDepartment, employeeCounts } = useSelector(
    (state) => state.employees
  );
  const { currentStep } = useSelector((state) => state.employees);
  const { isDarkMode } = useSelector((state) => state.theme);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

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

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Tizimga kiring!", { position: "top-right", autoClose: 3000 });
      navigate("/login");
      return;
    }

    dispatch(fetchEmployeeById(id));
    dispatch(fetchEmployeeCounts());
    dispatch(fetchDepartments());

    return () => {
      dispatch(clearCurrentEmployee());
      dispatch(resetCurrentStep());
    };
  }, [id, dispatch, navigate, isAuthenticated]);

  useEffect(() => {
    if (currentEmployee) {
      form.setFieldsValue({
        fullName: currentEmployee.passportData.fullName || "",
        inn: currentEmployee.passportData.inn || "",
        insp: currentEmployee.passportData.insp || "",
        address: currentEmployee.passportData.address || "",
        passportSeries: currentEmployee.passportData.passportSeries || "",
        passportNumber: currentEmployee.passportData.passportNumber || "",
        issuedBy: currentEmployee.passportData.issuedBy || "",
        issuedDate: currentEmployee.passportData.issuedDate
          ? dayjs(currentEmployee.passportData.issuedDate)
          : null,
        birthDate: currentEmployee.passportData.birthDate
          ? dayjs(currentEmployee.passportData.birthDate)
          : null,
        gender: currentEmployee.passportData.gender || "",
        birthPlace: currentEmployee.passportData.birthPlace || "",
        nationality: currentEmployee.passportData.nationality || "",
        phoneNumber: currentEmployee.passportData.phoneNumber || "",
        department: currentEmployee.jobData.department || "",
        position: currentEmployee.jobData.position || "",
        grade: currentEmployee.jobData.grade || "",
        salary: currentEmployee.jobData.salary || "",
        employmentContract: currentEmployee.jobData.employmentContract || "",
        hireDate: currentEmployee.jobData.hireDate ? dayjs(currentEmployee.jobData.hireDate) : null,
        orderNumber: currentEmployee.jobData.orderNumber || "",
        educationLevel: currentEmployee.educationData.educationLevel || "",
        institution: currentEmployee.educationData.institution || "",
        specialty: currentEmployee.educationData.specialty || "",
        graduationYear: currentEmployee.educationData.graduationYear || "",
        diplomaNumber: currentEmployee.educationData.diplomaNumber || "",
        academicTitle: currentEmployee.educationData.academicTitle || "",
      });
    }
  }, [currentEmployee, form]);

  const validatePositionLimits = (department, position) => {
    const departmentData = positionsByDepartment[department];
    if (!departmentData) return false;

    const positionData = departmentData.positions.find((pos) => pos.name === position);
    if (!positionData) return false;

    const currentCount =
      (employeeCounts[department]?.[position] || 0) -
      (currentEmployee?.jobData.department === department &&
      currentEmployee?.jobData.position === position
        ? 1
        : 0);
    return currentCount < positionData.max;
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();

      const formValues = form.getFieldsValue();
      const updatedFormData = {
        passportData: {
          fullName: formValues.fullName || currentEmployee.passportData.fullName || "",
          inn: formValues.inn || currentEmployee.passportData.inn || "",
          insp: formValues.insp || currentEmployee.passportData.insp || "",
          address: formValues.address || currentEmployee.passportData.address || "",
          passportSeries: formValues.passportSeries || currentEmployee.passportData.passportSeries || "",
          passportNumber: formValues.passportNumber || currentEmployee.passportData.passportNumber || "",
          issuedBy: formValues.issuedBy || currentEmployee.passportData.issuedBy || "",
          issuedDate: formValues.issuedDate
            ? formValues.issuedDate.format("YYYY-MM-DD")
            : currentEmployee.passportData.issuedDate || null,
          birthDate: formValues.birthDate
            ? formValues.birthDate.format("YYYY-MM-DD")
            : currentEmployee.passportData.birthDate || null,
          gender: formValues.gender || currentEmployee.passportData.gender || "",
          birthPlace: formValues.birthPlace || currentEmployee.passportData.birthPlace || "",
          nationality: formValues.nationality || currentEmployee.passportData.nationality || "",
          phoneNumber: formValues.phoneNumber || currentEmployee.passportData.phoneNumber || "",
        },
        jobData: {
          department: formValues.department || currentEmployee.jobData.department || "",
          position: formValues.position || currentEmployee.jobData.position || "",
          grade: formValues.grade || currentEmployee.jobData.grade || "",
          salary: formValues.salary || currentEmployee.jobData.salary || "",
          employmentContract: formValues.employmentContract || currentEmployee.jobData.employmentContract || "",
          hireDate: formValues.hireDate
            ? formValues.hireDate.format("YYYY-MM-DD")
            : currentEmployee.jobData.hireDate || null,
          orderNumber: formValues.orderNumber || currentEmployee.jobData.orderNumber || "",
        },
        educationData: {
          educationLevel: formValues.educationLevel || currentEmployee.educationData.educationLevel || "",
          institution: formValues.institution || currentEmployee.educationData.institution || "",
          specialty: formValues.specialty || currentEmployee.educationData.specialty || "",
          graduationYear: formValues.graduationYear || currentEmployee.educationData.graduationYear || "",
          diplomaNumber: formValues.diplomaNumber || currentEmployee.educationData.diplomaNumber || "",
          academicTitle: formValues.academicTitle || currentEmployee.educationData.academicTitle || "",
        },
        vacationStatus: currentEmployee.vacationStatus || "none",
        documents: currentEmployee.documents || [],
      };

      dispatch(updateEmployee({ id, updatedData: updatedFormData })).then((result) => {
        if (result.error) {
          toast.error(`❌ Xatolik: ${result.payload}`, {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          toast.success("✅ Xodim muvaffaqiyatli yangilandi!", {
            position: "top-right",
            autoClose: 3000,
          });
          setTimeout(() => navigate("/"), 3000);
        }
      });
    } catch (error) {
      toast.error(`❌ Xatolik: ${error.message || "Forma maydonlarini to'ldiring!"}`, {
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
      dispatch(setCurrentStep(currentStep + 1));
    } catch (error) {
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const prevStep = () => {
    dispatch(setCurrentStep(currentStep - 1));
  };

  if (fetchStatus === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spin tip="Ma'lumotlar yuklanmoqda..." />
      </div>
    );
  }
  if (fetchStatus === "failed") {
    return <div className="text-center text-red-500">Xatolik: {fetchError}</div>;
  }
  if (!currentEmployee) {
    return <div className="text-center text-gray-500">Xodim ma'lumotlari topilmadi!</div>;
  }

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <ToastContainer />
      <h2 className="text-2xl font-bold text-blue-500 mb-6">Xodim Ma'lumotlarini Tahrirlash</h2>
      <div className="space-y-6">
        <Steps current={currentStep}>
          <Step title="Qadam 1" />
          <Step title="Qadam 2" />
          <Step title="Qadam 3" />
        </Steps>
        <Form form={form} layout="vertical" className="space-y-4">
          {/* Qadam 1: Passport Ma'lumotlari */}
          <div style={{ display: currentStep === 0 ? "block" : "none" }}>
            <h3 className="text-lg font-semibold text-blue-500">Passport Ma'lumotlarini Tahrirlash</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item
                label="F.I.O."
                name="fullName"
                rules={[{ required: true, message: "Iltimos, F.I.O. ni kiriting!" }]}
              >
                <Input placeholder="F.I.O." className="w-full p-2 border rounded-md" />
              </Form.Item>
              <Form.Item
                label="INN"
                name="inn"
                rules={[
                  { required: true, message: "Iltimos, INN ni kiriting!" },
                  { pattern: /^\d{9}$/, message: "INN 9 raqamdan iborat bo'lishi kerak!" },
                ]}
              >
                <Input placeholder="123456789" maxLength={9} className="w-full p-2 border rounded-md" />
              </Form.Item>
              <Form.Item
                label="INSP"
                name="insp"
                rules={[
                  { required: true, message: "Iltimos, INSP ni kiriting!" },
                  { pattern: /^\d{14}$/, message: "INSP 14 raqamdan iborat bo'lishi kerak!" },
                ]}
              >
                <Input placeholder="14141414141234" maxLength={14} className="w-full p-2 border rounded-md" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item
                label="Manzil"
                name="address"
                rules={[{ required: true, message: "Iltimos, manzilni kiriting!" }]}
              >
                <Input placeholder="Manzil" className="w-full p-2 border rounded-md" />
              </Form.Item>
              <Form.Item
                label="Pasport Seriyasi"
                name="passportSeries"
                rules={[
                  { required: true, message: "Iltimos, passport seriyasini kiriting!" },
                  { pattern: /^[A-Z]{2}$/, message: "Passport seriyasi 2 harfdan iborat bo'lishi kerak!" },
                ]}
              >
                <Input placeholder="Pasport Seriyasi (masalan: AB)" maxLength={2} className="w-full p-2 border rounded-md" />
              </Form.Item>
              <Form.Item
                label="Pasport Raqami"
                name="passportNumber"
                rules={[
                  { required: true, message: "Iltimos, passport raqamini kiriting!" },
                  { pattern: /^\d{7}$/, message: "Passport raqami 7 raqamdan iborat bo'lishi kerak!" },
                ]}
              >
                <Input placeholder="Pasport Raqami" maxLength={7} className="w-full p-2 border rounded-md" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item
                label="Kim Tomonidan Berilgan"
                name="issuedBy"
                rules={[{ required: true, message: "Iltimos, kim tomonidan berilganligini kiriting!" }]}
              >
                <Input placeholder="Kim Tomonidan Berilgan" className="w-full p-2 border rounded-md" />
              </Form.Item>
              <Form.Item
                label="Berilgan Sana"
                name="issuedDate"
                rules={[{ required: true, message: "Iltimos, berilgan sanani kiriting!" }]}
              >
                <AntdDatePicker className="w-full p-2 border rounded-md" placeholder="Berilgan Sana" format="YYYY-MM-DD" />
              </Form.Item>
              <Form.Item
                label="Tug'ilgan Sana"
                name="birthDate"
                rules={[{ required: true, message: "Iltimos, tug'ilgan sanani kiriting!" }]}
              >
                <AntdDatePicker className="w-full p-2 border rounded-md" placeholder="Tug'ilgan Sana" format="YYYY-MM-DD" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item
                label="Jinsi"
                name="gender"
                rules={[{ required: true, message: "Iltimos, jinsni tanlang!" }]}
              >
                <Select placeholder="Tanlang" className="w-full">
                  <Option value="Erkak">Erkak</Option>
                  <Option value="Ayol">Ayol</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Tug'ilgan joyi"
                name="birthPlace"
                rules={[{ required: true, message: "Iltimos, tug'ilgan joyni kiriting!" }]}
              >
                <Input placeholder="Tug'ilgan joyi" className="w-full p-2 border rounded-md" />
              </Form.Item>
              <Form.Item
                label="Millati"
                name="nationality"
                rules={[{ required: true, message: "Iltimos, millatni kiriting!" }]}
              >
                <Input placeholder="Millati" className="w-full p-2 border rounded-md" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item
                label="Telefon Raqami"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Iltimos, telefon raqamini kiriting!" },
                  {
                    pattern: /^\+998\d{9}$/,
                    message: "Telefon raqami +998 bilan boshlanib, 9 raqamdan iborat bo'lishi kerak!",
                  },
                ]}
              >
                <Input placeholder="+998901234567" maxLength={13} className="w-full p-2 border rounded-md" />
              </Form.Item>
            </div>
          </div>

          {/* Qadam 2: Ish Ma'lumotlari */}
          <div style={{ display: currentStep === 1 ? "block" : "none" }}>
            <h3 className="text-lg font-semibold text-blue-500">Ish Joyi Bo'yicha Ma'lumotlarni Tahrirlash</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item
                label="Bo'lim"
                name="department"
                rules={[{ required: true, message: "Iltimos, bo'limni tanlang!" }]}
              >
                <Select placeholder="Bo'lim tanlang" className="w-full">
                  {departments.map((dep) => (
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
                  onChange={(value) => {
                    const department = form.getFieldValue("department");
                    if (validatePositionLimits(department, value)) {
                      form.setFieldsValue({ position: value });
                    } else {
                      toast.error("Bu lavozim uchun xodimlar soni cheklangan!", {
                        position: "top-right",
                      });
                      form.setFieldsValue({ position: "" });
                    }
                  }}
                  placeholder="Lavozim tanlang"
                  className="w-full"
                  disabled={!form.getFieldValue("department")}
                >
                  {positionsByDepartment[form.getFieldValue("department")]?.positions?.map((pos) => (
                    <Option key={pos.name} value={pos.name}>
                      {`${pos.name} (Mavjud: ${
                        pos.max -
                        (employeeCounts[form.getFieldValue("department")]?.[pos.name] || 0) +
                        (currentEmployee?.jobData.department === form.getFieldValue("department") &&
                        currentEmployee?.jobData.position === pos.name
                          ? 1
                          : 0)
                      })`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Razryadi"
                name="grade"
                rules={[{ required: true, message: "Iltimos, razryadni kiriting!" }]}
              >
                <Input placeholder="Razryadi" className="w-full p-2 border rounded-md" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item
                label="Maoshi"
                name="salary"
                rules={[
                  { required: true, message: "Iltimos, maoshni kiriting!" },
                  { pattern: /^\d+$/, message: "Maosh faqat raqamlardan iborat bo'lishi kerak!" },
                ]}
              >
                <Input placeholder="Maoshi" className="w-full p-2 border rounded-md" />
              </Form.Item>
              <Form.Item
                label="Bandlik Yo'llanmasi"
                name="employmentContract"
                rules={[{ required: true, message: "Iltimos, bandlik yo'llanmasini kiriting!" }]}
              >
                <Input placeholder="Bandlik Yo'llanmasi" className="w-full p-2 border rounded-md" />
              </Form.Item>
              <Form.Item
                label="Ishga Kirgan Sana"
                name="hireDate"
                rules={[{ required: true, message: "Iltimos, ishga kirgan sanani kiriting!" }]}
              >
                <AntdDatePicker className="w-full p-2 border rounded-md" placeholder="Ishga Kirgan Sana" format="YYYY-MM-DD" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item
                label="Buyruq Raqami"
                name="orderNumber"
                rules={[{ required: true, message: "Iltimos, buyruq raqamini kiriting!" }]}
              >
                <Input placeholder="Buyruq Raqami" className="w-full p-2 border rounded-md" />
              </Form.Item>
            </div>
          </div>

          {/* Qadam 3: Ta'lim Ma'lumotlari */}
          <div style={{ display: currentStep === 2 ? "block" : "none" }}>
            <h3 className="text-lg font-semibold text-blue-500">Ta'lim Ma'lumotlari</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item
                label="Ta'lim darajasi"
                name="educationLevel"
                rules={[{ required: true, message: "Iltimos, ta'lim darajasini tanlang!" }]}
              >
                <Select placeholder="Ta'lim darajasini tanlang" className="w-full">
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
                <Input placeholder="O'quv yurti" className="w-full p-2 border rounded-md" />
              </Form.Item>
              <Form.Item
                label="Mutaxassislik"
                name="specialty"
                rules={[{ required: true, message: "Iltimos, mutaxassislikni kiriting!" }]}
              >
                <Input placeholder="Mutaxassislik" className="w-full p-2 border rounded-md" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <Input type="number" placeholder="Bitirgan Yili" className="w-full p-2 border rounded-md" />
              </Form.Item>
              <Form.Item
                label="Diplom raqami"
                name="diplomaNumber"
                rules={[{ required: true, message: "Iltimos, diplom raqamini kiriting!" }]}
              >
                <Input placeholder="Diplom raqami" className="w-full p-2 border rounded-md" />
              </Form.Item>
              <Form.Item label="Ilmiy Unvoni" name="academicTitle">
                <Input placeholder="Ilmiy unvoni kiriting" className="w-full p-2 border rounded-md" />
              </Form.Item>
            </div>
          </div>
        </Form>
        <div className="flex justify-between space-x-4">
          <Button
            onClick={handleGoBack}
            disabled={updateStatus === "loading"}
            className="bg-gray-500 hover:bg-gray-600 text-white rounded-md px-4 py-2"
          >
            Ortga Qaytish
          </Button>
          <div className="flex space-x-4">
            {currentStep > 0 && (
              <Button
                onClick={prevStep}
                className="bg-gray-500 hover:bg-gray-600 text-white rounded-md px-4 py-2"
              >
                Oldingi
              </Button>
            )}
            {currentStep < 2 && (
              <Button
                onClick={nextStep}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2"
              >
                Keyingi
              </Button>
            )}
            {currentStep === 2 && (
              <Button
                onClick={handleSubmit}
                disabled={updateStatus === "loading"}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2"
              >
                {updateStatus === "loading" ? "Yuklanmoqda..." : "Saqlash"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPage;