import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/api";
import { invalidateUserPermissionCache } from "../../utils/rbacUtils";

/**
 * Yetkileri senkronize et - veritabanı ile permissions.json arasında senkronizasyon sağlar
 */
export const syncPermissions = createAsyncThunk(
  "yetki/syncPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/yetkiler/sync");
      return response.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Yetkiler senkronize edilirken hata oluştu";
      return rejectWithValue({ msg: message });
    }
  }
);

/**
 * Yetki değişikliklerinden sonra kullanıcı yetkilerini yeniden yükle ve cache'i güncelle
 */
export const refreshUserPermissions = createAsyncThunk(
  "yetki/refreshUserPermissions",
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      // Cache'i temizle
      invalidateUserPermissionCache(userId);

      // Kullanıcının yetkilerini yeniden yükle
      const response = await apiClient.get(`/api/users/${userId}/permissions`);
      return response.data;
    } catch (err) {
      const message =
        err.response && err.response.data.msg
          ? err.response.data.msg
          : "Kullanıcı yetkileri yenilenirken hata oluştu";
      return rejectWithValue({ msg: message });
    }
  }
);

/**
 * Tüm kullanıcıların yetkilerini yeniden yükle
 */
export const refreshAllUsersPermissions = createAsyncThunk(
  "yetki/refreshAllUsersPermissions",
  async (_, { dispatch, getState }) => {
    const { users } = getState().auth;

    if (!users || !Array.isArray(users)) return;

    // Permission cache'i tamamen temizle
    const permissionCache = await import("../../utils/permissionCache");
    permissionCache.default.clear();

    // Redux store'u güncelleme işlemleri...
    return { success: true };
  }
);
