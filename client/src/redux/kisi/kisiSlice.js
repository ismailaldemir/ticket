import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Tüm kişileri getir
export const getKisiler = createAsyncThunk(
  "kisi/getKisiler",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/kisiler");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Kişiler getirilemedi" }
      );
    }
  }
);

// ID'ye göre kişi getir
export const getKisiById = createAsyncThunk(
  "kisi/getKisiById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/kisiler/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Kişi bulunamadı" });
    }
  }
);

// Grup ID'sine göre kişileri getir
export const getKisilerByGrup = createAsyncThunk(
  "kisi/getKisilerByGrup",
  async (grupId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/kisiler/grup/${grupId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Grup için kişiler yüklenemedi" }
      );
    }
  }
);

// Kişi Ekleme
export const addKisi = createAsyncThunk(
  "kisi/add",
  async (kisiData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/kisiler", kisiData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Kişi eklenirken bir hata oluştu" }
      );
    }
  }
);

// Kişi Güncelleme
export const updateKisi = createAsyncThunk(
  "kisi/update",
  async ({ id, kisiData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/kisiler/${id}`, kisiData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Kişi güncellenirken bir hata oluştu" }
      );
    }
  }
);

// Kişi Silme
export const deleteKisi = createAsyncThunk(
  "kisi/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/kisiler/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Kişi silinirken bir hata oluştu" }
      );
    }
  }
);

// Yeni eklenen çoklu silme fonksiyonu
export const deleteManyKisiler = createAsyncThunk(
  "kisi/deleteManyKisiler",
  async (ids, { rejectWithValue }) => {
    try {
      await Promise.all(ids.map((id) => apiClient.delete(`/kisiler/${id}`)));
      toast.success("Seçili kişiler başarıyla silindi");
      return ids;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Kişiler silinemedi" }
      );
    }
  }
);

// Aktif kişileri getir
export const getActiveKisiler = createAsyncThunk(
  "kisi/getActiveKisiler",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/kisiler/aktif");
      return res.data || [];
    } catch (err) {
      console.error("Aktif kişiler yüklenirken hata:", err);
      return rejectWithValue(
        err.response?.data || { msg: "Aktif kişiler yüklenemedi" }
      );
    }
  }
);

// İletişim bilgilerini getirme işlemleri
export const getKisiAdresleri = createAsyncThunk(
  "kisi/getKisiAdresleri",
  async (kisiId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/kisiler/${kisiId}/adresler`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Adres bilgileri yüklenemedi" }
      );
    }
  }
);

export const getKisiTelefonlari = createAsyncThunk(
  "kisi/getKisiTelefonlari",
  async (kisiId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/kisiler/${kisiId}/telefonlar`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Telefon bilgileri yüklenemedi" }
      );
    }
  }
);

export const getKisiSosyalMedya = createAsyncThunk(
  "kisi/getKisiSosyalMedya",
  async (kisiId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/kisiler/${kisiId}/sosyal-medya`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Sosyal medya bilgileri yüklenemedi" }
      );
    }
  }
);

// İletişim bilgisi ekleme işlemleri
export const addKisiAdres = createAsyncThunk(
  "kisi/addKisiAdres",
  async ({ kisiId, adresData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/kisiler/${kisiId}/adresler`,
        adresData
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Adres eklenirken bir hata oluştu" }
      );
    }
  }
);

export const addKisiTelefon = createAsyncThunk(
  "kisi/addKisiTelefon",
  async ({ kisiId, telefonData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/kisiler/${kisiId}/telefonlar`,
        telefonData
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Telefon eklenirken bir hata oluştu" }
      );
    }
  }
);

export const addKisiSosyalMedya = createAsyncThunk(
  "kisi/addKisiSosyalMedya",
  async ({ kisiId, sosyalMedyaData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/kisiler/${kisiId}/sosyal-medya`,
        sosyalMedyaData
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          msg: "Sosyal medya bilgisi eklenirken bir hata oluştu",
        }
      );
    }
  }
);

// Telefon işlemleri
export const getKisiTelefonlar = createAsyncThunk(
  "kisi/getTelefonlar",
  async (kisiId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/kisiler/${kisiId}/telefonlar`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Telefon bilgileri yüklenemedi" }
      );
    }
  }
);

