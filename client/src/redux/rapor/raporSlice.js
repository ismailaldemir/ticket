import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Aylık borç raporu getir
export const getAylikBorcRaporu = createAsyncThunk(
  "rapor/getAylikBorcRaporu",
  async (filters, { rejectWithValue }) => {
    try {
      console.log("API'ye gönderilen filtreler:", filters); // Debug amaçlı
      const res = await apiClient.post("/raporlar/aylik-borc-raporu", filters);
      console.log("API yanıtı:", res.data); // Debug amaçlı
      return res.data;
    } catch (err) {
      console.error("Rapor yükleme hatası:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { msg: "Rapor yüklenemedi" }
      );
    }
  }
);

// Sistem genel özet bilgilerini getir
export const getRaporOzet = createAsyncThunk(
  "rapor/getRaporOzet",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/raporlar/ozet");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Rapor özeti yüklenemedi" }
      );
    }
  }
);

const initialState = {
  borclar: [], // Başlangıç değerini boş dizi olarak ayarla (undefined değil)
  aylikBorcRaporu: {
    aylar: [],
    raporVerileri: [],
  },
  raporOzet: {
    aktifKisiSayisi: 0,
    pasifKisiSayisi: 0,
    grupSayisi: 0,
    toplamBorc: 0,
    toplamOdeme: 0,
    odenmemisToplam: 0,
  },
  loading: false,
  error: null,
};

const raporSlice = createSlice({
  name: "rapor",
  initialState,
  reducers: {
    clearRaporData: (state) => {
      state.aylikBorcRaporu = { aylar: [], raporVerileri: [] };
    },
    clearRaporError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAylikBorcRaporu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAylikBorcRaporu.fulfilled, (state, action) => {
        state.borclar = action.payload?.raporVerileri || []; // payload gelmezse boş dizi ata
        state.aylikBorcRaporu = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getAylikBorcRaporu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload?.msg || "Rapor yüklenirken bir hata oluştu");
      })

      .addCase(getRaporOzet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRaporOzet.fulfilled, (state, action) => {
        state.raporOzet = action.payload;
        state.loading = false;
      })
      .addCase(getRaporOzet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(
          action.payload?.msg || "Rapor özeti yüklenirken bir hata oluştu"
        );
      });
  },
});

export const { clearRaporData, clearRaporError } = raporSlice.actions;

export default raporSlice.reducer;
