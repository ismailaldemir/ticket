import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";

// Tüm tarifeleri getir
export const getTarifeler = createAsyncThunk(
  "tarife/getTarifeler",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/tarifeler");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Tarifeler yüklenemedi" }
      );
    }
  }
);

// Aktif tarifeleri getir
export const getActiveTarifeler = createAsyncThunk(
  "tarife/getActiveTarifeler",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/tarifeler/active");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Aktif tarifeler yüklenemedi" }
      );
    }
  }
);

// Kullanım alanına göre tarifeleri getir
export const getTarifelerByKullanimAlani = createAsyncThunk(
  "tarife/getTarifelerByKullanimAlani",
  async (alan, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/tarifeler/kullanim-alani/${alan}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Tarifeler yüklenemedi" }
      );
    }
  }
);

// ID'ye göre tarife getir
export const getTarifeById = createAsyncThunk(
  "tarife/getTarifeById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/tarifeler/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Tarife bulunamadı" }
      );
    }
  }
);

// Yeni tarife ekle
export const addTarife = createAsyncThunk(
  "tarife/addTarife",
  async (tarifeData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/tarifeler", tarifeData);
      // Toast mesajını kaldırdık, component içinde gösterilecek
      return res.data;
    } catch (err) {
      // Hata mesajını component'te göstermek için sadece reject ediyoruz
      return rejectWithValue(
        err.response?.data || { msg: "Tarife eklenemedi" }
      );
    }
  }
);

// Tarife bilgilerini güncelle
export const updateTarife = createAsyncThunk(
  "tarife/updateTarife",
  async ({ id, tarifeData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/tarifeler/${id}`, tarifeData);
      // Toast mesajını kaldırdık, component içinde gösterilecek
      return res.data;
    } catch (err) {
      // Hata mesajını component'te göstermek için sadece reject ediyoruz
      return rejectWithValue(
        err.response?.data || { msg: "Tarife güncellenemedi" }
      );
    }
  }
);

// Tarife sil
export const deleteTarife = createAsyncThunk(
  "tarife/deleteTarife",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/tarifeler/${id}`);
      // Toast mesajını kaldırdık, component içinde gösterilecek
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Tarife silinemedi" }
      );
    }
  }
);

// Çoklu tarife silme fonksiyonu
export const deleteManyTarifeler = createAsyncThunk(
  "tarife/deleteManyTarifeler",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.delete("/tarifeler", { data: { ids } });
      // Toast mesajını kaldırdık, component içinde gösterilecek
      return ids;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Tarifeler silinemedi" }
      );
    }
  }
);

const initialState = {
  tarifeler: [],
  currentTarife: null,
  loading: false,
  error: null,
};

const tarifeSlice = createSlice({
  name: "tarife",
  initialState,
  reducers: {
    clearCurrentTarife: (state) => {
      state.currentTarife = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTarifeler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTarifeler.fulfilled, (state, action) => {
        state.tarifeler = action.payload;
        state.loading = false;
      })
      .addCase(getTarifeler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getActiveTarifeler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveTarifeler.fulfilled, (state, action) => {
        state.tarifeler = action.payload;
        state.loading = false;
      })
      .addCase(getActiveTarifeler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getTarifelerByKullanimAlani.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTarifelerByKullanimAlani.fulfilled, (state, action) => {
        state.tarifeler = action.payload;
        state.loading = false;
      })
      .addCase(getTarifelerByKullanimAlani.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getTarifeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTarifeById.fulfilled, (state, action) => {
        state.currentTarife = action.payload;
        state.loading = false;
      })
      .addCase(getTarifeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addTarife.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTarife.fulfilled, (state, action) => {
        state.tarifeler.unshift(action.payload);
        state.loading = false;
      })
      .addCase(addTarife.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateTarife.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTarife.fulfilled, (state, action) => {
        state.tarifeler = state.tarifeler.map((tarife) =>
          tarife._id === action.payload._id ? action.payload : tarife
        );
        state.currentTarife = action.payload;
        state.loading = false;
      })
      .addCase(updateTarife.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteTarife.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTarife.fulfilled, (state, action) => {
        state.tarifeler = state.tarifeler.filter(
          (tarife) => tarife._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteTarife.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteManyTarifeler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyTarifeler.fulfilled, (state, action) => {
        state.loading = false;
        state.tarifeler = state.tarifeler.filter(
          (tarife) => !action.payload.includes(tarife._id)
        );
      })
      .addCase(deleteManyTarifeler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentTarife, clearError } = tarifeSlice.actions;

export default tarifeSlice.reducer;
