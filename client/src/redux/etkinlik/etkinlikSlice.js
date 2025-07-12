import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Tüm etkinlikleri getir (hata ayıklama düzeltmeleriyle)
export const getEtkinlikler = createAsyncThunk(
  "etkinlik/getEtkinlikler",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/etkinlikler");
      console.log("Etkinlikler API yanıtı:", res.data.length + " etkinlik");
      return res.data;
    } catch (err) {
      console.error("Etkinlik yükleme hatası:", err);
      return rejectWithValue(
        err.response?.data || { msg: "Etkinlikler yüklenemedi" }
      );
    }
  }
);

// Aktif etkinlikleri getir
export const getActiveEtkinlikler = createAsyncThunk(
  "etkinlik/getActiveEtkinlikler",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/etkinlikler/aktif");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Aktif etkinlikler yüklenemedi" }
      );
    }
  }
);

// ID'ye göre etkinlik getir
export const getEtkinlikById = createAsyncThunk(
  "etkinlik/getEtkinlikById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/etkinlikler/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Etkinlik bulunamadı" }
      );
    }
  }
);

// Etkinlik katılımcılarını getir
export const getEtkinlikKatilimcilari = createAsyncThunk(
  "etkinlik/getEtkinlikKatilimcilari",
  async (etkinlikId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(
        `/etkinlikler/${etkinlikId}/katilimcilar`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Etkinlik katılımcıları yüklenemedi" }
      );
    }
  }
);

// Etkinlik eklerini getir
export const getEtkinlikEkler = createAsyncThunk(
  "etkinlik/getEtkinlikEkler",
  async (etkinlikId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/etkinlikler/${etkinlikId}/ekler`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Etkinlik ekleri yüklenemedi" }
      );
    }
  }
);

// Yeni etkinlik ekle
export const addEtkinlik = createAsyncThunk(
  "etkinlik/addEtkinlik",
  async (etkinlikData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/etkinlikler", etkinlikData);
      toast.success("Etkinlik başarıyla oluşturuldu");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Etkinlik oluşturulamadı");
      return rejectWithValue(
        err.response?.data || { msg: "Etkinlik oluşturulamadı" }
      );
    }
  }
);

// Etkinlik katılımcısı ekle
export const addEtkinlikKatilimci = createAsyncThunk(
  "etkinlik/addEtkinlikKatilimci",
  async ({ etkinlikId, katilimciData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(
        `/etkinlikler/${etkinlikId}/katilimci`,
        katilimciData
      );
      toast.success("Katılımcı başarıyla eklendi");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Katılımcı eklenemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Katılımcı eklenemedi" }
      );
    }
  }
);

// Etkinliğe toplu katılımcı ekle
export const addBulkEtkinlikKatilimci = createAsyncThunk(
  "etkinlik/addBulkEtkinlikKatilimci",
  async ({ etkinlikId, katilimcilar }, { rejectWithValue }) => {
    if (!etkinlikId) {
      return rejectWithValue({ msg: "Etkinlik ID gereklidir" });
    }

    if (!katilimcilar || katilimcilar.length === 0) {
      return rejectWithValue({ msg: "Eklenecek katılımcı listesi boş olamaz" });
    }

    try {
      const res = await apiClient.post(
        `/etkinlikler/${etkinlikId}/bulk-katilimci`,
        { katilimcilar }
      );

      return res.data;
    } catch (err) {
      let errorMsg = err.response?.data?.msg || "Katılımcılar eklenemedi";
      toast.error(errorMsg);
      return rejectWithValue({ msg: errorMsg });
    }
  }
);

// Tek dosya ekle
export const addEtkinlikEk = createAsyncThunk(
  "etkinlik/addEtkinlikEk",
  async ({ etkinlikId, formData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(
        `/etkinlikler/${etkinlikId}/ek`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Dosya başarıyla yüklendi");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Dosya yüklenemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Dosya yüklenemedi" }
      );
    }
  }
);

// Çoklu dosya ekle
export const addEtkinlikEkCoklu = createAsyncThunk(
  "etkinlik/addEtkinlikEkCoklu",
  async ({ etkinlikId, formData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(
        `/etkinlikler/${etkinlikId}/ekler`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(res.data.msg || "Dosyalar başarıyla yüklendi");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Dosyalar yüklenemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Dosyalar yüklenemedi" }
      );
    }
  }
);

// Etkinlik güncelle
export const updateEtkinlik = createAsyncThunk(
  "etkinlik/updateEtkinlik",
  async ({ id, etkinlikData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/etkinlikler/${id}`, etkinlikData);
      toast.success("Etkinlik başarıyla güncellendi");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Etkinlik güncellenemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Etkinlik güncellenemedi" }
      );
    }
  }
);

// Katılımcı güncelle
export const updateEtkinlikKatilimci = createAsyncThunk(
  "etkinlik/updateEtkinlikKatilimci",
  async ({ katilimciId, katilimciData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(
        `/etkinlikler/katilimci/${katilimciId}`,
        katilimciData
      );
      toast.success("Katılımcı bilgileri başarıyla güncellendi");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Katılımcı bilgileri güncellenemedi"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Katılımcı bilgileri güncellenemedi" }
      );
    }
  }
);

// Etkinlik sil
export const deleteEtkinlik = createAsyncThunk(
  "etkinlik/deleteEtkinlik",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/etkinlikler/${id}`);
      // Toast mesajını kaldırdık, component içinde gösterilecek
      return id;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Etkinlik silinemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Etkinlik silinemedi" }
      );
    }
  }
);

// Katılımcı sil
export const deleteEtkinlikKatilimci = createAsyncThunk(
  "etkinlik/deleteEtkinlikKatilimci",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/etkinlikler/katilimci/${id}`);
      toast.success("Katılımcı başarıyla silindi");
      return id;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Katılımcı silinemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Katılımcı silinemedi" }
      );
    }
  }
);

