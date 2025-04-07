import { createSlice } from "@reduxjs/toolkit";

const editFormSlice = createSlice({
  name: "editForm",
  initialState: {
    currentStep: 0,
  },
  reducers: {
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    resetCurrentStep: (state) => {
      state.currentStep = 0;
    },
  },
});

export const { setCurrentStep, resetCurrentStep } = editFormSlice.actions;
export default editFormSlice.reducer;