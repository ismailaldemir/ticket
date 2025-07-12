import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";
import { getActiveKasalar } from "../kasa/kasaSlice";

// Tüm ödemeleri getir
export const getOdemeler = createAsyncThunk(
  "odeme/getOdemeler",
  async (_, { rejectWithValue }) => {
    try {
      // Yolu /api/odemeler yerine sadece /odemeler olarak düzeltin
      const response = await apiClient.get("/odemeler");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Ödemeler getirilemedi" }
      );
    }
  }
);

// ID'ye göre ödeme getir
export const getOdemeById = createAsyncThunk(
  "odeme/getOdemeById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/odemeler/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Ödeme bulunamadı" });
    }
  }
);

// Borca göre ödemeleri getir
export const getOdemelerByBorc = createAsyncThunk(
  "odeme/getOdemelerByBorc",
  async (borcId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/odemeler/borc/${borcId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Borç için ödemeler yüklenemedi" }
      );
    }
  }
);

// Kişiye göre ödemeleri getir
export const getOdemelerByKisi = createAsyncThunk(
  "odeme/getOdemelerByKisi",
  async (kisiId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/odemeler/kisi/${kisiId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Kişi için ödemeler yüklenemedi" }
      );
    }
  }
);

// Yeni ödeme ekle
export const addOdeme = createAsyncThunk(
  "odeme/addOdeme",
  async (odemeData, { rejectWithValue }) => {
    try {
      // FormData kullanımını kontrol et
      const isFormData = odemeData instanceof FormData;

      const config = {
        headers: {
          "Content-Type": isFormData
            ? "multipart/form-data"
            : "application/json",
        },
      };

      const res = await apiClient.post("/odemeler", odemeData, config);
      toast.success("Ödeme başarıyla eklendi");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Ödeme eklenirken bir hata oluştu"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Ödeme eklenirken bir hata oluştu" }
      );
    }
  }
);

// Toplu ödeme ekleme
export const addBulkOdeme = createAsyncThunk(
  "odeme/addBulkOdeme",
  async (odemelerData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/odemeler/bulk", odemelerData);
      // Toplu ödeme bildirimi sadece burada gösterilecek, bileşende gösterilmeyecek
      toast.success(
        `${res.data.eklenenOdemeSayisi} adet ödeme başarıyla eklendi`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Ödemeler eklenemedi" }
      );
    }
  }
);

// Ödeme bilgilerini güncelle
export const updateOdeme = createAsyncThunk(
  "odeme/updateOdeme",
  async ({ id, odemeData }, { rejectWithValue }) => {
    try {
      // FormData kullanımını kontrol et
      const isFormData = odemeData instanceof FormData;

      const config = {
        headers: {
          "Content-Type": isFormData
            ? "multipart/form-data"
            : "application/json",
        },
      };

      const res = await apiClient.put(`/odemeler/${id}`, odemeData, config);
      toast.success("Ödeme başarıyla güncellendi");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Ödeme güncellenirken bir hata oluştu"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Ödeme güncellenirken bir hata oluştu" }
      );
    }
  }
);

// Ödeme sil
export const deleteOdeme = createAsyncThunk(
  "odeme/deleteOdeme",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/odemeler/${id}`);
      // Toast mesajını kaldırıyoruz, component içinde gösterilecek
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Ödeme silinemedi" });
    }
  }
);

// Çoklu ödeme silme
export const deleteManyOdemeler = createAsyncThunk(
  "odeme/deleteManyOdemeler",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/odemeler/delete-many", { ids });
      // Toast mesajını kaldırıyoruz, component içinde gösterilecek
      return ids;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Ödemeler silinemedi" }
      );
    }
  }
);

const initialState = {
  odemeler: [],
  odeme: null,
  loading: false,
  error: null,
};

const odemeSlice = createSlice({
  name: "odeme",
  initialState,
  reducers: {
    clearCurrentOdeme: (state) => {
      state.odeme = null;
    },
    clearOdemeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOdemeler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOdemeler.fulfilled, (state, action) => {
        state.odemeler = action.payload;
        state.loading = false;
      })
      .addCase(getOdemeler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOdemeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOdemeById.fulfilled, (state, action) => {
        state.odeme = action.payload;
        state.loading = false;
      })
      .addCase(getOdemeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOdemelerByBorc.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOdemelerByBorc.fulfilled, (state, action) => {
        state.odemeler = action.payload;
        state.loading = false;
      })
      .addCase(getOdemelerByBorc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOdemelerByKisi.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOdemelerByKisi.fulfilled, (state, action) => {
        state.odemeler = action.payload;
        state.loading = false;
      })
      .addCase(getOdemelerByKisi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addOdeme.pending, (state) => {
        state.loading = true;
      })
      .addCase(addOdeme.fulfilled, (state, action) => {
        state.odemeler.push(action.payload);
        state.loading = false;
      })
      .addCase(addOdeme.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addBulkOdeme.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBulkOdeme.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Yeni eklenen ödemeleri state'e ekle
        if (action.payload && action.payload.eklenenOdemeler) {
          state.odemeler = [
            ...state.odemeler,
            ...action.payload.eklenenOdemeler,
          ];
        }
      })
      .addCase(addBulkOdeme.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateOdeme.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOdeme.fulfilled, (state, action) => {
        state.odemeler = state.odemeler.map((odeme) =>
          odeme._id === action.payload._id ? action.payload : odeme
        );
        state.odeme = action.payload;
        state.loading = false;
      })
      .addCase(updateOdeme.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteOdeme.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteOdeme.fulfilled, (state, action) => {
        state.odemeler = state.odemeler.filter(
          (odeme) => odeme._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteOdeme.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Çoklu silme işlemi için reducer'lar
      .addCase(deleteManyOdemeler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyOdemeler.fulfilled, (state, action) => {
        state.loading = false;
        state.odemeler = state.odemeler.filter(
          (odeme) => !action.payload.includes(odeme._id)
        );
      })
      .addCase(deleteManyOdemeler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentOdeme, clearOdemeError } = odemeSlice.actions;

export default odemeSlice.reducer;
