const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const auditLogger = require("../../utils/auditLogger");

// User modeli
const User = require("../../models/User");

// @route   GET api/auth
// @desc    Kimlik doğrulama ve kullanıcı bilgilerini alma
// @access  Özel
router.get("/", auth, async (req, res) => {
  try {
    // Kullanıcıyı roller ve rollerin yetkileriyle birlikte eksiksiz çek
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Bu kullanıcı için profil bulunamadı" });
    }

    // Kullanıcı objesini sadeleştir
    const userObj = user.dataValues;

    res.json(userObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

// @route   POST api/auth
// @desc    Kullanıcı girişi ve JWT token alma
// @access  Genel
router.post(
  "/",
  [
    check("email", "Geçerli bir e-posta adresi giriniz").isEmail(),
    check("password", "Şifre gereklidir").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      console.log("Login denemesi:", {
        email,
        password: password ? "***" : "boş",
      });

      // Kullanıcı var mı kontrol et
      let user = await User.findOne({ where: { email } });

      if (!user) {
        console.log("Kullanıcı bulunamadı:", email);
        return res.status(400).json({ msg: "Geçersiz kimlik bilgileri" });
      }

      console.log("Kullanıcı bulundu:", { id: user.id, email: user.email });
      console.log("Veritabanındaki hash:", user.password ? "mevcut" : "yok");

      // Şifreleri karşılaştır
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Şifre karşılaştırma sonucu:", isMatch);

      if (!isMatch) {
        console.log("Şifre eşleşmedi");
        return res.status(400).json({ msg: "Geçersiz kimlik bilgileri" });
      }

      console.log("Giriş başarılı, token oluşturuluyor...");

      // JWT token oluştur
      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: config.get("jwtExpire") }, // Doğru: config'den oku
        async (err, token) => {
          if (err) throw err;

          // Giriş başarılı ise audit log oluştur
          await auditLogger.log({
            userId: user.id,
            action: "login",
            resource: "Auth",
            resourceId: user.id,
            ip: req.ip || req.connection.remoteAddress,
            details: {
              timestamp: new Date(),
              userAgent: req.get("user-agent"),
            },
          });

          // Kullanıcıyı rollerini ve yetkilerini dahil ederek tekrar çek
          const populatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ["password"] },
          });

          // Kullanıcı objesini sadeleştir
          let userObj = populatedUser.dataValues;

          res.json({
            token,
            user: userObj,
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
