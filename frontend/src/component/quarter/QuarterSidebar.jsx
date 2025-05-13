import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faGift,
  faMapMarkerAlt,
  faCreditCard,
  faTags,
  faUserFriends,
  faHeadset,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/slices/themeSlice";


const QuarterSidebar = () => {
     const location = useLocation();
      const dispatch = useDispatch();
      const { isDarkMode } = useSelector((state) => state.theme);
    
      const handleToggleTheme = () => {
        dispatch(toggleTheme());
      };
  return (
     <div
          className={`w-64 h-screen p-4 shadow-lg transition-colors duration-300 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
        >
          <nav className="menu">
            <ul className="space-y-2">
              <li
                className={`rounded-md transition-colors duration-200 ${location.pathname === "/choraklik-hisobotlar"
                  ? isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-900"
                  : isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-200"
                  }`}
              >
                <Link to="/yillik-hisobotlar" className="flex items-center p-2">
                  <FontAwesomeIcon className="mr-3 text-lg" icon={faCalendar} />
                  <span>Zaxira kadrlar</span>
                </Link>
              </li>
              <li
                className={`rounded-md transition-colors duration-200 ${location.pathname === "/choraklik-hisobotlar/klassifikator"
                  ? isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-900"
                  : isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-200"
                  }`}
              >
                <Link to="/yillik-hisobotlar" className="flex items-center p-2">
                  <FontAwesomeIcon className="mr-3 text-lg" icon={faGift} />
                  <span>-------</span>
                </Link>
              </li>
              <li
                className={`rounded-md transition-colors duration-200 ${location.pathname === "/refer"
                  ? isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-900"
                  : isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-200"
                  }`}
              >
                <Link to="/yillik-hisobotlar" className="flex items-center p-2">
                  <FontAwesomeIcon className="mr-3 text-lg" icon={faUserFriends} />
                  <span>------</span>
                </Link>
              </li>
              {/* <li
                className={`rounded-md transition-colors duration-200 ${location.pathname === "/jazo"
                  ? isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-900"
                  : isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-200"
                  }`}
              >
                <Link to="/jazo" className="flex items-center p-2">
                  <FontAwesomeIcon className="mr-3 text-lg" icon={faMapMarkerAlt} />
                  <span>Intizomiy jazolar</span>
                </Link>
              </li> */}
              {/* <li
                className={`rounded-md transition-colors duration-200 ${location.pathname === "/xujjat"
                  ? isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-900"
                  : isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-200"
                  }`}
              >
                <Link to="/xujjat" className="flex items-center p-2">
                  <FontAwesomeIcon className="mr-3 text-lg" icon={faCreditCard} />
                  <span>Qo'shimcha xujjatlar</span>
                </Link>
              </li> */}
              {/* <li
                className={`rounded-md transition-colors duration-200 ${location.pathname === "/tabel"
                  ? isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-900"
                  : isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-200"
                  }`}
              >
                <Link to="/tabel" className="flex items-center p-2">
                  <FontAwesomeIcon className="mr-3 text-lg" icon={faTags} />
                  <span>Tabel</span>
                </Link>
              </li> */}
             
              {/* <li
                className={`rounded-md transition-colors duration-200 ${location.pathname === "/archive"
                  ? isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-900"
                  : isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-200"
                  }`}
              >
                <Link to="/archive" className="flex items-center p-2">
                  <FontAwesomeIcon className="mr-3 text-lg" icon={faHeadset} />
                  <span>Arxiv</span>
                </Link>
              </li> */}
              {/* Tema o‘zgartirish tugmasi */}
              {/* <li className="mt-4">
                <button
                  onClick={handleToggleTheme}
                  className={`flex items-center p-2 w-full rounded-md transition-colors duration-200 ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                  <FontAwesomeIcon
                    className="mr-3 text-lg"
                    icon={isDarkMode ? faSun : faMoon}
                  />
                  <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>
              </li> */}
            </ul>
          </nav>
        </div>
  );
};

export default QuarterSidebar; // Default eksport
