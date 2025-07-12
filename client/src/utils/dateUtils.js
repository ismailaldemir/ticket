/**
 * Geçen süreyi insancıl formatta gösterir (örn: "3 dakika önce")
 * @param {number} timestamp - Geçmiş zaman damgası
 * @returns {string} - İnsancıl formatta geçen süre
 */
export const formatElapsedTime = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return `${interval} yıl önce`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval} ay önce`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval} gün önce`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} saat önce`;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval} dakika önce`;
  }

  return seconds < 5 ? "şimdi" : `${Math.floor(seconds)} saniye önce`;
};

/**
 * Timestamp'i okunabilir tarih formatına dönüştürür
 * @param {number} timestamp - Tarih timestamp'i
 * @returns {string} - Formatlanmış tarih
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
