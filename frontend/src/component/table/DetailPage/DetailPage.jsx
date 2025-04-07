import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Spin } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import Files from "../Document/Files";
import { fetchEmployeeById, clearCurrentEmployee } from "../../../redux/slices/departmentSlice";
// import { fetchEmployeeById, clearCurrentEmployee } from "../redux/slices/employeeSlice";

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentEmployee, fetchStatus, fetchError } = useSelector(
    (state) => state.departments // state.employees o‘rniga state.departments
  );
  const { isDarkMode } = useSelector((state) => state.theme);

  useEffect(() => {
    if (!id || id === "undefined") {
      toast.error("Xodim ID si noto'g'ri yoki topilmadi!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Tizimga kiring!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
      return;
    }

    dispatch(fetchEmployeeById(id));

    return () => {
      dispatch(clearCurrentEmployee());
    };
  }, [id, navigate, dispatch]);

  useEffect(() => {
    if (fetchStatus === "failed" && fetchError) {
      toast.error(`❌ Xatolik: ${fetchError}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [fetchStatus, fetchError]);

  const handleEdit = () => {
    if (!currentEmployee?._id) {
      toast.error("Xodim ma'lumotlari topilmadi!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    navigate(`/edit/${currentEmployee._id}`);
  };

  if (fetchStatus === "loading") {
    return (
      <div
        className={`p-6 rounded-lg shadow-md flex flex-col items-center ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <Spin tip="Ma'lumotlar yuklanmoqda..." />
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  if (!currentEmployee || !currentEmployee.passportData) {
    return (
      <div
        className={`p-6 rounded-lg shadow-md flex flex-col items-center ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-semibold text-red-500 mb-4">
          Xodim ma'lumotlari topilmadi!
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <ToastContainer />
      <h2 className="text-2xl font-semibold text-blue-500 mb-6">
        {currentEmployee.passportData.fullName || "Noma'lum"} haqida to'liq ma'lumot
      </h2>

      {/* Passport Ma'lumotlari */}
      <section
        className={`p-4 rounded-md mb-4 ${
          isDarkMode ? "bg-gray-700" : "bg-gray-100"
        }`}
      >
        <h3 className="text-xl font-semibold text-blue-500 mb-3">
          Passport Ma'lumotlari
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <p>
            <strong>F.I.O:</strong>{" "}
            {currentEmployee.passportData.fullName || "Noma'lum"}
          </p>
          <p>
            <strong>Telefon:</strong>{" "}
            {currentEmployee.passportData.phoneNumber || "Noma'lum"}
          </p>
          <p>
            <strong>INN:</strong>{" "}
            {currentEmployee.passportData.inn || "Noma'lum"}
          </p>
          <p>
            <strong>INSP:</strong>{" "}
            {currentEmployee.passportData.insp || "Noma'lum"}
          </p>
          <p>
            <strong>Manzil:</strong>{" "}
            {currentEmployee.passportData.address || "Noma'lum"}
          </p>
          <p>
            <strong>Pasport Seriyasi:</strong>{" "}
            {currentEmployee.passportData.passportSeries || "Noma'lum"}
          </p>
          <p>
            <strong>Pasport Raqami:</strong>{" "}
            {currentEmployee.passportData.passportNumber || "Noma'lum"}
          </p>
          <p>
            <strong>Kim Tomonidan Berilgan:</strong>{" "}
            {currentEmployee.passportData.issuedBy || "Noma'lum"}
          </p>
          <p>
            <strong>Berilgan Sana:</strong>{" "}
            {currentEmployee.passportData.issuedDate
              ? moment(currentEmployee.passportData.issuedDate).format(
                  "DD.MM.YYYY"
                )
              : "Noma'lum"}
          </p>
          <p>
            <strong>Tug'ilgan Sana:</strong>{" "}
            {currentEmployee.passportData.birthDate
              ? moment(currentEmployee.passportData.birthDate).format(
                  "DD.MM.YYYY"
                )
              : "Noma'lum"}
          </p>
          <p>
            <strong>Jinsi:</strong>{" "}
            {currentEmployee.passportData.gender || "Noma'lum"}
          </p>
          <p>
            <strong>Tug'ilgan Joyi:</strong>{" "}
            {currentEmployee.passportData.birthPlace || "Noma'lum"}
          </p>
          <p>
            <strong>Millati:</strong>{" "}
            {currentEmployee.passportData.nationality || "Noma'lum"}
          </p>
        </div>
      </section>

      {/* Ish Joyi Ma'lumotlari */}
      <section
        className={`p-4 rounded-md mb-4 ${
          isDarkMode ? "bg-gray-700" : "bg-gray-100"
        }`}
      >
        <h3 className="text-xl font-semibold text-blue-500 mb-3">
          Ish Joyi Ma'lumotlari
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <p>
            <strong>Bo'lim:</strong>{" "}
            {currentEmployee.jobData?.department || "Noma'lum"}
          </p>
          <p>
            <strong>Lavozimi:</strong>{" "}
            {currentEmployee.jobData?.position || "Noma'lum"}
          </p>
          <p>
            <strong>Razryadi:</strong>{" "}
            {currentEmployee.jobData?.grade || "Noma'lum"}
          </p>
          <p>
            <strong>Maoshi:</strong>{" "}
            {currentEmployee.jobData?.salary || "Noma'lum"}
          </p>
          <p>
            <strong>Bandlik Yo'llanmasi:</strong>{" "}
            {currentEmployee.jobData?.employmentContract || "Noma'lum"}
          </p>
          <p>
            <strong>Ishga Kirgan Vaqti:</strong>{" "}
            {currentEmployee.jobData?.hireDate
              ? moment(currentEmployee.jobData.hireDate).format("DD.MM.YYYY")
              : "Noma'lum"}
          </p>
          <p>
            <strong>Buyruq Raqami:</strong>{" "}
            {currentEmployee.jobData?.orderNumber || "Noma'lum"}
          </p>
          <p>
            <strong>Ish Tajribasi:</strong>{" "}
            {currentEmployee.jobData?.experience || "Noma'lum"}
          </p>
        </div>
      </section>

      {/* Ma'lumoti */}
      <section
        className={`p-4 rounded-md mb-4 ${
          isDarkMode ? "bg-gray-700" : "bg-gray-100"
        }`}
      >
        <h3 className="text-xl font-semibold text-blue-500 mb-3">Ma'lumoti</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <p>
            <strong>Ma'lumoti:</strong>{" "}
            {currentEmployee.educationData?.educationLevel || "Noma'lum"}
          </p>
          <p>
            <strong>Qaysi O'quv Yurtini Tamomlagan:</strong>{" "}
            {currentEmployee.educationData?.institution || "Noma'lum"}
          </p>
          <p>
            <strong>Mutaxassisligi:</strong>{" "}
            {currentEmployee.educationData?.specialty || "Noma'lum"}
          </p>
          <p>
            <strong>Bitirgan Yili:</strong>{" "}
            {currentEmployee.educationData?.graduationYear || "Noma'lum"}
          </p>
          <p>
            <strong>Diplom Raqami:</strong>{" "}
            {currentEmployee.educationData?.diplomaNumber || "Noma'lum"}
          </p>
        </div>
      </section>

      {/* Hujjatlar */}
      <section
        className={`p-4 rounded-md mb-4 ${
          isDarkMode ? "bg-gray-700" : "bg-gray-100"
        }`}
      >
        <h3 className="text-xl font-semibold text-blue-500 mb-3">Hujjatlar</h3>
        <Files employeeId={id} />
      </section>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => navigate("/")}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Bosh sahifaga qaytish
        </button>
        <button
          onClick={handleEdit}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Tahrirlash
        </button>
      </div>
    </div>
  );
};

export default DetailPage;