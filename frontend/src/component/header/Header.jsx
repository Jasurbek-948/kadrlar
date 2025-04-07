import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt, faBars, faUsers, faFileAlt, faCalendarAlt, faFileContract } from "@fortawesome/free-solid-svg-icons";

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state) => state.theme);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      if (onLogout) {
        onLogout();
      }
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className={`w-full p-4 flex justify-between items-center sticky top-0 z-50 ${isDarkMode ? "bg-background-dark text-gray-200" : "bg-background-light text-gray-900"
        } border-b border-gray-200 dark:border-gray-700`} // Oddiy fon va chegara
    >
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <div className="text-lg font-semibold">Logo</div> {/* Oddiy matn logosi */}
      </div>

      {/* Mobil Menyu Tugmasi (Kichik ekranlar uchun) */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Toggle menu"
      >
        <FontAwesomeIcon
          icon={faBars}
          className={`text-lg ${isDarkMode ? "text-gray-200" : "text-gray-900"}`} // Oddiy ikonka
        />
      </button>

      {/* Navigatsiya Tugmalari */}
      <nav
        className={`${isMenuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row absolute md:static top-16 left-0 w-full md:w-auto p-4 md:p-0 space-y-2 md:space-y-0 md:space-x-6 transition-all duration-300 ease-in-out ${isDarkMode ? "bg-background-dark border-t border-gray-700" : "bg-background-light border-t border-gray-200"
          } z-40`} // Oddiy fon va chegara
      >
        <button
          onClick={() => handleNavigation("/")}
          className={`w-full md:w-auto px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none border-b-2 ${location.pathname === "/"
            ? "border-primary text-primary"
            : "border-transparent text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"
            }`} // Faol tugma pastki chiziq bilan belgilandi
        >
          Xodimlar bo'limi
        </button>
        <button
          onClick={() => handleNavigation("/hisobot")}
          className={`w-full md:w-auto px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none border-b-2 ${location.pathname === "/hisobot"
            ? "border-primary text-primary"
            : "border-transparent text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"
            }`}
        >
          Oylik hisobotlar
        </button>
        <button
          onClick={() => handleNavigation("/choraklik-hisobotlar")}
          className={`w-full md:w-auto px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none border-b-2 ${location.pathname === "/choraklik-hisobotlar"
            ? "border-primary text-primary"
            : "border-transparent text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"
            }`}
        >
          Choraklik xisobotlar
        </button>
        <button
          onClick={() => handleNavigation("/yillik-hisobotlar")}
          className={`w-full md:w-auto px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none border-b-2 ${location.pathname === "/choraklik-hisobotlar"
            ? "border-primary text-primary"
            : "border-transparent text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"
            }`}
        >
          Yillik xisobotlar
        </button>
        <button
          onClick={() => handleNavigation("/mexnat")}
          className={`w-full md:w-auto px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none border-b-2 ${location.pathname === "/mexnat"
            ? "border-primary text-primary"
            : "border-transparent text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"
            }`}
        >
          Mexnat shartnomasi
        </button>
        <button
          className={`w-full md:w-auto px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none border-b-2 border-transparent text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary`} // Oddiy matn tugmasi
        >
          Button
        </button>
      </nav>

      {/* Account Bo‘limi */}
      <div className="hidden md:flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon
            icon={faUser}
            className={`text-base ${isDarkMode ? "text-gray-300" : "text-gray-900"}`} // Oddiy ikonka
          />
          <span className="font-medium text-sm">Account</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none text-gray-600 dark:text-gray-300 hover:text-primary"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
          <span>Chiqish</span>
        </button>
      </div>

      {/* Mobil Account Bo‘limi (Kichik ekranlar uchun) */}
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
            onClick={handleLogout}
            className="px-2 py-1 font-medium text-sm transition-colors duration-200 focus:outline-none text-gray-600 dark:text-gray-300 hover:text-primary"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
            <span>Chiqish</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;