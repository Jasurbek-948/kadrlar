import React from "react";
import "./Sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faGift,
  faMapMarkerAlt,
  faCreditCard,
  faTags,
  faUserFriends,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext"; // useTheme ni import qilamiz

const Sidebar = () => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme(); // ThemeContext o‘rniga useTheme ishlatamiz

  return (
    <div className={`sidebar ${isDarkMode ? "dark" : "light"}`}>
      <nav className="menu">
        <ul>
          <li className={`menu-item ${location.pathname === "/" ? "active" : ""}`}>
            <Link to="/">
              <FontAwesomeIcon className="fontawesome" icon={faCalendar} />
              <span>Umumiy Jadval</span>
            </Link>
          </li>
          <li className={`menu-item ${location.pathname === "/tatil" ? "active" : ""}`}>
            <Link to="/tatil">
              <FontAwesomeIcon className="fontawesome" icon={faGift} />
              <span>Mexnat ta'tili</span>
            </Link>
          </li>
          <li className={`menu-item ${location.pathname === "/jazo" ? "active" : ""}`}>
            <Link to="/jazo">
              <FontAwesomeIcon className="fontawesome" icon={faMapMarkerAlt} />
              <span>Intizomiy jazolar</span>
            </Link>
          </li>
          <li className={`menu-item ${location.pathname === "/xujjat" ? "active" : ""}`}>
            <Link to="/xujjat">
              <FontAwesomeIcon className="fontawesome" icon={faCreditCard} />
              <span>Qo'shimcha xujjatlar</span>
            </Link>
          </li>
          <li className={`menu-item ${location.pathname === "/tabel" ? "active" : ""}`}>
            <Link to="/tabel">
              <FontAwesomeIcon className="fontawesome" icon={faTags} />
              <span>Tabel</span>
            </Link>
          </li>
          <li className={`menu-item ${location.pathname === "/refer" ? "active" : ""}`}>
            <Link to="/refer">
              <FontAwesomeIcon className="fontawesome" icon={faUserFriends} />
              <span>--------</span>
            </Link>
          </li>
          <li className={`menu-item ${location.pathname === "/archive" ? "active" : ""}`}>
            <Link to="/archive">
              <FontAwesomeIcon className="fontawesome" icon={faHeadset} />
              <span>Arxiv</span>
            </Link>
          </li>
         
        </ul>
      </nav>
    </div>
  );
};

Sidebar.displayName = "Sidebar";

export default Sidebar;