import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiClient, { updateAuthToken, clearAuthToken } from "../../utils/api"; // updateAuthToken ve clearAuthToken'ı ekledik
import Logger from "../../utils/logger"; // Logger'ı içe aktarıyoruz

// Kullanıcı bilgilerini yükle
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Token header'a zaten eklenmiş mi kontrol et
      const token = localStorage.getItem("token");
      if (token && apiClient.defaults && apiClient.defaults.headers) {
        updateAuthToken(token);
      }

      // Doğru endpoint: baseURL'inize göre sadece "/auth" olmalı
      const response = await apiClient.get("/auth");
      // Eğer response.data bir obje değilse (ör. HTML döndüyse), logout yap
      if (
        !response.data ||
        typeof response.data !== "object" ||
        Array.isArray(response.data) ||
        (typeof response.data === "string" && response.data.startsWith("<!DOCTYPE html"))
      ) {
        // Hatalı veri geldi, logout işlemi
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return rejectWithValue({ msg: "Kullanıcı bilgisi alınamadı, lütfen tekrar giriş yapın." });
      }
      return response.data;
    } catch (err) {
      Logger.error("Kullanıcı bilgileri yüklenirken hata:", err.response?.data);
      return rejectWithValue(
        err.response?.data || { msg: "Kullanıcı bilgileri yüklenemedi" }
      );
    }
  }
);

// Token geçerliliğini kontrol et
export const checkTokenValidity = createAsyncThunk(
  "auth/checkTokenValidity",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        Logger.warn(
          "Token bulunamadı, kullanıcı çıkış yapmış olarak işaretlenecek"
        );
        return { isAuthenticated: false };
      }

      // Token'i header'a ekle
      updateAuthToken(token);

      // Kullanıcı bilgilerini getirerek token geçerliliğini kontrol et
      // Doğru endpoint: baseURL'inize göre sadece "/auth" olmalı
      const res = await apiClient.get("/auth");
      return { isAuthenticated: true, user: res.data };
    } catch (error) {
      // Token geçersiz
      clearAuthToken();
      localStorage.removeItem("token");
      Logger.error("Token geçerlilik kontrolü başarısız:", error);
      return rejectWithValue({ msg: "Token geçersiz veya süresi dolmuş" });
    }
  }
);

// Login action
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth", { email, password });
      if (!res.data || !res.data.token || !res.data.user) {
        return rejectWithValue({
          msg: "Sunucudan geçerli kullanıcı veya token bilgisi alınamadı.",
        });
      }
      updateAuthToken(res.data.token);
      // Token ve user bilgisini localStorage'a kaydet
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Giriş yapılamadı" });
    }
  }
);

// Kayıt ol
export const register = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/users", formData);
      updateAuthToken(res.data.token);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Kayıt yapılamadı" });
    }
  }
);

// Tüm kullanıcıları getir
export const getUsers = createAsyncThunk(
  "auth/getUsers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { users } = getState().auth;
      if (users && users.length > 0) {
        Logger.info("Kullanıcılar zaten yüklenmiş, API çağrısı atlanıyor");
        return users;
      }

      Logger.info("API çağrısı yapılıyor: getUsers");
      const res = await apiClient.get("/users");
      Logger.debug("API yanıtı:", res.data);
      return res.data;
    } catch (err) {
      Logger.error("getUsers API hatası:", err);
      toast.error(err.response?.data?.msg || "Kullanıcılar getirilemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Kullanıcılar getirilemedi" }
      );
    }
  }
);

