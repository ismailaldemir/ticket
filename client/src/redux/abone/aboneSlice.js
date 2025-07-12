import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Tüm aboneleri getir
export const getAboneler = createAsyncThunk(
  "abone/getAboneler",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/aboneler");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Aboneler yüklenemedi" }
      );
    }
  }
);

// Aktif aboneleri getir
export const getActiveAboneler = createAsyncThunk(
  "abone/getActiveAboneler",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/aboneler/aktif");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Aktif aboneler yüklenemedi" }
      );
    }
  }
);

// ID'ye göre abone getir
export const getAboneById = createAsyncThunk(
  "abone/getAboneById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/aboneler/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Abone bulunamadı" });
    }
  }
);

// Kişiye göre aboneleri getir
export const getAbonelerByKisi = createAsyncThunk(
  "abone/getAbonelerByKisi",
  async (kisi_id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/aboneler/kisi/${kisi_id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Aboneler yüklenemedi" }
      );
    }
  }
);

// Yeni abone ekle
export const addAbone = createAsyncThunk(
  "abone/addAbone",
  async (aboneData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/aboneler", aboneData);
      toast.success("Abone başarıyla eklendi");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Abone eklenemedi");
      return rejectWithValue(err.response?.data || { msg: "Abone eklenemedi" });
    }
  }
);

// Abone güncelle
export const updateAbone = createAsyncThunk(
  "abone/updateAbone",
  async ({ id, aboneData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/aboneler/${id}`, aboneData);
      toast.success("Abone başarıyla güncellendi");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Abone güncellenemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Abone güncellenemedi" }
      );
    }
  }
);

// Abone sil
export const deleteAbone = createAsyncThunk(
  "abone/deleteAbone",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/aboneler/${id}`);
      toast.success("Abone başarıyla silindi");
      return id;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Abone silinemedi");
      return rejectWithValue(err.response?.data || { msg: "Abone silinemedi" });
    }
  }
);

// Çoklu abone silme
export const deleteManyAboneler = createAsyncThunk(
  "abone/deleteManyAboneler",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/aboneler/delete-many", { ids });
      toast.success("Seçilen aboneler başarıyla silindi");
      return ids;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Aboneler silinemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Aboneler silinemedi" }
      );
    }
  }
);

const initialState = {
  aboneler: [],
  abone: null,
  loading: false,
  error: null,
};

const aboneSlice = createSlice({
  name: "abone",
  initialState,
  reducers: {
    clearCurrentAbone: (state) => {
      state.abone = null;
      state.error = null;
    },
    clearAboneError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAboneler
      .addCase(getAboneler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAboneler.fulfilled, (state, action) => {
        state.aboneler = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getAboneler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getActiveAboneler
      .addCase(getActiveAboneler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveAboneler.fulfilled, (state, action) => {
        state.aboneler = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getActiveAboneler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getAboneById
      .addCase(getAboneById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAboneById.fulfilled, (state, action) => {
        state.abone = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getAboneById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getAbonelerByKisi
      .addCase(getAbonelerByKisi.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAbonelerByKisi.fulfilled, (state, action) => {
        state.aboneler = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getAbonelerByKisi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addAbone
      .addCase(addAbone.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAbone.fulfilled, (state, action) => {
        state.aboneler.unshift(action.payload);
        state.abone = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(addAbone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateAbone
      .addCase(updateAbone.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAbone.fulfilled, (state, action) => {
        state.aboneler = state.aboneler.map((abone) =>
          abone._id === action.payload._id ? action.payload : abone
        );
        state.abone = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateAbone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteAbone
      .addCase(deleteAbone.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAbone.fulfilled, (state, action) => {
        state.aboneler = state.aboneler.filter(
          (abone) => abone._id !== action.payload
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteAbone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteManyAboneler
      .addCase(deleteManyAboneler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyAboneler.fulfilled, (state, action) => {
        state.aboneler = state.aboneler.filter(
          (abone) => !action.payload.includes(abone._id)
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteManyAboneler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentAbone, clearAboneError } = aboneSlice.actions;

export default aboneSlice.reducer;
