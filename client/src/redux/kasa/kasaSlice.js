import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";
import Logger from "../../utils/logger";

// Tüm kasaları getir
export const getKasalar = createAsyncThunk(
  "kasa/getKasalar",
  async (_, { rejectWithValue }) => {
    try {
      Logger.debug("Kasalar endpoint'ine istek yapılıyor");
      const response = await apiClient.get("/kasalar");
      return response.data;
    } catch (err) {
      Logger.error("Kasalar getirilemedi:", err);

      // 500 hatası alındığında daha detaylı hata bilgisini logla
      if (err.response && err.response.status === 500) {
        Logger.error("Sunucu hatası detayları:", err.response.data);
      }

      return rejectWithValue(
        err.response?.data || { msg: "Kasalar getirilemedi" }
      );
    }
  }
);

// Aktif kasaları getir
export const getActiveKasalar = createAsyncThunk(
  "kasa/getActiveKasalar",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/kasalar/active");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Aktif kasalar getirilemedi" }
      );
    }
  }
);

// ID'ye göre kasa getir
export const getKasaById = createAsyncThunk(
  "kasa/getKasaById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/kasalar/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Kasa bulunamadı" });
    }
  }
);

// Şubeye göre kasaları getir
export const getKasalarBySube = createAsyncThunk(
  "kasa/getKasalarBySube",
  async (subeId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/kasalar/sube/${subeId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Şube için kasalar yüklenemedi" }
      );
    }
  }
);

// Yeni kasa ekle
export const addKasa = createAsyncThunk(
  "kasa/addKasa",
  async (kasaData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/kasalar", kasaData);
      // Toast mesajını burada gösteriyoruz, form bileşeninde tekrar gösterilmemeli
      toast.success("Kasa başarıyla eklendi");
      return res.data;
    } catch (err) {
      // Hata durumunda toast mesajını burada gösteriyoruz
      toast.error(err.response?.data?.msg || "Kasa eklenirken bir hata oluştu");
      return rejectWithValue(err.response?.data || { msg: "Kasa eklenemedi" });
    }
  }
);

// Kasa güncelle
export const updateKasa = createAsyncThunk(
  "kasa/updateKasa",
  async ({ id, kasaData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/kasalar/${id}`, kasaData);
      // Toast mesajını burada gösteriyoruz, form bileşeninde tekrar gösterilmemeli
      toast.success("Kasa başarıyla güncellendi");
      return res.data;
    } catch (err) {
      // Hata durumunda toast mesajını burada gösteriyoruz
      toast.error(
        err.response?.data?.msg || "Kasa güncellenirken bir hata oluştu"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Kasa güncellenemedi" }
      );
    }
  }
);

// Kasa sil
export const deleteKasa = createAsyncThunk(
  "kasa/deleteKasa",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/kasalar/${id}`);
      toast.success("Kasa başarıyla silindi");
      return id;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Kasa silinirken bir hata oluştu");
      return rejectWithValue(err.response?.data || { msg: "Kasa silinemedi" });
    }
  }
);

// Çoklu kasa silme
export const deleteManyKasalar = createAsyncThunk(
  "kasa/deleteManyKasalar",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/kasalar/delete-many", { ids });
      toast.success("Seçili kasalar başarıyla silindi");
      return ids;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Kasalar silinirken bir hata oluştu"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Kasalar silinemedi" }
      );
    }
  }
);

const initialState = {
  kasalar: [],
  kasa: null,
  loading: false,
  error: null,
};

const kasaSlice = createSlice({
  name: "kasa",
  initialState,
  reducers: {
    clearCurrentKasa: (state) => {
      state.kasa = null;
    },
    clearKasaError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Tüm kasaları getir
      .addCase(getKasalar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getKasalar.fulfilled, (state, action) => {
        state.loading = false;
        state.kasalar = action.payload;
        state.error = null;
      })
      .addCase(getKasalar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Aktif kasaları getir
      .addCase(getActiveKasalar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveKasalar.fulfilled, (state, action) => {
        state.loading = false;
        state.kasalar = action.payload;
        state.error = null;
      })
      .addCase(getActiveKasalar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ID'ye göre kasa getir
      .addCase(getKasaById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getKasaById.fulfilled, (state, action) => {
        state.loading = false;
        state.kasa = action.payload;
        state.error = null;
      })
      .addCase(getKasaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Şubeye göre kasaları getir
      .addCase(getKasalarBySube.pending, (state) => {
        state.loading = true;
      })
      .addCase(getKasalarBySube.fulfilled, (state, action) => {
        state.loading = false;
        state.kasalar = action.payload;
        state.error = null;
      })
      .addCase(getKasalarBySube.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Yeni kasa ekle
      .addCase(addKasa.pending, (state) => {
        state.loading = true;
      })
      .addCase(addKasa.fulfilled, (state, action) => {
        state.loading = false;
        state.kasalar.push(action.payload);
        state.error = null;
      })
      .addCase(addKasa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Kasa güncelle
      .addCase(updateKasa.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateKasa.fulfilled, (state, action) => {
        state.loading = false;
        state.kasalar = state.kasalar.map((kasa) =>
          kasa._id === action.payload._id ? action.payload : kasa
        );
        state.kasa = action.payload;
        state.error = null;
      })
      .addCase(updateKasa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Kasa sil
      .addCase(deleteKasa.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteKasa.fulfilled, (state, action) => {
        state.loading = false;
        state.kasalar = state.kasalar.filter(
          (kasa) => kasa._id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteKasa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Çoklu kasa silme
      .addCase(deleteManyKasalar.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyKasalar.fulfilled, (state, action) => {
        state.loading = false;
        state.kasalar = state.kasalar.filter(
          (kasa) => !action.payload.includes(kasa._id)
        );
        state.error = null;
      })
      .addCase(deleteManyKasalar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentKasa, clearKasaError } = kasaSlice.actions;

export default kasaSlice.reducer;
