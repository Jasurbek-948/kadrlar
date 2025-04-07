import { createSlice } from "@reduxjs/toolkit";

const toggleSlice = createSlice({
  name: "toggle",
  initialState: {
    isToggled: false, // Dastlabki holat
  },
  reducers: {
    toggle: (state) => {
      state.isToggled = !state.isToggled;
    },
    setToggle: (state, action) => {
      state.isToggled = action.payload;
    },
  },
});

export const { toggle, setToggle } = toggleSlice.actions;
export default toggleSlice.reducer;