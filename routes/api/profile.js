const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

// User modelini dahil et
const User = require("../../models/User");

// @route   GET api/profile/me
// @desc    Geçerli kullanıcının profil bilgilerini getir
// @access  Özel
router.get("/me", auth, async (req, res) => {
  try {
    // Kullanıcıyı roller ve rollerin yetkileriyle birlikte eksiksiz çek
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          association: "roller",
          attributes: ["id", "ad", "aciklama", "isAdmin"],
          include: [
            {
              association: "yetkiler",
              attributes: ["kod", "ad", "modul", "islem"],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Bu kullanıcı için profil bulunamadı" });
    }

    // Kullanıcı objesini sadeleştir (roller ve yetkiler her zaman nesne olarak dönsün)
    const userObj = user.toObject({ virtuals: true });

    // Roller ve rollerin yetkileri her zaman dizi ve nesne olarak dönsün
    if (userObj.roller && Array.isArray(userObj.roller)) {
      userObj.roller = userObj.roller.map((rol) => ({
        ...rol,
        yetkiler: Array.isArray(rol.yetkiler)
          ? rol.yetkiler.map((y) =>
              typeof y === "object" && y !== null ? y : {}
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

// Diğer profil işlemleri için route'lar gerekirse buraya eklenebilir

module.exports = router;