// Kullanıcı detaylarını getir
export const getUserById = createAsyncThunk(
  "auth/getUserById",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      const { currentUser } = getState().auth;
      // İlk önce mevcut state'deki currentUser'ı kontrol et
      if (currentUser && currentUser._id === id) {
        Logger.info("Aynı kullanıcı zaten yüklenmiş, API çağrısı atlanıyor");
        return currentUser;
      }

      Logger.info(`getUserById API çağrısı yapılıyor: /users/${id}`);
      const res = await apiClient.get(`/users/${id}`);
      Logger.info("getUserById API yanıtı alındı");
      return res.data;
    } catch (err) {
      Logger.error("getUserById API hatası:", err);
      // Bağlantı hatası durumunda özel bir mesaj döndür
      if (!err.response) {
        return rejectWithValue({
          msg: "API sunucusuna bağlanılamıyor. Sunucunun çalıştığından emin olun.",
        });
      }
      return rejectWithValue(
        err.response?.data || {
          msg: err.message || "Kullanıcı bilgileri getirilemedi",
        }
      );
    }
  }
);

// Yeni kullanıcı ekle
export const addUser = createAsyncThunk(
  "auth/addUser",
  async (userData, { rejectWithValue }) => {
    try {
      let formData;
      let apiRequest;
      if (userData.avatar && userData.avatar instanceof File) {
        formData = new FormData();
        Object.keys(userData).forEach((key) => {
          if (key === "avatar" && userData[key] instanceof File) {
            formData.append(key, userData[key]);
          } else if (userData[key] !== undefined && userData[key] !== null) {
            formData.append(key, userData[key]);
          }
        });
        apiRequest = apiClient.post("/users/add", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        apiRequest = apiClient.post("/users/add", userData);
      }
      const res = await apiRequest;
      toast.success("Kullanıcı başarıyla eklendi");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Kullanıcı eklenemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Kullanıcı eklenemedi" }
      );
    }
  }
);

// Kullanıcı bilgilerini güncelle
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      console.log(`updateUser API çağrısı yapılıyor: /users/${id}`, userData);
      let formData;
      let apiRequest;
      if (userData.avatar && userData.avatar instanceof File) {
        formData = new FormData();
        Object.keys(userData).forEach((key) => {
          if (key === "avatar" && userData[key] instanceof File) {
            formData.append(key, userData[key]);
          } else if (userData[key] !== undefined && userData[key] !== null) {
            formData.append(key, userData[key]);
          }
        });
        apiRequest = apiClient.put(`/users/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        apiRequest = apiClient.put(`/users/${id}`, userData);
      }
      const res = await apiRequest;
      console.log("updateUser API yanıtı:", res.data);
      toast.success("Kullanıcı bilgileri başarıyla güncellendi");
      return res.data;
    } catch (err) {
      console.error("updateUser API hatası:", err);
      return rejectWithValue(
        err.response?.data || {
          msg: err.message || "Kullanıcı bilgileri güncellenemedi",
        }
      );
    }
  }
);

// Kullanıcı avatarını sil
export const deleteUserAvatar = createAsyncThunk(
  "auth/deleteUserAvatar",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/users/avatar/${id}`);
      toast.success("Profil resmi başarıyla silindi");
      return id;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Profil resmi silinemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Profil resmi silinemedi" }
      );
    }
  }
);

// Kullanıcı sil
export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/users/${id}`);
      toast.success("Kullanıcı başarıyla silindi");
      return id;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Kullanıcı silinemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Kullanıcı silinemedi" }
      );
    }
  }
);

// Çoklu kullanıcı silme
export const deleteManyUsers = createAsyncThunk(
  "auth/deleteManyUsers",
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post("/users/delete-many", { ids });
      toast.success("Seçilen kullanıcılar başarıyla silindi");
      return ids;
    } catch (err) {
      toast.error(err.response?.data?.msg || "Kullanıcılar silinemedi");
      return rejectWithValue(
        err.response?.data || { msg: "Kullanıcılar silinemedi" }
      );
    }
  }
);

// Çift modal açılmasını önlemek için action'a flag ekleyelim
export const setAuthModalOpenAction = createAction(
  "auth/setAuthModalOpen",
  (isOpen) => {
    return {
      payload: isOpen,
    };
  }
);

// Token yenileme için yeni bir action oluşturuyoruz
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiClient.post("/auth", formData);
      updateAuthToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      dispatch(loadUser());
      return res.data;
    } catch (err) {
      console.error("Token yenilenirken hata:", err);
      return rejectWithValue(
        err.response && err.response.data
          ? err.response.data
          : { msg: "Token yenileme hatası" }
      );
    }
  }
);

// Kullanıcının yetkilerini getir
export const getUserPermissions = createAsyncThunk(
  "auth/getUserPermissions",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/users/${userId}/permissions`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: "Yetkiler yüklenemedi" }
      );
    }
  }
);

