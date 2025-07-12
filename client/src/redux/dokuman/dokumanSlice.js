import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const addDokuman = createAsyncThunk(
  "dokuman/addDokuman",
  async (formData) => {
    const response = await axios.post("/api/dokuman", formData);
    return response.data;
  }
);

export const getDokumanlar = createAsyncThunk(
  "dokuman/getDokumanlar",
  async ({ referansTur, referansId }) => {
    const response = await axios.get(
      `/api/dokuman/${referansTur}/${referansId}`
    );
    return response.data;
  }
);

export const deleteDokuman = createAsyncThunk(
  "dokuman/deleteDokuman",
  async (id) => {
    await axios.delete(`/api/dokuman/${id}`);
    return id;
  }
);

const dokumanSlice = createSlice({
  name: "dokuman",
  initialState: {
    dokumanlar: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearDokumanlar: (state) => {
      state.dokumanlar = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDokumanlar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDokumanlar.fulfilled, (state, action) => {
        state.loading = false;
        state.dokumanlar = action.payload;
        state.error = null;
      })
      .addCase(getDokumanlar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addDokuman.fulfilled, (state, action) => {
        state.dokumanlar.unshift(action.payload);
      })
      .addCase(deleteDokuman.fulfilled, (state, action) => {
        state.dokumanlar = state.dokumanlar.filter(
          (dok) => dok._id !== action.payload
        );
      });
  },
});

export const { clearDokumanlar } = dokumanSlice.actions;
export default dokumanSlice.reducer;
