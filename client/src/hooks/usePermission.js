import { useSelector } from "react-redux";
import { hasPermissionCached, hasModulePermission } from "../utils/rbacUtils";
import config from "../config";

/**
 * Yetki kontrolü için özel React hook'u
 * @returns {Object} - Yetki kontrolü fonksiyonları
 */
export default function usePermission() {
  const { user } = useSelector((state) => state.auth);

  /**
   * Belirli bir yetki koduna sahip olup olmama durumunu kontrol eder
   * @param {String} yetkiKodu - Kontrol edilecek yetki kodu
   * @returns {Boolean} - Kullanıcının yetkisi var mı?
   */
  const can = (yetkiKodu) => {
    // Superadmin ise her zaman izin ver
    if (user && config?.app?.adminEmail && user.email === config.app.adminEmail) return true;
    return hasPermissionCached(user, yetkiKodu);
  };

  /**
   * Belirli bir modül ve işlem için yetki kontrolü yapar
   * @param {String} modul - Modül adı
   * @param {String} islem - İşlem türü (goruntuleme, ekleme, duzenleme, silme)
   * @returns {Boolean} - Kullanıcının yetkisi var mı?
   */
  const canAccess = (modul, islem) => {
    if (user && config?.app?.adminEmail && user.email === config.app.adminEmail) return true;
    return hasModulePermission(user, modul, islem);
  };

  /**
   * Kullanıcının genel admin yetkileri olup olmadığını kontrol eder
   * @returns {Boolean} - Kullanıcı admin mi?
   */
  const isAdmin = () => {
    if (!user) return false;
    if (config?.app?.adminEmail && user.email === config.app.adminEmail) return true;

    return (
      user.role === "admin" ||
      (user.roller && user.roller.some((r) => r.isAdmin === true))
    );
  };

  return { can, canAccess, isAdmin };
}
