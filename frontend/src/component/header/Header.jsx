import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // React Router navigatsiyasi va joylashuvi uchun
import './Header.css';

const Header = () => {
  const navigate = useNavigate(); // Yo'nalishni boshqarish uchun `useNavigate` hook
  const location = useLocation(); // Joriy yo'nalishni olish uchun `useLocation`

  const handleNavigation = (path) => {
    navigate(path); // Bosilganda tegishli yo'nalishga yo'naltirish
  };

  return (
    <header className="header">
      <div className="logo">Logo</div>
      <nav className="nav-buttons">
        <button
          className={location.pathname === '/' ? 'active' : ''} // Xodimlar bo'limi uchun active class
          onClick={() => handleNavigation('/')}
        >
          Xodimlar bo'limi
        </button>
        <button
          className={location.pathname === '/hisobot' ? 'active' : ''} // Oylik hisobotlar uchun active class
          onClick={() => handleNavigation('/hisobot')}
        >
          Oylik hisobotlar
        </button>
        <button
          className={location.pathname === '/choraklik-hisobotlar' ? 'active' : ''} // Choraklik hisobotlar uchun active class
          onClick={() => handleNavigation('/choraklik-hisobotlar')}
        >
          Choraklik xisobotlar
        </button>
        <button
          className={location.pathname === '/mexnat' ? 'active' : ''} // Choraklik hisobotlar uchun active class
          onClick={() => handleNavigation('/mexnat')}
        >
          Mexnat shartnomasi
        </button>
        <button>Button</button>
      </nav>
      <div className="account-section">
        <div className="account-icon">
          <i className="fas fa-user"></i>
        </div>
        <span>Account</span>
      </div>
    </header>
  );
};

export default Header;
