/**
 * Tarih formatlamak için yardımcı fonksiyon
 * @param {Date|string} date Formatlanacak tarih
 * @param {string} format İsteğe bağlı format parametresi (varsayılan: DD.MM.YYYY)
 * @returns {string} Formatlanmış tarih stringi
 */
export const formatDate = (date, format = 'DD.MM.YYYY') => {
  if (!date) return '-';
  
  try {
    const dt = new Date(date);
    if (isNaN(dt.getTime())) return '-';
    
    const day = dt.getDate().toString().padStart(2, '0');
    const month = (dt.getMonth() + 1).toString().padStart(2, '0');
    const year = dt.getFullYear();
    
    if (format === 'DD.MM.YYYY') {
      return `${day}.${month}.${year}`;
    } else if (format === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`;
    } else if (format === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`;
    }
    
    return `${day}.${month}.${year}`;
  } catch (error) {
    return '-';
  }
};

/**
 * Para birimi formatlamak için yardımcı fonksiyon
 * @param {number} amount Formatlanacak tutar
 * @param {string} currency Para birimi (varsayılan: ₺)
 * @returns {string} Formatlanmış para birimi stringi
 */
export const formatCurrency = (amount, currency = '₺') => {
  if (amount === undefined || amount === null) return '-';
  
  try {
    const formatter = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    });
    
    // Formatter'ın ürettiği string'den TRY'yi çıkar ve yerine parametre olarak gelen currency'i koy
    return formatter.format(amount).replace('₺', currency);
  } catch (error) {
    return `${amount} ${currency}`;
  }
};

/**
 * Boolean değerleri formatlamak için yardımcı fonksiyon
 * @param {boolean} value Formatlanacak boolean değer
 * @returns {string} "Evet" veya "Hayır" stringi
 */
export const formatBoolean = (value) => {
  return value ? 'Evet' : 'Hayır';
};

/**
 * Ay numarasını ay adına çeviren yardımcı fonksiyon
 * @param {number} ay Ay numarası (1-12)
 * @returns {string} Ay adı
 */
export const getAyAdi = (ay) => {
  const aylar = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  return aylar[ay - 1] || '';
};
