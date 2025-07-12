const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // Token'ı header'dan al
  const token = req.header("x-auth-token");

  // Token yok mu kontrol et
  if (!token) {
    return res
      .status(401)
      .json({ msg: "Yetkilendirme tokeni bulunamadı, erişim reddedildi" });
  }

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    // Token içindeki kullanıcı bilgisini request'e ekle
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token geçerli değil" });
  }
};
