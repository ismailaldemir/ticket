import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Tüm borçları getir
export const getBorclar = createAsyncThunk(
  "borc/getBorclar",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/borclar");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Borçlar getirilemedi" }
      );
    }
  }
);

// Borç detayını getir
export const getBorcById = createAsyncThunk(
  "borc/getBorcById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/borclar/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Borç detayı yüklenemedi" }
      );
    }
  }
);

// Kişiye göre borçları getir
export const getBorclarByKisi = createAsyncThunk(
  "borc/getBorclarByKisi",
  async (kisiId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/borclar/kisi/${kisiId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Kişi için borçlar yüklenemedi" }
      );
    }
  }
);

// Ödenmemiş borçları getir
export const getOdenmemisBorclar = createAsyncThunk(
  "borc/getOdenmemisBorclar",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/borclar/durum/odenmemis");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Ödenmemiş borçlar yüklenemedi" }
      );
    }
  }
);

// Kişiye göre ödenmemiş borçları getir
export const getOdenmemisBorclarByKisi = createAsyncThunk(
  "borc/getOdenmemisBorclarByKisi",
  async (kisiId, { rejectWithValue }) => {
    try {
      // Tüm borçları getiren endpoint'i kullanalım (ödenenler de dahil)
      const res = await apiClient.get(`/borclar/kisi/${kisiId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Borçlar yüklenemedi" }
      );
    }
  }
);

// Çoklu kişi için ödenmemiş borçları getir
export const getOdenmemisBorclarByCokluKisi = createAsyncThunk(
  "borc/getOdenmemisBorclarByCokluKisi",
  async (kisiIds, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/borclar/coklu-kisi-odenmemis", {
        kisiIds,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          msg: "Kişiler için ödenmemiş borçlar yüklenemedi",
        }
      );
    }
  }
);

// Yeni borç ekle
export const addBorc = createAsyncThunk(
  "borc/addBorc",
  async (borcData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/borclar", borcData);
      toast.success("Borç başarıyla eklendi");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Borç eklenemedi" });
    }
  }
);

// Toplu borç ekle
export const addBulkBorc = createAsyncThunk(
  "borc/addBulk",
  async (borcData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/borclar/bulk", borcData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Borçlar eklenemedi" }
      );
    }
  }
);

// Borç bilgilerini güncelle - eksik olan fonksiyon eklendi
export const updateBorc = createAsyncThunk(
  "borc/updateBorc",
  async ({ id, borcData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/borclar/${id}`, borcData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Borç güncellenemedi" }
      );
    }
  }
);

// Borç sil - eksik olan fonksiyon eklendi
export const deleteBorc = createAsyncThunk(
  "borc/deleteBorc",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/borclar/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Borç silinemedi" });
    }
  }
);

const initialState = {
  borclar: [],
  borc: null,
  loading: false,
  error: null,
};

const borcSlice = createSlice({
  name: "borc",
  initialState,
  reducers: {
    clearCurrentBorc: (state) => {
      state.borc = null;
    },
    clearBorcError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBorclar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBorclar.fulfilled, (state, action) => {
        state.borclar = action.payload;
        state.loading = false;
      })
      .addCase(getBorclar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getBorcById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBorcById.fulfilled, (state, action) => {
        state.loading = false;

        // Tek borç dönerse onu bir array'e çevirip borclar'a atayalım
        // veya mevcut borçlar arasında varsa o borcu güncelleyelim
        const borcIndex = state.borclar.findIndex(
          (borc) => borc._id === action.payload._id
        );

        if (borcIndex >= 0) {
          state.borclar[borcIndex] = action.payload;
        } else {
          state.borclar = [action.payload]; // Tek borç olduğunda
        }

        state.borc = action.payload;
        state.error = null;
      })
      .addCase(getBorcById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getBorclarByKisi.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBorclarByKisi.fulfilled, (state, action) => {
        state.borclar = action.payload;
        state.loading = false;
      })
      .addCase(getBorclarByKisi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOdenmemisBorclar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOdenmemisBorclar.fulfilled, (state, action) => {
        state.borclar = action.payload;
        state.loading = false;
      })
      .addCase(getOdenmemisBorclar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOdenmemisBorclarByKisi.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOdenmemisBorclarByKisi.fulfilled, (state, action) => {
        state.borclar = action.payload;
        state.loading = false;
      })
      .addCase(getOdenmemisBorclarByKisi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOdenmemisBorclarByCokluKisi.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOdenmemisBorclarByCokluKisi.fulfilled, (state, action) => {
        state.borclar = action.payload;
        state.loading = false;
      })
      .addCase(getOdenmemisBorclarByCokluKisi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addBorc.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBorc.fulfilled, (state, action) => {
        state.borclar.push(action.payload);
        state.loading = false;
      })
      .addCase(addBorc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addBulkBorc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBulkBorc.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Yeni eklenen borçları state'e ekle
        if (action.payload && action.payload.eklenenBorclar) {
          state.borclar = [...state.borclar, ...action.payload.eklenenBorclar];
        }
      })
      .addCase(addBulkBorc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateBorc.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBorc.fulfilled, (state, action) => {
        state.borclar = state.borclar.map((borc) =>
          borc._id === action.payload._id ? action.payload : borc
        );
        state.borc = action.payload;
        state.loading = false;
      })
      .addCase(updateBorc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteBorc.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBorc.fulfilled, (state, action) => {
        state.borclar = state.borclar.filter(
          (borc) => borc._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteBorc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentBorc, clearBorcError } = borcSlice.actions;

export default borcSlice.reducer;
