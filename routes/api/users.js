const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const { check } = require("express-validator");
const validationErrorHandler = require("../../middleware/validationErrorHandler");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize"); // Sequelize operators

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/avatars");

    // Klasör yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = `avatar-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

// Dosya filtresi - sadece resim dosyalarını kabul et
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Sadece .jpg, .jpeg, .png ve .gif uzantılı resim dosyaları yüklenebilir."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const User = require("../../models/User");

// @route   POST api/users
// @desc    Kullanıcı kaydı
// @access  Açık
router.post(
  "/",
  [
    check("name", "İsim gereklidir").not().isEmpty(),
    check("email", "Lütfen geçerli bir e-posta adresi giriniz").isEmail(),
    check(
      "password",
      "Lütfen en az 6 karakter içeren bir şifre giriniz"
    ).isLength({ min: 6 }),
  ],
  validationErrorHandler,
  async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
      // E-posta adresini küçük harfe çevirerek kontrol et
      const normalizedEmail = email.toLowerCase();
      let user = await User.findOne({ where: { email: normalizedEmail } });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Kullanıcı zaten mevcut" }] });
      }

      // Yeni kullanıcı örneği oluştur
      user = await User.create({
        name,
        email: normalizedEmail,
        password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
        role: role || "user",
      });

      // JWT oluştur
      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: config.get("jwtExpire") },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/users
// @desc    Tüm kullanıcıları getir (sadece admin yetkisi)
// @access  Özel (Admin)
router.get("/", auth, yetkiKontrol("users_goruntuleme"), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      include: [
        {
          model: require("../../models/Rol"),
          as: "roller",
          attributes: ["ad", "aciklama", "isAdmin"],
          include: [
            {
              model: require("../../models/Yetki"),
              as: "yetkiler",
              attributes: ["kod", "ad", "modul", "islem"],
            },
          ],
        },
      ],
      order: [["date", "DESC"]], // User modelinde createdAt yerine 'date' alanı var
    });

    // Avatar URL'lerini düzenleme
    const usersWithFormattedAvatars = users.map((user) => {
      const userData = user.toJSON();
      if (userData.avatar && !userData.avatar.startsWith("http")) {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        userData.avatar = `${baseUrl}${userData.avatar}`;
      }
      return userData;
    });

    res.json(usersWithFormattedAvatars);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/users/:id
// @desc    Kullanıcı bilgilerini getir
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    let user;

    // "me" özel durumunu kontrol et
    if (req.params.id === "me") {
      // Token'dan gelen kullanıcı ID'sini kullan
      user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json({ msg: "Kullanıcı bulunamadı" });
      }
    } else {
      // Normal UUID kontrolü yap
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ msg: "Geçersiz kullanıcı ID formatı" });
      }

      user = await User.findByPk(req.params.id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json({ msg: "Kullanıcı bulunamadı" });
      }
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

// @route   PUT api/users/:id
// @desc    Kullanıcı bilgilerini güncelle
// @access  Özel (Yalnızca kendi hesabı veya admin)
router.put("/:id", [auth, upload.single("avatar")], async (req, res) => {
  try {
    const userId = req.params.id;

    // RBAC: Admin veya kendi hesabı ya da users_duzenleme yetkisi olanlar güncelleyebilir
    const isSelf = req.user.id === userId;
    const isAdmin = req.user.role === "admin";
    const hasEditPermission =
      req.permissions &&
      Array.isArray(req.permissions) &&
      req.permissions.includes("users_duzenleme");
    if (!isSelf && !isAdmin && !hasEditPermission) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ msg: "Yetkiniz yok" });
    }

    // Güncellenecek kullanıcıyı bul
    let user = await User.findByPk(userId);
    if (!user) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ msg: "Kullanıcı bulunamadı" });
    }

    const { name, email, currentPassword, newPassword, role, active } =
      req.body;

    // Kullanıcı bilgilerini güncelle
    if (name) user.name = name;
    if (email && email !== user.email) {
      const normalizedEmail = email.toLowerCase();
      const emailExists = await User.findOne({
        where: {
          email: normalizedEmail,
          id: { [Op.ne]: userId },
        },
      });
      if (emailExists) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res
          .status(400)
          .json({ msg: "Bu e-posta adresi zaten kullanımda" });
      }
      user.email = normalizedEmail;
    }

    if (active !== undefined) {
      user.active = active === "true" || active === true;
    }

    // Sadece admin rolü değiştirebilir
    if (role && req.user.role === "admin") {
      user.role = role;
    }

    if (req.file) {
      if (user.avatar && user.avatar.startsWith("/uploads/avatars/")) {
        const oldImagePath = path.join(__dirname, "../../", user.avatar);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // Şifre değiştirme işlemi
    if (newPassword && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ msg: "Mevcut şifre hatalı" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    // Sequelize'da _id yok, id ile dönülmeli
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      avatar: user.avatar,
      date: user.date,
    };
    res.json(userResponse);
  } catch (err) {
    console.error(err.message);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).send("Sunucu hatası");
  }
});

