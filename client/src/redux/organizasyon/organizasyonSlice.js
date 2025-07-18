import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";


// --- Organizasyon Ana İşlemleri --- //

export const getOrganizasyonlar = createAsyncThunk(
  "organizasyon/getOrganizasyonlar",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/organizasyonlar");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getActiveOrganizasyonlar = createAsyncThunk(
  "organizasyon/getActiveOrganizasyonlar",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/organizasyonlar/active");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getOrganizasyonById = createAsyncThunk(
  "organizasyon/getOrganizasyonById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/organizasyonlar/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addOrganizasyon = createAsyncThunk(
  "organizasyon/addOrganizasyon",
  async (organizasyonData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        "/organizasyonlar",
        organizasyonData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateOrganizasyon = createAsyncThunk(
  "organizasyon/updateOrganizasyon",
  async ({ id, organizasyonData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        `/organizasyonlar/${id}`,
        organizasyonData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteOrganizasyon = createAsyncThunk(
  "organizasyon/deleteOrganizasyon",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/organizasyonlar/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteManyOrganizasyonlar = createAsyncThunk(
  "organizasyon/deleteManyOrganizasyonlar",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/organizasyonlar/delete-many", { ids });
      return ids;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// --- Organizasyon Görselleri --- //

export const uploadOrganizasyonGorsel = createAsyncThunk(
  "organizasyon/uploadOrganizasyonGorsel",
  async ({ id, gorselTipi, formData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/organizasyonlar/${id}/gorsel/${gorselTipi}`,
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
        error.response?.data || { msg: `${gorselTipi} yüklenemedi` }
      );
    }
  }
);

export const deleteOrganizasyonGorsel = createAsyncThunk(
  "organizasyon/deleteOrganizasyonGorsel",
  async ({ id, gorselTipi }, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(
        `/organizasyonlar/${id}/gorsel/${gorselTipi}`
      );
      return { ...response.data, gorselTipi };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: `${gorselTipi} silinemedi` }
      );
    }
  }
);

// --- Organizasyon Telefon İşlemleri --- //

export const getOrganizasyonTelefonlar = createAsyncThunk(
  "organizasyon/getOrganizasyonTelefonlar",
  async (organizasyonId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/organizasyonlar/${organizasyonId}/telefonlar`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addOrganizasyonTelefon = createAsyncThunk(
  "organizasyon/addOrganizasyonTelefon",
  async ({ organizasyonId, telefonData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/organizasyonlar/${organizasyonId}/telefonlar`,
        telefonData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateOrganizasyonTelefon = createAsyncThunk(
  "organizasyon/updateOrganizasyonTelefon",
  async ({ id, telefonData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        `/iletisim/telefon/${id}`,
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

export const deleteOrganizasyonTelefon = createAsyncThunk(
  "organizasyon/deleteOrganizasyonTelefon",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/iletisim/telefon/${id}`);
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Telefon silinemedi" }
      );
    }
  }
);

// --- Organizasyon Adres İşlemleri --- //

export const getOrganizasyonAdresler = createAsyncThunk(
  "organizasyon/getOrganizasyonAdresler",
  async (organizasyonId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/organizasyonlar/${organizasyonId}/adresler`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addOrganizasyonAdres = createAsyncThunk(
  "organizasyon/addOrganizasyonAdres",
  async ({ organizasyonId, adresData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/organizasyonlar/${organizasyonId}/adresler`,
        adresData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateOrganizasyonAdres = createAsyncThunk(
  "organizasyon/updateOrganizasyonAdres",
  async ({ id, adresData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/iletisim/adres/${id}`, adresData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Adres güncellenemedi" }
      );
    }
  }
);

export const deleteOrganizasyonAdres = createAsyncThunk(
  "organizasyon/deleteOrganizasyonAdres",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/api/iletisim/adres/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Adres silinemedi" }
      );
    }
  }
);

// --- Organizasyon Sosyal Medya İşlemleri --- //

export const getOrganizasyonSosyalMedya = createAsyncThunk(
  "organizasyon/getSosyalMedya",
  async (organizasyonId, { rejectWithValue }) => {
    try {
      if (!organizasyonId) {
        throw new Error("Organizasyon ID gerekli");
      }

      const res = await apiClient.get(
        `/sosyal-medya/referans/Organizasyon/${organizasyonId}`
      );

      // Gelen veriyi doğrula ve filtrele
      const filteredData = res.data.filter(
        (item) =>
          item.referansTur === "Organizasyon" &&
          item.referansId === organizasyonId
      );

      return filteredData;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Sosyal medya bilgileri alınamadı" }
      );
    }
  }
);

export const addOrganizasyonSosyalMedya = createAsyncThunk(
  "organizasyon/addSosyalMedya",
  async ({ organizasyonId, sosyalMedyaData }, { rejectWithValue }) => {
    try {
      const payload = {
        referansTur: "Organizasyon",
        referansId: organizasyonId,
        tur: sosyalMedyaData.tur,
        kullaniciAdi: sosyalMedyaData.kullaniciAdi,
        url: sosyalMedyaData.url,
        aciklama: sosyalMedyaData.aciklama,
        durumu: sosyalMedyaData.durumu,
      };

      const res = await apiClient.post("/sosyal-medya", payload);
      return res.data;
    } catch (err) {
      console.error("Sosyal medya ekleme hatası:", err);
      return rejectWithValue(
        err.response?.data || { msg: "Sosyal medya eklenemedi" }
      );
    }
  }
);

export const updateOrganizasyonSosyalMedya = createAsyncThunk(
  "organizasyon/updateSosyalMedya",
  async ({ id, sosyalMedyaData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/sosyal-medya/${id}`, {
        medya_turu: sosyalMedyaData.tur,
        deger: sosyalMedyaData.kullaniciAdi,
        url: sosyalMedyaData.url,
        aciklama: sosyalMedyaData.aciklama,
        isActive: sosyalMedyaData.durumu === "Aktif",
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Sosyal medya güncellenemedi" }
      );
    }
  }
);

export const deleteOrganizasyonSosyalMedya = createAsyncThunk(
  "organizasyon/deleteSosyalMedya",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/sosyal-medya/${id}`);
      return { id };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Sosyal medya silinemedi" }
      );
    }
  }
);

const initialState = {
  organizasyonlar: [],
  organizasyon: null,
  telefonlar: [],
  adresler: [],
  sosyalMedyalar: [],
  loading: false,
  loadingIletisim: false, // iletişim yükleniyor mu
  loadingGorsel: false, // görsel yükleniyor mu
  error: null,
};

const organizasyonSlice = createSlice({
  name: "organizasyon",
  initialState,
  reducers: {
    clearCurrentOrganizasyon: (state) => {
      state.organizasyon = null;
      state.telefonlar = [];
      state.adresler = [];
      state.sosyalMedyalar = [];
    },
    clearOrganizasyonError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Organizasyon Ana İşlemleri
    builder
      .addCase(getOrganizasyonlar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrganizasyonlar.fulfilled, (state, action) => {
        state.loading = false;
        state.organizasyonlar = action.payload;
        state.error = null;
      })
      .addCase(getOrganizasyonlar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { msg: "Organizasyonlar yüklenemedi" };
      })

      .addCase(getActiveOrganizasyonlar.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveOrganizasyonlar.fulfilled, (state, action) => {
        state.loading = false;
        state.organizasyonlar = action.payload;
        state.error = null;
      })
      .addCase(getActiveOrganizasyonlar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || {
          msg: "Aktif organizasyonlar yüklenemedi",
        };
      })

      .addCase(getOrganizasyonById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrganizasyonById.fulfilled, (state, action) => {
        state.loading = false;
        state.organizasyon = action.payload;
        state.error = null;
      })
      .addCase(getOrganizasyonById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || {
          msg: "Organizasyon detayları yüklenemedi",
        };
      })

      .addCase(addOrganizasyon.pending, (state) => {
        state.loading = true;
      })
      .addCase(addOrganizasyon.fulfilled, (state, action) => {
        state.loading = false;
        state.organizasyon = action.payload;
        state.organizasyonlar = [action.payload, ...state.organizasyonlar];
        state.error = null;
      })
      .addCase(addOrganizasyon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { msg: "Organizasyon eklenemedi" };
      })

      .addCase(updateOrganizasyon.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrganizasyon.fulfilled, (state, action) => {
        state.loading = false;
        state.organizasyon = action.payload;
        state.organizasyonlar = state.organizasyonlar.map((org) =>
          org.id === action.payload.id ? action.payload : org
        );
        state.error = null;
      })
      .addCase(updateOrganizasyon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { msg: "Organizasyon güncellenemedi" };
      })

      .addCase(deleteOrganizasyon.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteOrganizasyon.fulfilled, (state, action) => {
        state.loading = false;
        state.organizasyonlar = state.organizasyonlar.filter(
          (org) => org.id !== action.payload
        );
        if (state.organizasyon && state.organizasyon.id === action.payload) {
          state.organizasyon = null;
        }
        state.error = null;
      })
      .addCase(deleteOrganizasyon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { msg: "Organizasyon silinemedi" };
      })

      .addCase(deleteManyOrganizasyonlar.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyOrganizasyonlar.fulfilled, (state, action) => {
        state.loading = false;
        state.organizasyonlar = state.organizasyonlar.filter(
          (org) => !action.payload.includes(org.id)
        );
        state.error = null;
      })
      .addCase(deleteManyOrganizasyonlar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || {
          msg: "Organizasyonlar toplu olarak silinemedi",
        };
      })

      // Organizasyon Görsel İşlemleri
      .addCase(uploadOrganizasyonGorsel.pending, (state) => {
        state.loadingGorsel = true;
        state.error = null;
      })
      .addCase(uploadOrganizasyonGorsel.fulfilled, (state, action) => {
        state.loadingGorsel = false;
        if (state.organizasyon) {
          if (!state.organizasyon.gorselBilgileri) {
            state.organizasyon.gorselBilgileri = {};
          }
          state.organizasyon.gorselBilgileri[action.payload.gorselTipi] =
            action.payload.data;
        }
      })
      .addCase(uploadOrganizasyonGorsel.rejected, (state, action) => {
        state.loadingGorsel = false;
        state.error = action.payload || { msg: "Görsel yüklenemedi" };
      })

      .addCase(deleteOrganizasyonGorsel.pending, (state) => {
        state.loadingGorsel = true;
        state.error = null;
      })
      .addCase(deleteOrganizasyonGorsel.fulfilled, (state, action) => {
        state.loadingGorsel = false;
        if (state.organizasyon && state.organizasyon.gorselBilgileri) {
          state.organizasyon.gorselBilgileri[action.payload.gorselTipi] = null;
        }
      })
      .addCase(deleteOrganizasyonGorsel.rejected, (state, action) => {
        state.loadingGorsel = false;
        state.error = action.payload || { msg: "Görsel silinemedi" };
      });

    // Diğer Async Thunk'lar için hata yakalamak dışında özel bir durum yok,
    // bu nedenle sadece loading ve error durumlarını izliyoruz.
    // Telefon, Adres ve Sosyal Medya işlemleri için extraReducer'lar
    builder
      .addCase(getOrganizasyonTelefonlar.pending, (state) => {
        state.loadingIletisim = true;
      })
      .addCase(getOrganizasyonTelefonlar.fulfilled, (state, action) => {
        state.loadingIletisim = false;
        state.telefonlar = action.payload;
        state.error = null;
      })
      .addCase(getOrganizasyonTelefonlar.rejected, (state, action) => {
        state.loadingIletisim = false;
        state.error = action.payload || {
          msg: "Telefon bilgileri yüklenemedi",
        };
      })

      .addCase(addOrganizasyonTelefon.pending, (state) => {
        state.loadingIletisim = true;
      })
      .addCase(addOrganizasyonTelefon.fulfilled, (state, action) => {
        state.loadingIletisim = false;
        state.telefonlar.unshift(action.payload);
        state.error = null;
      })
      .addCase(addOrganizasyonTelefon.rejected, (state, action) => {
        state.loadingIletisim = false;
        state.error = action.payload || { msg: "Telefon eklenemedi" };
      })

      .addCase(updateOrganizasyonTelefon.pending, (state) => {
        state.loadingIletisim = true;
      })
      .addCase(updateOrganizasyonTelefon.fulfilled, (state, action) => {
        state.loadingIletisim = false;
        state.telefonlar = state.telefonlar.map((telefon) =>
          telefon._id === action.payload._id ? action.payload : telefon
        );
        state.error = null;
      })
      .addCase(updateOrganizasyonTelefon.rejected, (state, action) => {
        state.loadingIletisim = false;
        state.error = action.payload || { msg: "Telefon güncellenemedi" };
      })

      .addCase(deleteOrganizasyonTelefon.pending, (state) => {
        state.loadingIletisim = true;
      })
      .addCase(deleteOrganizasyonTelefon.fulfilled, (state, action) => {
        state.loadingIletisim = false;
        state.telefonlar = state.telefonlar.filter(
          (telefon) => telefon._id !== action.payload.id
        );
        state.error = null;
      })
      .addCase(deleteOrganizasyonTelefon.rejected, (state, action) => {
        state.loadingIletisim = false;
        state.error = action.payload || { msg: "Telefon silinemedi" };
      })

      .addCase(getOrganizasyonAdresler.pending, (state) => {
        state.loadingIletisim = true;
      })
      .addCase(getOrganizasyonAdresler.fulfilled, (state, action) => {
        state.loadingIletisim = false;
        state.adresler = action.payload;
        state.error = null;
      })
      .addCase(getOrganizasyonAdresler.rejected, (state, action) => {
        state.loadingIletisim = false;
        state.error = action.payload || { msg: "Adres bilgileri yüklenemedi" };
      })

      .addCase(addOrganizasyonAdres.pending, (state) => {
        state.loadingIletisim = true;
      })
      .addCase(addOrganizasyonAdres.fulfilled, (state, action) => {
        state.loadingIletisim = false;
        state.adresler.unshift(action.payload);
        state.error = null;
      })
      .addCase(addOrganizasyonAdres.rejected, (state, action) => {
        state.loadingIletisim = false;
        state.error = action.payload || { msg: "Adres eklenemedi" };
      })

      .addCase(updateOrganizasyonAdres.pending, (state) => {
        state.loadingIletisim = true;
      })
      .addCase(updateOrganizasyonAdres.fulfilled, (state, action) => {
        state.loadingIletisim = false;
        state.adresler = state.adresler.map((adres) =>
          adres._id === action.payload._id ? action.payload : adres
        );
        state.error = null;
      })
      .addCase(updateOrganizasyonAdres.rejected, (state, action) => {
        state.loadingIletisim = false;
        state.error = action.payload || { msg: "Adres güncellenemedi" };
      })

      .addCase(deleteOrganizasyonAdres.pending, (state) => {
        state.loadingIletisim = true;
      })
      .addCase(deleteOrganizasyonAdres.fulfilled, (state, action) => {
        state.loadingIletisim = false;
        state.adresler = state.adresler.filter(
          (adres) => adres._id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteOrganizasyonAdres.rejected, (state, action) => {
        state.loadingIletisim = false;
        state.error = action.payload || { msg: "Adres silinemedi" };
      })

      .addCase(getOrganizasyonSosyalMedya.pending, (state) => {
        state.loadingIletisim = true;
      })
      .addCase(getOrganizasyonSosyalMedya.fulfilled, (state, action) => {
        state.loadingIletisim = false;
        state.sosyalMedyalar = action.payload;
        state.error = null;
      })
      .addCase(getOrganizasyonSosyalMedya.rejected, (state, action) => {
        state.loadingIletisim = false;
        state.error = action.payload || {
          msg: "Sosyal medya bilgileri yüklenemedi",
        };
      })

      .addCase(addOrganizasyonSosyalMedya.pending, (state) => {
        state.loadingIletisim = true;
      })
      .addCase(addOrganizasyonSosyalMedya.fulfilled, (state, action) => {
        state.loadingIletisim = false;
        state.sosyalMedyalar.unshift(action.payload);
        state.error = null;
      })
      .addCase(addOrganizasyonSosyalMedya.rejected, (state, action) => {
        state.loadingIletisim = false;
        state.error = action.payload || { msg: "Sosyal medya eklenemedi" };
      })

      .addCase(updateOrganizasyonSosyalMedya.pending, (state) => {
        state.loadingIletisim = true;
      })
      .addCase(updateOrganizasyonSosyalMedya.fulfilled, (state, action) => {
        state.loadingIletisim = false;
        state.sosyalMedyalar = state.sosyalMedyalar.map((sosyalMedya) =>
          sosyalMedya._id === action.payload._id ? action.payload : sosyalMedya
        );
        state.error = null;
      })
      .addCase(updateOrganizasyonSosyalMedya.rejected, (state, action) => {
        state.loadingIletisim = false;
        state.error = action.payload || { msg: "Sosyal medya güncellenemedi" };
      })

      .addCase(deleteOrganizasyonSosyalMedya.pending, (state) => {
        state.loadingIletisim = true;
      })
      .addCase(deleteOrganizasyonSosyalMedya.fulfilled, (state, action) => {
        state.loadingIletisim = false;
        state.sosyalMedyalar = state.sosyalMedyalar.filter(
          (sosyalMedya) => sosyalMedya._id !== action.payload.id
        );
        state.error = null;
      })
      .addCase(deleteOrganizasyonSosyalMedya.rejected, (state, action) => {
        state.loadingIletisim = false;
        state.error = action.payload || { msg: "Sosyal medya silinemedi" };
      });
  },
});

export const { clearCurrentOrganizasyon, clearOrganizasyonError } =
  organizasyonSlice.actions;

export default organizasyonSlice.reducer;
