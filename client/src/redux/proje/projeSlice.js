import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";
import Logger from "../../utils/logger"; // Logger eklendi

// Tüm projeleri getir
export const getProjeler = createAsyncThunk(
  "proje/getProjeler",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/projeler");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Projeler yüklenemedi" }
      );
    }
  }
);

// ID'ye göre proje getir
export const getProjeById = createAsyncThunk(
  "proje/getProjeById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/projeler/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Proje bulunamadı" });
    }
  }
);

// Projeye ait görevleri getir
export const getProjeGorevleri = createAsyncThunk(
  "proje/getProjeGorevleri",
  async (proje_id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/projeler/gorevler/${proje_id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Görevler yüklenemedi" }
      );
    }
  }
);

// Yeni proje ekle
export const addProje = createAsyncThunk(
  "proje/addProje",
  async (projeData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/projeler", projeData);
      toast.success("Proje başarıyla eklendi");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Proje eklenirken bir hata oluştu"
      );
      return rejectWithValue(err.response?.data || { msg: "Proje eklenemedi" });
    }
  }
);

// Projeye görev ekle
export const addGorev = createAsyncThunk(
  "proje/addGorev",
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

// Proje güncelle
export const updateProje = createAsyncThunk(
  "proje/updateProje",
  async ({ id, projeData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/projeler/${id}`, projeData);
      toast.success("Proje başarıyla güncellendi");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Proje güncellenirken bir hata oluştu"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Proje güncellenemedi" }
      );
    }
  }
);

// Görev güncelle
export const updateGorev = createAsyncThunk(
  "proje/updateGorev",
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

// Proje sil
export const deleteProje = createAsyncThunk(
  "proje/deleteProje",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/projeler/${id}`);
      toast.success("Proje ve görevleri başarıyla silindi");
      return id;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Proje silinirken bir hata oluştu"
      );
      return rejectWithValue(err.response?.data || { msg: "Proje silinemedi" });
    }
  }
);

// Görev sil
export const deleteGorev = createAsyncThunk(
  "proje/deleteGorev",
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

// Çoklu proje silme
export const deleteManyProjeler = createAsyncThunk(
  "proje/deleteManyProjeler",
  async (ids, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/projeler/delete-many", { ids });
      toast.success(`${res.data.count} proje başarıyla silindi`);
      return ids;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Projeler silinirken bir hata oluştu"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Projeler silinemedi" }
      );
    }
  }
);

// Projedeki görevleri veya tüm görevleri alma
export const getGorevler = createAsyncThunk(
  "proje/getGorevler",
  async ({ proje_id, includeGenelGorevler = false }, { rejectWithValue }) => {
    try {
      Logger.debug("Görevler endpoint'ine istek yapılıyor", {
        proje_id,
        includeGenelGorevler,
      });

      // URL yapısını düzelt
      let url;

      if (proje_id) {
        // Belirli bir projeye ait görevleri getir
        url = `/projeler/${proje_id}/gorevler`;
        Logger.info(`Belirli proje görevleri için API çağrısı: ${url}`);
      } else if (includeGenelGorevler) {
        // Tüm görevleri getir
        url = "/projeler/gorevler/all";
        Logger.info(`Tüm görevleri getirmek için API çağrısı: ${url}`);
      } else {
        // Varsayılan olarak tüm görevleri getir
        url = "/projeler/gorevler/all";
        Logger.info(`Varsayılan API çağrısı: ${url}`);
      }

      const res = await apiClient.get(url);
      Logger.debug("Görevler başarıyla alındı:", res.data.length);
      return res.data;
    } catch (err) {
      Logger.error("Görevler yüklenirken hata:", err);
      return rejectWithValue(
        err.response?.data || { msg: "Görevler yüklenemedi" }
      );
    }
  }
);

const initialState = {
  projeler: [],
  proje: null,
  gorevler: [],
  loading: false,
  error: null,
};

const projeSlice = createSlice({
  name: "proje",
  initialState,
  reducers: {
    clearCurrentProje: (state) => {
      state.proje = null;
      state.gorevler = [];
      state.error = null;
    },
    clearProjeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Projeleri getir
      .addCase(getProjeler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProjeler.fulfilled, (state, action) => {
        state.projeler = action.payload;
        state.loading = false;
      })
      .addCase(getProjeler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Proje detayını getir
      .addCase(getProjeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProjeById.fulfilled, (state, action) => {
        state.proje = action.payload;
        state.loading = false;
      })
      .addCase(getProjeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Görevleri getir
      .addCase(getProjeGorevleri.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProjeGorevleri.fulfilled, (state, action) => {
        state.gorevler = action.payload;
        state.loading = false;
      })
      .addCase(getProjeGorevleri.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Proje ekle
      .addCase(addProje.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProje.fulfilled, (state, action) => {
        state.projeler.unshift(action.payload);
        state.proje = action.payload;
        state.loading = false;
      })
      .addCase(addProje.rejected, (state, action) => {
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
      })
      .addCase(addGorev.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Proje güncelle
      .addCase(updateProje.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProje.fulfilled, (state, action) => {
        state.projeler = state.projeler.map((proje) =>
          proje._id === action.payload._id ? action.payload : proje
        );
        state.proje = action.payload;
        state.loading = false;
      })
      .addCase(updateProje.rejected, (state, action) => {
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
        state.loading = false;
      })
      .addCase(updateGorev.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Proje sil
      .addCase(deleteProje.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProje.fulfilled, (state, action) => {
        state.projeler = state.projeler.filter(
          (proje) => proje._id !== action.payload
        );
        if (state.proje && state.proje._id === action.payload) {
          state.proje = null;
          state.gorevler = [];
        }
        state.loading = false;
      })
      .addCase(deleteProje.rejected, (state, action) => {
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
      })
      .addCase(deleteGorev.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Çoklu proje sil
      .addCase(deleteManyProjeler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyProjeler.fulfilled, (state, action) => {
        state.projeler = state.projeler.filter(
          (proje) => !action.payload.includes(proje._id)
        );
        state.loading = false;
      })
      .addCase(deleteManyProjeler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Görevleri getirme
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
      });
  },
});

export const { clearCurrentProje, clearProjeError } = projeSlice.actions;

export default projeSlice.reducer;
