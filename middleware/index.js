/**
 * Merkezi Middleware İhraç Modülü
 * Tüm middleware'leri tek bir noktadan dışa aktarmak için kullanılır
 * Bu sayede import yolları daha temiz ve hata olasılığı daha düşük olur
 */

const auth = require("./auth");
const yetki = require("./yetki");
const auditMiddleware = require("./auditMiddleware");

module.exports = {
  auth,
  yetkiKontrol: yetki, // yetki fonksiyonunu yetkiKontrol adıyla dışa aktarıyoruz (geriye dönük uyumluluk için)
  auditMiddleware,
};
