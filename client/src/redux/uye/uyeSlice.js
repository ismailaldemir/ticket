import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";
import Logger from "../../utils/logger";

// Tüm üyeleri getir
export const getUyeler = createAsyncThunk(
  "uye/getUyeler",
  async (_, { rejectWithValue }) => {
    try {
      Logger.debug("Üyeler endpoint'ine istek yapılıyor");
      const response = await apiClient.get("/uyeler");
      return response.data;
    } catch (err) {
      Logger.error("Üyeler getirilemedi:", err);
      return rejectWithValue(
        err.response?.data || { msg: "Üyeler getirilemedi" }
      );
    }
  }
);

// Aktif üyeleri getir
export const getActiveUyeler = createAsyncThunk(
  "uye/getActiveUyeler",
  async (_, { rejectWithValue }) => {
    try {
      Logger.debug("Aktif üyeler endpoint'ine istek yapılıyor");
      const response = await apiClient.get("/uyeler/active");
      return response.data;
    } catch (err) {
      Logger.error("Aktif üyeler getirilemedi:", err);
      return rejectWithValue(
        err.response?.data || { msg: "Aktif üyeler getirilemedi" }
      );
    }
  }
);

// ID'ye göre üye getir
export const getUyeById = createAsyncThunk(
  "uye/getUyeById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/uyeler/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Üye bulunamadı" });
    }
  }
);

// Kişiye göre üyeleri getir
export const getUyelerByKisi = createAsyncThunk(
  "uye/getUyelerByKisi",
  async (kisi_id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/uyeler/kisi/${kisi_id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Kişiye ait üyeler yüklenemedi" }
      );
    }
  }
);

// Yeni üye ekle
export const addUye = createAsyncThunk(
  "uye/addUye",
  async (uyeData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/uyeler", uyeData);
      toast.success("Üye başarıyla eklendi");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Üye eklenemedi");
      return rejectWithValue(err.response?.data || { msg: "Üye eklenemedi" });
    }
  }
);

// Üye güncelle
export const updateUye = createAsyncThunk(
  "uye/updateUye",
  async ({ id, uyeData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/uyeler/${id}`, uyeData);
      toast.success("Üye bilgileri güncellendi");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Üye güncellenemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Üye güncellenemedi" }
      );
    }
  }
);

// Üye sil
export const deleteUye = createAsyncThunk(
  "uye/deleteUye",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/uyeler/${id}`);
      toast.success("Üye başarıyla silindi");
      return id;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Üye silinemedi");
      return rejectWithValue(err.response?.data || { msg: "Üye silinemedi" });
    }
  }
);

// Çoklu üye silme
export const deleteManyUyeler = createAsyncThunk(
  "uye/deleteManyUyeler",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/uyeler/delete-many", { ids });
      toast.success("Seçilen üyeler başarıyla silindi");
      return ids;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Üyeler silinemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Üyeler silinemedi" }
      );
    }
  }
);

const initialState = {
  uyeler: [],
  uye: null,
  loading: false,
  error: null,
};

const uyeSlice = createSlice({
  name: "uye",
  initialState,
  reducers: {
    clearCurrentUye: (state) => {
      state.uye = null;
      state.error = null;
    },
    clearUyeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getUyeler
      .addCase(getUyeler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUyeler.fulfilled, (state, action) => {
        state.uyeler = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getUyeler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getActiveUyeler
      .addCase(getActiveUyeler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveUyeler.fulfilled, (state, action) => {
        state.uyeler = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getActiveUyeler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getUyeById
      .addCase(getUyeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUyeById.fulfilled, (state, action) => {
        state.uye = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getUyeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getUyelerByKisi
      .addCase(getUyelerByKisi.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUyelerByKisi.fulfilled, (state, action) => {
        state.uyeler = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getUyelerByKisi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addUye
      .addCase(addUye.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUye.fulfilled, (state, action) => {
        state.uyeler.unshift(action.payload);
        state.uye = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(addUye.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateUye
      .addCase(updateUye.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUye.fulfilled, (state, action) => {
        state.uyeler = state.uyeler.map((uye) =>
          uye._id === action.payload._id ? action.payload : uye
        );
        state.uye = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUye.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteUye
      .addCase(deleteUye.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUye.fulfilled, (state, action) => {
        state.uyeler = state.uyeler.filter((uye) => uye._id !== action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteUye.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteManyUyeler
      .addCase(deleteManyUyeler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyUyeler.fulfilled, (state, action) => {
        state.uyeler = state.uyeler.filter(
          (uye) => !action.payload.includes(uye._id)
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteManyUyeler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentUye, clearUyeError } = uyeSlice.actions;

export default uyeSlice.reducer;
