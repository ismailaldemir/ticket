/**
 * Yetki kontrolü için cache mekanizması
 * Sık yapılan yetki kontrolleri için performans artışı sağlar
 */
class PermissionCache {
  constructor() {
    this.cache = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Cache'e yeni bir yetki kontrolünün sonucunu ekler
   * @param {string} userId - Kullanıcı ID
   * @param {string} permissionKey - Yetki anahtarı
   * @param {boolean} result - Yetki kontrolü sonucu
   * @returns {void}
   */
  set(userId, permissionKey, result) {
    if (!userId || !permissionKey) return;

    const key = `${userId}:${permissionKey}`;
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Cache'den bir yetki kontrolünün sonucunu alır
   * @param {string} userId - Kullanıcı ID
   * @param {string} permissionKey - Yetki anahtarı
   * @returns {boolean|null} - Cache'de varsa sonuç, yoksa null
   */
  get(userId, permissionKey) {
    if (!userId || !permissionKey) return null;

    const key = `${userId}:${permissionKey}`;
    const cached = this.cache.get(key);

    if (!cached) {
      this.cacheMisses++;
      return null;
    }

    // 5 dakikadan eski cache entryleri kullanmıyoruz
    if (Date.now() - cached.timestamp > 5 * 60 * 1000) {
      this.cache.delete(key);
      return null;
    }

    this.cacheHits++;
    return cached.result;
  }

  /**
   * Belirli bir kullanıcı için cache'i temizler
   * @param {string} userId - Kullanıcı ID
   * @returns {void}
   */
  invalidateUser(userId) {
    if (!userId) return;

    for (const key of this.cache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Tüm cache'i temizler
   * @returns {void}
   */
  clear() {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Cache istatistiklerini döndürür
   * @returns {Object} - Cache istatistikleri
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRatio:
        this.cacheHits + this.cacheMisses > 0
          ? this.cacheHits / (this.cacheHits + this.cacheMisses)
          : 0,
    };
  }
}

// Singleton instance oluştur
const permissionCache = new PermissionCache();

export default permissionCache;
