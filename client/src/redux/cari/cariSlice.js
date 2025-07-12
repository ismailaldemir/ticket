import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';
import { toast } from 'react-toastify';

// Tüm carileri getir
export const getCariler = createAsyncThunk(
  'cari/getCariler',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/cariler');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Cariler yüklenemedi' });
    }
  }
);

// Aktif carileri getir
export const getActiveCariler = createAsyncThunk(
  'cari/getActiveCariler',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/cariler/active');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Aktif cariler yüklenemedi' });
    }
  }
);

// Belirli türdeki carileri getir
export const getCarilerByTur = createAsyncThunk(
  'cari/getCarilerByTur',
  async (tur, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/cariler/tur/${tur}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Cariler yüklenemedi' });
    }
  }
);

// ID'ye göre cari getir
export const getCariById = createAsyncThunk(
  'cari/getCariById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/cariler/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Cari bulunamadı' });
    }
  }
);

// Yeni cari ekle
export const addCari = createAsyncThunk(
  'cari/addCari',
  async (cariData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/cariler', cariData);
      toast.success('Cari başarıyla eklendi');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Cari eklenemedi' });
    }
  }
);

// Cari güncelle
export const updateCari = createAsyncThunk(
  'cari/updateCari',
  async ({ id, cariData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/cariler/${id}`, cariData);
      toast.success('Cari bilgileri güncellendi');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Cari güncellenemedi' });
    }
  }
);

// Cari sil
export const deleteCari = createAsyncThunk(
  'cari/deleteCari',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/cariler/${id}`);
      toast.success('Cari silindi');
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Cari silinemedi' });
    }
  }
);

// Çoklu cari silme
export const deleteManyCariler = createAsyncThunk(
  'cari/deleteManyCariler',
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post('/cariler/delete-many', { ids });
      return ids;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Cariler silinemedi' });
    }
  }
);

const initialState = {
  cariler: [],
  cari: null,
  loading: false,
  error: null
};

const cariSlice = createSlice({
  name: 'cari',
  initialState,
  reducers: {
    clearCurrentCari: (state) => {
      state.cari = null;
    },
    clearCariError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCariler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCariler.fulfilled, (state, action) => {
        state.cariler = action.payload;
        state.loading = false;
      })
      .addCase(getCariler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getActiveCariler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveCariler.fulfilled, (state, action) => {
        state.cariler = action.payload;
        state.loading = false;
      })
      .addCase(getActiveCariler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getCarilerByTur.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCarilerByTur.fulfilled, (state, action) => {
        state.cariler = action.payload;
        state.loading = false;
      })
      .addCase(getCarilerByTur.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getCariById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCariById.fulfilled, (state, action) => {
        state.cari = action.payload;
        state.loading = false;
      })
      .addCase(getCariById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(addCari.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCari.fulfilled, (state, action) => {
        state.cariler.push(action.payload);
        state.loading = false;
      })
      .addCase(addCari.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateCari.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCari.fulfilled, (state, action) => {
        state.cariler = state.cariler.map(cari => 
          cari._id === action.payload._id ? action.payload : cari
        );
        state.cari = action.payload;
        state.loading = false;
      })
      .addCase(updateCari.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteCari.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCari.fulfilled, (state, action) => {
        state.cariler = state.cariler.filter(cari => cari._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteCari.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Çoklu cari silme
      .addCase(deleteManyCariler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyCariler.fulfilled, (state, action) => {
        state.cariler = state.cariler.filter(cari => !action.payload.includes(cari._id));
        state.loading = false;
      })
      .addCase(deleteManyCariler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentCari, clearCariError } = cariSlice.actions;

export default cariSlice.reducer;
