const express = require("express");
const router = express.Router();
const AuditLog = require("../../models/AuditLog");
const { auth, yetkiKontrol } = require("../../middleware");
const logger = require("../../utils/logger");

// @route   GET api/auditlogs
// @desc    Tüm audit logları getir (filtreleme ve pagination ile)
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("auditlogs_goruntuleme"),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Filtreleme parametreleri
      const {
        action,
        resource,
        userId,
        startDate,
        endDate,
        search,
        sortBy,
        sortDirection,
      } = req.query;

      // Sorgu oluştur
      let query = {};

      // İşlem türüne göre filtreleme
      if (action) {
        query.action = action;
      }

      // Kaynak türüne göre filtreleme
      if (resource) {
        query.resource = resource;
      }

      // Kullanıcıya göre filtreleme
      if (userId) {
        query.user = Types.ObjectId.isValid(userId) ? userId : null;
      }

      // Tarih aralığına göre filtreleme
      if (startDate || endDate) {
        query.timestamp = {};

        if (startDate) {
          query.timestamp.$gte = new Date(startDate);
        }

        if (endDate) {
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          query.timestamp.$lte = endDateTime;
        }
      }

      // Metin araması
      if (search) {
        query.$or = [
          { resource: { $regex: search, $options: "i" } },
          { action: { $regex: search, $options: "i" } },
          { "details.path": { $regex: search, $options: "i" } },
        ];
      }

      // Sıralama seçenekleri
      const sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortDirection === "desc" ? -1 : 1;
      } else {
        sortOptions.timestamp = -1; // Varsayılan olarak en yeni kayıtlar önce
      }

      // Toplam kayıt sayısını hesapla
      const total = await AuditLog.countDocuments(query);

      // Logları getir
      const auditlogs = await AuditLog.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("user", "name email") // Kullanıcı bilgilerini getir
        .lean();

      // Sayfa bilgilerini hazırla
      const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };

      res.json({ auditlogs, pagination });
    } catch (err) {
      logger.error("Audit loglar getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/auditlogs/actions
// @desc    Tüm benzersiz işlem türlerini getir
// @access  Özel
router.get(
  "/actions",
  auth,
  yetkiKontrol("auditlogs_goruntuleme"),
  async (req, res) => {
    try {
      const actions = await AuditLog.distinct("action");
      res.json(actions);
    } catch (err) {
      logger.error("İşlem türleri getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/auditlogs/resources
// @desc    Tüm benzersiz kaynak türlerini getir
// @access  Özel
router.get(
  "/resources",
  auth,
  yetkiKontrol("auditlogs_goruntuleme"),
  async (req, res) => {
    try {
      const resources = await AuditLog.distinct("resource");
      res.json(resources);
    } catch (err) {
      logger.error("Kaynak türleri getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
