import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { setAuthModalOpen } from "../../redux/auth/authSlice";
import { store as _store } from "../../redux/store";
import { toast } from "react-toastify";

// Token kontrolü yapan yardımcı fonksiyon
const checkAndRefreshToken = async () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    // Token'ın geçerli olup olmadığını kontrol et
    await apiClient.get("/auth/verify-token");
    return true;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      // Token geçersiz, yenilemek için oturum modalını aç
      if (_store) {
        _store.dispatch(setAuthModalOpen(true));
      }
      return false;
    }
    return true; // Diğer hata türleri için devam et
  }
};

// Tüm giderleri getir
export const getGiderler = createAsyncThunk(
  "gider/getGiderler",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/giderler");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Giderler yüklenemedi" }
      );
    }
  }
);

// ID'ye göre gider kaydı getir
export const getGiderById = createAsyncThunk(
  "gider/getGiderById",
  async (id, { rejectWithValue }) => {
    try {
      // API isteği öncesi token kontrolü yap
      await checkAndRefreshToken();

      const res = await apiClient.get(`/giderler/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gider detayları yüklenemedi" }
      );
    }
  }
);

// Gidere ait detayları getir
export const getGiderDetaylari = createAsyncThunk(
  "gider/getGiderDetaylari",
  async (gider_id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/giderler/detay/${gider_id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gider detayları yüklenemedi" }
      );
    }
  }
);

// Yeni gider kaydı ekle
export const addGider = createAsyncThunk(
  "gider/addGider",
  async (giderData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/giderler", giderData);
      toast.success("Gider kaydı başarıyla oluşturuldu");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gider kaydı eklenemedi" }
      );
    }
  }
);

// Gider detay kaydı ekle
export const addGiderDetay = createAsyncThunk(
  "gider/addGiderDetay",
  async (detayData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/giderler/detay", detayData);
      toast.success("Gider detay kaydı başarıyla eklendi");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gider detay kaydı eklenemedi" }
      );
    }
  }
);

// Gider kaydını güncelle
export const updateGider = createAsyncThunk(
  "gider/updateGider",
  async ({ id, giderData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/giderler/${id}`, giderData);
      toast.success("Gider kaydı başarıyla güncellendi");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gider kaydı güncellenemedi" }
      );
    }
  }
);

// Gider kaydı sil
export const deleteGider = createAsyncThunk(
  "gider/deleteGider",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/giderler/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gider kaydı silinemedi" }
      );
    }
  }
);

// Gider detay kaydı sil
export const deleteGiderDetay = createAsyncThunk(
  "gider/deleteGiderDetay",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/giderler/detay/${id}`);
      return { id, data: res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gider detay kaydı silinemedi" }
      );
    }
  }
);

// Çoklu gider kaydı silme
export const deleteManyGiderler = createAsyncThunk(
  "gider/deleteManyGiderler",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/giderler/delete-many", { ids });
      return ids;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gider kayıtları silinemedi" }
      );
    }
  }
);

const initialState = {
  giderler: [],
  gider: null,
  giderDetaylari: [],
  loading: false,
  error: null,
};

const giderSlice = createSlice({
  name: "gider",
  initialState,
  reducers: {
    clearCurrentGider: (state) => {
      state.gider = null;
      state.giderDetaylari = [];
    },
    clearGiderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGiderler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGiderler.fulfilled, (state, action) => {
        state.giderler = action.payload;
        state.loading = false;
      })
      .addCase(getGiderler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getGiderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGiderById.fulfilled, (state, action) => {
        state.gider = action.payload;
        state.loading = false;
      })
      .addCase(getGiderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getGiderDetaylari.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGiderDetaylari.fulfilled, (state, action) => {
        state.giderDetaylari = action.payload;
        state.loading = false;
      })
      .addCase(getGiderDetaylari.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addGider.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGider.fulfilled, (state, action) => {
        state.giderler.unshift(action.payload);
        state.gider = action.payload;
        state.loading = false;
      })
      .addCase(addGider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addGiderDetay.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGiderDetay.fulfilled, (state, action) => {
        state.giderDetaylari.push(action.payload.giderDetay);

        // Gider nesnesinin toplam tutarını güncelle
        if (state.gider) {
          state.gider.toplamTutar = action.payload.yeniToplamTutar;
        }

        // Giderler listesindeki ilgili giderin toplam tutarını güncelle
        const giderIndex = state.giderler.findIndex(
          (g) => g._id === action.payload.giderDetay.gider_id
        );

        if (giderIndex !== -1) {
          state.giderler[giderIndex].toplamTutar =
            action.payload.yeniToplamTutar;
        }

        state.loading = false;
      })
      .addCase(addGiderDetay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateGider.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateGider.fulfilled, (state, action) => {
        state.giderler = state.giderler.map((gider) =>
          gider._id === action.payload._id ? action.payload : gider
        );
        state.gider = action.payload;
        state.loading = false;
      })
      .addCase(updateGider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteGider.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteGider.fulfilled, (state, action) => {
        state.giderler = state.giderler.filter(
          (gider) => gider._id !== action.payload
        );
        if (state.gider && state.gider._id === action.payload) {
          state.gider = null;
          state.giderDetaylari = [];
        }
        state.loading = false;
      })
      .addCase(deleteGider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteGiderDetay.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteGiderDetay.fulfilled, (state, action) => {
        state.giderDetaylari = state.giderDetaylari.filter(
          (detay) => detay._id !== action.payload.id
        );

        // Gider nesnesinin toplam tutarını güncelle
        if (state.gider) {
          state.gider.toplamTutar = action.payload.data.yeniToplamTutar;
        }

        // Giderler listesindeki ilgili giderin toplam tutarını güncelle
        if (state.giderDetaylari.length > 0) {
          const giderId = state.giderDetaylari[0].gider_id;
          const giderIndex = state.giderler.findIndex((g) => g._id === giderId);

          if (giderIndex !== -1) {
            state.giderler[giderIndex].toplamTutar =
              action.payload.data.yeniToplamTutar;
          }
        }

        state.loading = false;
      })
      .addCase(deleteGiderDetay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteManyGiderler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyGiderler.fulfilled, (state, action) => {
        state.giderler = state.giderler.filter(
          (gider) => !action.payload.includes(gider._id)
        );
        state.loading = false;
      })
      .addCase(deleteManyGiderler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentGider, clearGiderError } = giderSlice.actions;

export default giderSlice.reducer;
