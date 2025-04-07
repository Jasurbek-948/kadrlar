import React from 'react';
import { FaUsers, FaTable } from 'react-icons/fa';
import './YearlySidebar.scss';

const YearlySidebar = ({ activeMenu, onMenuChange }) => {
    const menuItems = [
        { id: 'milliy-tarkib', label: 'Milliy tarkib', icon: <FaUsers className="fontawesome" /> },
        { id: 'klassifikator', label: 'Klassifikator', icon: <FaTable className="fontawesome" /> },
    ];

    return (
        <div className="sidebar">
            <div className="menu">
                <ul>
                    {menuItems.map((item) => (
                        <li
                            key={item.id}
                            className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => onMenuChange(item.id)}
                        >
                            <a href={`#${item.id}`}>
                                {item.icon}
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default YearlySidebar;