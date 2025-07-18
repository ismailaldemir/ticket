const express = require('express');
const router = express.Router();
const Talep = require('../../models/Talep');

// Tüm talepleri listele
router.get('/', async (req, res) => {
  try {
    const talepler = await Talep.findAll();
    res.json(talepler);
  } catch (err) {
    res.status(500).json({ error: 'Talepler alınamadı.' });
  }
});

// Yeni talep oluştur
router.post('/', async (req, res) => {
  try {
    const talep = await Talep.create(req.body);
    res.status(201).json(talep);
  } catch (err) {
    res.status(400).json({ error: 'Talep oluşturulamadı.' });
  }
});

// Talep güncelle
router.put('/:id', async (req, res) => {
  try {
    const talep = await Talep.findByPk(req.params.id);
    if (!talep) return res.status(404).json({ error: 'Talep bulunamadı.' });
    await talep.update(req.body);
    res.json(talep);
  } catch (err) {
    res.status(400).json({ error: 'Talep güncellenemedi.' });
  }
});

// Talep sil
router.delete('/:id', async (req, res) => {
  try {
    const talep = await Talep.findByPk(req.params.id);
    if (!talep) return res.status(404).json({ error: 'Talep bulunamadı.' });
    await talep.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Talep silinemedi.' });
  }
});

module.exports = router;
