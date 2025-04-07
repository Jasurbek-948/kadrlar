import { createSlice } from "@reduxjs/toolkit";

// Dastlabki holatni aniqlash: localStorage yoki tizim sozlamalari
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    return savedTheme === "dark";
  }
  // Tizim sozlamalariga qarab aniqlash
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    isDarkMode: getInitialTheme(),
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      // localStorage'da saqlash
      localStorage.setItem("theme", state.isDarkMode ? "dark" : "light");
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
      // localStorage'da saqlash
      localStorage.setItem("theme", state.isDarkMode ? "dark" : "light");
    },
  },
});

export const { toggleTheme, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;