/**
 * Uygulama genelinde kullanılacak yapılandırma ayarları
 * Çevresel değişkenlerden ve varsayılan değerlerden oluşur
 */
const config = {
  // API URL ayarları
  api: {
    url: process.env.REACT_APP_API_URL || "",
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || "30000", 10),
    retryCount: parseInt(process.env.REACT_APP_API_RETRY_COUNT || "3", 10),
  },

  // Kullanıcı arayüzü ayarları
  ui: {
    theme: process.env.REACT_APP_THEME || "light",
    animationsEnabled: process.env.REACT_APP_ANIMATIONS_ENABLED !== "false",
    defaultPageSize: parseInt(
      process.env.REACT_APP_DEFAULT_PAGE_SIZE || "10",
      10
    ),
  },

  // Avatar/medya ile ilgili ayarlar
  avatar: {
    placeholder: "/assets/images/avatar-placeholder.png",
    defaultSize: 40,
    defaultBorderColor: "rgba(0, 0, 0, 0.05)",
    sizes: {
      small: 32,
      medium: 40,
      large: 120,
      extraLarge: 180, // Profil sayfası için daha büyük boyut
    },
  },

  // Uygulama genelinde kullanılacak ayarlar
  app: {
    name: process.env.REACT_APP_NAME || "Organizasyon Yönetim Sistemi",
    version: process.env.REACT_APP_VERSION || "1.0.0",
    copyright: `© ${new Date().getFullYear()} Tüm hakları saklıdır.`,
    logLevel: process.env.REACT_APP_LOG_LEVEL || "error",
    defaultLanguage: process.env.REACT_APP_DEFAULT_LANGUAGE || "tr",
    adminEmail: process.env.REACT_APP_ADMIN_EMAIL || "admin@example.com", // Admin e-posta adresi
  },

  // Dosya yükleme kısıtlamaları
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
    allowedDocumentTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },

  // Güvenlik ayarları
  security: {
    tokenRefreshInterval: parseInt(
      process.env.REACT_APP_TOKEN_REFRESH_INTERVAL || "1800000",
      10
    ), // 30 dakika
    sessionTimeout: parseInt(
      process.env.REACT_APP_SESSION_TIMEOUT || "3600000",
      10
    ), // 1 saat
  },
};

// Development ortamında config içeriğini konsola yazdır
if (process.env.NODE_ENV === "development") {
  // Hassas bilgileri filtreleme
  const safeConfig = { ...config };
  if (safeConfig.security) {
    safeConfig.security = { ...safeConfig.security, tokens: "[FILTERED]" };
  }
  console.log("Uygulama yapılandırması:", safeConfig);
}

export default config;
