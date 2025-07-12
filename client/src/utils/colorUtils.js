/**
 * String'den tutarlı bir renk oluşturan yardımcı fonksiyon
 * @param {string} string İsim veya diğer string değeri
 * @returns {string} Hex renk kodu
 */
export function stringToColor(string) {
  if (!string) return "#1976d2"; // Varsayılan renk

  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Daha canlı renkler için hue, saturation ve lightness değerleriyle oynayalım
  // HSL renk modeline geçerek daha güzel renkler elde edelim
  const h = Math.abs(hash) % 360; // Hue 0-360 değeri
  const s = 65; // Saturation - sabit ve canlı bir değer
  const l = 55; // Lightness - orta ton, ne çok açık ne çok koyu

  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Rastgele bir renk üretir
 * @returns {string} Hex renk kodu
 */
export function getRandomColor() {
  // Rastgele ama canlı renkler için HSL kullan
  const h = Math.floor(Math.random() * 360); // 0-360 arası
  const s = 65 + Math.floor(Math.random() * 15); // 65-80 arası
  const l = 50 + Math.floor(Math.random() * 10); // 50-60 arası

  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * İsimden avatar için arka plan rengi oluşturur
 * @param {string} name Kullanıcı adı
 * @returns {object} Stil nesnesi
 */
export function getAvatarStyle(name) {
  return {
    bgcolor: stringToColor(name),
    color: "#ffffff", // Beyaz text daha okunabilir
  };
}

/**
 * Material Design'a uygun önceden tanımlanmış renklerden seçer
 * @param {string} input Girdi değeri
 * @returns {string} Hex renk kodu
 */
export function getMaterialColor(input) {
  // Material palette renkleri
  const colors = [
    "#f44336", // Red
    "#e91e63", // Pink
    "#9c27b0", // Purple
    "#673ab7", // Deep Purple
    "#3f51b5", // Indigo
    "#2196f3", // Blue
    "#03a9f4", // Light Blue
    "#00bcd4", // Cyan
    "#009688", // Teal
    "#4caf50", // Green
    "#8bc34a", // Light Green
    "#cddc39", // Lime
    "#ffeb3b", // Yellow
    "#ffc107", // Amber
    "#ff9800", // Orange
    "#ff5722", // Deep Orange
    "#795548", // Brown
    "#607d8b", // Blue Grey
  ];

  // Input'tan sayısal bir değer oluştur
  let hash = 0;
  if (!input) return colors[0];

  for (let i = 0; i < input.length; i++) {
    hash += input.charCodeAt(i);
  }

  // Renk dizisinden bir renk seç
  return colors[hash % colors.length];
}
