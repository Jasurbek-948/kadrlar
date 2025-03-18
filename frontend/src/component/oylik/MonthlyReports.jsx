import React from "react";
import "./MonthlyReports.css"; // Stilingiz uchun alohida CSS faylni o'zingiz yaratishingiz mumkin

const MonthlyReports = () => {
  return (
    <div className="monthly-reports-container">
      <h1>Oylik hisobotlar</h1>
      <p>Bu sahifada oylik hisobotlar bilan bog'liq ma'lumotlar joylashadi.</p>
      {/* Hisobotlar jadvali yoki boshqa tarkibni shu yerga qo'shishingiz mumkin */}
    </div>
  );
};

export default MonthlyReports;