// Kullanıcıya rol ata - skipRefresh ve skipToast parametreleri ile
export const assignRolesToUser = createAsyncThunk(
  "auth/assignRolesToUser",
  async (
    {
      roller,
      userId,
      isSistemAdmin = false,
      skipRefresh = false,
      skipToast = false,
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await apiClient.put(`/users/${userId}/roles`, { roller });
      // Admin rolü koruması sadece isSistemAdmin parametresi true geldiğinde yapılsın
      if (isSistemAdmin) {
        const adminRol = res.data.roller?.find(
          (r) => r.isAdmin && r.ad === "Admin"
        );
        if (!adminRol) {
          toast.error("Admin kullanıcısından admin rolü çıkarılamaz!");
          dispatch(getUserPermissions(userId));
          return rejectWithValue({
            msg: "Admin kullanıcısının admin rolü korumalıdır",
          });
        }
      }
      // Başarı mesajını yalnızca skipToast parametresi false ise göster
      if (!skipToast) {
        toast.success("Kullanıcı rolleri başarıyla güncellendi");
      }
      // Kullanıcı verilerini yenile - skipRefresh true ise yapma
      if (!skipRefresh) {
        dispatch(getUsers());
      }
      return { updatedUser: res.data, userId };
    } catch (err) {
      const errorMessage = err.response?.data?.msg || "Roller güncellenemedi";
      toast.error(errorMessage);
      return rejectWithValue(err.response?.data || { msg: errorMessage });
    }
  }
);

// Birden fazla kullanıcıya rol ata
export const assignRolesToManyUsers = createAsyncThunk(
  "auth/assignRolesToManyUsers",
  async (
    { userIds, roller, skipRefresh = false },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await apiClient.post("/users/assign-roles-bulk", {
        userIds,
        roller,
      });
      // Başarılı mesajı
      if (res.data.success > 0) {
        toast.success(`${res.data.success} kullanıcının rolleri güncellendi`);
      }
      if (res.data.failed > 0) {
        toast.warning(`${res.data.failed} kullanıcının rolleri güncellenemedi`);
      }
      // Eğer skipRefresh değilse, kullanıcıları yeniden yükle
      // skipRefresh genellikle optimistik UI güncellemeleri için true olarak geçilir
      if (!skipRefresh) {
        dispatch(getUsers());
      }
      return {
        ...res.data,
        userIds,
        roller,
        updatedAt: new Date().toISOString(),
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || "Roller topluca güncellenemedi";
      toast.error(errorMessage);
      return rejectWithValue(err.response?.data || { msg: errorMessage });
    }
  }
);

