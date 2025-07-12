import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Tüm üye rollerini getir
export const getUyeRoller = createAsyncThunk(
  "uyeRol/getUyeRoller",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/uyeRoller");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Üye rolleri yüklenemedi" }
      );
    }
  }
);

// Aktif üye rollerini getir
export const getActiveUyeRoller = createAsyncThunk(
  "uyeRol/getActiveUyeRoller",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/uyeRoller/active");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Aktif üye rolleri yüklenemedi" }
      );
    }
  }
);

// ID'ye göre üye rolü getir
export const getUyeRolById = createAsyncThunk(
  "uyeRol/getUyeRolById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/uyeRoller/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Üye rolü bulunamadı" }
      );
    }
  }
);

// Yeni üye rolü ekle
export const addUyeRol = createAsyncThunk(
  "uyeRol/addUyeRol",
  async (uyeRolData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/uyeRoller", uyeRolData);
      toast.success("Üye rolü başarıyla eklendi");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Üye rolü eklenemedi" }
      );
    }
  }
);

// Üye rolü bilgilerini güncelle
export const updateUyeRol = createAsyncThunk(
  "uyeRol/updateUyeRol",
  async ({ id, uyeRolData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/uyeRoller/${id}`, uyeRolData);
      toast.success("Üye rolü bilgileri güncellendi");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Üye rolü güncellenemedi" }
      );
    }
  }
);

// Üye rolü sil
export const deleteUyeRol = createAsyncThunk(
  "uyeRol/deleteUyeRol",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/uyeRoller/${id}`);
      toast.success("Üye rolü silindi");
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Üye rolü silinemedi" }
      );
    }
  }
);

// Çoklu üye rolü silme
export const deleteManyUyeRoller = createAsyncThunk(
  "uyeRol/deleteManyUyeRoller",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/uyeRoller/delete-many", { ids });
      return ids;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Üye rolleri silinemedi" }
      );
    }
  }
);

const initialState = {
  uyeRoller: [],
  uyeRol: null,
  loading: false,
  error: null,
};

const uyeRolSlice = createSlice({
  name: "uyeRol",
  initialState,
  reducers: {
    clearCurrentUyeRol: (state) => {
      state.uyeRol = null;
    },
    clearUyeRolError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Tüm üye rollerini getir
      .addCase(getUyeRoller.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUyeRoller.fulfilled, (state, action) => {
        state.uyeRoller = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getUyeRoller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Aktif üye rollerini getir
      .addCase(getActiveUyeRoller.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveUyeRoller.fulfilled, (state, action) => {
        state.uyeRoller = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getActiveUyeRoller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Üye rolü getir
      .addCase(getUyeRolById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUyeRolById.fulfilled, (state, action) => {
        state.uyeRol = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getUyeRolById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Üye rolü ekle
      .addCase(addUyeRol.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUyeRol.fulfilled, (state, action) => {
        state.uyeRoller.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addUyeRol.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Üye rolü güncelle
      .addCase(updateUyeRol.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUyeRol.fulfilled, (state, action) => {
        state.uyeRoller = state.uyeRoller.map((uyeRol) =>
          uyeRol._id === action.payload._id ? action.payload : uyeRol
        );
        if (state.uyeRol && state.uyeRol._id === action.payload._id) {
          state.uyeRol = action.payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUyeRol.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Üye rolü sil
      .addCase(deleteUyeRol.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUyeRol.fulfilled, (state, action) => {
        state.uyeRoller = state.uyeRoller.filter(
          (uyeRol) => uyeRol._id !== action.payload
        );
        if (state.uyeRol && state.uyeRol._id === action.payload) {
          state.uyeRol = null;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteUyeRol.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Çoklu üye rolü silme
      .addCase(deleteManyUyeRoller.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyUyeRoller.fulfilled, (state, action) => {
        state.uyeRoller = state.uyeRoller.filter(
          (uyeRol) => !action.payload.includes(uyeRol._id)
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteManyUyeRoller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentUyeRol, clearUyeRolError } = uyeRolSlice.actions;

export default uyeRolSlice.reducer;
