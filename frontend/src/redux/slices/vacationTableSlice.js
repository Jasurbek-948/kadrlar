import { createSlice } from "@reduxjs/toolkit";

const vacationTableSlice = createSlice({
  name: "vacationTable",
  initialState: {
    isModalVisible: false,
    selectedEmployee: null,
    vacationDates: [null, null],
  },
  reducers: {
    setIsModalVisible: (state, action) => {
      state.isModalVisible = action.payload;
    },
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    setVacationDates: (state, action) => {
      state.vacationDates = action.payload;
    },
  },
});

export const { setIsModalVisible, setSelectedEmployee, setVacationDates } = vacationTableSlice.actions;
export default vacationTableSlice.reducer;