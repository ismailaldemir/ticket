import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Tüm toplantıları getir
export const getToplantilar = createAsyncThunk(
  "toplanti/getToplantilar",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/toplantilar");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Toplantılar yüklenemedi" }
      );
    }
  }
);

// ID'ye göre toplantı getir
export const getToplantiById = createAsyncThunk(
  "toplanti/getToplantiById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/toplantilar/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Toplantı kaydı bulunamadı" }
      );
    }
  }
);

// Toplantıya ait kararları getir
export const getToplantiKararlari = createAsyncThunk(
  "toplanti/getToplantiKararlari",
  async (toplanti_id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/toplantilar/kararlar/${toplanti_id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Toplantı kararları yüklenemedi" }
      );
    }
  }
);

// Toplantıya ait katılımcıları getir
export const getToplantiKatilimcilari = createAsyncThunk(
  "toplanti/getToplantiKatilimcilari",
  async (toplanti_id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(
        `/toplantilar/katilimcilar/${toplanti_id}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Toplantı katılımcıları yüklenemedi" }
      );
    }
  }
);

// Yeni toplantı ekle
export const addToplanti = createAsyncThunk(
  "toplanti/addToplanti",
  async (toplantiData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/toplantilar", toplantiData);
      // Burada toast mesajını kaldırdık, ToplantiForm içinde gösterilecek
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Toplantı kaydı eklenemedi" }
      );
    }
  }
);

// Toplantı kararı ekle
export const addToplantiKarar = createAsyncThunk(
  "toplanti/addToplantiKarar",
  async (kararData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/toplantilar/kararlar", kararData);
      toast.success("Toplantı kararı başarıyla eklendi");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Toplantı kararı eklenemedi" }
      );
    }
  }
);

// Toplantı katılımcısı ekle
export const addToplantiKatilimci = createAsyncThunk(
  "toplanti/addToplantiKatilimci",
  async (katilimciData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(
        "/toplantilar/katilimcilar",
        katilimciData
      );
      toast.success("Toplantı katılımcısı başarıyla eklendi");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Toplantı katılımcısı eklenemedi" }
      );
    }
  }
);

// Toplu Katılımcı Ekleme
export const addBulkToplantiKatilimci = createAsyncThunk(
  "toplanti/addBulkToplantiKatilimci",
  async ({ toplanti_id, katilimcilar }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/toplantilar/katilimcilar/bulk", {
        toplanti_id,
        katilimcilar,
      });

      if (res.data.eklenenSayisi > 0) {
        toast.success(`${res.data.eklenenSayisi} katılımcı başarıyla eklendi`);
      }

      if (res.data.atlanSayisi > 0) {
        toast.warning(`${res.data.atlanSayisi} katılımcı eklenemedi`);
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Katılımcılar eklenemedi" }
      );
    }
  }
);

// Toplantı güncelle
export const updateToplanti = createAsyncThunk(
  "toplanti/updateToplanti",
  async ({ id, toplantiData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/toplantilar/${id}`, toplantiData);
      // Burada toast mesajını kaldırdık, ToplantiForm içinde gösterilecek
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Toplantı kaydı güncellenemedi" }
      );
    }
  }
);

// Toplantı kararı güncelle
export const updateToplantiKarar = createAsyncThunk(
  "toplanti/updateToplantiKarar",
  async ({ id, kararData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/toplantilar/kararlar/${id}`, kararData);
      toast.success("Toplantı kararı başarıyla güncellendi");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Toplantı kararı güncellenemedi" }
      );
    }
  }
);

// Toplantı katılımcısı güncelle
export const updateToplantiKatilimci = createAsyncThunk(
  "toplanti/updateToplantiKatilimci",
  async ({ id, katilimciData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(
        `/toplantilar/katilimcilar/${id}`,
        katilimciData
      );
      toast.success("Katılımcı bilgileri başarıyla güncellendi");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Katılımcı bilgileri güncellenemedi" }
      );
    }
  }
);

// Toplantı sil
export const deleteToplanti = createAsyncThunk(
  "toplanti/deleteToplanti",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/toplantilar/${id}`);
      toast.success("Toplantı kaydı silindi");
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Toplantı kaydı silinemedi" }
      );
    }
  }
);

// Toplantı kararı sil
export const deleteToplantiKarar = createAsyncThunk(
  "toplanti/deleteToplantiKarar",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/toplantilar/kararlar/${id}`);
      toast.success("Toplantı kararı silindi");
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Toplantı kararı silinemedi" }
      );
    }
  }
);

// Toplantı katılımcısı sil
export const deleteToplantiKatilimci = createAsyncThunk(
  "toplanti/deleteToplantiKatilimci",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/toplantilar/katilimcilar/${id}`);
      toast.success("Katılımcı kaydı silindi");
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Katılımcı kaydı silinemedi" }
      );
    }
  }
);

// Çoklu toplantı kaydı silme
export const deleteManyToplantilar = createAsyncThunk(
  "toplanti/deleteManyToplantilar",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/toplantilar/delete-many", { ids });
      return ids;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Toplantı kayıtları silinemedi" }
      );
    }
  }
);

