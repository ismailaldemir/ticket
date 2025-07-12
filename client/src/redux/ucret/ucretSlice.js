import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";

// Tüm ücretleri getir
export const getUcretler = createAsyncThunk(
  "ucret/getUcretler",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/ucretler");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Ücretler yüklenemedi" }
      );
    }
  }
);

// Aktif ücretleri getir
export const getActiveUcretler = createAsyncThunk(
  "ucret/getActiveUcretler",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/ucretler/active");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Aktif ücretler yüklenemedi" }
      );
    }
  }
);

// Geçerli ücretleri getir
export const getGecerliUcretler = createAsyncThunk(
  "ucret/getGecerliUcretler",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/ucretler/gecerli");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Geçerli ücretler yüklenemedi" }
      );
    }
  }
);

// ID'ye göre ücret getir
export const getUcretById = createAsyncThunk(
  "ucret/getUcretById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/ucretler/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Ücret bulunamadı" });
    }
  }
);

// Tarifeye göre ücretleri getir
export const getUcretlerByTarife = createAsyncThunk(
  "ucret/getUcretlerByTarife",
  async (tarifeId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/ucretler/tarife/${tarifeId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Tarifeye ait ücretler yüklenemedi" }
      );
    }
  }
);

// Kullanım alanına göre ücretleri getir
export const getUcretlerByKullanimAlani = createAsyncThunk(
  "ucret/getUcretlerByKullanimAlani",
  async (alan, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/ucretler/kullanim-alani/${alan}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Ücretler yüklenemedi" }
      );
    }
  }
);

// Yeni ücret ekle
export const addUcret = createAsyncThunk(
  "ucret/addUcret",
  async (ucretData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/ucretler", ucretData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Ücret eklenemedi" });
    }
  }
);

// Tarifeye ücret ekle (varolan addUcret'i çağıracak)
export const addUcretToTarife = createAsyncThunk(
  "ucret/addUcretToTarife",
  async ({ tarifeId, ucretData }, { dispatch }) => {
    // Tarife bilgilerini ucretData'ya ekle
    const data = {
      ...ucretData,
      tarife_id: tarifeId,
    };

    const response = await dispatch(addUcret(data)).unwrap();
    return response;
  }
);

// Ücret bilgilerini güncelle
export const updateUcret = createAsyncThunk(
  "ucret/updateUcret",
  async ({ id, ucretData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/ucretler/${id}`, ucretData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Ücret güncellenemedi" }
      );
    }
  }
);

// Ücret sil
export const deleteUcret = createAsyncThunk(
  "ucret/deleteUcret",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/ucretler/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Ücret silinemedi" });
    }
  }
);

// Çoklu ücret silme fonksiyonu
export const deleteManyUcretler = createAsyncThunk(
  "ucret/deleteManyUcretler",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.delete("/ucretler", { data: { ids } });
      return ids;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Ücretler silinemedi" }
      );
    }
  }
);

const initialState = {
  ucretler: [],
  currentUcret: null,
  loading: false,
  error: null,
};

const ucretSlice = createSlice({
  name: "ucret",
  initialState,
  reducers: {
    clearCurrentUcret: (state) => {
      state.currentUcret = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUcretler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUcretler.fulfilled, (state, action) => {
        state.ucretler = action.payload;
        state.loading = false;
      })
      .addCase(getUcretler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getActiveUcretler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveUcretler.fulfilled, (state, action) => {
        state.ucretler = action.payload;
        state.loading = false;
      })
      .addCase(getActiveUcretler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getGecerliUcretler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGecerliUcretler.fulfilled, (state, action) => {
        state.ucretler = action.payload;
        state.loading = false;
      })
      .addCase(getGecerliUcretler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUcretById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUcretById.fulfilled, (state, action) => {
        state.currentUcret = action.payload;
        state.loading = false;
      })
      .addCase(getUcretById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUcretlerByTarife.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUcretlerByTarife.fulfilled, (state, action) => {
        state.ucretler = action.payload;
        state.loading = false;
      })
      .addCase(getUcretlerByTarife.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUcretlerByKullanimAlani.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUcretlerByKullanimAlani.fulfilled, (state, action) => {
        state.ucretler = action.payload;
        state.loading = false;
      })
      .addCase(getUcretlerByKullanimAlani.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addUcret.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUcret.fulfilled, (state, action) => {
        state.ucretler.unshift(action.payload);
        state.loading = false;
      })
      .addCase(addUcret.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUcret.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUcret.fulfilled, (state, action) => {
        state.ucretler = state.ucretler.map((ucret) =>
          ucret._id === action.payload._id ? action.payload : ucret
        );
        state.currentUcret = action.payload;
        state.loading = false;
      })
      .addCase(updateUcret.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteUcret.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUcret.fulfilled, (state, action) => {
        state.ucretler = state.ucretler.filter(
          (ucret) => ucret._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteUcret.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Çoklu ücret silme için reducer'lar
      .addCase(deleteManyUcretler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyUcretler.fulfilled, (state, action) => {
        state.loading = false;
        state.ucretler = state.ucretler.filter(
          (ucret) => !action.payload.includes(ucret._id)
        );
      })
      .addCase(deleteManyUcretler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentUcret, clearError } = ucretSlice.actions;

export default ucretSlice.reducer;
