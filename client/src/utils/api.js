import axios from "axios";
import { toast } from "react-toastify";
import Logger from "./logger";
import { setAuthModalOpen } from "../redux/auth/authSlice";
import { addPermissionDenied } from "../redux/notification/notificationSlice";
import { store } from "../redux/store";

let _store;
let _navigate; // Yeni: navigate fonksiyonu referansı

// Store'u kaydeden fonksiyon
export const injectStore = (store) => {
  _store = store;
};

// Yeni: navigate fonksiyonunu kaydeden fonksiyon
export const injectNavigate = (navigate) => {
  _navigate = navigate;
};

/**
 * Kimlik doğrulama token'ını getiren merkezi fonksiyon
 * @returns {string|null} Kayıtlı token veya null
 */
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Token'ı güvenli şekilde header'lara ekleyen merkezi fonksiyon
 * @param {Object} headers - İstek headers nesnesi
 * @returns {Object} Token eklenmiş headers
 */
export const addAuthTokenToHeaders = (headers = {}) => {
  const token = getAuthToken();
  if (token && typeof token === "string" && token.trim().length > 0) {
    return {
      ...headers,
      "x-auth-token": token,
    };
  }
  return headers;
};

// API temel URL yapılandırması
const baseURL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://iaidat-backend.onrender.com"
    : "http://localhost:5000"); // Sadece port, /api yok!

const apiClient = axios.create({
  baseURL,
  timeout: 30000, // 30 saniye
  headers: {
    "Content-Type": "application/json",
  },
});

// API durumunu izlemek için değişken
let isApiAvailable = true;

/**
 * Yetki gerektiren istekler için merkezi yardımcı fonksiyon
 * @param {string} endpoint - İstek yapılacak endpoint
 * @param {Object} options - Axios istek seçenekleri
 * @returns {Promise} API yanıtı
 */
export const authorizedRequest = async (endpoint, options = {}) => {
  try {
    const headers = addAuthTokenToHeaders(options.headers || {});
    const response = await apiClient({
      url: endpoint,
      ...options,
      headers,
    });
    return response.data;
  } catch (error) {
    Logger.error(`Yetkili istek başarısız: ${endpoint}`, error);

    // Yetki hatası durumunda özel işlem
    if (error.response && error.response.status === 403) {
      const componentName = endpoint.split("/").pop() || "Bu İşlem";
      handlePermissionDenied(error, endpoint, componentName);
    }

    throw error;
  }
};

/**
 * API'nin durumunu kontrol eden fonksiyon
 * @returns {Promise<boolean>} API erişilebilirlik durumu
 */
export const checkApiStatus = async () => {
  try {
    // Özel bir sağlık kontrolü endpoint'i kullanıyoruz
    await apiClient.get("/status");

    // Eğer API daha önce kullanılamaz durumdaysa ve şimdi kullanılabilir hale geldiyse
    if (!isApiAvailable) {
      isApiAvailable = true;
      Logger.info("API sunucusu tekrar erişilebilir");
      toast.success("Sunucu bağlantısı yeniden kuruldu");
    }

    return true;
  } catch (error) {
    if (isApiAvailable) {
      isApiAvailable = false;
      Logger.error("API sunucusuna erişilemiyor", error);
    }
    return false;
  }
};

/**
 * Yetkisiz erişim durumlarını işleyen merkezi fonksiyon
 * @param {Object} error - Hata nesnesi
 * @param {string} path - Erişilen yol
 * @param {string} component - Erişilen bileşen
 */
export const handlePermissionDenied = (error, path, component) => {
  const requiredPermission =
    error.response?.data?.requiredPermission ||
    error.response?.data?.detail ||
    "bilinmeyen_yetki";

  Logger.warn(
    `Yetkisiz erişim engellendi: ${path}, gerekli yetki: ${requiredPermission}`,
    { component }
  );

  store.dispatch(
    addPermissionDenied({
      path,
      requiredPermission,
      component,
      description:
        error.response?.data?.msg ||
        `"${component}" sayfası veya işlemi için "${requiredPermission}" yetkisine sahip değilsiniz.`,
      timestamp: Date.now(),
    })
  );

  toast.error("Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor.");
};

