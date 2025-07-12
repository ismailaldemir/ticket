import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';
import { toast } from 'react-toastify';

// Tüm şubeleri getir
export const getSubeler = createAsyncThunk(
  'sube/getSubeler',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/subeler');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Şubeler yüklenemedi' });
    }
  }
);

// Aktif şubeleri getir
export const getActiveSubeler = createAsyncThunk(
  'sube/getActiveSubeler',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/subeler/active');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Aktif şubeler yüklenemedi' });
    }
  }
);

// Organizasyon ID'sine göre şubeleri getir
export const getSubelerByOrganizasyon = createAsyncThunk(
  'sube/getSubelerByOrganizasyon',
  async (organizasyonId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/subeler/organizasyon/${organizasyonId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Organizasyon için şubeler yüklenemedi' });
    }
  }
);

// ID'ye göre şube getir
export const getSubeById = createAsyncThunk(
  'sube/getSubeById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/subeler/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Şube bulunamadı' });
    }
  }
);

// Yeni şube ekle
export const addSube = createAsyncThunk(
  'sube/addSube',
  async (subeData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/subeler', subeData);
      toast.success('Şube başarıyla eklendi');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Şube eklenemedi' });
    }
  }
);

// Şube bilgilerini güncelle
export const updateSube = createAsyncThunk(
  'sube/updateSube',
  async ({ id, subeData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/subeler/${id}`, subeData);
      toast.success('Şube bilgileri güncellendi');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Şube güncellenemedi' });
    }
  }
);

// Şube sil
export const deleteSube = createAsyncThunk(
  'sube/deleteSube',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/subeler/${id}`);
      toast.success('Şube silindi');
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Şube silinemedi' });
    }
  }
);

// Çoklu şube silme
export const deleteManySubeler = createAsyncThunk(
  'sube/deleteManySubeler',
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post('/subeler/delete-many', { ids });
      return ids;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Şubeler silinemedi' });
    }
  }
);

const initialState = {
  subeler: [],
  sube: null,
  loading: false,
  error: null
};

const subeSlice = createSlice({
  name: 'sube',
  initialState,
  reducers: {
    clearCurrentSube: (state) => {
      state.sube = null;
    },
    clearSubeError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSubeler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubeler.fulfilled, (state, action) => {
        state.loading = false;
        state.subeler = action.payload;
        state.error = null;
      })
      .addCase(getSubeler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getActiveSubeler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveSubeler.fulfilled, (state, action) => {
        state.loading = false;
        state.subeler = action.payload;
        state.error = null;
      })
      .addCase(getActiveSubeler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getSubelerByOrganizasyon.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubelerByOrganizasyon.fulfilled, (state, action) => {
        state.loading = false;
        state.subeler = action.payload;
        state.error = null;
      })
      .addCase(getSubelerByOrganizasyon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getSubeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubeById.fulfilled, (state, action) => {
        state.loading = false;
        state.sube = action.payload;
        state.error = null;
      })
      .addCase(getSubeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(addSube.pending, (state) => {
        state.loading = true;
      })
      .addCase(addSube.fulfilled, (state, action) => {
        state.subeler.push(action.payload);
        state.loading = false;
      })
      .addCase(addSube.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateSube.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSube.fulfilled, (state, action) => {
        state.subeler = state.subeler.map(sube => 
          sube._id === action.payload._id ? action.payload : sube
        );
        state.sube = action.payload;
        state.loading = false;
      })
      .addCase(updateSube.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteSube.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSube.fulfilled, (state, action) => {
        state.subeler = state.subeler.filter(
          sube => sube._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteSube.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Çoklu şube silme
      .addCase(deleteManySubeler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManySubeler.fulfilled, (state, action) => {
        state.loading = false;
        state.subeler = state.subeler.filter(
          sube => !action.payload.includes(sube._id)
        );
        state.error = null;
      })
      .addCase(deleteManySubeler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentSube, clearSubeError } = subeSlice.actions;

export default subeSlice.reducer;
