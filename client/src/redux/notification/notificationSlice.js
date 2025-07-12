import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  permissionDeniedNotifications: [],
  showPermissionDeniedAlert: false,
  lastPermissionDeniedPath: null,
  currentNotification: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addPermissionDenied: (state, action) => {
      const {
        path,
        requiredPermission,
        component,
        timestamp = Date.now(),
        description,
      } = action.payload;

      // Benzersiz bir ID oluştur
      const id = `${requiredPermission}-${timestamp}`;

      // Aynı bildirim zaten var mı kontrol et (tekrar göstermeyi önle)
      const existingNotificationIndex =
        state.permissionDeniedNotifications.findIndex(
          (n) =>
            n.path === path &&
            n.requiredPermission === requiredPermission &&
            !n.read
        );

      if (existingNotificationIndex !== -1) {
        // Mevcut bildirimi güncelle
        state.permissionDeniedNotifications[
          existingNotificationIndex
        ].timestamp = timestamp;
        state.currentNotification =
          state.permissionDeniedNotifications[existingNotificationIndex];
      } else {
        // Yeni bildirim ekle
        const newNotification = {
          id,
          path,
          requiredPermission,
          component,
          timestamp,
          description,
          read: false,
        };

        state.permissionDeniedNotifications.unshift(newNotification);
        state.currentNotification = newNotification;
      }

      // Son yetkisiz erişim yolunu kaydet
      state.lastPermissionDeniedPath = path;

      // Bildirimi göster
      state.showPermissionDeniedAlert = true;
    },

    markNotificationAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.permissionDeniedNotifications.find(
        (n) => n.id === notificationId
      );

      if (notification) {
        notification.read = true;
      }
    },

    dismissAlert: (state) => {
      state.showPermissionDeniedAlert = false;
    },

    clearAllNotifications: (state) => {
      state.permissionDeniedNotifications = [];
      state.showPermissionDeniedAlert = false;
      state.currentNotification = null;
    },

    setCurrentNotification: (state, action) => {
      state.currentNotification = action.payload;
    },
  },
});

export const {
  addPermissionDenied,
  markNotificationAsRead,
  clearAllNotifications,
  dismissAlert,
  setCurrentNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