const initialState = {
  toplantilar: [],
  toplanti: null,
  kararlar: [],
  katilimcilar: [],
  loading: false,
  error: null,
};

const toplantiSlice = createSlice({
  name: "toplanti",
  initialState,
  reducers: {
    clearCurrentToplanti: (state) => {
      state.toplanti = null;
      state.kararlar = [];
      state.katilimcilar = [];
    },
    clearToplantiError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Toplantıları Getirme
      .addCase(getToplantilar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getToplantilar.fulfilled, (state, action) => {
        state.toplantilar = action.payload;
        state.loading = false;
      })
      .addCase(getToplantilar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Tekil Toplantı Getirme
      .addCase(getToplantiById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getToplantiById.fulfilled, (state, action) => {
        state.toplanti = action.payload;
        state.loading = false;
      })
      .addCase(getToplantiById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toplantı Kararlarını Getirme
      .addCase(getToplantiKararlari.pending, (state) => {
        state.loading = true;
      })
      .addCase(getToplantiKararlari.fulfilled, (state, action) => {
        state.kararlar = action.payload;
        state.loading = false;
      })
      .addCase(getToplantiKararlari.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toplantı Katılımcılarını Getirme
      .addCase(getToplantiKatilimcilari.pending, (state) => {
        state.loading = true;
      })
      .addCase(getToplantiKatilimcilari.fulfilled, (state, action) => {
        state.katilimcilar = action.payload;
        state.loading = false;
      })
      .addCase(getToplantiKatilimcilari.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toplantı Ekleme
      .addCase(addToplanti.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToplanti.fulfilled, (state, action) => {
        state.toplantilar.unshift(action.payload);
        state.toplanti = action.payload;
        state.loading = false;
      })
      .addCase(addToplanti.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Karar Ekleme
      .addCase(addToplantiKarar.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToplantiKarar.fulfilled, (state, action) => {
        state.kararlar.push(action.payload);
        state.loading = false;
      })
      .addCase(addToplantiKarar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Katılımcı Ekleme
      .addCase(addToplantiKatilimci.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToplantiKatilimci.fulfilled, (state, action) => {
        state.katilimcilar.push(action.payload);
        state.loading = false;
      })
      .addCase(addToplantiKatilimci.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toplu Katılımcı Ekleme
      .addCase(addBulkToplantiKatilimci.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBulkToplantiKatilimci.fulfilled, (state, action) => {
        state.katilimcilar = [
          ...state.katilimcilar,
          ...action.payload.eklenenler,
        ];
        state.loading = false;
      })
      .addCase(addBulkToplantiKatilimci.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toplantı Güncelleme
      .addCase(updateToplanti.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateToplanti.fulfilled, (state, action) => {
        state.toplantilar = state.toplantilar.map((toplanti) =>
          toplanti._id === action.payload._id ? action.payload : toplanti
        );
        state.toplanti = action.payload;
        state.loading = false;
      })
      .addCase(updateToplanti.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Karar Güncelleme
      .addCase(updateToplantiKarar.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateToplantiKarar.fulfilled, (state, action) => {
        state.kararlar = state.kararlar.map((karar) =>
          karar._id === action.payload._id ? action.payload : karar
        );
        state.loading = false;
      })
      .addCase(updateToplantiKarar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Katılımcı Güncelleme
      .addCase(updateToplantiKatilimci.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateToplantiKatilimci.fulfilled, (state, action) => {
        state.katilimcilar = state.katilimcilar.map((katilimci) =>
          katilimci._id === action.payload._id ? action.payload : katilimci
        );
        state.loading = false;
      })
      .addCase(updateToplantiKatilimci.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toplantı Silme
      .addCase(deleteToplanti.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteToplanti.fulfilled, (state, action) => {
        state.toplantilar = state.toplantilar.filter(
          (toplanti) => toplanti._id !== action.payload
        );
        if (state.toplanti && state.toplanti._id === action.payload) {
          state.toplanti = null;
          state.kararlar = [];
          state.katilimcilar = [];
        }
        state.loading = false;
      })
      .addCase(deleteToplanti.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Karar Silme
      .addCase(deleteToplantiKarar.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteToplantiKarar.fulfilled, (state, action) => {
        state.kararlar = state.kararlar.filter(
          (karar) => karar._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteToplantiKarar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Katılımcı Silme
      .addCase(deleteToplantiKatilimci.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteToplantiKatilimci.fulfilled, (state, action) => {
        state.katilimcilar = state.katilimcilar.filter(
          (katilimci) => katilimci._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteToplantiKatilimci.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Çoklu Toplantı Silme
      .addCase(deleteManyToplantilar.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyToplantilar.fulfilled, (state, action) => {
        state.toplantilar = state.toplantilar.filter(
          (toplanti) => !action.payload.includes(toplanti._id)
        );
        state.loading = false;
      })
      .addCase(deleteManyToplantilar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentToplanti, clearToplantiError } =
  toplantiSlice.actions;

export default toplantiSlice.reducer;
