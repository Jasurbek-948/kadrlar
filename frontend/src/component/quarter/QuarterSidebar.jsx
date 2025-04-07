import React from 'react';
import { Link } from 'react-router-dom';
import './quarter.scss';

const QuarterSidebar = ({ setDepartmentFilter, setPositionFilter }) => {
    const departments = [
        { label: "Boshqaruv", value: "Boshqaruv" },
        { label: "AKT bo'limi", value: "AKTni joriy etish va axborot xavfsizligi bo'limi" },
    ];

    const positions = [
        {
            label: "«Andijon GES» filiali direktori lavozimiga zaxiraga kiritilgan nomzodlar ro’yxati",
            value: "Direktor"
        },
        {
            label: "«Andijon GES» filiali bosh muhandisi zaxirasiga kiritilgan nomzodlar ro’yxati",
            value: "Bosh muhandis"
        },
        {
            label: "«Andijon GES» filiali direktori o’rinbosari (Suv omborlarini xavfsiz eksplutatsiyasi va raqamlashtirish bo'yicha) lavozimiga zaxiraga kiritilgan nomzodlar ro’yxati",
            value: "Direktor o'rinbosari"
        },
        {
            label: "«Andijon GES» filiali bosh xisobchisi zaxirasiga kiritilgan nomzodlar ro’yxati",
            value: "Bosh xisobchi"
        },
    ];

    const handleDepartmentFilter = (value) => {
        if (setDepartmentFilter) {
            setDepartmentFilter(value);
            localStorage.setItem('departmentFilter', value);
        } else {
            console.error('setDepartmentFilter funksiyasi mavjud emas');
        }
    };

    const handlePositionFilter = (value) => {
        if (setPositionFilter) {
            setPositionFilter(value);
            localStorage.setItem('positionFilter', value);
        } else {
            console.error('setPositionFilter funksiyasi mavjud emas');
        }
    };

    const clearFilters = () => {
        if (setDepartmentFilter && setPositionFilter) {
            setDepartmentFilter('');
            setPositionFilter('');
            localStorage.removeItem('departmentFilter');
            localStorage.removeItem('positionFilter');
        } else {
            console.error('setDepartmentFilter yoki setPositionFilter funksiyasi mavjud emas');
        }
    };

    return (
        <div className="sidebar">
            <div className="filter-section">
                <h4>Bo'lim bo'yicha filtr</h4>
                <div className="filter-buttons">
                    {departments.map((dept) => (
                        <button
                            key={dept.value}
                            className={`filter-btn ${dept.value === (localStorage.getItem('departmentFilter') || '') ? 'active' : ''}`}
                            onClick={() => {
                                handleDepartmentFilter(dept.value);
                                localStorage.setItem('departmentFilter', dept.value);
                            }}
                        >
                            {dept.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-section">
                <h4>Lavozim bo'yicha filtr</h4>
                <div className="filter-buttons">
                    {positions.map((pos) => (
                        <button
                            key={pos.value}
                            className={`filter-btn ${pos.value === (localStorage.getItem('positionFilter') || '') ? 'active' : ''}`}
                            onClick={() => {
                                handlePositionFilter(pos.value);
                                localStorage.setItem('positionFilter', pos.value);
                            }}
                        >
                            {pos.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-section">
                <button
                    className="clear-btn"
                    onClick={() => {
                        clearFilters();
                        localStorage.removeItem('departmentFilter');
                        localStorage.removeItem('positionFilter');
                    }}
                >
                    Filtrlarni tozalash
                </button>
            </div>
        </div>
    );
};

export default QuarterSidebar;