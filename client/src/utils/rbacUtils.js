import config from "../config";

/**
 * Kullanıcının belirli bir yetkiye sahip olup olmadığını kontrol eder
 * @param {Object} user - Giriş yapmış kullanıcı nesnesi
 * @param {String} yetkiKodu - Kontrol edilecek yetki kodu (örn: "users_goruntuleme")
 * @returns {Boolean}
 */
export const hasPermission = (user, yetkiKodu) => {
  if (!user) return false;

  // Superadmin (sistem admin) e-posta kontrolü
  if (config?.app?.adminEmail && user.email === config.app.adminEmail) {
    return true;
  }

  // Admin rolü veya isAdmin özelliği varsa tüm yetkilere sahip
  // DİKKAT: Eğer user.roller sadece ObjectId (string) ise, roller populate edilmemiştir ve admin kontrolü yapılamaz.
  // Bu durumda, backend'den user.roller her zaman populate edilmiş (en azından isAdmin alanı ile) gelmelidir.
  if (
    user.role === "admin" ||
    (Array.isArray(user.roller) && user.roller.some((r) => {
      // Eğer rol bir obje ise isAdmin kontrolü yap
      if (typeof r === "object" && r !== null) return r.isAdmin === true;
      // Eğer string ise (ObjectId), admin kontrolü yapılamaz, false dön
      return false;
    }))
  ) {
    return true;
  }

  // Roller üzerinden yetki kontrolü
  if (user.roller && Array.isArray(user.roller)) {
    return user.roller.some((rol) => {
      if (typeof rol === "object" && rol !== null && rol.yetkiler) {
        return rol.yetkiler.some((yetki) =>
          typeof yetki === "string"
            ? yetki === yetkiKodu
            : yetki.kod === yetkiKodu
        );
      }
      return false;
    });
  }

  // Doğrudan permissions array'i kontrolü
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.some(
      (perm) => perm === yetkiKodu || perm.kod === yetkiKodu
    );
  }

  return false;
};

// Helper fonksiyon: kullanıcının herhangi rolü var mı kontrolü
export const hasAnyRole = (user) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return !!(user.roller && user.roller.length > 0);
};

/**
 * Yetkiye göre JSX elementini gösterir veya gizler
 */
export const PermissionGuard = ({
  user,
  yetkiKodu,
  element,
  fallback = null,
}) => {
  return hasPermission(user, yetkiKodu) ? element : fallback;
};

/**
 * React children'ı yetkiye göre gösterir
 */
export const PermissionRequired = ({
  user,
  yetkiKodu,
  children,
  fallback = null,
}) => {
  return hasPermission(user, yetkiKodu) ? <>{children}</> : fallback;
};

/**
 * Yetki kodunu oluşturur (örn: modul_islem şeklinde)
 * @param {String} modul - Modül adı
 * @param {String} islem - İşlem tipi (goruntuleme, ekleme, duzenleme, silme vb.)
 * @returns {String} - Oluşturulan yetki kodu
 */
export const generatePermissionCode = (modul, islem) => {
  const modulPrefix = modul.substring(0, 3).toUpperCase();
  const islemSuffix = islem.substring(0, 1).toUpperCase();
  return `${modulPrefix}_${islemSuffix}`;
};

/**
 * Dinamik yetki kodu oluşturur
 * @param {String} modul - Modül adı
 * @param {String} islem - İşlem tipi
 * @returns {String|null} - Oluşturulan yetki kodu veya null
 */
export const getPermissionCode = (modul, islem) => {
  if (!modul || !islem) return null; // bilinmeyen_yetki dönme!
  return `${modul}_${islem}`;
};

/**
 * İşlem tipini etiket olarak döndürür
 * @param {String} islem - İşlem tipi
 * @returns {String} - İşlemin anlaşılır etiketi
 */
export const getIslemLabel = (islem) => {
  const islemMap = {
    goruntuleme: "Görüntüleme",
    ekleme: "Ekleme",
    duzenleme: "Düzenleme",
    silme: "Silme",
    ozel: "Özel İşlem",
  };

  return islemMap[islem] || islem;
};

