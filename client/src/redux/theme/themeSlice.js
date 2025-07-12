import { createSlice } from '@reduxjs/toolkit';

// LocalStorage'dan mevcut tema varsa getir, yoksa light temasını kullan
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme || 'light';
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    currentTheme: getInitialTheme(),
  },
  reducers: {
    setTheme: (state, action) => {
      state.currentTheme = action.payload;
      // LocalStorage'a tema tercihini kaydet
      localStorage.setItem('theme', action.payload);
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
