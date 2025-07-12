const express = require("express");
const router = express.Router();

/**
 * @route   GET api/status
 * @desc    API sağlık kontrolü
 * @access  Genel
 */
router.get("/", (req, res) => {
  try {
    res.status(200).json({
      status: "online",
      message: "API çalışıyor",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (err) {
    const errMsg = "Sağlık kontrolü sırasında hata oluştu";
    console.error(errMsg, err.message);
    res.status(500).json({
      status: "error",
      message: errMsg,
      error: err.message,
    });
  }
});

module.exports = router;
