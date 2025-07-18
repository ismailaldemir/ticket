import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getTalepler = createAsyncThunk('talep/getTalepler', async () => {
  const response = await axios.get('/api/talepler');
  return response.data;
});

export const createTalep = createAsyncThunk('talep/createTalep', async (talep) => {
  const response = await axios.post('/api/talepler', talep);
  return response.data;
});

export const updateTalep = createAsyncThunk('talep/updateTalep', async ({ id, talep }) => {
  const response = await axios.put(`/api/talepler/${id}`, talep);
  return response.data;
});

export const deleteTalep = createAsyncThunk('talep/deleteTalep', async (id) => {
  await axios.delete(`/api/talepler/${id}`);
  return id;
});

const talepSlice = createSlice({
  name: 'talep',
  initialState: {
    talepler: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTalepler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTalepler.fulfilled, (state, action) => {
        state.talepler = action.payload;
        state.loading = false;
      })
      .addCase(getTalepler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createTalep.fulfilled, (state, action) => {
        state.talepler.push(action.payload);
      })
      .addCase(updateTalep.fulfilled, (state, action) => {
        const idx = state.talepler.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.talepler[idx] = action.payload;
      })
      .addCase(deleteTalep.fulfilled, (state, action) => {
        state.talepler = state.talepler.filter(t => t.id !== action.payload);
      });
  },
});

export default talepSlice.reducer;
