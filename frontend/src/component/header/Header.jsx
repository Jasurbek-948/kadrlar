import React, { useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt, faBars, faUsers, faFileAlt, faCalendarAlt, faFileContract } from "@fortawesome/free-solid-svg-icons";
import { logoutUser } from "../../redux/slices/authSlice";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state) => state.theme);
  const { isAuthenticated, status, error } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = useCallback(
    (path) => {
      navigate(path);
      setIsMenuOpen(false);
    },
    [navigate]
  );

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const onLogout = useCallback(async () => {
    try {
      console.log("Logout tugmasi bosildi (Header)");
      await dispatch(logoutUser()).unwrap();
      navigate("/login", { replace: true });
      setIsMenuOpen(false);
    } catch (err) {
      console.error("Header logout xatosi:", err);
      // Navigate to login even if logout fails, as local state is cleared
      navigate("/login", { replace: true });
      setIsMenuOpen(false);
    }
  }, [dispatch, navigate]);

  return (
    <header
      className={`w-full p-4 flex justify-between items-center sticky top-0 z-50 ${
        isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
      } border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      <div className="flex items-center space-x-3">
        <div className="text-lg font-semibold">Logo</div>
      </div>

      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Toggle menu"
        disabled={!isAuthenticated}
      >
        <FontAwesomeIcon
          icon={faBars}
          className={`text-lg ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}
        />
      </button>

      <nav
        className={`${
          isMenuOpen ? "flex" : "hidden"
        } md:flex flex-col md:flex-row absolute md:static top-16 left-0 w-full md:w-auto p-4 md:p-0 space-y-2 md:space-y-0 md:space-x-6 transition-all duration-300 ease-in-out ${
          isDarkMode ? "bg-gray-800 border-t border-gray-700" : "bg-white border-t border-gray-200"
        } z-40`}
      >
        <button
          onClick={() => handleNavigation("/")}
          className={`w-full md:w-auto px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none border-b-2 ${
            location.pathname === "/" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-500"
          }`}
          disabled={!isAuthenticated}
        >
          <FontAwesomeIcon icon={faUsers} className="mr-1" />
          Xodimlar bo'limi
        </button>
        <button
          onClick={() => handleNavigation("/hisobot")}
          className={`w-full md:w-auto px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none border-b-2 ${
            location.pathname === "/hisobot" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-500"
          }`}
          disabled={!isAuthenticated}
        >
          <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
          Oylik hisobotlar
        </button>
        <button
          onClick={() => handleNavigation("/choraklik-hisobotlar")}
          className={`w-full md:w-auto px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none border-b-2 ${
            location.pathname === "/choraklik-hisobotlar" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-500"
          }`}
          disabled={!isAuthenticated}
        >
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
          Choraklik hisobotlar
        </button>
        <button
          onClick={() => handleNavigation("/yillik-hisobotlar")}
          className={`w-full md:w-auto px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none border-b-2 ${
            location.pathname === "/yillik-hisobotlar" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-500"
          }`}
          disabled={!isAuthenticated}
        >
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
          Yillik hisobotlar
        </button>
        <button
          onClick={() => handleNavigation("/mexnat")}
          className={`w-full md:w-auto px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none border-b-2 ${
            location.pathname === "/mexnat" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-500"
          }`}
          disabled={!isAuthenticated}
        >
          <FontAwesomeIcon icon={faFileContract} className="mr-1" />
          Mexnat shartnomasi
        </button>
      </nav>

      <div className="hidden md:flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon
            icon={faUser}
            className={`text-base ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
          />
          <span className="font-medium text-sm">Account</span>
        </div>
        <button
          onClick={onLogout}
          className={`px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none ${
            isDarkMode ? "text-gray-300 hover:text-blue-400" : "text-gray-600 hover:text-blue-500"
          }`}
          disabled={!isAuthenticated || status === "loading"}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
          <span>Chiqish</span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="flex md:hidden items-center space-x-3 p-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon
              icon={faUser}
              className={`text-base ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
            />
            <span className="font-medium text-sm">Account</span>
          </div>
          <button
            onClick={onLogout}
            className={`px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none ${
              isDarkMode ? "text-gray-300 hover:text-blue-400" : "text-gray-600 hover:text-blue-500"
            }`}
            disabled={!isAuthenticated || status === "loading"}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
            <span>Chiqish</span>
          </button>
        </div>
      )}

      {error && (
        <div className="absolute top-16 left-0 w-full bg-red-500 text-white text-center py-2">
          {error}
        </div>
      )}
    </header>
  );
};

export default Header;