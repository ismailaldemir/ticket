import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";
import Logger from "../../utils/logger";

// Tüm görevleri getir
export const getGorevler = createAsyncThunk(
  "gorev/getGorevler",
  async ({ includeGenelGorevler = false } = {}, { rejectWithValue }) => {
    try {
      Logger.debug("Görevler endpoint'ine istek yapılıyor", {
        includeGenelGorevler,
      });

      // Backend'de varolan endpoint'i kullanma
      // /projeler/gorevler/all endpoint'i backend'de zaten tanımlı olduğu için bunu kullanıyoruz
      let url = "/projeler/gorevler/all";

      if (includeGenelGorevler) {
        url += "?includeGenelGorevler=true";
      }

      Logger.info(`Görevleri getirmek için API çağrısı: ${url}`);
      const res = await apiClient.get(url);
      Logger.debug("Görevler başarıyla alındı:", res.data.length);
      return res.data;
    } catch (err) {
      Logger.error("Görevler yüklenirken hata:", err);
      toast.error(err.response?.data?.msg || "Görevler yüklenemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Görevler yüklenemedi" }
      );
    }
  }
);

// Görev detayını getir
export const getGorevById = createAsyncThunk(
  "gorev/getGorevById",
  async (id, { rejectWithValue }) => {
    try {
      Logger.info(
        `Görev detayını getirmek için API çağrısı: /projeler/gorevler/${id}`
      );
      const res = await apiClient.get(`/projeler/gorevler/${id}`);
      return res.data;
    } catch (err) {
      Logger.error("Görev detayı yüklenirken hata:", err);
      toast.error(err.response?.data?.msg || "Görev detayı yüklenemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Görev detayı yüklenemedi" }
      );
    }
  }
);

// Projeye göre görevleri getir
export const getGorevlerByProje = createAsyncThunk(
  "gorev/getGorevlerByProje",
  async (projeId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/projeler/${projeId}/gorevler`);
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Proje görevleri yüklenemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Proje görevleri yüklenemedi" }
      );
    }
  }
);

// Atanan kişiye göre görevleri getir
export const getGorevlerByKisi = createAsyncThunk(
  "gorev/getGorevlerByKisi",
  async (kisiId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/projeler/gorevler/kisi/${kisiId}`);
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Kişi görevleri yüklenemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Kişi görevleri yüklenemedi" }
      );
    }
  }
);

// Görev ekle
export const addGorev = createAsyncThunk(
  "gorev/addGorev",
  async (gorevData, { rejectWithValue }) => {
    try {
      // atananKisi_id boşsa null değeri gönderilmesi sağlanır
      const dataToSend = {
        ...gorevData,
        atananKisi_id: gorevData.atananKisi_id || null,
      };

      const res = await apiClient.post("/projeler/gorevler", dataToSend);
      toast.success("Görev başarıyla eklendi");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Görev eklenirken bir hata oluştu"
      );
      return rejectWithValue(err.response?.data || { msg: "Görev eklenemedi" });
    }
  }
);

// Görev güncelle
export const updateGorev = createAsyncThunk(
  "gorev/updateGorev",
  async ({ id, gorevData }, { rejectWithValue }) => {
    try {
      // atananKisi_id boşsa null değeri gönderilmesi sağlanır
      const dataToSend = {
        ...gorevData,
        atananKisi_id: gorevData.atananKisi_id || null,
      };

      const res = await apiClient.put(`/projeler/gorevler/${id}`, dataToSend);
      toast.success("Görev başarıyla güncellendi");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Görev güncellenirken bir hata oluştu"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Görev güncellenemedi" }
      );
    }
  }
);

// Görev sil
export const deleteGorev = createAsyncThunk(
  "gorev/deleteGorev",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/projeler/gorevler/${id}`);
      toast.success("Görev başarıyla silindi");
      return id;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Görev silinirken bir hata oluştu"
      );
      return rejectWithValue(err.response?.data || { msg: "Görev silinemedi" });
    }
  }
);

// Çoklu görev silme
export const deleteManyGorevler = createAsyncThunk(
  "gorev/deleteManyGorevler",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/projeler/gorevler/delete-many", { ids });
      toast.success("Seçilen görevler başarıyla silindi");
      return ids;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Görevler silinirken bir hata oluştu"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Görevler silinemedi" }
      );
    }
  }
);

const initialState = {
  gorevler: [],
  gorev: null,
  loading: false,
  error: null,
};

const gorevSlice = createSlice({
  name: "gorev",
  initialState,
  reducers: {
    clearCurrentGorev: (state) => {
      state.gorev = null;
      state.error = null;
    },
    clearGorevError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Tüm görevleri getir
      .addCase(getGorevler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGorevler.fulfilled, (state, action) => {
        state.gorevler = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getGorevler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Görev detayını getir
      .addCase(getGorevById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGorevById.fulfilled, (state, action) => {
        state.gorev = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getGorevById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Projeye göre görevleri getir
      .addCase(getGorevlerByProje.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGorevlerByProje.fulfilled, (state, action) => {
        state.gorevler = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getGorevlerByProje.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Kişiye göre görevleri getir
      .addCase(getGorevlerByKisi.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGorevlerByKisi.fulfilled, (state, action) => {
        state.gorevler = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getGorevlerByKisi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Görev ekle
      .addCase(addGorev.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGorev.fulfilled, (state, action) => {
        state.gorevler.unshift(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addGorev.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Görev güncelle
      .addCase(updateGorev.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateGorev.fulfilled, (state, action) => {
        state.gorevler = state.gorevler.map((gorev) =>
          gorev._id === action.payload._id ? action.payload : gorev
        );
        if (state.gorev && state.gorev._id === action.payload._id) {
          state.gorev = action.payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateGorev.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Görev sil
      .addCase(deleteGorev.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteGorev.fulfilled, (state, action) => {
        state.gorevler = state.gorevler.filter(
          (gorev) => gorev._id !== action.payload
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteGorev.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Çoklu görev silme
      .addCase(deleteManyGorevler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyGorevler.fulfilled, (state, action) => {
        state.gorevler = state.gorevler.filter(
          (gorev) => !action.payload.includes(gorev._id)
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteManyGorevler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentGorev, clearGorevError } = gorevSlice.actions;

export default gorevSlice.reducer;
