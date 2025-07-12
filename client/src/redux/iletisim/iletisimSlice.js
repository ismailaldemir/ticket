import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Telefon thunks
export const getTelefonlar = createAsyncThunk(
  "iletisim/getTelefonlar",
  async ({ referansId, referansTur }) => {
    const res = await axios.get(
      `/api/iletisim/telefon/${referansTur}/${referansId}`
    );
    return res.data;
  }
);

export const addTelefon = createAsyncThunk(
  "iletisim/addTelefon",
  async ({ telefonData }) => {
    const res = await axios.post("/api/iletisim/telefon", telefonData);
    return res.data;
  }
);

export const updateTelefon = createAsyncThunk(
  "iletisim/updateTelefon",
  async ({ id, telefonData }) => {
    const res = await axios.put(`/api/iletisim/telefon/${id}`, telefonData);
    return res.data;
  }
);

export const deleteTelefon = createAsyncThunk(
  "iletisim/deleteTelefon",
  async (id) => {
    await axios.delete(`/api/iletisim/telefon/${id}`);
    return id;
  }
);

// Adres thunks
export const getAdresler = createAsyncThunk(
  "iletisim/getAdresler",
  async ({ referansId, referansTur }) => {
    const res = await axios.get(
      `/api/iletisim/adres/${referansTur}/${referansId}`
    );
    return res.data;
  }
);

export const addAdres = createAsyncThunk(
  "iletisim/addAdres",
  async ({ adresData }) => {
    const res = await axios.post("/api/iletisim/adres", adresData);
    return res.data;
  }
);

export const updateAdres = createAsyncThunk(
  "iletisim/updateAdres",
  async ({ id, adresData }) => {
    const res = await axios.put(`/api/iletisim/adres/${id}`, adresData);
    return res.data;
  }
);

export const deleteAdres = createAsyncThunk(
  "iletisim/deleteAdres",
  async (id) => {
    await axios.delete(`/api/iletisim/adres/${id}`);
    return id;
  }
);

// Sosyal Medya thunks
export const getSosyalMedyalar = createAsyncThunk(
  "iletisim/getSosyalMedyalar",
  async ({ referansId, referansTur }) => {
    const res = await axios.get(
      `/api/iletisim/sosyal-medya/${referansTur}/${referansId}`
    );
    return res.data;
  }
);

export const addSosyalMedya = createAsyncThunk(
  "iletisim/addSosyalMedya",
  async ({ sosyalMedyaData }) => {
    const res = await axios.post("/api/iletisim/sosyal-medya", sosyalMedyaData);
    return res.data;
  }
);

export const updateSosyalMedya = createAsyncThunk(
  "iletisim/updateSosyalMedya",
  async ({ id, sosyalMedyaData }) => {
    const res = await axios.put(
      `/api/iletisim/sosyal-medya/${id}`,
      sosyalMedyaData
    );
    return res.data;
  }
);

export const deleteSosyalMedya = createAsyncThunk(
  "iletisim/deleteSosyalMedya",
  async (id) => {
    await axios.delete(`/api/iletisim/sosyal-medya/${id}`);
    return id;
  }
);

const initialState = {
  telefonlar: [],
  adresler: [],
  sosyalMedyalar: [],
  loading: false,
  error: null,
};

const iletisimSlice = createSlice({
  name: "iletisim",
  initialState,
  reducers: {
    clearIletisimState: (state) => {
      state.telefonlar = [];
      state.adresler = [];
      state.sosyalMedyalar = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Telefon reducers
      .addCase(getTelefonlar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTelefonlar.fulfilled, (state, action) => {
        state.loading = false;
        state.telefonlar = action.payload;
        state.error = null;
      })
      .addCase(getTelefonlar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addTelefon.fulfilled, (state, action) => {
        state.telefonlar.unshift(action.payload);
        state.error = null;
      })
      .addCase(updateTelefon.fulfilled, (state, action) => {
        state.telefonlar = state.telefonlar.map((telefon) =>
          telefon._id === action.payload._id ? action.payload : telefon
        );
        state.error = null;
      })
      .addCase(deleteTelefon.fulfilled, (state, action) => {
        state.telefonlar = state.telefonlar.filter(
          (telefon) => telefon._id !== action.payload
        );
        state.error = null;
      })

      // Adres reducers
      .addCase(getAdresler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdresler.fulfilled, (state, action) => {
        state.loading = false;
        state.adresler = action.payload;
        state.error = null;
      })
      .addCase(getAdresler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addAdres.fulfilled, (state, action) => {
        state.adresler.unshift(action.payload);
        state.error = null;
      })
      .addCase(updateAdres.fulfilled, (state, action) => {
        state.adresler = state.adresler.map((adres) =>
          adres._id === action.payload._id ? action.payload : adres
        );
        state.error = null;
      })
      .addCase(deleteAdres.fulfilled, (state, action) => {
        state.adresler = state.adresler.filter(
          (adres) => adres._id !== action.payload
        );
        state.error = null;
      })

      // Sosyal Medya reducers
      .addCase(getSosyalMedyalar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSosyalMedyalar.fulfilled, (state, action) => {
        state.loading = false;
        state.sosyalMedyalar = action.payload;
        state.error = null;
      })
      .addCase(getSosyalMedyalar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addSosyalMedya.fulfilled, (state, action) => {
        state.sosyalMedyalar.unshift(action.payload);
        state.error = null;
      })
      .addCase(updateSosyalMedya.fulfilled, (state, action) => {
        state.sosyalMedyalar = state.sosyalMedyalar.map((sosyalMedya) =>
          sosyalMedya._id === action.payload._id ? action.payload : sosyalMedya
        );
        state.error = null;
      })
      .addCase(deleteSosyalMedya.fulfilled, (state, action) => {
        state.sosyalMedyalar = state.sosyalMedyalar.filter(
          (sosyalMedya) => sosyalMedya._id !== action.payload
        );
        state.error = null;
      });
  },
});

export const { clearIletisimState } = iletisimSlice.actions;

export default iletisimSlice.reducer;
