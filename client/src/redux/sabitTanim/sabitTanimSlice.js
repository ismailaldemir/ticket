import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';
import { toast } from 'react-toastify';

// Sabit tanımları getir
export const getSabitTanimlar = createAsyncThunk(
  'sabitTanim/getSabitTanimlar',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/sabit-tanimlar');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Sabit tanımlar getirilemedi' });
    }
  }
);

// Belirli tipteki sabit tanımları getir - Bu fonksiyon eksikti, ekliyoruz
export const getSabitTanimlarByTip = createAsyncThunk(
  'sabitTanim/getSabitTanimlarByTip',
  async (tip, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/sabit-tanimlar/tip/${tip}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: `${tip} tipindeki sabit tanımlar getirilemedi` });
    }
  }
);

// Sabit tanım ekle
export const addSabitTanim = createAsyncThunk(
  'sabitTanim/addSabitTanim',
  async (sabitTanimData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/sabit-tanimlar', sabitTanimData);
      toast.success('Sabit tanım başarıyla eklendi');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Sabit tanım eklenemedi' });
    }
  }
);

// Sabit tanım güncelle
export const updateSabitTanim = createAsyncThunk(
  'sabitTanim/updateSabitTanim',
  async ({ id, sabitTanimData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/sabit-tanimlar/${id}`, sabitTanimData);
      toast.success('Sabit tanım başarıyla güncellendi');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Sabit tanım güncellenemedi' });
    }
  }
);

// Sabit tanım sil
export const deleteSabitTanim = createAsyncThunk(
  'sabitTanim/deleteSabitTanim',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/sabit-tanimlar/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Sabit tanım silinemedi' });
    }
  }
);

// Çoklu sabit tanım silme
export const deleteManyTanimlar = createAsyncThunk(
  'sabitTanim/deleteManyTanimlar',
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post('/sabit-tanimlar/delete-many', { ids });
      return ids;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: 'Sabit tanımlar silinemedi' });
    }
  }
);

const initialState = {
  sabitTanimlar: [],
  currentSabitTanim: null,
  loading: false,
  error: null
};

const sabitTanimSlice = createSlice({
  name: 'sabitTanim',
  initialState,
  reducers: {
    clearCurrentSabitTanim: (state) => {
      state.currentSabitTanim = null;
    },
    clearSabitTanimError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // getSabitTanimlar için reducerlar
      .addCase(getSabitTanimlar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSabitTanimlar.fulfilled, (state, action) => {
        state.loading = false;
        state.sabitTanimlar = action.payload;
      })
      .addCase(getSabitTanimlar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // getSabitTanimlarByTip için reducerlar
      .addCase(getSabitTanimlarByTip.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSabitTanimlarByTip.fulfilled, (state, action) => {
        state.loading = false;
        state.sabitTanimlar = action.payload;
      })
      .addCase(getSabitTanimlarByTip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // addSabitTanim için reducerlar
      .addCase(addSabitTanim.pending, (state) => {
        state.loading = true;
      })
      .addCase(addSabitTanim.fulfilled, (state, action) => {
        state.loading = false;
        state.sabitTanimlar.push(action.payload);
      })
      .addCase(addSabitTanim.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateSabitTanim için reducerlar
      .addCase(updateSabitTanim.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSabitTanim.fulfilled, (state, action) => {
        state.loading = false;
        state.sabitTanimlar = state.sabitTanimlar.map(sabitTanim => 
          sabitTanim._id === action.payload._id ? action.payload : sabitTanim
        );
      })
      .addCase(updateSabitTanim.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // deleteSabitTanim için reducerlar
      .addCase(deleteSabitTanim.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSabitTanim.fulfilled, (state, action) => {
        state.loading = false;
        state.sabitTanimlar = state.sabitTanimlar.filter(
          sabitTanim => sabitTanim._id !== action.payload
        );
      })
      .addCase(deleteSabitTanim.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // deleteManyTanimlar için reducerlar
      .addCase(deleteManyTanimlar.pending, (state) => {   
        state.loading = true;
      })
      .addCase(deleteManyTanimlar.fulfilled, (state, action) => {
        state.loading = false;
        state.sabitTanimlar = state.sabitTanimlar.filter(
          sabitTanim => !action.payload.includes(sabitTanim._id)
        );
      })
      .addCase(deleteManyTanimlar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentSabitTanim, clearSabitTanimError } = sabitTanimSlice.actions;

export default sabitTanimSlice.reducer;
