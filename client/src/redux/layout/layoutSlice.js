import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isNavbarOnly: false,
  navbarOpen: false,
  isSidebarCollapsed: false, // Sidebar daraltma/gelişletme için eklendi
};

const layoutSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleNavbarOnly: (state) => {
      state.isNavbarOnly = !state.isNavbarOnly;
    },
    toggleNavbar: (state) => {
      state.navbarOpen = !state.navbarOpen;
    },
    setNavbarOpen: (state, action) => {
      state.navbarOpen = action.payload;
    },
    resetLayoutState: () => initialState,
    toggleSidebarCollapse: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
  },
});

export const {
  toggleNavbarOnly,
  toggleNavbar,
  setNavbarOpen,
  resetLayoutState,
  toggleSidebarCollapse, // Export eklendi
} = layoutSlice.actions;

export default layoutSlice.reducer;