export const updateKisiTelefon = createAsyncThunk(
  "kisi/updateTelefon",
  async ({ id, telefonData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        `/api/iletisim/telefon/${id}`,
        telefonData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Telefon güncellenemedi" }
      );
    }
  }
);

export const deleteKisiTelefon = createAsyncThunk(
  "kisi/deleteTelefon",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/api/iletisim/telefon/${id}`);
      return {
        success: true,
        msg: "Telefon başarıyla silindi",
        id,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Telefon silinemedi" }
      );
    }
  }
);

// Adres işlemleri
export const getKisiAdresler = createAsyncThunk(
  "kisi/getAdresler",
  async (kisiId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/kisiler/${kisiId}/adresler`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Adres bilgileri yüklenemedi" }
      );
    }
  }
);

export const updateKisiAdres = createAsyncThunk(
  "kisi/updateAdres",
  async ({ id, adresData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(
        `/kisiler/${adresData.referansId}/adresler/${id}`,
        adresData
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Adres güncellenemedi" }
      );
    }
  }
);

export const deleteKisiAdres = createAsyncThunk(
  "kisi/deleteKisiAdres",
  async (params, { rejectWithValue, getState }) => {
    try {
      const { kisiId, adresId } = params;
      await apiClient.delete(`/kisiler/${kisiId}/adresler/${adresId}`);
      return adresId;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Adres silinemedi" });
    }
  }
);

// Sosyal Medya işlemleri
export const updateKisiSosyalMedya = createAsyncThunk(
  "kisi/updateSosyalMedya",
  async ({ kisiId, sosyalMedyaId, sosyalMedyaData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(
        `/kisiler/${kisiId}/sosyal-medya/${sosyalMedyaId}`,
        sosyalMedyaData
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Sosyal medya güncellenemedi" }
      );
    }
  }
);

export const deleteKisiSosyalMedya = createAsyncThunk(
  "kisi/deleteSosyalMedya",
  async ({ kisiId, sosyalMedyaId }, { rejectWithValue }) => {
    try {
      await apiClient.delete(
        `/kisiler/${kisiId}/sosyal-medya/${sosyalMedyaId}`
      );
      return { id: sosyalMedyaId };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Sosyal medya silinemedi" }
      );
    }
  }
);

// Dosya işlemleri
export const addKisiEk = createAsyncThunk(
  "kisi/addKisiEk",
  async ({ kisiId, formData }) => {
    const response = await apiClient.post(
      `/api/kisiler/${kisiId}/ekler`,
      formData
    );
    return response.data;
  }
);

export const getKisiEkler = createAsyncThunk(
  "kisi/getKisiEkler",
  async (kisiId) => {
    const response = await apiClient.get(`/api/kisiler/${kisiId}/ekler`);
    return response.data;
  }
);

export const deleteKisiEk = createAsyncThunk(
  "kisi/deleteKisiEk",
  async (ekId) => {
    await apiClient.delete(`/api/kisiler/ekler/${ekId}`);
    return ekId;
  }
);

// Doküman yükleme action düzenlemesi
export const uploadKisiDokuman = createAsyncThunk(
  "kisi/uploadDokuman",
  async ({ kisiId, formData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/kisiler/${kisiId}/dokumanlar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Doküman yüklenirken bir hata oluştu" }
      );
    }
  }
);

// Çoklu doküman yükleme action
export const uploadKisiDokumanCoklu = createAsyncThunk(
  "kisi/uploadDokumanCoklu",
  async ({ kisiId, formData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/kisiler/${kisiId}/dokumanlar/bulk`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          msg: "Dokümanlar yüklenirken bir hata oluştu",
        }
      );
    }
  }
);

// Çoklu doküman yükleme action'ı
export const uploadKisiDokumanlar = createAsyncThunk(
  "kisi/uploadKisiDokumanlar",
  async ({ kisiId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(
        `/kisiler/${kisiId}/dokumanlar/upload`,
        formData
      );
      // response değişkeni kullanılmıyordu, doğrudan data döndürülüyor
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Doküman silme action
export const deleteKisiDokuman = createAsyncThunk(
  "kisi/deleteKisiDokuman",
  async ({ kisiId, dokumanId }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/kisiler/${kisiId}/dokumanlar/${dokumanId}`);
      // response değişkeni kullanılmadığı için kaldırıldı

      return { kisiId, dokumanId };
    } catch (error) {
      console.error("Dosya silme hatası:", error.response?.data || error);
      return rejectWithValue(
        error.response?.data || {
          msg: "Doküman silinirken bir hata oluştu",
          detail: error.message,
        }
      );
    }
  }
);

