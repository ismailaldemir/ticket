import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Tüm evrakları getir
export const getEvraklar = createAsyncThunk(
  "evrak/getEvraklar",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/evraklar");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Evraklar yüklenemedi" }
      );
    }
  }
);

// ID'ye göre evrak getir
export const getEvrakById = createAsyncThunk(
  "evrak/getEvrakById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/evraklar/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Evrak bulunamadı" });
    }
  }
);

// Evrak eklerini getir
export const getEvrakEkler = createAsyncThunk(
  "evrak/getEvrakEkler",
  async (evrakId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/evraklar/ekler/${evrakId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Evrak ekleri yüklenemedi" }
      );
    }
  }
);

// Yeni evrak ekle
export const addEvrak = createAsyncThunk(
  "evrak/addEvrak",
  async (evrakData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/evraklar", evrakData);
      toast.success("Evrak başarıyla eklendi");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Evrak eklenirken bir hata oluştu"
      );
      return rejectWithValue(err.response?.data || { msg: "Evrak eklenemedi" });
    }
  }
);

// Evrak dosyası ekle
export const addEvrakEk = createAsyncThunk(
  "evrak/addEvrakEk",
  async ({ formData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/evraklar/ekler", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Evrak eki başarıyla eklendi");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Evrak eki eklenirken bir hata oluştu"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Evrak eki eklenemedi" }
      );
    }
  }
);

// Çoklu evrak dosyası ekle
export const addEvrakEkCoklu = createAsyncThunk(
  "evrak/addEvrakEkCoklu",
  async ({ formData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/evraklar/ekler/coklu", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(
        `${res.data.eklenenDosyaSayisi} evrak eki başarıyla eklendi`
      );
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Evrak ekleri yüklenirken bir hata oluştu"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Evrak ekleri yüklenemedi" }
      );
    }
  }
);

// Evrak güncelle
export const updateEvrak = createAsyncThunk(
  "evrak/updateEvrak",
  async ({ id, evrakData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/evraklar/${id}`, evrakData);
      toast.success("Evrak başarıyla güncellendi");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Evrak güncellenirken bir hata oluştu"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Evrak güncellenemedi" }
      );
    }
  }
);

// Evrak sil
export const deleteEvrak = createAsyncThunk(
  "evrak/deleteEvrak",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/evraklar/${id}`);
      toast.success("Evrak ve ekleri başarıyla silindi");
      return id;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Evrak silinirken bir hata oluştu"
      );
      return rejectWithValue(err.response?.data || { msg: "Evrak silinemedi" });
    }
  }
);

// Evrak eki sil
export const deleteEvrakEk = createAsyncThunk(
  "evrak/deleteEvrakEk",
  async (ekId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/evraklar/ekler/${ekId}`);
      toast.success("Evrak eki başarıyla silindi");
      return ekId;
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || "Evrak eki silinirken bir hata oluştu";
      toast.error(errorMessage);
      return rejectWithValue({
        msg: errorMessage,
        error: err.response?.data || { msg: "Evrak eki silinemedi" },
      });
    }
  }
);

// Çoklu evrak silme
export const deleteManyEvraklar = createAsyncThunk(
  "evrak/deleteManyEvraklar",
  async (ids, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/evraklar/delete-many", { ids });
      toast.success(`${res.data.silinenEvrakSayisi} evrak başarıyla silindi`);
      return ids;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Evraklar silinirken bir hata oluştu"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Evraklar silinemedi" }
      );
    }
  }
);

// Evrak eki güncelle
export const updateEvrakEk = createAsyncThunk(
  "evrak/updateEvrakEk",
  async ({ ekId, ekData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/evraklar/ekler/${ekId}`, ekData);
      toast.success("Evrak eki başarıyla güncellendi");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Evrak eki güncellenirken bir hata oluştu"
      );
      return rejectWithValue(
        err.response?.data || { msg: "Evrak eki güncellenemedi" }
      );
    }
  }
);

// Sitede yayımlanan ekler için yeni bir action ekleyelim
export const getYayimlananEvrakEkler = createAsyncThunk(
  "evrak/getYayimlananEvrakEkler",
  async (evrakId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/evraklar/yayimlanan/${evrakId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Yayımlanan evrak ekleri getirme hatası:",
        error.response?.data || error
      );
      return rejectWithValue(
        error.response?.data || {
          msg: "Yayımlanan evrak ekleri getirilirken bir hata oluştu",
          error: error.message,
        }
      );
    }
  }
);

