import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import "./App.css";
import "antd/dist/reset.css";
import 'react-toastify/dist/ReactToastify.css';
import Jazo from "./component/table/jazo/Jazo";
import SignInPage from "./component/signIn/SignInPage";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./ProtectedRoute";
import { ToggleProvider } from "./context/ToggleContext"; // ToggleContext uchun
import { ThemeProvider } from "./context/ThemeContext"; // ThemeContext uchun
import Tabel from "./component/tabel/Tabel";
import Refer from "./component/refer/Refer";
import Mexnat from "./component/mexnat/Mexnat";

const AppContent = () => {
  const location = useLocation();
  const [data, setData] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    console.log("Token tekshiruvi:", token ? "Mavjud" : "Yo'q", "Dastlabki yuklanish");
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  const renderSidebar = () => {
    if (location.pathname === "/hisobot") {
      return <MonthlySidebar />;
    } if (location.pathname === "/mexnat") {
      return <MonthlySidebar />;
    }
    return <Sidebar />;
  };

  return (
    <div className="app-container">
      <ToastContainer />
      {location.pathname === "/login" ? (
        <Routes>
          <Route path="/login" element={<SignInPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <>
          <Header onLogout={handleLogout} />
          <div className="content-container">
            {renderSidebar()}
            <div className="main-content">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Table data={data} setData={setData} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tatil"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <VacationTable />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/xujjat"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Document />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jazo"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Jazo />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/xujjat/AddDocument"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <AddDocument />
                    </ProtectedRoute>
                  }
                />
                    <Route
                  path="/tabel"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Tabel />
                    </ProtectedRoute>
                  }
                />
                 <Route
                  path="/refer"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Refer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/archive"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Archive />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/detail/:id"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <DetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit/:id"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <EditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-employee"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <AddEmployeePage data={data} setData={setData} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hisobot"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <MonthlyReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mexnat"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Mexnat />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider> {/* ThemeProvider ni eng yuqori darajada o‘rnating */}
        <ToggleProvider>
          <AppContent />
        </ToggleProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;