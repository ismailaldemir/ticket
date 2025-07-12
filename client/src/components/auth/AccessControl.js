import React from "react";
import { useSelector } from "react-redux";
import {
  hasPermissionCached,
  hasModulePermission,
} from "../../utils/rbacUtils";
import config from "../../config";

/**
 * Çok yönlü erişim kontrolü komponenti
 * Farklı koşullarla erişim kontrolü yapabilir ve alternatif içerik gösterebilir
 */
const AccessControl = ({
  // Temel yetkiler
  yetkiKodu,
  yetkiKodlari = [],

  // Alternatif kontroller
  modul,
  islem,

  // Lojik operatörler
  anyPermission = false, // true: OR, false: AND

  // Özel koşul fonksiyonu
  condition,

  // Görüntülenecek içerik
  children,
  placeholder = null,
  renderNoAccess,

  // Stil özellikleri
  noWrapper = false,
  className = "",
}) => {
  const { user } = useSelector((state) => state.auth);

  // Superadmin (sistem admin) ise erişime her zaman izin ver
  if (user && config?.app?.adminEmail && user.email === config.app.adminEmail) {
    return <>{children}</>;
  }

  // Koşulların hiçbiri belirtilmemişse, içeriği göster
  if (!yetkiKodu && yetkiKodlari.length === 0 && !modul && !condition) {
    return <>{children}</>;
  }

  // Özel koşul fonksiyonu kontrolü
  if (condition && typeof condition === "function") {
    const conditionResult = condition(user);
    if (!conditionResult) {
      return renderNoAccess ? renderNoAccess() : placeholder;
    }
  }

  // Rol ve yetki kontrolü
  let hasAccess = true;

  // Yetki kodu kontrolü
  if (yetkiKodu) {
    hasAccess = hasPermissionCached(user, yetkiKodu);
  }

  // Çoklu yetki kodu kontrolü
  if (yetkiKodlari.length > 0) {
    if (anyPermission) {
      // OR lojik operatörü - herhangi biri yeterli
      hasAccess = yetkiKodlari.some((kod) => hasPermissionCached(user, kod));
    } else {
      // AND lojik operatörü - hepsi gerekli
      hasAccess = yetkiKodlari.every((kod) => hasPermissionCached(user, kod));
    }
  }

  // Modül ve işlem kontrolü
  if (modul && islem) {
    hasAccess = hasModulePermission(user, modul, islem);
  }

  // Erişim yoksa placeholder göster
  if (!hasAccess) {
    return renderNoAccess ? renderNoAccess() : placeholder;
  }

  // Wrapper'sız gösterim için
  if (noWrapper) {
    return <>{children}</>;
  }

  // Erişim varsa içeriği bir div içinde göster
  return <div className={className}>{children}</div>;
};

export default AccessControl;
