import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setAlert } from "../alert/alertSlice";

// Tüm yetkileri getir
export const getYetkiler = createAsyncThunk(
  "yetki/getYetkiler",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/yetkiler", {
        headers: {
          "x-auth-token": token,
        },
      });
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Yetkiler yüklenirken hata oluştu";
      return rejectWithValue({ msg: message });
    }
  }
);

// Aktif yetkileri getir
export const getActiveYetkiler = createAsyncThunk(
  "yetki/getActiveYetkiler",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/yetkiler/active", {
        headers: {
          "x-auth-token": token,
        },
      });
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Yetkiler yüklenirken hata oluştu";
      return rejectWithValue({ msg: message });
    }
  }
);

// Modüle göre yetkileri getir
export const getYetkilerByModul = createAsyncThunk(
  "yetki/getYetkilerByModul",
  async (modul, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/yetkiler/modul/${modul}`, {
        headers: {
          "x-auth-token": token,
        },
      });
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Yetkiler yüklenirken hata oluştu";
      return rejectWithValue({ msg: message });
    }
  }
);

// Yetki detayını getir
export const getYetkiById = createAsyncThunk(
  "yetki/getYetkiById",
  async (yetkiId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/yetkiler/${yetkiId}`, {
        headers: {
          "x-auth-token": token,
        },
      });
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Yetki detayı yüklenirken hata oluştu";
      return rejectWithValue({ msg: message });
    }
  }
);

// Tüm modül isimlerini getir
export const getModuller = createAsyncThunk(
  "yetki/getModuller",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/yetkiler/moduller", {
        headers: {
          "x-auth-token": token,
        },
      });
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Modüller yüklenirken hata oluştu";
      return rejectWithValue({ msg: message });
    }
  }
);

// Yeni yetki ekle
export const addYetki = createAsyncThunk(
  "yetki/addYetki",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/yetkiler", formData, {
        headers: {
          "x-auth-token": token,
        },
      });
      dispatch(setAlert("Yetki başarıyla eklendi", "success"));
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Yetki eklenirken hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

// Yetki güncelle
export const updateYetki = createAsyncThunk(
  "yetki/updateYetki",
  async ({ id, formData }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`/api/yetkiler/${id}`, formData, {
        headers: {
          "x-auth-token": token,
        },
      });
      dispatch(setAlert("Yetki başarıyla güncellendi", "success"));
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Yetki güncellenirken hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

// Yetki sil
export const deleteYetki = createAsyncThunk(
  "yetki/deleteYetki",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/yetkiler/${id}`, {
        headers: {
          "x-auth-token": token,
        },
      });
      dispatch(setAlert("Yetki başarıyla silindi", "success"));
      return id;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Yetki silinirken hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

// Toplu yetki sil
export const deleteManyYetkiler = createAsyncThunk(
  "yetki/deleteManyYetkiler",
  async (ids, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/yetkiler/bulk-delete",
        { ids },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      dispatch(
        setAlert(`${res.data.deletedCount} yetki başarıyla silindi`, "success")
      );
      return ids;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Yetkiler silinirken hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

const initialState = {
  yetkiler: [],
  yetki: null,
  moduller: [],
  loading: false,
  error: null,
};

const yetkiSlice = createSlice({
  name: "yetki",
  initialState,
  reducers: {
    clearCurrentYetki: (state) => {
      state.yetki = null;
    },
    clearYetkiError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Tüm yetkileri getir
      .addCase(getYetkiler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getYetkiler.fulfilled, (state, action) => {
        state.yetkiler = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
        state.error = null;
      })
      .addCase(getYetkiler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Aktif yetkileri getir
      .addCase(getActiveYetkiler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveYetkiler.fulfilled, (state, action) => {
        state.yetkiler = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
        state.error = null;
      })
      .addCase(getActiveYetkiler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Modüle göre yetkileri getir
      .addCase(getYetkilerByModul.pending, (state) => {
        state.loading = true;
      })
      .addCase(getYetkilerByModul.fulfilled, (state, action) => {
        state.yetkiler = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
        state.error = null;
      })
      .addCase(getYetkilerByModul.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Yetki detayını getir
      .addCase(getYetkiById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getYetkiById.fulfilled, (state, action) => {
        state.yetki = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getYetkiById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Tüm modül isimlerini getir
      .addCase(getModuller.pending, (state) => {
        state.loading = true;
      })
      .addCase(getModuller.fulfilled, (state, action) => {
        state.moduller = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getModuller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Yeni yetki ekle
      .addCase(addYetki.pending, (state) => {
        state.loading = true;
      })
      .addCase(addYetki.fulfilled, (state, action) => {
        state.yetkiler.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addYetki.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Yetki güncelle
      .addCase(updateYetki.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateYetki.fulfilled, (state, action) => {
        state.yetkiler = state.yetkiler.map((yetki) =>
          yetki._id === action.payload._id ? action.payload : yetki
        );
        state.yetki = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateYetki.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Yetki sil
      .addCase(deleteYetki.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteYetki.fulfilled, (state, action) => {
        state.yetkiler = state.yetkiler.filter(
          (yetki) => yetki._id !== action.payload
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteYetki.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toplu yetki sil
      .addCase(deleteManyYetkiler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyYetkiler.fulfilled, (state, action) => {
        state.yetkiler = state.yetkiler.filter(
          (yetki) => !action.payload.includes(yetki._id)
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteManyYetkiler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentYetki, clearYetkiError } = yetkiSlice.actions;

export default yetkiSlice.reducer;