// @route   PUT api/users/:id/roles
// @desc    Kullanıcıya roller ata
// @access  Admin
router.put(
  "/:id/roles",
  [auth, yetkiKontrol("users_duzenleme")],
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { roller } = req.body;

      // Kullanıcının var olduğunu kontrol et
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ msg: "Kullanıcı bulunamadı" });
      }

      // Roller doğru formatta mı kontrol et
      if (!Array.isArray(roller)) {
        return res.status(400).json({ msg: "Roller bir dizi olmalıdır" });
      }

      // Rollerin var olduğunu kontrol et
      const rolIDs = await Rol.findAll({
        where: { id: roller },
        attributes: ["id"],
      });
      if (rolIDs.length !== roller.length) {
        return res.status(400).json({ msg: "Bazı roller bulunamadı" });
      }

      // Kullanıcıya rolleri ata
      user.roller = roller;
      await user.save();

      // Güncellenmiş kullanıcıyı ve rollerini döndür
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      res.json(updatedUser);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/users/assign-roles-bulk
// @desc    Birden fazla kullanıcıya rol ata
// @access  Özel (Admin)
router.post("/assign-roles-bulk", auth, async (req, res) => {
  try {
    // Yetki kontrolü - sadece admin veya users_duzenleme yetkisi olanlar
    if (
      req.user.role !== "admin" &&
      !req.permissions?.includes("users_duzenleme")
    ) {
      return res.status(403).json({ msg: "Yetkiniz yok" });
    }

    const { userIds, roller } = req.body;

    // Giriş parametrelerini kontrol et
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ msg: "Geçerli kullanıcı listesi gönderilmedi" });
    }

    if (!roller || !Array.isArray(roller)) {
      return res.status(400).json({ msg: "Roller bir dizi olmalıdır" });
    }

    // Rollerin var olduğunu kontrol et
    const rolIDs = await Rol.findAll({
      where: { id: roller },
      attributes: ["id"],
    });
    if (rolIDs.length !== roller.length) {
      return res.status(400).json({ msg: "Bazı roller bulunamadı" });
    }

    // Her bir kullanıcı için roller ata
    const updatePromises = userIds.map(async (userId) => {
      try {
        const user = await User.findByPk(userId);
        if (!user)
          return { userId, success: false, error: "Kullanıcı bulunamadı" };

        user.roller = roller;
        await user.save();
        return { userId, success: true };
      } catch (err) {
        return { userId, success: false, error: err.message };
      }
    });

    const results = await Promise.all(updatePromises);

    // Sonuçları analiz et
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    // Sonuçları döndür
    res.json({
      message: `${successful} kullanıcı başarıyla güncellendi, ${failed} kullanıcı güncellenemedi`,
      details: results,
      success: successful,
      failed: failed,
    });
  } catch (err) {
    console.error("Toplu rol atama hatası:", err.message);
    res.status(500).json({ msg: "Sunucu hatası" });
  }
});

