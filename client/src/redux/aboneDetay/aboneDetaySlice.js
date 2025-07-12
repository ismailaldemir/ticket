import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Tüm abone detaylarını getir
export const getAboneDetaylar = createAsyncThunk(
  "aboneDetay/getAboneDetaylar",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/abonedetaylar");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Abone detayları yüklenemedi" }
      );
    }
  }
);

// ID'ye göre abone detay getir
export const getAboneDetayById = createAsyncThunk(
  "aboneDetay/getAboneDetayById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/abonedetaylar/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Abone detayı bulunamadı" }
      );
    }
  }
);

// Aboneye göre detay kayıtları getir
export const getAboneDetaylarByAbone = createAsyncThunk(
  "aboneDetay/getAboneDetaylarByAbone",
  async (abone_id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/abonedetaylar/abone/${abone_id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Abone detayları yüklenemedi" }
      );
    }
  }
);

// Dönem (ay/yıl) bazında detay kayıtları getir
export const getAboneDetaylarByDonem = createAsyncThunk(
  "aboneDetay/getAboneDetaylarByDonem",
  async ({ yil, ay }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/abonedetaylar/donem/${yil}/${ay}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Abone detayları yüklenemedi" }
      );
    }
  }
);

// Yeni abone detay ekle
export const addAboneDetay = createAsyncThunk(
  "aboneDetay/addAboneDetay",
  async (aboneDetayData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/abonedetaylar", aboneDetayData);
      toast.success("Abone detay kaydı başarıyla eklendi");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Abone detay kaydı eklenemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Abone detay kaydı eklenemedi" }
      );
    }
  }
);

// Toplu abone detay ekle
export const addBulkAboneDetay = createAsyncThunk(
  "aboneDetay/addBulkAboneDetay",
  async (detaylar, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/abonedetaylar/bulk", { detaylar });

      if (res.data.basariliKayitSayisi > 0) {
        toast.success(
          `${res.data.basariliKayitSayisi} adet kayıt başarıyla eklendi`
        );
      }

      if (res.data.hataliKayitSayisi > 0) {
        toast.warning(`${res.data.hataliKayitSayisi} adet kayıt eklenemedi`);
      }

      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Toplu kayıt eklenemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Toplu kayıt eklenemedi" }
      );
    }
  }
);

// Abone detay güncelle
export const updateAboneDetay = createAsyncThunk(
  "aboneDetay/updateAboneDetay",
  async ({ id, aboneDetayData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/abonedetaylar/${id}`, aboneDetayData);
      toast.success("Abone detay kaydı başarıyla güncellendi");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Abone detay kaydı güncellenemedi"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Abone detay kaydı güncellenemedi" }
      );
    }
  }
);

// Abone detay sil
export const deleteAboneDetay = createAsyncThunk(
  "aboneDetay/deleteAboneDetay",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/abonedetaylar/${id}`);
      toast.success("Abone detay kaydı başarıyla silindi");
      return id;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Abone detay kaydı silinemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Abone detay kaydı silinemedi" }
      );
    }
  }
);

// Çoklu abone detay silme
export const deleteManyAboneDetaylar = createAsyncThunk(
  "aboneDetay/deleteManyAboneDetaylar",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/abonedetaylar/delete-many", { ids });
      toast.success("Seçilen kayıtlar başarıyla silindi");
      return ids;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Kayıtlar silinemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Kayıtlar silinemedi" }
      );
    }
  }
);

const initialState = {
  aboneDetaylar: [],
  aboneDetay: null,
  loading: false,
  error: null,
  successMessage: null,
  bulkResults: null,
};

const aboneDetaySlice = createSlice({
  name: "aboneDetay",
  initialState,
  reducers: {
    clearCurrentAboneDetay: (state) => {
      state.aboneDetay = null;
      state.error = null;
      state.successMessage = null;
    },
    clearAboneDetayError: (state) => {
      state.error = null;
    },
    clearBulkResults: (state) => {
      state.bulkResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAboneDetaylar
      .addCase(getAboneDetaylar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAboneDetaylar.fulfilled, (state, action) => {
        state.aboneDetaylar = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getAboneDetaylar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getAboneDetayById
      .addCase(getAboneDetayById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAboneDetayById.fulfilled, (state, action) => {
        state.aboneDetay = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getAboneDetayById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getAboneDetaylarByAbone
      .addCase(getAboneDetaylarByAbone.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAboneDetaylarByAbone.fulfilled, (state, action) => {
        state.aboneDetaylar = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getAboneDetaylarByAbone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getAboneDetaylarByDonem
      .addCase(getAboneDetaylarByDonem.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAboneDetaylarByDonem.fulfilled, (state, action) => {
        state.aboneDetaylar = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getAboneDetaylarByDonem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addAboneDetay
      .addCase(addAboneDetay.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAboneDetay.fulfilled, (state, action) => {
        state.aboneDetaylar.unshift(action.payload);
        state.aboneDetay = action.payload;
        state.loading = false;
        state.error = null;
        state.successMessage = "Abone detay kaydı başarıyla eklendi";
      })
      .addCase(addAboneDetay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addBulkAboneDetay
      .addCase(addBulkAboneDetay.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBulkAboneDetay.fulfilled, (state, action) => {
        // Başarılı kayıtları listeye ekle
        if (
          action.payload.basariliKayitlar &&
          action.payload.basariliKayitlar.length > 0
        ) {
          state.aboneDetaylar = [
            ...action.payload.basariliKayitlar,
            ...state.aboneDetaylar,
          ];
        }
        state.loading = false;
        state.error = null;
        state.bulkResults = action.payload;
        state.successMessage = `${action.payload.basariliKayitSayisi} adet kayıt başarıyla eklendi`;
      })
      .addCase(addBulkAboneDetay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateAboneDetay
      .addCase(updateAboneDetay.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAboneDetay.fulfilled, (state, action) => {
        state.aboneDetaylar = state.aboneDetaylar.map((aboneDetay) =>
          aboneDetay._id === action.payload._id ? action.payload : aboneDetay
        );
        state.aboneDetay = action.payload;
        state.loading = false;
        state.error = null;
        state.successMessage = "Abone detay kaydı başarıyla güncellendi";
      })
      .addCase(updateAboneDetay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteAboneDetay
      .addCase(deleteAboneDetay.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAboneDetay.fulfilled, (state, action) => {
        state.aboneDetaylar = state.aboneDetaylar.filter(
          (aboneDetay) => aboneDetay._id !== action.payload
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteAboneDetay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteManyAboneDetaylar
      .addCase(deleteManyAboneDetaylar.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyAboneDetaylar.fulfilled, (state, action) => {
        state.aboneDetaylar = state.aboneDetaylar.filter(
          (aboneDetay) => !action.payload.includes(aboneDetay._id)
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteManyAboneDetaylar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentAboneDetay,
  clearAboneDetayError,
  clearBulkResults,
} = aboneDetaySlice.actions;

export default aboneDetaySlice.reducer;
