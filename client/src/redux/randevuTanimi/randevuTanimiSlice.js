import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";
import Logger from "../../utils/logger"; // Logger servisini import ediyoruz

// Tüm randevu tanımlarını getir
export const getRandevuTanimlari = createAsyncThunk(
  "randevuTanimi/getRandevuTanimlari",
  async ({ forceRefetch } = {}, { rejectWithValue }) => {
    try {
      // Cache'i önlemek için timestamp ekle
      const timestamp = forceRefetch ? `?_t=${Date.now()}` : "";
      const response = await apiClient.get(`/randevu-tanimlari${timestamp}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Aktif randevu tanımlarını getir
export const getActiveRandevuTanimlari = createAsyncThunk(
  "randevuTanimi/getActiveRandevuTanimlari",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/randevu-tanimlari/active");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// ID'ye göre randevu tanımını getir
export const getRandevuTanimiById = createAsyncThunk(
  "randevuTanimi/getRandevuTanimiById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/randevu-tanimlari/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Yeni randevu tanımı ekle
export const addRandevuTanimi = createAsyncThunk(
  "randevuTanimi/addRandevuTanimi",
  async (tanımData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/randevu-tanimlari", tanımData);
      toast.success("Randevu tanımı başarıyla eklendi");
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Randevu tanımı eklenirken bir hata oluştu"
      );
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Randevu tanımını güncelle
export const updateRandevuTanimi = createAsyncThunk(
  "randevuTanimi/updateRandevuTanimi",
  async ({ id, tanımData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        `/randevu-tanimlari/${id}`,
        tanımData
      );
      toast.success("Randevu tanımı başarıyla güncellendi");
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.msg ||
          "Randevu tanımı güncellenirken bir hata oluştu"
      );
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Randevu tanımını sil
export const deleteRandevuTanimi = createAsyncThunk(
  "randevuTanimi/deleteRandevuTanimi",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/randevu-tanimlari/${id}`);
      toast.success("Randevu tanımı başarıyla silindi");
      return id;
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Randevu tanımı silinirken bir hata oluştu"
      );
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Çoklu randevu tanımını sil
export const deleteManyRandevuTanimlari = createAsyncThunk(
  "randevuTanimi/deleteManyRandevuTanimlari",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/randevu-tanimlari/delete-many", { ids });
      toast.success(`${ids.length} randevu tanımı başarıyla silindi`);
      return ids;
    } catch (error) {
      toast.error(
        error.response?.data?.msg ||
          "Randevu tanımları silinirken bir hata oluştu"
      );
      return rejectWithValue(error.response?.data || { msg: "Sunucu hatası" });
    }
  }
);

// Initial state
const initialState = {
  randevuTanimlari: [],
  activeRandevuTanimlari: [], // activeRandevuTanimlari'yi initial state'e ekleyelim
  currentRandevuTanimi: null,
  loading: false,
  error: null,
};

