import { createSlice } from "@reduxjs/toolkit";

const disciplinaryFormSlice = createSlice({
  name: "disciplinaryForm",
  initialState: {
    formData: {
      employeeId: "",
      fullName: "",
      position: "",
      orderDetails: "",
      orderDate: "",
      reason: "",
    },
    isModalOpen: false,
    editData: null,
  },
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = {
        employeeId: "",
        fullName: "",
        position: "",
        orderDetails: "",
        orderDate: "",
        reason: "",
      };
    },
    setIsModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
    setEditData: (state, action) => {
      state.editData = action.payload;
    },
  },
});

export const { setFormData, resetFormData, setIsModalOpen, setEditData } =
  disciplinaryFormSlice.actions;
export default disciplinaryFormSlice.reducer;