import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Kullanıcının hızlı işlemlerini getir
export const getUserQuickActions = createAsyncThunk(
  "quickAction/getUserQuickActions",
  async (_, { rejectWithValue }) => {
    try {
      // Token'ı header'a ekle (güvenli istek için)
      const token = localStorage.getItem("token");
      const response = await apiClient.get("/quick-actions/user", {
        headers: token ? { "x-auth-token": token } : {},
      });
      // Gelen veri dizi değilse, boş dizi döndür
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      toast.error("Hızlı işlemler yüklenirken bir hata oluştu");
      return rejectWithValue(
        err.response?.data || { msg: "Hızlı işlemler getirilemedi" }
      );
    }
  }
);

// Kullanıcının hızlı işlemlerini güncelle
export const updateQuickActions = createAsyncThunk(
  "quickAction/updateQuickActions",
  async (actions, { rejectWithValue }) => {
    try {
      // URL duplikasyonunu düzeltiyoruz
      const response = await apiClient.put("/quick-actions", { actions });
      toast.success("Hızlı işlemler güncellendi");
      return response.data;
    } catch (err) {
      toast.error("Hızlı işlemler güncellenirken bir hata oluştu");
      return rejectWithValue(
        err.response?.data || { msg: "Hızlı işlemler güncellenemedi" }
      );
    }
  }
);

// Kullanıcının hızlı işlemlerini varsayılana sıfırla
export const resetToDefault = createAsyncThunk(
  "quickAction/resetToDefault",
  async (_, { rejectWithValue }) => {
    try {
      // URL duplikasyonunu düzeltiyoruz
      const response = await apiClient.put("/quick-actions", {
        actions: [],
      });
      toast.success("Hızlı işlemler sıfırlandı");
      return response.data;
    } catch (err) {
      toast.error("Hızlı işlemler sıfırlanırken bir hata oluştu");
      return rejectWithValue(
        err.response?.data || { msg: "Hızlı işlemler sıfırlanamadı" }
      );
    }
  }
);

// updateUserActions'ı düzenleyelim
export const updateUserActions = createAsyncThunk(
  "quickAction/updateUserActions",
  async (actions, { rejectWithValue }) => {
    try {
      const response = await apiClient.put("/quick-actions", { actions });
      // Başarılı durumda mesaj göster
      toast.success("Hızlı işlemler güncellendi");
      return response.data;
    } catch (err) {
      // Hata durumunda hata mesajı göster ve reddet
      toast.error("Hızlı işlemler güncellenirken bir hata oluştu");
      return rejectWithValue(
        err.response?.data || { msg: "Hızlı işlemler güncellenemedi" }
      );
    }
  }
);

// Quick Action Slice
const quickActionSlice = createSlice({
  name: "quickAction",
  initialState: {
    actions: [],
    userActions: [], // QuickActionSettings.js bileşeni için uyumluluk alanı eklendi
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserQuickActions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserQuickActions.fulfilled, (state, action) => {
        // Gelen veri dizi değilse, boş dizi ata
        state.actions = Array.isArray(action.payload) ? action.payload : [];
        state.userActions = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
        state.error = null;
      })
      .addCase(getUserQuickActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.actions = [];
        state.userActions = [];
      })
      .addCase(updateQuickActions.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateQuickActions.fulfilled, (state, action) => {
        state.actions = action.payload;
        state.userActions = action.payload; // userActions da aynı değeri almalı
        state.loading = false;
        state.error = null;
      })
      .addCase(updateQuickActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetToDefault.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetToDefault.fulfilled, (state, action) => {
        state.actions = action.payload;
        state.userActions = action.payload; // userActions da aynı değeri almalı
        state.loading = false;
        state.error = null;
      })
      .addCase(resetToDefault.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserActions.fulfilled, (state, action) => {
        state.userActions = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Hızlı işlemler güncellenemedi";
      });
  },
});

export const { clearError } = quickActionSlice.actions;

export default quickActionSlice.reducer;