const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: null,
  isAuthModalOpen: false,
  loading: true,
  user: null,
  error: null,
  refreshCounter: 0,
  users: [],
  currentUser: null,
  lastPermissionDenied: null,
  userRoles: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
      state.error = null;
      // Yükleme durumunu sıfırla
      state.loading = false;
    },
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      clearAuthToken();
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
    },
    setAuthModalOpen: (state, action) => {
      state.isAuthModalOpen = action.payload;
    },
    setApiError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    PERMISSION_DENIED: (state, action) => {
      state.lastPermissionDenied = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loading = false;
        state.error = null;
        // Kullanıcı bilgileri yüklendiğinde roller ve yetkiler de tam olarak yüklenir
        if (action.payload.roller) {
          state.userRoles = action.payload.roller;
        }
      })
      .addCase(loadUser.rejected, (state, action) => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload;
        state.userRoles = [];
      })
      .addCase(checkTokenValidity.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkTokenValidity.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user || null;
        state.loading = false;
        state.error = null;
      })
      .addCase(checkTokenValidity.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
        // Token ve user localStorage'a kaydedildiğinden ve axios header'a eklendiğinden emin ol
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        // Token'ı axios instance'ına doğrudan ekle (dinamik import olmadan)
        updateAuthToken(action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.token = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Hata mesajı göster
        // Eğer hata bir obje ve içinde msg varsa sadece msg göster, aksi halde generic mesaj
        if (
          action.payload &&
          typeof action.payload === "object" &&
          action.payload.msg
        ) {
          toast.error(action.payload.msg);
        } else if (typeof action.payload === "string") {
          toast.error(action.payload);
        } else {
          toast.error("Giriş yapılamadı");
        }
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
        // Token localStorage'a kaydedilsin
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        Logger.debug("getUsers: Yükleniyor");
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        // Avatar URL'lerini kontrol et ve düzelt
        const usersWithCheckedAvatars = action.payload.map((user) => {
          if (
            user.avatar &&
            !user.avatar.startsWith("http") &&
            !user.avatar.startsWith("data:")
          ) {
            // Avatar URL'si geçersizse veya erişilemezse bir flag ekle
            return { ...user, avatarError: true };
          }
          return user;
        });
        state.users = usersWithCheckedAvatars;
        state.loading = false;
        Logger.debug("getUsers: Başarılı", usersWithCheckedAvatars);
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        Logger.error("getUsers: Başarısız", action.payload);
      })
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentUser = null;
      })
      .addCase(addUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
        state.loading = false;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        if (state.users && state.users.length > 0) {
          state.users = state.users.map((user) =>
            user._id === action.payload._id
              ? { ...user, ...action.payload }
              : user
          );
        }
        if (state.currentUser && state.currentUser._id === action.payload._id) {
          state.currentUser = { ...state.currentUser, ...action.payload };
        }
        if (
          state.user &&
          action.payload &&
          state.user._id === action.payload._id
        ) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteManyUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteManyUsers.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (user) => !action.payload.includes(user._id)
        );
        state.loading = false;
      })
      .addCase(deleteManyUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUserAvatar.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUserAvatar.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user && state.user._id === action.payload) {
          state.user.avatar = null;
        }
        if (state.currentUser && state.currentUser._id === action.payload) {
          state.currentUser.avatar = null;
        }
      })
      .addCase(deleteUserAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
        state.isAuthModalOpen = false;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.isAuthModalOpen = false;
        localStorage.removeItem("token");
      })
      .addCase(getUserPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload.permissions;
        state.isAdmin = action.payload.isAdmin;
      })
      .addCase(getUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(assignRolesToUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignRolesToUser.fulfilled, (state, action) => {
        // Yalnızca belirli bir kullanıcıyı güncelleyelim - tüm listeyi değil
        if (action.payload?.updatedUser && action.payload?.userId) {
          state.users = state.users.map((user) =>
            user._id === action.payload.userId
              ? { ...user, ...action.payload.updatedUser }
              : user
          );
        }
        state.loading = false;
      })
      .addCase(assignRolesToUser.rejected, (state) => {
        state.loading = false;
      })
      .addCase(assignRolesToManyUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignRolesToManyUsers.fulfilled, (state, action) => {
        // Artık kullanıcı bilgilerini state üzerinde güncelliyoruz, getUsers çağrısına gerek kalmadan
        if (action.payload?.userIds && action.payload?.roller) {
          const { userIds, roller } = action.payload;
          state.users = state.users.map((user) => {
            if (userIds.includes(user._id)) {
              return {
                ...user,
                roller: roller,
                displayRoles: roller,
              };
            }
            return user;
          });
        }
        state.loading = false;
      })
      .addCase(assignRolesToManyUsers.rejected, (state) => {
        state.loading = false;
      })
      .addCase(setAuthModalOpenAction, (state, action) => {
        state.isAuthModalOpen = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentUser,
  logout,
  setAuthModalOpen,
  setApiError,
} = authSlice.actions;

export default authSlice.reducer;
