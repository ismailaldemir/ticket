import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Tüm grupları getir
export const getGruplar = createAsyncThunk(
  "grup/getGruplar",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/gruplar");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gruplar getirilemedi" }
      );
    }
  }
);

// Aktif grupları getir
export const getActiveGruplar = createAsyncThunk(
  "grup/getActiveGruplar",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/gruplar/active");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Aktif gruplar yüklenemedi" }
      );
    }
  }
);

// ID'ye göre grup getir
export const getGrupById = createAsyncThunk(
  "grup/getGrupById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/gruplar/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Grup bulunamadı" });
    }
  }
);

// Yeni grup ekle
export const addGrup = createAsyncThunk(
  "grup/addGrup",
  async (grupData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/gruplar", grupData);
      toast.success("Grup başarıyla eklendi");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Grup eklenemedi" });
    }
  }
);

// Grup bilgilerini güncelle
export const updateGrup = createAsyncThunk(
  "grup/updateGrup",
  async ({ id, grupData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/gruplar/${id}`, grupData);
      toast.success("Grup bilgileri güncellendi");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Grup güncellenemedi" }
      );
    }
  }
);

// Grup sil
export const deleteGrup = createAsyncThunk(
  "grup/deleteGrup",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/gruplar/${id}`);
      toast.success("Grup silindi");
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Grup silinemedi" });
    }
  }
);

// Çoklu grup silme fonksiyonu
export const deleteManyGruplar = createAsyncThunk(
  "grup/deleteManyGruplar",
  async (ids, { rejectWithValue }) => {
    try {
      await Promise.all(ids.map((id) => apiClient.delete(`/gruplar/${id}`)));
      toast.success("Seçili gruplar başarıyla silindi");
      return ids;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gruplar silinemedi" }
      );
    }
  }
);

const initialState = {
  gruplar: [],
  grup: null,
  loading: false,
  error: null,
};

const grupSlice = createSlice({
  name: "grup",
  initialState,
  reducers: {
    clearCurrentGrup: (state) => {
      state.grup = null;
    },
    clearGrupError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGruplar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGruplar.fulfilled, (state, action) => {
        state.gruplar = action.payload;
        state.loading = false;
      })
      .addCase(getGruplar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getActiveGruplar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveGruplar.fulfilled, (state, action) => {
        state.gruplar = action.payload;
        state.loading = false;
      })
      .addCase(getActiveGruplar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getGrupById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGrupById.fulfilled, (state, action) => {
        state.grup = action.payload;
        state.loading = false;
      })
      .addCase(getGrupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addGrup.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGrup.fulfilled, (state, action) => {
        state.gruplar.push(action.payload);
        state.loading = false;
      })
      .addCase(addGrup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateGrup.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateGrup.fulfilled, (state, action) => {
        state.gruplar = state.gruplar.map((grup) =>
          grup._id === action.payload._id ? action.payload : grup
        );
        state.grup = action.payload;
        state.loading = false;
      })
      .addCase(updateGrup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteGrup.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteGrup.fulfilled, (state, action) => {
        state.gruplar = state.gruplar.filter(
          (grup) => grup._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteGrup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Çoklu grup silme için reducer'lar
      .addCase(deleteManyGruplar.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyGruplar.fulfilled, (state, action) => {
        state.loading = false;
        state.gruplar = state.gruplar.filter(
          (grup) => !action.payload.includes(grup._id)
        );
      })
      .addCase(deleteManyGruplar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentGrup, clearGrupError } = grupSlice.actions;

export default grupSlice.reducer;