const initialState = {
  evraklar: [],
  evrak: null,
  ekler: [],
  loading: false,
  error: null,
  yayimlananEkler: [],
  loadingYayimlananEkler: false,
};

const evrakSlice = createSlice({
  name: "evrak",
  initialState,
  reducers: {
    clearCurrentEvrak: (state) => {
      state.evrak = null;
      state.ekler = [];
      state.error = null;
    },
    clearEvrakError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Evrakları getir
      .addCase(getEvraklar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEvraklar.fulfilled, (state, action) => {
        state.evraklar = action.payload;
        state.loading = false;
      })
      .addCase(getEvraklar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Evrak detayını getir
      .addCase(getEvrakById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEvrakById.fulfilled, (state, action) => {
        state.evrak = action.payload;
        state.loading = false;
      })
      .addCase(getEvrakById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Evrak eklerini getir
      .addCase(getEvrakEkler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEvrakEkler.fulfilled, (state, action) => {
        state.ekler = action.payload;
        state.loading = false;
      })
      .addCase(getEvrakEkler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Evrak ekle
      .addCase(addEvrak.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEvrak.fulfilled, (state, action) => {
        state.evraklar.unshift(action.payload);
        state.evrak = action.payload;
        state.loading = false;
      })
      .addCase(addEvrak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Evrak eki ekle
      .addCase(addEvrakEk.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEvrakEk.fulfilled, (state, action) => {
        state.ekler.push(action.payload);
        state.loading = false;
      })
      .addCase(addEvrakEk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Çoklu evrak eki ekle
      .addCase(addEvrakEkCoklu.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEvrakEkCoklu.fulfilled, (state, action) => {
        state.ekler = [...state.ekler, ...action.payload.eklenenDosyalar];
        state.loading = false;
      })
      .addCase(addEvrakEkCoklu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Evrak güncelle
      .addCase(updateEvrak.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEvrak.fulfilled, (state, action) => {
        state.evraklar = state.evraklar.map((evrak) =>
          evrak._id === action.payload._id ? action.payload : evrak
        );
        state.evrak = action.payload;
        state.loading = false;
      })
      .addCase(updateEvrak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Evrak sil
      .addCase(deleteEvrak.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEvrak.fulfilled, (state, action) => {
        state.evraklar = state.evraklar.filter(
          (evrak) => evrak._id !== action.payload
        );
        if (state.evrak && state.evrak._id === action.payload) {
          state.evrak = null;
          state.ekler = [];
        }
        state.loading = false;
      })
      .addCase(deleteEvrak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Evrak eki sil
      .addCase(deleteEvrakEk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEvrakEk.fulfilled, (state, action) => {
        state.ekler = state.ekler.filter((ek) => ek._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteEvrakEk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Çoklu evrak sil
      .addCase(deleteManyEvraklar.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyEvraklar.fulfilled, (state, action) => {
        state.evraklar = state.evraklar.filter(
          (evrak) => !action.payload.includes(evrak._id)
        );
        state.loading = false;
      })
      .addCase(deleteManyEvraklar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Evrak eki güncelle
      .addCase(updateEvrakEk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEvrakEk.fulfilled, (state, action) => {
        state.ekler = state.ekler.map((ek) =>
          ek._id === action.payload._id ? action.payload : ek
        );
        state.loading = false;
      })
      .addCase(updateEvrakEk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getYayimlananEvrakEkler için durumlar ekleyelim
      .addCase(getYayimlananEvrakEkler.pending, (state) => {
        state.loadingYayimlananEkler = true;
      })
      .addCase(getYayimlananEvrakEkler.fulfilled, (state, action) => {
        state.loadingYayimlananEkler = false;
        state.yayimlananEkler = action.payload;
      })
      .addCase(getYayimlananEvrakEkler.rejected, (state, action) => {
        state.loadingYayimlananEkler = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentEvrak, clearEvrakError } = evrakSlice.actions;

export default evrakSlice.reducer;
