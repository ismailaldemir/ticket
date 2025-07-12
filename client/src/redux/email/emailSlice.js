import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api"; // Doğru import yolu
import { setAlert } from "../alert/alertSlice";

// Tüm e-posta adreslerini getir
export const getEmails = createAsyncThunk(
  "email/getEmails",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiClient.get("/emails");
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "E-posta adresleri alınırken bir hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

// Kişiye ait e-posta adreslerini getir
export const getEmailsByKisi = createAsyncThunk(
  "email/getEmailsByKisi",
  async (kisiId, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiClient.get(`/emails/kisi/${kisiId}`);
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Kişiye ait e-posta adresleri alınırken bir hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

// Organizasyona ait e-posta adreslerini getir
export const getEmailsByOrganizasyon = createAsyncThunk(
  "email/getEmailsByOrganizasyon",
  async (organizasyonId, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiClient.get(`/emails/organizasyon/${organizasyonId}`);
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Organizasyona ait e-posta adresleri alınırken bir hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

// Şubeye ait e-posta adreslerini getir
export const getEmailsBySube = createAsyncThunk(
  "email/getEmailsBySube",
  async (subeId, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiClient.get(`/emails/sube/${subeId}`);
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Şubeye ait e-posta adresleri alınırken bir hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

// E-posta adresi ekle
export const addEmail = createAsyncThunk(
  "email/addEmail",
  async (emailData, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiClient.post("/emails", emailData);
      dispatch(setAlert("E-posta adresi başarıyla eklendi", "success"));
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "E-posta adresi eklenirken bir hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

// E-posta adresi güncelle
export const updateEmail = createAsyncThunk(
  "email/updateEmail",
  async ({ id, emailData }, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiClient.put(`/emails/${id}`, emailData);
      dispatch(setAlert("E-posta adresi başarıyla güncellendi", "success"));
      return res.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "E-posta adresi güncellenirken bir hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

// E-posta adresi sil
export const deleteEmail = createAsyncThunk(
  "email/deleteEmail",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.delete(`/emails/${id}`);
      dispatch(setAlert("E-posta adresi başarıyla silindi", "success"));
      return id;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "E-posta adresi silinirken bir hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

// Referansa ait tüm e-posta adreslerini sil
export const deleteAllEmails = createAsyncThunk(
  "email/deleteAllEmails",
  async ({ referansTur, referansId }, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiClient.delete(
        `/emails/all/${referansTur}/${referansId}`
      );
      dispatch(
        setAlert(
          `${res.data.count} adet e-posta adresi başarıyla silindi`,
          "success"
        )
      );
      return { referansTur, referansId };
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "E-posta adresleri silinirken bir hata oluştu";
      dispatch(setAlert(message, "error"));
      return rejectWithValue({ msg: message });
    }
  }
);

const initialState = {
  emails: [],
  loading: false,
  error: null,
};

const emailSlice = createSlice({
  name: "email",
  initialState,
  reducers: {
    clearEmailError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getEmails
      .addCase(getEmails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmails.fulfilled, (state, action) => {
        state.emails = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getEmailsByKisi
      .addCase(getEmailsByKisi.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmailsByKisi.fulfilled, (state, action) => {
        state.emails = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getEmailsByKisi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getEmailsByOrganizasyon
      .addCase(getEmailsByOrganizasyon.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmailsByOrganizasyon.fulfilled, (state, action) => {
        state.emails = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getEmailsByOrganizasyon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getEmailsBySube
      .addCase(getEmailsBySube.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmailsBySube.fulfilled, (state, action) => {
        state.emails = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getEmailsBySube.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addEmail
      .addCase(addEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEmail.fulfilled, (state, action) => {
        state.emails.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateEmail
      .addCase(updateEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEmail.fulfilled, (state, action) => {
        state.emails = state.emails.map((email) =>
          email._id === action.payload._id ? action.payload : email
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(updateEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteEmail
      .addCase(deleteEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEmail.fulfilled, (state, action) => {
        state.emails = state.emails.filter(
          (email) => email._id !== action.payload
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteAllEmails
      .addCase(deleteAllEmails.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAllEmails.fulfilled, (state, action) => {
        state.emails = state.emails.filter(
          (email) =>
            !(
              email.referansTur === action.payload.referansTur &&
              email.referansId.toString() ===
                action.payload.referansId.toString()
            )
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteAllEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearEmailError } = emailSlice.actions;

export default emailSlice.reducer;