// Slice
const randevuTanimiSlice = createSlice({
  name: "randevuTanimi",
  initialState,
  reducers: {
    clearCurrentRandevuTanimi: (state) => {
      state.currentRandevuTanimi = null;
    },
    clearRandevuTanimiError: (state) => {
      state.error = null;
    },
    clearRandevuTanimlari: (state) => {
      state.randevuTanimlari = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // getRandevuTanimlari
      .addCase(getRandevuTanimlari.pending, (state) => {
        state.loading = true;
        Logger.info("getRandevuTanimlari: İstek gönderiliyor...");
      })
      .addCase(getRandevuTanimlari.fulfilled, (state, action) => {
        Logger.info(
          "getRandevuTanimlari: Başarılı yanıt geldi:",
          action.payload
        );
        try {
          const data = action.payload || [];

          // Immutability için yeni referanslar oluştur
          state.randevuTanimlari = [...data];

          // Bu noktada debugging ekle
          Logger.debug(
            `randevuTanimlari state güncellendi. Veriler: ${JSON.stringify(
              state.randevuTanimlari.map((t) => ({ id: t._id, ad: t.ad }))
            )}`
          );

          // Eğer randevuTanimlari güncellendiyse ve boş değilse, activeRandevuTanimlari'ni da güncelle
          // Bu sayede RandevuAnaSayfa'da da veriler görünecek
          if (data.length > 0) {
            const activeData = data.filter((tanim) => tanim.isActive === true);
            state.activeRandevuTanimlari = [...activeData];

            Logger.debug(
              `activeRandevuTanimlari state de güncellendi. Veri sayısı: ${activeData.length}`
            );
          }
        } catch (e) {
          Logger.error("Veri işlenirken hata:", e);
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(getRandevuTanimlari.rejected, (state, action) => {
        state.loading = false;
        Logger.error("getRandevuTanimlari: Hata oluştu", action.payload);
        state.error = action.payload;
      })

      // getActiveRandevuTanimlari
      .addCase(getActiveRandevuTanimlari.pending, (state) => {
        state.loading = true;
        Logger.info("getActiveRandevuTanimlari: İstek gönderiliyor...");
      })
      .addCase(getActiveRandevuTanimlari.fulfilled, (state, action) => {
        Logger.info(
          "getActiveRandevuTanimlari: Başarılı yanıt geldi:",
          action.payload
        );

        try {
          const data = action.payload || [];
          // Immutability için yeni referanslar oluştur
          state.activeRandevuTanimlari = [...data];

          // Çift yönlü güncelleme - Ana listeyi de güncelle
          // Bu kritik önemli, çünkü bazı bileşenler sadece randevuTanimlari'nı kullanıyor olabilir
          if (data.length > 0) {
            // Mevcut randevuTanimlari ile aktif olanları birleştir
            const currentTanimlar = state.randevuTanimlari || [];

            // Listede olmayan tanımları ekle (ID'ye göre)
            const idsInMainList = new Set(currentTanimlar.map((t) => t._id));
            const newTanimlar = [...currentTanimlar];

            for (const activeTanim of data) {
              if (!idsInMainList.has(activeTanim._id)) {
                newTanimlar.push(activeTanim);
              }
            }

            state.randevuTanimlari = newTanimlar;

            Logger.debug(
              `randevuTanimlari state çapraz güncellendi. Yeni veri sayısı: ${newTanimlar.length}`
            );
          }
        } catch (e) {
          Logger.error("Aktif tanımlar işlenirken hata:", e);
        }

        state.loading = false;
        state.error = null;
      })
      .addCase(getActiveRandevuTanimlari.rejected, (state, action) => {
        state.loading = false;
        Logger.error("getActiveRandevuTanimlari: Hata oluştu", action.payload);
        state.error = action.payload;
      })

      // getRandevuTanimiById
      .addCase(getRandevuTanimiById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRandevuTanimiById.fulfilled, (state, action) => {
        state.currentRandevuTanimi = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getRandevuTanimiById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addRandevuTanimi
      .addCase(addRandevuTanimi.pending, (state) => {
        state.loading = true;
      })
      .addCase(addRandevuTanimi.fulfilled, (state, action) => {
        state.randevuTanimlari = [action.payload, ...state.randevuTanimlari];
        state.loading = false;
        state.error = null;
      })
      .addCase(addRandevuTanimi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateRandevuTanimi
      .addCase(updateRandevuTanimi.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRandevuTanimi.fulfilled, (state, action) => {
        state.randevuTanimlari = state.randevuTanimlari.map((tanim) =>
          tanim._id === action.payload._id ? action.payload : tanim
        );
        state.currentRandevuTanimi = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateRandevuTanimi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteRandevuTanimi
      .addCase(deleteRandevuTanimi.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRandevuTanimi.fulfilled, (state, action) => {
        state.randevuTanimlari = state.randevuTanimlari.filter(
          (tanim) => tanim._id !== action.payload
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteRandevuTanimi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteManyRandevuTanimlari
      .addCase(deleteManyRandevuTanimlari.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyRandevuTanimlari.fulfilled, (state, action) => {
        state.randevuTanimlari = state.randevuTanimlari.filter(
          (tanim) => !action.payload.includes(tanim._id)
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteManyRandevuTanimlari.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentRandevuTanimi,
  clearRandevuTanimiError,
  clearRandevuTanimlari,
} = randevuTanimiSlice.actions;

export default randevuTanimiSlice.reducer;
