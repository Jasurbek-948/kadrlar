import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, logoutUser } from "./redux/slices/authSlice";
import { setDarkMode } from "./redux/slices/themeSlice";
import Table from "./component/table/Table";
import DetailPage from "./component/table/DetailPage/DetailPage";
import EditPage from "./component/table/EditPage/EditPage";
import AddEmployeePage from "./component/table/AddEmployee/AddEmployeePage";
import Header from "./component/header/Header";
import Sidebar from "./component/sidebar/Sidebar";
import MonthlySidebar from "./component/oylik/MonthlySidebar";
import MonthlyReports from "./component/oylik/MonthlyReports";
import VacationTable from "./component/table/VocationTable/VacationTable";
import Document from "./component/table/Document/EmployeeTable";
import AddDocument from "./component/table/Document/AddDocument";
import Archive from "./component/arxiv/Archive";
import Jazo from "./component/table/jazo/Jazo";
import SignInPage from "./component/signIn/SignInPage";
import { ToastContainer, toast } from "react-toastify";
import ProtectedRoute from "./ProtectedRoute";
import Tabel from "./component/tabel/Tabel";
import Refer from "./component/refer/Refer";
import Mexnat from "./component/mexnat/Mexnat";
import "antd/dist/reset.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import Quarter from "./component/quarter/Quarter";
import QuarterSidebar from "./component/quarter/QuarterSidebar";
import Yearly from "./component/yearly/Yearly";
import YearlySidebar from "./component/yearly/YearlySidebar";
import Classifier from "./component/yearly/Classifier";
import Analitika from "./component/yearly/analitika/Analitika";
import Vocation from "./component/yearly/vocation/Vocation";
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  const { isDarkMode } = useSelector((state) => state.theme);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [activeMenu, setActiveMenu] = useState('milliy-tarkib');
  const [showedToast, setShowedToast] = useState(false);

  // Handle authentication and navigation
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !token) {
      dispatch(loginUser({ token: storedToken }));
    } else if (!storedToken && isAuthenticated) {
      dispatch(logoutUser());
    }

    if (!isAuthenticated && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    } else if (isAuthenticated && location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [dispatch, isAuthenticated, token, navigate]);

  // Handle system dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => dispatch(setDarkMode(e.matches));
    mediaQuery.addEventListener("change", handleChange);
    dispatch(setDarkMode(mediaQuery.matches));
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [dispatch]);

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Show login prompt toast
  useEffect(() => {
    if (!isAuthenticated && !showedToast && location.pathname === "/login") {
      toast.info("Iltimos, qayta kirish qiling!", {
        onOpen: () => setShowedToast(true),
      });
    }
  }, [isAuthenticated, location.pathname, showedToast]);

  const handleMenuChange = (menuId) => {
    setActiveMenu(menuId);
  };

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    dispatch(loginUser({ token }));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  const renderSidebar = () => {
    if (location.pathname === "/hisobot" || location.pathname === "/mexnat") {
      return <MonthlySidebar />;
    } else if (location.pathname === '/choraklik-hisobotlar' || location.pathname === '/choraklik-hisobotlar/klassifikator' || location.pathname === '/choraklik-hisobotlar/analitika') {
      return <YearlySidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />;
    } else if (location.pathname === '/yillik-hisobotlar') {
      return <QuarterSidebar />
    }
    return <Sidebar />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer
        theme={isDarkMode ? "dark" : "light"}
        position="top-right"
        autoClose={3000}
      />
      {location.pathname === "/login" ? (
        <Routes>
          <Route path="/login" element={<SignInPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <>
          <Header onLogout={handleLogout} />
          <div className="flex flex-1">
            <div className="hidden lg:block">{renderSidebar()}</div>
            <main
              className={`flex-1 p-4 sm:p-6 overflow-y-auto shadow-md rounded-lg m-2 sm:m-4 transition-colors duration-300 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <Routes>
                <Route
                  path="/"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}><Table /></ProtectedRoute>}
                />
                <Route
                  path="/tatil"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}><VacationTable /></ProtectedRoute>}
                />
                <Route
                  path="/xujjat"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}><Document /></ProtectedRoute>}
                />
                <Route
                  path="/jazo"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}><Jazo /></ProtectedRoute>}
                />
                <Route
                  path="/xujjat/AddDocument"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}><AddDocument /></ProtectedRoute>}
                />
                <Route
                  path="/tabel"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}><Tabel /></ProtectedRoute>}
                />
                <Route
                  path="/refer"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}><Refer /></ProtectedRoute>}
                />
                <Route
                  path="/archive"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}><Archive /></ProtectedRoute>}
                />
                <Route
                  path="/detail/:id"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}><DetailPage /></ProtectedRoute>}
                />
                <Route
                  path="/edit/:id"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}><EditPage /></ProtectedRoute>}
                />
                <Route
                  path="/add-employee"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}><AddEmployeePage /></ProtectedRoute>}
                />
                <Route
                  path="/hisobot"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}><MonthlyReports /></ProtectedRoute>}
                />
                <Route
                  path="/mexnat"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}><Mexnat /></ProtectedRoute>}
                />
                <Route
                  path="/yillik-hisobotlar"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Quarter departmentFilter={departmentFilter} positionFilter={positionFilter} />
                  </ProtectedRoute>}
                />
                <Route
                  path="/choraklik-hisobotlar"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Yearly departmentFilter={departmentFilter} positionFilter={positionFilter} />
                  </ProtectedRoute>}
                />
                <Route
                  path="/choraklik-hisobotlar/klassifikator"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Classifier departmentFilter={departmentFilter} positionFilter={positionFilter} />
                  </ProtectedRoute>}
                />
                <Route
                  path="/choraklik-hisobotlar/analitika"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Analitika departmentFilter={departmentFilter} positionFilter={positionFilter} />
                  </ProtectedRoute>}
                />
                <Route
                  path="/choraklik-hisobotlar/vakansiya"
                  element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Vocation />
                  </ProtectedRoute>}
                />
                <Route
                  path="*"
                  element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
                />
              </Routes>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;