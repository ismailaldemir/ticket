const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const logger = require("../../utils/logger");
const QuickAction = require("../../models/QuickAction");
const User = require("../../models/User");

// @route   GET api/quick-actions/user
// @desc    Kullanıcının hızlı işlemlerini getir
// @access  Özel
router.get("/user", auth, async (req, res) => {
  try {
    // Kullanıcıya ait hızlı işlemleri QuickAction tablosundan getir
    let quickAction = await QuickAction.findOne({ user: req.user.id });
    if (!quickAction) {
      // Kayıt yoksa boş dizi döndür
      return res.json([]);
    }
    res.json(quickAction.actions || []);
  } catch (err) {
    logger.error("Hızlı işlemler getirilirken hata oluştu", {
      error: err.message,
    });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   PUT api/quick-actions
// @desc    Kullanıcının hızlı işlemlerini güncelle
// @access  Özel
router.put("/", auth, async (req, res) => {
  try {
    const { actions } = req.body;
    if (!Array.isArray(actions)) {
      return res.status(400).json({ msg: "Geçersiz veri formatı" });
    }

    let quickAction = await QuickAction.findOne({ user: req.user.id });
    if (!quickAction) {
      quickAction = new QuickAction({
        user: req.user.id,
        actions,
      });
    } else {
      quickAction.actions = actions;
    }
    await quickAction.save();
    res.json(quickAction.actions);
  } catch (err) {
    logger.error("Hızlı işlemler güncellenirken hata oluştu", {
      error: err.message,
    });
    res.status(500).send("Sunucu hatası");
  }
});

module.exports = router;
