/**
 * Yetki hiyerarşisi tanımlama sistemi
 * Bir üst seviye yetkiye sahip olan, alt seviyelere otomatik erişebilir
 */
const permissionHierarchy = {
  // Görüntüleme < Ekleme < Düzenleme < Silme hiyerarşisi
  goruntuleme: ["goruntuleme"],
  ekleme: ["goruntuleme", "ekleme"],
  duzenleme: ["goruntuleme", "ekleme", "duzenleme"],
  silme: ["goruntuleme", "ekleme", "duzenleme", "silme"],
  ozel: ["ozel"], // Özel izinler kendi başına
};

/**
 * Kullanıcının yetkisinin hiyerarşide daha yüksek bir yetkiyi kapsayıp kapsamadığını kontrol eder
 * @param {string} userPermissionType - Kullanıcının sahip olduğu yetki türü (goruntuleme, ekleme vb.)
 * @param {string} requiredPermissionType - Gerekli olan yetki türü
 * @returns {boolean} - Kullanıcının yetkisi gerekli yetkiyi kapsıyor mu
 */
export const hasHierarchicalPermission = (
  userPermissionType,
  requiredPermissionType
) => {
  if (!userPermissionType || !requiredPermissionType) return false;
  if (!permissionHierarchy[userPermissionType]) return false;

  return permissionHierarchy[userPermissionType].includes(
    requiredPermissionType
  );
};

export default permissionHierarchy;
