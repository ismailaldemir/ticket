const express = require('express');
const router = express.Router();
const Sube = require('../models/Sube');

// Organizasyona göre şubeleri getir
exports.getSubelerByOrganizasyon = async (req, res) => {
  try {
    const organizasyonId = req.params.organizasyonId;
    
    const subeler = await Sube.find({ organizasyon_id: organizasyonId })
      .populate('organizasyon_id', 'ad')
      .sort({ ad: 1 });
    
    res.json(subeler);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Sunucu hatası' });
  }
};

module.exports = router;