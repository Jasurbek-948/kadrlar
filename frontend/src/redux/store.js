import { configureStore } from "@reduxjs/toolkit";
import employeeReducer from "./slices/employeeSlice";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice";
import toggleReducer from "./slices/toggleSlice";
import departmentReducer from "./slices/departmentSlice";
import tableReducer from "./slices/tableSlice";
import vacationTableReducer from "./slices/vacationTableSlice";
import disciplinaryReducer from "./slices/disciplinarySlice";
import disciplinaryFormReducer from "./slices/disciplinaryFormSlice";
import editFormReducer from "./slices/editFormSlice";

// Store sozlamalari
export const store = configureStore({
  reducer: {
    employees: employeeReducer,
    theme: themeReducer,
    auth: authReducer,
    toggle: toggleReducer,
    departments: departmentReducer,
    table: tableReducer,
    vacationTable: vacationTableReducer,
    disciplinary: disciplinaryReducer,
    disciplinaryForm: disciplinaryFormReducer,
    editForm: editFormReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Agar serializable bo'lmagan ma'lumotlar bo'lsa, xatolarni o'chirish
    }),
  devTools: process.env.NODE_ENV !== "production", // Faqat development muhitida Redux DevTools yoqiladi
});