/**
 * Güvenli yetki kontrolü yapar
 * @param {Object} props - Bileşen özellikleri
 * @returns {JSX.Element|null} - Yetki kontrolüne göre JSX elementi veya null
 */
export const safePermissionRequired = ({ yetkiKodu, children, fallback }) => {
  if (!yetkiKodu || yetkiKodu === "bilinmeyen_yetki") {
    return fallback || null;
  }
  return (
    <PermissionRequired yetkiKodu={yetkiKodu}>{children}</PermissionRequired>
  );
};

/**
 * Gelişmiş yetki kontrolü - modul ve işlem türü ile yetki kontrolü yapar
 * Bu sayede kod üretmeye gerek kalmadan dinamik kontrol yapılabilir
 *
 * @param {Object} user - Kullanıcı nesnesi
 * @param {String} modul - Kontrol edilecek modül (örn: "Kullanıcı Yönetimi")
 * @param {String} islemTuru - İşlem türü (goruntuleme, ekleme, duzenleme, silme, ozel)
 * @returns {Boolean} - Yetki var mı?
 */
export const hasModulePermission = (user, modul, islemTuru) => {
  if (!user || !modul || !islemTuru) return false;

  // Admin rolü tüm yetkilere sahiptir
  if (
    user.role === "admin" ||
    (user.roller && user.roller.some((r) => r.isAdmin))
  ) {
    return true;
  }

  // Kullanıcının tüm yetkilerini al
  let permissions = [];

  // Roller üzerinden yetkiler
  if (user.roller && Array.isArray(user.roller)) {
    user.roller.forEach((rol) => {
      if (rol.yetkiler && Array.isArray(rol.yetkiler)) {
        rol.yetkiler.forEach((yetki) => {
          if (typeof yetki === "object") {
            permissions.push(yetki);
          }
        });
      }
    });
  }

  // Doğrudan permissions array'i kontrolü
  if (user.permissions && Array.isArray(user.permissions)) {
    permissions = [
      ...permissions,
      ...user.permissions.filter((p) => typeof p === "object"),
    ];
  }

  // İlgili modül ve işlem türüne sahip herhangi bir yetki var mı?
  return permissions.some((perm) => {
    // Tam eşleşme kontrolü
    if (perm.modul === modul && perm.islem === islemTuru) {
      return true;
    }

    // Hiyerarşik kontrol - örneğin kullanıcı düzenleme yetkisi varsa, görüntüleme yetkisi de vardır
    if (
      perm.modul === modul &&
      hasHierarchicalPermission(perm.islem, islemTuru)
    ) {
      return true;
    }

    return false;
  });
};

import permissionCache from "./permissionCache";
import { hasHierarchicalPermission } from "./permissionHierarchy";

/**
 * Gelişmiş yetki kontrolü - caching mekanizması ile
 * @param {Object} user - Kullanıcı nesnesi
 * @param {String} yetkiKodu - Kontrol edilecek yetki kodu
 * @returns {Boolean} - Kullanıcının yetkisi var mı?
 */
export const hasPermissionCached = (user, yetkiKodu) => {
  if (!user || !yetkiKodu) return false;

  const userId = user._id || user.id;
  if (!userId) return hasPermission(user, yetkiKodu); // Cache kullanamıyoruz

  // Cache kontrolü
  const cachedResult = permissionCache.get(userId, yetkiKodu);
  if (cachedResult !== null) {
    return cachedResult;
  }

  // Cache'de yoksa hesapla
  const result = hasPermission(user, yetkiKodu);

  // Sonucu cache'e ekle
  permissionCache.set(userId, yetkiKodu, result);

  return result;
};

// Kullanıcı rollerinde veya yetkilerindeki değişikliklerden sonra cache'i temizle
export const invalidateUserPermissionCache = (userId) => {
  if (userId) {
    permissionCache.invalidateUser(userId);
  }
};
