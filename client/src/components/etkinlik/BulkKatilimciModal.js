import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Box,
  Chip,
  CircularProgress,
  TextField,
  Alert,
  FormControlLabel,
  Switch,
  InputAdornment,
} from "@mui/material";
import {
  People as PeopleIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

/**
 * Etkinliklere toplu katılımcı eklemek için modal bileşeni
 * @param {Object} props
 * @param {boolean} props.open - Modal açık mı?
 * @param {Function} props.onClose - Modal kapatma işlevi
 * @param {Function} props.onSubmit - Seçilen katılımcıları onaylama işlevi
 * @param {Array} props.kisiler - Kişiler listesi
 * @param {Array} props.existingKisiIds - Mevcut katılımcıların ID'leri (hariç tutulacak)
 * @param {string} props.title - Modal başlığı
 */
const BulkKatilimciModal = ({
  open,
  onClose,
  onSubmit,
  kisiler = [],
  existingKisiIds = [],
  title = "Etkinliğe Toplu Katılımcı Ekle",
}) => {
  const [selectedKisiler, setSelectedKisiler] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [katilimDurumu, setKatilimDurumu] = useState("Katılacak");
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  // Mevcut katılımcıları dışlama
  useEffect(() => {
    if (open) {
      // Mevcut katılımcıları seçim listesinden çıkar
      setSelectedKisiler([]);
    }
  }, [open, existingKisiIds]);

  // Filtreleme işlevi
  const filterKisiler = () => {
    return kisiler.filter((kisi) => {
      // Aktif durum filtresi
      if (showOnlyActive && !kisi.isActive) {
        return false;
      }

      // Mevcut katılımcıları dışla
      if (existingKisiIds.includes(kisi._id)) {
        return false;
      }

      // Arama filtresi
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          kisi.ad?.toLowerCase().includes(searchLower) ||
          kisi.soyad?.toLowerCase().includes(searchLower) ||
          kisi.telefonNumarasi?.toLowerCase().includes(searchLower) ||
          kisi.email?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  };

  const filteredKisiler = filterKisiler();

  // Çoklu seçim işlevi
  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedKisiler(value);
  };

  // Tüm filtrelenen kişileri seç/kaldır
  const handleToggleAll = () => {
    if (selectedKisiler.length === filteredKisiler.length) {
      setSelectedKisiler([]);
    } else {
      setSelectedKisiler(filteredKisiler.map((kisi) => kisi._id));
    }
  };

  // Kaydet işlevi
  const handleSubmit = () => {
    setLoading(true);
    setIsError(false);

    if (selectedKisiler.length === 0) {
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      // Katılımcıları formatla ve gönder
      const katilimcilar = selectedKisiler.map((kisiId) => ({
        kisi_id: kisiId,
        katilimDurumu: katilimDurumu,
        not: "",
      }));

      onSubmit(katilimcilar);
      setLoading(false);
    } catch (error) {
      console.error("Toplu katılımcı ekleme hatası:", error);
      setIsError(true);
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PeopleIcon color="primary" />
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Lütfen en az bir katılımcı seçin
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Katılım Durumu
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Seçilen kişilerin katılım durumu</InputLabel>
            <Select
              value={katilimDurumu}
              onChange={(e) => setKatilimDurumu(e.target.value)}
              label="Seçilen kişilerin katılım durumu"
            >
              <MenuItem value="Katılacak">Katılacak</MenuItem>
              <MenuItem value="Katılmayacak">Katılmayacak</MenuItem>
              <MenuItem value="Belki">Belki</MenuItem>
              <MenuItem value="Katıldı">Katıldı</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Filtreleme Seçenekleri
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Kişi Ara"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyActive}
                  onChange={(e) => setShowOnlyActive(e.target.checked)}
                  color="primary"
                />
              }
              label="Sadece Aktif Kişiler"
            />
          </Box>
        </Box>

        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1">Kişi Seçimi</Typography>
            <Button size="small" onClick={handleToggleAll}>
              {selectedKisiler.length === filteredKisiler.length
                ? "Tümünü Kaldır"
                : "Tümünü Seç"}
            </Button>
          </Box>

          <FormControl fullWidth>
            <Select
              multiple
              value={selectedKisiler}
              onChange={handleChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${selected.length} kişi seçildi`}
                    color="primary"
                  />
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              {filteredKisiler.map((kisi) => (
                <MenuItem key={kisi._id} value={kisi._id}>
                  <Checkbox checked={selectedKisiler.indexOf(kisi._id) > -1} />
                  <ListItemText
                    primary={`${kisi.ad} ${kisi.soyad}`}
                    secondary={kisi.telefonNumarasi || kisi.email}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {filteredKisiler.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, fontStyle: "italic" }}
            >
              {searchQuery
                ? "Arama kriterlerine uygun kişi bulunamadı"
                : existingKisiIds.length > 0
                ? "Tüm kişiler zaten etkinliğe eklenmiş"
                : "Kişi listesi yüklenemedi"}
            </Typography>
          )}

          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Toplam {filteredKisiler.length} kişi listelendi,{" "}
              {selectedKisiler.length} kişi seçildi
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || selectedKisiler.length === 0}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? "Ekleniyor..." : "Katılımcıları Ekle"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkKatilimciModal;
