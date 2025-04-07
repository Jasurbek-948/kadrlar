/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Tailwind CSS’ni qaysi fayllarda ishlatishni ko‘rsatadi
  ],
  darkMode: "class", // Dark mode’ni class asosida boshqarish (App.jsx’da ishlatilmoqda)
  theme: {
    extend: {
      // Ranglar
      colors: {
        primary: "#1D4ED8", // Asosiy rang (ko‘k)
        secondary: "#9333EA", // Ikkinchi darajali rang (binafsha)
        accent: "#F59E0B", // Qo‘shimcha rang (sariq)
        success: "#10B981", // Muvaffaqiyat rangi (yashil)
        error: "#EF4444", // Xato rangi (qizil)
        background: {
          light: "#F3F4F6", // Light mode uchun fon
          dark: "#1F2937", // Dark mode uchun fon
        },
      },
      // Font o‘lchamlari
      fontSize: {
        xs: "0.75rem", // 12px
        sm: "0.875rem", // 14px
        base: "1rem", // 16px
        lg: "1.125rem", // 18px
        xl: "1.25rem", // 20px
        "2xl": "1.5rem", // 24px
        "3xl": "1.875rem", // 30px
      },
      // Masofalar (spacing)
      spacing: {
        72: "18rem", // 288px
        84: "21rem", // 336px
        96: "24rem", // 384px
      },
      // Box shadow
      boxShadow: {
        "extra-deep": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "soft": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "deep": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      // Transitionlar
      transitionProperty: {
        "height": "height",
        "spacing": "margin, padding",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // Form elementlari uchun
    require("@tailwindcss/typography"), // Matn formatlash uchun
  ],
};