import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api"; // axios yerine apiClient kullan
import { setAlert } from "../alert/alertSlice";

// Roller'i getir - axios yerine apiClient kullan
export const getRoller = createAsyncThunk(
  "rol/getRoller",
  async (_, { rejectWithValue }) => {
    try {
      // Token header'ı apiClient tarafından otomatik ekleniyor
      const res = await apiClient.get("/roller");
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Roller yüklenirken hata oluştu";
      return rejectWithValue({ msg: message });
    }
  }
);

// Aktif rolleri getir
export const getActiveRoller = createAsyncThunk(
  "rol/getActiveRoller",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/roller/active");
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Roller yüklenirken hata oluştu";
      return rejectWithValue({ msg: message });
    }
  }
);

// Rol detayını getir
export const getRolById = createAsyncThunk(
  "rol/getRolById",
  async (rolId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/roller/${rolId}`);
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Rol detayı yüklenirken hata oluştu";
      return rejectWithValue({ msg: message });
    }
  }
);

// Yeni rol ekle
export const addRol = createAsyncThunk(
  "rol/addRol",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiClient.post("/roller", formData);
      dispatch(setAlert("Rol başarıyla eklendi", "success"));
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Rol eklenirken hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

// Rol güncelle
export const updateRol = createAsyncThunk(
  "rol/updateRol",
  async ({ id, formData }, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiClient.put(`/roller/${id}`, formData);
      dispatch(setAlert("Rol başarıyla güncellendi", "success"));
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Rol güncellenirken hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

// Rol sil
export const deleteRol = createAsyncThunk(
  "rol/deleteRol",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.delete(`/roller/${id}`);
      dispatch(setAlert("Rol başarıyla silindi", "success"));
      return id;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Rol silinirken hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

// Toplu rol sil
export const deleteManyRoller = createAsyncThunk(
  "rol/deleteManyRoller",
  async (ids, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiClient.post("/roller/bulk-delete", { ids });
      dispatch(
        setAlert(`${res.data.deletedCount} rol başarıyla silindi`, "success")
      );
      return ids;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Roller silinirken hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

const initialState = {
  roller: [],
  rol: null,
  loading: false,
  error: null,
};

const rolSlice = createSlice({
  name: "rol",
  initialState,
  reducers: {
    clearCurrentRol: (state) => {
      state.rol = null;
    },
    clearRolError: (state) => {
      state.error = null;
    },
    // Yetkileri yerel olarak güncelleme (sayfa yenilenmeden)
    updateYetkilerLocal: (state, action) => {
      if (state.rol) {
        state.rol = {
          ...state.rol,
          yetkiler: action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Tüm rolleri getir
      .addCase(getRoller.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRoller.fulfilled, (state, action) => {
        state.roller = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getRoller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Aktif rolleri getir
      .addCase(getActiveRoller.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveRoller.fulfilled, (state, action) => {
        state.roller = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getActiveRoller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Rol detayını getir
      .addCase(getRolById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRolById.fulfilled, (state, action) => {
        state.rol = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getRolById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Yeni rol ekle
      .addCase(addRol.pending, (state) => {
        state.loading = true;
      })
      .addCase(addRol.fulfilled, (state, action) => {
        state.roller.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addRol.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Rol güncelle
      .addCase(updateRol.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRol.fulfilled, (state, action) => {
        // Rolle ilişkili verilerin referans bütünlüğünü koruyarak güncelleme
        state.rol = action.payload;

        // Roller listesini immutable olarak güncelle
        state.roller = state.roller.map((rol) =>
          rol._id === action.payload._id ? action.payload : rol
        );

        state.loading = false;
        state.error = null;
      })
      .addCase(updateRol.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Rol sil
      .addCase(deleteRol.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRol.fulfilled, (state, action) => {
        // Silinen rolü state'den kaldır
        state.roller = state.roller.filter((rol) => rol._id !== action.payload);

        // Eğer silinmiş rol, seçili rolse, seçili rolü temizle
        if (state.rol && state.rol._id === action.payload) {
          state.rol = null;
        }

        state.loading = false;
        state.error = null;
      })
      .addCase(deleteRol.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toplu rol sil
      .addCase(deleteManyRoller.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyRoller.fulfilled, (state, action) => {
        state.roller = state.roller.filter(
          (rol) => !action.payload.includes(rol._id)
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteManyRoller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentRol, clearRolError, updateYetkilerLocal } =
  rolSlice.actions;

export default rolSlice.reducer;