// Ek sil
export const deleteEtkinlikEk = createAsyncThunk(
  "etkinlik/deleteEtkinlikEk",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/etkinlikler/ek/${id}`);
      toast.success("Dosya başarıyla silindi");
      return id;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Dosya silinemedi");
      return rejectWithValue(err.response?.data || { msg: "Dosya silinemedi" });
    }
  }
);

// Çoklu etkinlik sil
export const deleteManyEtkinlikler = createAsyncThunk(
  "etkinlik/deleteManyEtkinlikler",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/etkinlikler/delete-many", { ids });
      toast.success("Seçili etkinlikler başarıyla silindi");
      return ids;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Etkinlikler silinemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Etkinlikler silinemedi" }
      );
    }
  }
);

const initialState = {
  etkinlikler: [],
  etkinlik: null,
  katilimcilar: [],
  ekler: [],
  loading: false,
  error: null,
};

const etkinlikSlice = createSlice({
  name: "etkinlik",
  initialState,
  reducers: {
    clearCurrentEtkinlik: (state) => {
      state.etkinlik = null;
      state.katilimcilar = [];
      state.ekler = [];
    },
    clearEtkinlikError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Tüm etkinlikleri getirme
      .addCase(getEtkinlikler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEtkinlikler.fulfilled, (state, action) => {
        state.etkinlikler = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getEtkinlikler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Aktif etkinlikleri getirme
      .addCase(getActiveEtkinlikler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveEtkinlikler.fulfilled, (state, action) => {
        state.etkinlikler = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getActiveEtkinlikler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ID'ye göre etkinlik getirme
      .addCase(getEtkinlikById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEtkinlikById.fulfilled, (state, action) => {
        state.etkinlik = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getEtkinlikById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Etkinlik katılımcılarını getirme
      .addCase(getEtkinlikKatilimcilari.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEtkinlikKatilimcilari.fulfilled, (state, action) => {
        state.katilimcilar = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getEtkinlikKatilimcilari.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Etkinlik eklerini getirme
      .addCase(getEtkinlikEkler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEtkinlikEkler.fulfilled, (state, action) => {
        state.ekler = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getEtkinlikEkler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Yeni etkinlik ekleme
      .addCase(addEtkinlik.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEtkinlik.fulfilled, (state, action) => {
        state.etkinlikler.unshift(action.payload);
        state.etkinlik = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(addEtkinlik.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Etkinliğe katılımcı ekleme
      .addCase(addEtkinlikKatilimci.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEtkinlikKatilimci.fulfilled, (state, action) => {
        state.katilimcilar.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addEtkinlikKatilimci.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Etkinliğe toplu katılımcı ekleme
      .addCase(addBulkEtkinlikKatilimci.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBulkEtkinlikKatilimci.fulfilled, (state, action) => {
        // Başarı durumunda katılımcıları yeniden yükleme kararı verildi
        // Bu nedenle state'i doğrudan değiştirmiyoruz, yeniden sorgu yapılmalı
        state.loading = false;
        state.error = null;
      })
      .addCase(addBulkEtkinlikKatilimci.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Etkinliğe tek dosya ekleme
      .addCase(addEtkinlikEk.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEtkinlikEk.fulfilled, (state, action) => {
        state.ekler.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addEtkinlikEk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Etkinliğe çoklu dosya ekleme
      .addCase(addEtkinlikEkCoklu.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEtkinlikEkCoklu.fulfilled, (state, action) => {
        if (action.payload.eklenenDosyalar) {
          state.ekler = [...state.ekler, ...action.payload.eklenenDosyalar];
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(addEtkinlikEkCoklu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Etkinlik güncelleme
      .addCase(updateEtkinlik.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEtkinlik.fulfilled, (state, action) => {
        state.etkinlikler = state.etkinlikler.map((etkinlik) =>
          etkinlik._id === action.payload._id ? action.payload : etkinlik
        );
        state.etkinlik = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateEtkinlik.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Katılımcı güncelleme
      .addCase(updateEtkinlikKatilimci.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEtkinlikKatilimci.fulfilled, (state, action) => {
        state.katilimcilar = state.katilimcilar.map((katilimci) =>
          katilimci._id === action.payload._id ? action.payload : katilimci
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(updateEtkinlikKatilimci.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Etkinlik silme
      .addCase(deleteEtkinlik.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEtkinlik.fulfilled, (state, action) => {
        state.etkinlikler = state.etkinlikler.filter(
          (etkinlik) => etkinlik._id !== action.payload
        );
        if (state.etkinlik && state.etkinlik._id === action.payload) {
          state.etkinlik = null;
          state.katilimcilar = [];
          state.ekler = [];
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteEtkinlik.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Katılımcı silme
      .addCase(deleteEtkinlikKatilimci.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEtkinlikKatilimci.fulfilled, (state, action) => {
        state.katilimcilar = state.katilimcilar.filter(
          (katilimci) => katilimci._id !== action.payload
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteEtkinlikKatilimci.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Ek silme
      .addCase(deleteEtkinlikEk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEtkinlikEk.fulfilled, (state, action) => {
        state.ekler = state.ekler.filter((ek) => ek._id !== action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteEtkinlikEk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Çoklu etkinlik silme
      .addCase(deleteManyEtkinlikler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyEtkinlikler.fulfilled, (state, action) => {
        state.etkinlikler = state.etkinlikler.filter(
          (etkinlik) => !action.payload.includes(etkinlik._id)
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteManyEtkinlikler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentEtkinlik, clearEtkinlikError } =
  etkinlikSlice.actions;

export default etkinlikSlice.reducer;