/**
 * Token'ı tüm sistem genelinde günceller - localStorage ve axios instance headers
 * @param {string} token - Güncellenecek token
 */
export const updateAuthToken = (token) => {
  if (token && typeof token === "string" && token.trim().length > 0) {
    // LocalStorage'a token'ı kaydet
    localStorage.setItem("token", token);

    // Axios instance'ının default headers'ını güncelle
    apiClient.defaults.headers.common["x-auth-token"] = token;

    Logger.info("Token başarıyla güncellendi ve tüm sistemde aktifleştirildi");
    return true;
  } else {
    Logger.warn("Geçersiz token formatı - token güncellenemedi");
    return false;
  }
};

/**
 * Token'ı sistemden temizler
 */
export const clearAuthToken = () => {
  localStorage.removeItem("token");
  delete apiClient.defaults.headers.common["x-auth-token"];
  Logger.info("Token sistemden temizlendi");
};

// Periyodik olarak API durumunu kontrol et
if (process.env.NODE_ENV === "development") {
  setInterval(checkApiStatus, 30000); // Her 30 saniyede bir kontrol et
}

// Başlangıçta token varsa ekle
const token = getAuthToken();
if (token) {
  apiClient.defaults.headers.common["x-auth-token"] = token;
  Logger.debug("Token başlıklara eklendi");
}

// İstek interceptor'u - token eklemesi (addAuthTokenToHeaders fonksiyonu ile tutarlılık sağlanıyor)
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers["x-auth-token"] = token;

      // Debug modunda token varlığını kontrol et
      if (process.env.NODE_ENV === "development") {
        Logger.debug(`API İsteği: ${config.url} - Token mevcut: ${!!token}`);
      }
    } else {
      // Token yoksa ve debug modunda ise uyarı ver
      if (process.env.NODE_ENV === "development") {
        Logger.warn(`API İsteği: ${config.url} - Token bulunamadı!`);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt interceptor'u - bağlantı hatalarını yakalama
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Bağlantı hatası (ECONNREFUSED) durumunda
    if (error.code === "ECONNREFUSED" || !error.response) {
      Logger.error("API sunucusuna bağlantı kurulamadı:", error);

      // Store varsa hata durumunu güncelle
      if (_store) {
        // Modal'ı göster veya kullanıcıyı bilgilendir
        _store.dispatch(setAuthModalOpen(true));
      }

      toast.error(
        "Sunucu bağlantısı kurulamadı. Lütfen internet bağlantınızı kontrol edin."
      );
    }

    // 401 hatası durumunda
    if (error.response && error.response.status === 401) {
      Logger.warn("401 hatası yakalandı - Yetkilendirme gerekiyor", {
        url: error.config?.url,
        method: error.config?.method,
      });
      // Token veya kullanıcı bilgisi geçersiz, localStorage'ı temizle ve login sayfasına yönlendir
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (_store) {
        _store.dispatch(setAuthModalOpen(true));
      } else {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // 403 Forbidden hatası durumunda - merkezi fonksiyonu kullan
    if (error.response && error.response.status === 403) {
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split("/");
      let component = pathParts[pathParts.length - 1] || "Bu Sayfa";
      component = component.charAt(0).toUpperCase() + component.slice(1);

      // Merkezi yetki reddedildi işleme fonksiyonunu kullan
      handlePermissionDenied(error, currentPath, component);

      // SPA yönlendirme: Sayfa yenilemeden 403'e git
      if (_navigate) {
        _navigate("/403", { replace: true });
      } else {
        window.location.href = "/403";
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Login işlemi sonrası şunu mutlaka çağırın:
updateAuthToken(token);

export default apiClient;
