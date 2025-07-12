const express = require("express");
const router = express.Router();

// @route   GET api/health
// @desc    API sağlık kontrolü
// @access  Genel
router.get("/", (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "API çalışıyor",
      timestamp: new Date(),
      uptime: process.uptime(),
    });
  } catch (err) {
    console.error("Sağlık kontrolü sırasında hata:", err.message);
    res.status(500).json({
      status: "error",
      message: "API sağlık kontrolü başarısız",
      error: err.message,
    });
  }
});

// @route   HEAD api/health
// @desc    API sağlık kontrolü (başlık kontrolü)
// @access  Genel
router.head("/", (req, res) => {
  try {
    res.status(200).end();
  } catch (err) {
    console.error("Sağlık kontrolü sırasında hata:", err.message);
    res.status(500).end();
  }
});

module.exports = router;
