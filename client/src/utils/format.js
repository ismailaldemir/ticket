/**
 * Tarih formatı için yardımcı fonksiyon
 * @param {string|Date} date - Formatlanacak tarih
 * @param {Object} options - Intl.DateTimeFormat için opsiyonlar
 * @returns {string} - Formatlanmış tarih string'i
 */
export const formatDate = (date, options = {}) => {
  if (!date) return "-";

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "-";

    const defaultOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    };

    if (options.excludeTime) {
      delete defaultOptions.hour;
      delete defaultOptions.minute;
    }

    return new Intl.DateTimeFormat("tr-TR", defaultOptions).format(dateObj);
  } catch (error) {
    console.error("Tarih formatlanırken hata oluştu:", error);
    return "-";
  }
};

/**
 * Para birimi formatı için yardımcı fonksiyon
 * @param {number} amount - Formatlanacak tutar
 * @param {string} currency - Para birimi (varsayılan: TRY)
 * @returns {string} - Formatlanmış para birimi string'i
 */
export const formatCurrency = (amount, currency = "TRY") => {
  if (amount === null || amount === undefined || isNaN(amount)) return "-";

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Boolean değeri formatlamak için yardımcı fonksiyon
 * @param {boolean} value - Formatlanacak boolean değer
 * @param {Object} options - Format seçenekleri
 * @returns {string} - Formatlanmış string
 */
export const formatBoolean = (value, options = {}) => {
  const { trueText = "Evet", falseText = "Hayır" } = options;

  if (value === null || value === undefined) return "-";
  return value ? trueText : falseText;
};

/**
 * Telefon numarası formatlamak için yardımcı fonksiyon
 * @param {string} phoneNumber - Formatlanacak telefon numarası
 * @returns {string} - Formatlanmış telefon numarası
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "-";

  // Sadece rakamları al
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Türkiye formatı: 0(555) 123 45 67
  if (cleaned.length === 10) {
    return `0(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(
      6,
      8
    )} ${cleaned.slice(8, 10)}`;
  }

  // Diğer durumlar için orijinal değeri döndür
  return phoneNumber;
};

/**
 * TC Kimlik numarası formatı için yardımcı fonksiyon
 * @param {string} tcKimlik - Formatlanacak TC Kimlik
 * @returns {string} - Formatlanmış TC Kimlik numarası
 */
export const formatTcKimlik = (tcKimlik) => {
  if (!tcKimlik) return "-";

  // Sadece rakamları al ve 11 hane kontrolü yap
  const cleaned = tcKimlik.replace(/\D/g, "");
  if (cleaned.length !== 11) return tcKimlik;

  // Formatla: XX XXX XXX XXX
  return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(
    5,
    8
  )} ${cleaned.slice(8, 11)}`;
};
