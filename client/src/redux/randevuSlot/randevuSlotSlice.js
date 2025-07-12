import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Tüm randevu slotlarını getir
export const getRandevuSlotlari = createAsyncThunk(
  "randevuSlot/getRandevuSlotlari",
  async (queryParams, { rejectWithValue }) => {
    try {
      let url = "/randevu-slotlari";

      // Query parametreleri varsa URL'e ekle
      if (queryParams && Object.keys(queryParams).length > 0) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(queryParams)) {
          if (value) {
            params.append(key, value);
          }
        }
        url += `?${params.toString()}`;
      }

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// ID'ye göre randevu slotunu getir
export const getRandevuSlotById = createAsyncThunk(
  "randevuSlot/getRandevuSlotById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/randevu-slotlari/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Toplu randevu slotları oluştur
export const createBulkRandevuSlotlari = createAsyncThunk(
  "randevuSlot/createBulkRandevuSlotlari",
  async (slotData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        "/randevu-slotlari/toplu-olustur",
        slotData
      );
      toast.success(
        response.data.msg || "Randevu slotları başarıyla oluşturuldu"
      );
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.msg ||
          "Randevu slotları oluşturulurken bir hata oluştu"
      );
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Yeni randevu slotu ekle
export const addRandevuSlot = createAsyncThunk(
  "randevuSlot/addRandevuSlot",
  async (slotData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/randevu-slotlari", slotData);
      toast.success("Randevu slotu başarıyla eklendi");
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Randevu slotu eklenirken bir hata oluştu"
      );
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Randevu slotunu güncelle
export const updateRandevuSlot = createAsyncThunk(
  "randevuSlot/updateRandevuSlot",
  async ({ id, slotData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/randevu-slotlari/${id}`, slotData);
      toast.success("Randevu slotu başarıyla güncellendi");
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.msg ||
          "Randevu slotu güncellenirken bir hata oluştu"
      );
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Randevu slot durumunu güncelle
export const updateRandevuSlotDurum = createAsyncThunk(
  "randevuSlot/updateRandevuSlotDurum",
  async ({ id, durum, iptalNedeni }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        `/randevu-slotlari/durum-guncelle/${id}`,
        {
          durum,
          iptalNedeni,
        }
      );
      toast.success("Randevu slot durumu başarıyla güncellendi");
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.msg ||
          "Randevu slot durumu güncellenirken bir hata oluştu"
      );
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Randevu rezervasyonu
export const createRezervasyon = createAsyncThunk(
  "randevuSlot/createRezervasyon",
  async ({ id, rezervasyonData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/randevu-slotlari/rezervasyon/${id}`,
        rezervasyonData
      );
      toast.success("Randevu rezervasyonu başarıyla yapıldı");
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.msg ||
          "Randevu rezervasyonu yapılırken bir hata oluştu"
      );
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Randevu slotunu sil
export const deleteRandevuSlot = createAsyncThunk(
  "randevuSlot/deleteRandevuSlot",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/randevu-slotlari/${id}`);
      toast.success("Randevu slotu başarıyla silindi");
      return id;
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Randevu slotu silinirken bir hata oluştu"
      );
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Çoklu randevu slotunu sil
export const deleteManyRandevuSlotlari = createAsyncThunk(
  "randevuSlot/deleteManyRandevuSlotlari",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/randevu-slotlari/delete-many", { ids });
      toast.success(`${ids.length} randevu slotu başarıyla silindi`);
      return ids;
    } catch (error) {
      toast.error(
        error.response?.data?.msg ||
          "Randevu slotları silinirken bir hata oluştu"
      );
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Initial state
const initialState = {
  randevuSlotlari: [],
  currentRandevuSlot: null,
  loading: false,
  error: null,
  bulkCreateResult: null,
};

// Slice
const randevuSlotSlice = createSlice({
  name: "randevuSlot",
  initialState,
  reducers: {
    clearCurrentRandevuSlot: (state) => {
      state.currentRandevuSlot = null;
    },
    clearRandevuSlotError: (state) => {
      state.error = null;
    },
    clearBulkCreateResult: (state) => {
      state.bulkCreateResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getRandevuSlotlari
      .addCase(getRandevuSlotlari.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRandevuSlotlari.fulfilled, (state, action) => {
        // Gelen veri dizi değilse, boş diziye çek
        state.randevuSlotlari = Array.isArray(action.payload)
          ? action.payload
          : [];
        state.loading = false;
        state.error = null;
      })
      .addCase(getRandevuSlotlari.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getRandevuSlotById
      .addCase(getRandevuSlotById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRandevuSlotById.fulfilled, (state, action) => {
        state.currentRandevuSlot = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getRandevuSlotById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createBulkRandevuSlotlari
      .addCase(createBulkRandevuSlotlari.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBulkRandevuSlotlari.fulfilled, (state, action) => {
        state.bulkCreateResult = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(createBulkRandevuSlotlari.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addRandevuSlot
      .addCase(addRandevuSlot.pending, (state) => {
        state.loading = true;
      })
      .addCase(addRandevuSlot.fulfilled, (state, action) => {
        // Yeni eklenen slotu listenin başına ekle
        state.randevuSlotlari.unshift(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addRandevuSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateRandevuSlot
      .addCase(updateRandevuSlot.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRandevuSlot.fulfilled, (state, action) => {
        state.randevuSlotlari = state.randevuSlotlari.map((slot) =>
          slot._id === action.payload._id ? action.payload : slot
        );
        state.currentRandevuSlot = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateRandevuSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateRandevuSlotDurum
      .addCase(updateRandevuSlotDurum.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRandevuSlotDurum.fulfilled, (state, action) => {
        state.randevuSlotlari = state.randevuSlotlari.map((slot) =>
          slot._id === action.payload._id ? action.payload : slot
        );
        if (
          state.currentRandevuSlot &&
          state.currentRandevuSlot._id === action.payload._id
        ) {
          state.currentRandevuSlot = action.payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateRandevuSlotDurum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createRezervasyon
      .addCase(createRezervasyon.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRezervasyon.fulfilled, (state, action) => {
        state.randevuSlotlari = state.randevuSlotlari.map((slot) =>
          slot._id === action.payload._id ? action.payload : slot
        );
        if (
          state.currentRandevuSlot &&
          state.currentRandevuSlot._id === action.payload._id
        ) {
          state.currentRandevuSlot = action.payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(createRezervasyon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteRandevuSlot
      .addCase(deleteRandevuSlot.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRandevuSlot.fulfilled, (state, action) => {
        state.randevuSlotlari = state.randevuSlotlari.filter(
          (slot) => slot._id !== action.payload
        );
        if (
          state.currentRandevuSlot &&
          state.currentRandevuSlot._id === action.payload
        ) {
          state.currentRandevuSlot = null;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteRandevuSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteManyRandevuSlotlari
      .addCase(deleteManyRandevuSlotlari.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyRandevuSlotlari.fulfilled, (state, action) => {
        state.randevuSlotlari = state.randevuSlotlari.filter(
          (slot) => !action.payload.includes(slot._id)
        );
        if (
          state.currentRandevuSlot &&
          action.payload.includes(state.currentRandevuSlot._id)
        ) {
          state.currentRandevuSlot = null;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteManyRandevuSlotlari.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentRandevuSlot,
  clearRandevuSlotError,
  clearBulkCreateResult,
} = randevuSlotSlice.actions;

export default randevuSlotSlice.reducer;