// @route   GET api/users/:id/permissions
// @desc    Kullanıcının yetkilerini getir
// @access  Private
router.get("/:id/permissions", auth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Yetkisiz erişim kontrolü
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Yetkiniz yok" });
    }

    // Kullanıcıyı rolleri ve yetkileriyle birlikte getir
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ msg: "Kullanıcı bulunamadı" });
    }

    // Kullanıcının tüm yetkilerini düz bir diziye dönüştür
    const permissions = [];
    let isAdmin = false;

    if (user.roller && Array.isArray(user.roller)) {
      user.roller.forEach((rol) => {
        if (rol.isAdmin) {
          isAdmin = true;
        }
        if (rol.yetkiler && Array.isArray(rol.yetkiler)) {
          rol.yetkiler.forEach((yetki) => {
            if (!permissions.some((p) => p.kod === yetki.kod)) {
              permissions.push({
                kod: yetki.kod,
                ad: yetki.ad,
                modul: yetki.modul,
                islem: yetki.islem,
              });
            }
          });
        }
      });
    }

    res.json({
      userId: user.id,
      isAdmin,
      permissions,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

// @route   DELETE api/users/:id
// @desc    Kullanıcı sil
// @access  Özel (Admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    // Sadece adminler silebilir
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Yetkiniz yok" });
    }

    // Kendini silmesini engelle
    if (req.user.id === req.params.id) {
      return res.status(400).json({ msg: "Kendinizi silemezsiniz" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Kullanıcı bulunamadı" });
    }

    await user.destroy();
    res.json({ msg: "Kullanıcı silindi" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

// @route   POST api/users/delete-many
// @desc    Birden çok kullanıcıyı sil
// @access  Özel (Admin)
router.post("/delete-many", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Yetkiniz yok" });
    }
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ msg: "Geçerli kullanıcı ID listesi sağlanmalıdır" });
    }
    if (ids.includes(req.user.id)) {
      return res.status(400).json({ msg: "Kendinizi silemezsiniz" });
    }
    // Sequelize ile toplu silme
    const result = await User.destroy({ where: { id: ids } });
    if (result === 0) {
      return res.status(404).json({ msg: "Silinecek kullanıcı bulunamadı" });
    }
    res.json({
      msg: `${result} kullanıcı silindi`,
      count: result,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

// @route   POST api/users/add
// @desc    Kullanıcı ekle (admin yetkisi)
// @access  Özel (Admin)

router.post(
  "/add",
  [auth, yetkiKontrol("users_ekleme"), upload.single("avatar")],
  async (req, res) => {
    try {
      const { name, email, password, role, active } = req.body;

      // E-posta adresini küçük harfe çevirerek kontrol et
      const normalizedEmail = email.toLowerCase();
      let user = await User.findOne({ where: { email: normalizedEmail } });
      if (user) {
        // Dosya yüklendiyse sil
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          msg: "Bu e-posta adresi zaten kullanımda",
        });
      }

      // Avatar yolu belirleme
      const avatarPath = req.file
        ? `/uploads/avatars/${req.file.filename}`
        : null;

      user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: role || "user",
        active: active === "true" || active === true,
        avatar: avatarPath,
      });

      res.json(user);
    } catch (err) {
      console.error(err.message);

      // Dosya yüklendiyse hata durumunda sil
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/users/avatar/:id
// @desc    Kullanıcı avatarını sil
// @access  Özel (Yalnızca kendi hesabı veya admin)
router.delete("/avatar/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Kullanıcı sadece kendi hesabını veya admin ise herhangi bir hesabı güncelleyebilir
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Yetkiniz yok" });
    }

    // Kullanıcıyı bul
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ msg: "Kullanıcı bulunamadı" });
    }

    // Avatar varsa sil
    if (user.avatar) {
      // Fiziksel dosyayı sil (eğer local sistemde ise)
      if (user.avatar.startsWith("/uploads/avatars/")) {
        const imagePath = path.join(__dirname, "../../", user.avatar);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Avatar alanını null yap
      user.avatar = null;
      await user.save();
    }

    res.json({ msg: "Avatar başarıyla silindi" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/users/me
// @desc    Kullanıcı bilgilerini getir
// @access  Özel
router.get("/me", auth, async (req, res) => {
  try {
    // Kullanıcıyı rollerini dahil ederek çekelim
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(400).json({ msg: "Kullanıcı bulunamadı" });
    }

    // Avatar URL'sini düzenleme (gerekirse)
    if (user.avatar && !user.avatar.startsWith("http")) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      user.avatar = `${baseUrl}${user.avatar}`;
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

module.exports = router;
