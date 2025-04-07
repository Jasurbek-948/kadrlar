import { createSlice } from "@reduxjs/toolkit";

const tableSlice = createSlice({
  name: "table",
  initialState: {
    searchTerm: "",
    filteredEmployees: [],
    isDeleteModalVisible: false,
    isVacationModalVisible: false,
    selectedEmployee: null,
    selectedVacationStatus: null,
    loading: true,
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFilteredEmployees: (state, action) => {
      state.filteredEmployees = action.payload;
    },
    setIsDeleteModalVisible: (state, action) => {
      state.isDeleteModalVisible = action.payload;
    },
    setIsVacationModalVisible: (state, action) => {
      state.isVacationModalVisible = action.payload;
    },
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    setSelectedVacationStatus: (state, action) => {
      state.selectedVacationStatus = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setSearchTerm,
  setFilteredEmployees,
  setIsDeleteModalVisible,
  setIsVacationModalVisible,
  setSelectedEmployee,
  setSelectedVacationStatus,
  setLoading,
} = tableSlice.actions;
export default tableSlice.reducer;