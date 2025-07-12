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
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate([
        {
          path: "roller",
          select: "ad aciklama isAdmin yetkiler",
          populate: {
            path: "yetkiler",
            select: "kod ad modul islem",
          },
        },
      ]);

    if (!user) {
      return res.status(400).json({ msg: "Bu kullanıcı için profil bulunamadı" });
    }

    // Kullanıcı objesini sadeleştir (roller ve yetkiler her zaman nesne olarak dönsün)
    const userObj = user.toObject({ virtuals: true });
    if (userObj.roller && Array.isArray(userObj.roller)) {
      userObj.roller = userObj.roller.map((rol) => ({
        ...rol,
        yetkiler: Array.isArray(rol.yetkiler)
          ? rol.yetkiler.map((y) =>
              typeof y === "object" && y !== null
                ? y
                : {}
            )
          : [],
      }));
    }

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
      // Kullanıcı var mı kontrol et
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: "Geçersiz kimlik bilgileri" });
      }

      // Şifreleri karşılaştır
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: "Geçersiz kimlik bilgileri" });
      }

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

      // Kullanıcıyı rollerini ve yetkilerini popüle ederek tekrar çek
      const populatedUser = await User.findById(user.id)
        .select("-password")
        .populate([
          {
            path: "roller",
            select: "ad aciklama isAdmin yetkiler",
            populate: {
              path: "yetkiler",
              select: "kod ad modul islem",
            },
          },
        ]);

      // Kullanıcı objesini sadeleştir (roller ve yetkiler her zaman nesne olarak dönsün)
      let userObj = populatedUser.toObject({ virtuals: true });
      if (userObj.roller && Array.isArray(userObj.roller)) {
        userObj.roller = userObj.roller.map((rol) => ({
          ...rol,
          yetkiler: Array.isArray(rol.yetkiler)
            ? rol.yetkiler.map((y) =>
                typeof y === "object" && y !== null
                  ? y
                  : {}
              )
            : [],
        }));
      }

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