// Yeni eklenen dökümanları getirme fonksiyonu
export const getKisiDokulmanlar = createAsyncThunk(
  "kisi/getKisiDokumanlar",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/kisiler/${id}/dokumanlar`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Dökümanlar yüklenemedi" }
      );
    }
  }
);

// Kişi ile ilişkili organizasyonları getirme
export const getKisiOrganizasyonlar = createAsyncThunk(
  "kisi/getKisiOrganizasyonlar",
  async (kisiId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(
        `/kisiler/${kisiId}/organizasyonlar`
      );
      return data;
    } catch (error) {
      console.error("Kişi organizasyonları getirme hatası:", error);
      return rejectWithValue(
        error.response?.data || {
          msg: "Kişi organizasyonları alınırken bir hata oluştu",
        }
      );
    }
  }
);

const initialState = {
  kisiler: [],
  kisi: null,
  adresler: [],
  telefonlar: [],
  sosyalMedya: [],
  ekler: [],
  loading: false,
  iletisimLoading: false,
  eklerLoading: false,
  error: null,
  eklerError: null,
};

const kisiSlice = createSlice({
  name: "kisi",
  initialState,
  reducers: {
    clearCurrentKisi: (state) => {
      state.kisi = null;
      state.error = null;
    },
    clearKisiError: (state) => {
      state.error = null;
    },
    refreshKisiList: (state) => {
      state.loading = true;
    },
    clearIletisimBilgileri: (state) => {
      state.adresler = [];
      state.telefonlar = [];
      state.sosyalMedya = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getKisiler.pending, (state) => {
        state.loading = true;
      })
      .addCase(getKisiler.fulfilled, (state, action) => {
        state.kisiler = action.payload;
        state.loading = false;
      })
      .addCase(getKisiler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getKisiById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getKisiById.fulfilled, (state, action) => {
        state.kisi = action.payload;
        state.loading = false;
      })
      .addCase(getKisiById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getKisilerByGrup.pending, (state) => {
        state.loading = true;
      })
      .addCase(getKisilerByGrup.fulfilled, (state, action) => {
        state.kisiler = action.payload;
        state.loading = false;
      })
      .addCase(getKisilerByGrup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addKisi.pending, (state) => {
        state.loading = true;
      })
      .addCase(addKisi.fulfilled, (state, action) => {
        state.loading = false;
        state.kisiler.push(action.payload);
      })
      .addCase(addKisi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateKisi.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateKisi.fulfilled, (state, action) => {
        state.kisiler = state.kisiler.map((kisi) =>
          kisi._id === action.payload._id ? action.payload : kisi
        );
        state.kisi = action.payload;
        state.loading = false;
      })
      .addCase(updateKisi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteKisi.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteKisi.fulfilled, (state, action) => {
        state.kisiler = state.kisiler.filter(
          (kisi) => kisi._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteKisi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteManyKisiler.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyKisiler.fulfilled, (state, action) => {
        state.loading = false;
        state.kisiler = state.kisiler.filter(
          (kisi) => !action.payload.includes(kisi._id)
        );
      })
      .addCase(deleteManyKisiler.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getActiveKisiler.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveKisiler.fulfilled, (state, action) => {
        state.kisiler = action.payload || [];
        state.loading = false;
        state.error = null;
      })
      .addCase(getActiveKisiler.rejected, (state, action) => {
        state.loading = false;
        state.kisiler = state.kisiler.length > 0 ? state.kisiler : [];
        state.error = action.payload;
        console.error("Kişi listesi yüklenirken hata:", action.payload);
      })

      .addCase(getKisiAdresleri.pending, (state) => {
        state.iletisimLoading = true;
      })
      .addCase(getKisiAdresleri.fulfilled, (state, action) => {
        state.adresler = action.payload;
        state.iletisimLoading = false;
      })
      .addCase(getKisiAdresleri.rejected, (state, action) => {
        state.iletisimLoading = false;
        state.error = action.payload;
      })

      .addCase(addKisiAdres.pending, (state) => {
        state.iletisimLoading = true;
      })
      .addCase(addKisiAdres.fulfilled, (state, action) => {
        state.adresler.push(action.payload);
        state.iletisimLoading = false;
      })
      .addCase(addKisiAdres.rejected, (state, action) => {
        state.iletisimLoading = false;
        state.error = action.payload;
      })

      .addCase(updateKisiAdres.pending, (state) => {
        state.iletisimLoading = true;
      })
      .addCase(updateKisiAdres.fulfilled, (state, action) => {
        state.adresler = state.adresler.map((adres) =>
          adres._id === action.payload._id ? action.payload : adres
        );
        state.iletisimLoading = false;
      })
      .addCase(updateKisiAdres.rejected, (state, action) => {
        state.iletisimLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteKisiAdres.pending, (state) => {
        state.iletisimLoading = true;
      })
      .addCase(deleteKisiAdres.fulfilled, (state, action) => {
        state.adresler = state.adresler.filter(
          (adres) => adres._id !== action.payload
        );
        state.iletisimLoading = false;
      })
      .addCase(deleteKisiAdres.rejected, (state, action) => {
        state.iletisimLoading = false;
        state.error = action.payload;
      })

      .addCase(getKisiTelefonlari.pending, (state) => {
        state.iletisimLoading = true;
      })
      .addCase(getKisiTelefonlari.fulfilled, (state, action) => {
        state.telefonlar = action.payload;
        state.iletisimLoading = false;
      })
      .addCase(getKisiTelefonlari.rejected, (state, action) => {
        state.iletisimLoading = false;
        state.error = action.payload;
      })

      .addCase(addKisiTelefon.pending, (state) => {
        state.iletisimLoading = true;
      })
      .addCase(addKisiTelefon.fulfilled, (state, action) => {
        state.telefonlar.push(action.payload);
        state.iletisimLoading = false;
      })
      .addCase(addKisiTelefon.rejected, (state, action) => {
        state.iletisimLoading = false;
        state.error = action.payload;
      })

      .addCase(updateKisiTelefon.pending, (state) => {
        state.iletisimLoading = true;
      })
      .addCase(updateKisiTelefon.fulfilled, (state, action) => {
        state.telefonlar = state.telefonlar.map((tel) =>
          tel._id === action.payload._id ? action.payload : tel
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(updateKisiTelefon.rejected, (state, action) => {
        state.iletisimLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteKisiTelefon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteKisiTelefon.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.telefonlar = state.telefonlar.filter(
          (tel) => tel._id !== action.payload.id
        );
      })
      .addCase(deleteKisiTelefon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getKisiSosyalMedya.pending, (state) => {
        state.iletisimLoading = true;
      })
      .addCase(getKisiSosyalMedya.fulfilled, (state, action) => {
        state.sosyalMedya = action.payload;
        state.iletisimLoading = false;
      })
      .addCase(getKisiSosyalMedya.rejected, (state, action) => {
        state.iletisimLoading = false;
        state.error = action.payload;
      })

      .addCase(addKisiSosyalMedya.pending, (state) => {
        state.iletisimLoading = true;
      })
      .addCase(addKisiSosyalMedya.fulfilled, (state, action) => {
        state.sosyalMedya.push(action.payload);
        state.iletisimLoading = false;
      })
      .addCase(addKisiSosyalMedya.rejected, (state, action) => {
        state.iletisimLoading = false;
        state.error = action.payload;
      })

      .addCase(updateKisiSosyalMedya.pending, (state) => {
        state.iletisimLoading = true;
      })
      .addCase(updateKisiSosyalMedya.fulfilled, (state, action) => {
        state.sosyalMedya = state.sosyalMedya.map((sosyalMedya) =>
          sosyalMedya._id === action.payload._id ? action.payload : sosyalMedya
        );
        state.iletisimLoading = false;
      })
      .addCase(updateKisiSosyalMedya.rejected, (state, action) => {
        state.iletisimLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteKisiSosyalMedya.pending, (state) => {
        state.iletisimLoading = true;
      })
      .addCase(deleteKisiSosyalMedya.fulfilled, (state, action) => {
        state.sosyalMedya = state.sosyalMedya.filter(
          (sosyalMedya) => sosyalMedya._id !== action.payload.id
        );
        state.iletisimLoading = false;
      })
      .addCase(deleteKisiSosyalMedya.rejected, (state, action) => {
        state.iletisimLoading = false;
        state.error = action.payload;
      })

      .addCase(getKisiEkler.pending, (state) => {
        state.eklerLoading = true;
      })
      .addCase(getKisiEkler.fulfilled, (state, action) => {
        state.eklerLoading = false;
        state.ekler = action.payload;
      })
      .addCase(getKisiEkler.rejected, (state, action) => {
        state.eklerLoading = false;
        state.eklerError = action.error.message;
      })

      .addCase(addKisiEk.fulfilled, (state, action) => {
        state.ekler.push(action.payload);
      })

      .addCase(deleteKisiEk.fulfilled, (state, action) => {
        state.ekler = state.ekler.filter((ek) => ek._id !== action.payload);
      })

      .addCase(uploadKisiDokuman.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadKisiDokuman.fulfilled, (state, action) => {
        state.loading = false;
        if (state.kisi) {
          state.kisi.dokumanlar = [
            ...(state.kisi.dokumanlar || []),
            action.payload,
          ];
        }
      })
      .addCase(uploadKisiDokuman.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(uploadKisiDokumanCoklu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadKisiDokumanCoklu.fulfilled, (state, action) => {
        state.loading = false;
        if (state.kisi && action.payload) {
          if (!state.kisi.dokumanlar) {
            state.kisi.dokumanlar = [];
          }

          // Gelen payload'ın yapısını kontrol et
          let yeniDokumanlar = [];
          if (Array.isArray(action.payload)) {
            yeniDokumanlar = action.payload;
          } else if (action.payload.dokumanlar) {
            yeniDokumanlar = action.payload.dokumanlar;
          }

          // Mevcut dokümanlara yeni dokümanları ekle
          state.kisi.dokumanlar = [
            ...state.kisi.dokumanlar,
            ...yeniDokumanlar,
          ].filter(Boolean); // null/undefined değerleri filtrele
        }
        state.error = null;
      })
      .addCase(uploadKisiDokumanCoklu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || {
          msg: "Dokümanlar toplu yüklenirken bir hata oluştu",
        };
      })

      .addCase(uploadKisiDokumanlar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadKisiDokumanlar.fulfilled, (state, action) => {
        state.loading = false;
        if (state.kisi && action.payload) {
          // Mevcut dokumanlar array'i yoksa oluştur
          if (!state.kisi.dokumanlar) {
            state.kisi.dokumanlar = [];
          }

          // Payload geldiği formata göre kontrol et ve ekle
          if (Array.isArray(action.payload)) {
            state.kisi.dokumanlar = [
              ...state.kisi.dokumanlar,
              ...action.payload,
            ];
          } else if (action.payload.dokumanlar) {
            state.kisi.dokumanlar = [
              ...state.kisi.dokumanlar,
              ...action.payload.dokumanlar,
            ];
          }
        }
        state.error = null;
      })
      .addCase(uploadKisiDokumanlar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || {
          msg: "Dokümanlar yüklenirken bir hata oluştu",
        };
      })

      .addCase(deleteKisiDokuman.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteKisiDokuman.fulfilled, (state, action) => {
        state.loading = false;
        if (state.kisi && state.kisi.dokumanlar) {
          state.kisi.dokumanlar = state.kisi.dokumanlar.filter(
            (doc) => doc._id !== action.meta.arg.dokumanId
          );
        }
      })
      .addCase(deleteKisiDokuman.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentKisi,
  clearKisiError,
  refreshKisiList,
  clearIletisimBilgileri,
} = kisiSlice.actions;

export default kisiSlice.reducer;
