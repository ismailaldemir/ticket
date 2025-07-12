import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Tüm gelirleri getir
export const getGelirler = createAsyncThunk(
  "gelir/getGelirler",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/gelirler");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gelirler yüklenemedi" }
      );
    }
  }
);

// ID'ye göre gelir kaydı getir
export const getGelirById = createAsyncThunk(
  "gelir/getGelirById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/gelirler/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gelir kaydı bulunamadı" }
      );
    }
  }
);

// Gelire ait detayları getir
export const getGelirDetaylari = createAsyncThunk(
  "gelir/getGelirDetaylari",
  async (gelir_id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/gelirler/detay/${gelir_id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gelir detayları yüklenemedi" }
      );
    }
  }
);

// Yeni gelir kaydı ekle
export const addGelir = createAsyncThunk(
  "gelir/addGelir",
  async (gelirData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/gelirler", gelirData);
      toast.success("Gelir kaydı başarıyla oluşturuldu");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gelir kaydı eklenemedi" }
      );
    }
  }
);

// Gelir detay kaydı ekle
export const addGelirDetay = createAsyncThunk(
  "gelir/addGelirDetay",
  async (detayData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/gelirler/detay", detayData);
      toast.success("Gelir detay kaydı başarıyla eklendi");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gelir detay kaydı eklenemedi" }
      );
    }
  }
);

// Gelir kaydını güncelle
export const updateGelir = createAsyncThunk(
  "gelir/updateGelir",
  async ({ id, gelirData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/gelirler/${id}`, gelirData);
      toast.success("Gelir kaydı başarıyla güncellendi");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gelir kaydı güncellenemedi" }
      );
    }
  }
);

// Gelir kaydı sil
export const deleteGelir = createAsyncThunk(
  "gelir/deleteGelir",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/gelirler/${id}`);
      toast.success("Gelir kaydı silindi");
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gelir kaydı silinemedi" }
      );
    }
  }
);

// Gelir detay kaydı sil
export const deleteGelirDetay = createAsyncThunk(
  "gelir/deleteGelirDetay",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/gelirler/detay/${id}`);
      toast.success("Gelir detay kaydı silindi");
      return { id, data: res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gelir detay kaydı silinemedi" }
      );
    }
  }
);

// Çoklu gelir kaydı silme
export const deleteManyGelirler = createAsyncThunk(
  "gelir/deleteManyGelirler",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/gelirler/delete-many", { ids });
      return ids;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Gelir kayıtları silinemedi" }
      );
    }
  }
);

const initialState = {
  gelirler: [],
  gelir: null,
  gelirDetaylari: [],
  loading: false,
  error: null,
};

const gelirSlice = createSlice({
  name: "gelir",
  initialState,
  reducers: {
    clearCurrentGelir: (state) => {
      state.gelir = null;
      state.gelirDetaylari = [];
    },
    clearGelirError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGelirler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGelirler.fulfilled, (state, action) => {
        state.gelirler = action.payload;
        state.loading = false;
      })
      .addCase(getGelirler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getGelirById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGelirById.fulfilled, (state, action) => {
        state.gelir = action.payload;
        state.loading = false;
      })
      .addCase(getGelirById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getGelirDetaylari.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGelirDetaylari.fulfilled, (state, action) => {
        state.gelirDetaylari = action.payload;
        state.loading = false;
      })
      .addCase(getGelirDetaylari.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addGelir.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGelir.fulfilled, (state, action) => {
        state.gelirler.unshift(action.payload);
        state.gelir = action.payload;
        state.loading = false;
      })
      .addCase(addGelir.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addGelirDetay.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGelirDetay.fulfilled, (state, action) => {
        state.gelirDetaylari.push(action.payload.gelirDetay);

        // Gelir nesnesinin toplam tutarını güncelle
        if (state.gelir) {
          state.gelir.toplamTutar = action.payload.yeniToplamTutar;
        }

        // Gelirler listesindeki ilgili gelirin toplam tutarını güncelle
        const gelirIndex = state.gelirler.findIndex(
          (g) => g._id === action.payload.gelirDetay.gelir_id
        );

        if (gelirIndex !== -1) {
          state.gelirler[gelirIndex].toplamTutar =
            action.payload.yeniToplamTutar;
        }

        state.loading = false;
      })
      .addCase(addGelirDetay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateGelir.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateGelir.fulfilled, (state, action) => {
        state.gelirler = state.gelirler.map((gelir) =>
          gelir._id === action.payload._id ? action.payload : gelir
        );
        state.gelir = action.payload;
        state.loading = false;
      })
      .addCase(updateGelir.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteGelir.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteGelir.fulfilled, (state, action) => {
        state.gelirler = state.gelirler.filter(
          (gelir) => gelir._id !== action.payload
        );
        if (state.gelir && state.gelir._id === action.payload) {
          state.gelir = null;
          state.gelirDetaylari = [];
        }
        state.loading = false;
      })
      .addCase(deleteGelir.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteGelirDetay.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteGelirDetay.fulfilled, (state, action) => {
        state.gelirDetaylari = state.gelirDetaylari.filter(
          (detay) => detay._id !== action.payload.id
        );

        // Gelir nesnesinin toplam tutarını güncelle
        if (state.gelir) {
          state.gelir.toplamTutar = action.payload.data.yeniToplamTutar;
        }

        // Gelirler listesindeki ilgili gelirin toplam tutarını güncelle
        if (state.gelirDetaylari.length > 0) {
          const gelirId = state.gelirDetaylari[0].gelir_id;
          const gelirIndex = state.gelirler.findIndex((g) => g._id === gelirId);

          if (gelirIndex !== -1) {
            state.gelirler[gelirIndex].toplamTutar =
              action.payload.data.yeniToplamTutar;
          }
        }

        state.loading = false;
      })
      .addCase(deleteGelirDetay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteManyGelirler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyGelirler.fulfilled, (state, action) => {
        state.gelirler = state.gelirler.filter(
          (gelir) => !action.payload.includes(gelir._id)
        );
        state.loading = false;
      })
      .addCase(deleteManyGelirler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentGelir, clearGelirError } = gelirSlice.actions;

export default gelirSlice.reducer;
