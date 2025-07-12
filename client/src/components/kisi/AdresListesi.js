import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  InputAdornment,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  Home as HomeIcon,
} from "@mui/icons-material";

import {
  getKisiAdresler,
  addKisiAdres,
  updateKisiAdres,
  deleteKisiAdres,
} from "../../redux/kisi/kisiSlice";
import { toast } from "react-toastify";
import KonumSec from "../common/KonumSec";

const AdresListesi = ({ kisiId }) => {
  const dispatch = useDispatch();
  const [adresler, setAdresler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seciliAdres, setSeciliAdres] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    adres: "",
    il: "",
    ilce: "",
    postaKodu: "",
    ulke: "Türkiye",
    tur: "İş",
    lokasyon: {
      lat: null,
      lng: null,
      adres: "",
    },
    aciklama: "",
    varsayilan: false,
    durumu: "Aktif",
  });

  // Adresleri yükle
  useEffect(() => {
    const fetchAdresler = async () => {
      if (kisiId) {
        try {
          setLoading(true);
          const response = await dispatch(getKisiAdresler(kisiId)).unwrap();
          setAdresler(response);
        } catch (error) {
          console.error("Adres bilgileri yüklenirken bir hata oluştu:", error);
          toast.error("Adres bilgileri yüklenemedi.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAdresler();
  }, [dispatch, kisiId]);

  // Adres ekleme formunu aç
  const handleAddAdres = () => {
    setSeciliAdres(null);
    setFormData({
      adres: "",
      il: "",
      ilce: "",
      postaKodu: "",
      ulke: "Türkiye",
      tur: "İş",
      lokasyon: {
        lat: null,
        lng: null,
        adres: "",
      },
      aciklama: "",
      varsayilan: false,
      durumu: "Aktif",
    });
    setIsDialogOpen(true);
  };

  // Adres düzenleme formunu aç
  const handleEditAdres = (adres) => {
    setSeciliAdres(adres);
    setFormData({
      adres: adres.adres || "",
      il: adres.il || "",
      ilce: adres.ilce || "",
      postaKodu: adres.postaKodu || "",
      ulke: adres.ulke || "Türkiye",
      tur: adres.tur || "İş",
      lokasyon: adres.lokasyon || {
        lat: null,
        lng: null,
        adres: "",
      },
      aciklama: adres.aciklama || "",
      varsayilan: adres.varsayilan || false,
      durumu: adres.durumu || "Aktif",
    });
    setIsDialogOpen(true);
  };

  // Silme dialog'unu aç
  const handleDeleteAdresDialog = (adres) => {
    setSeciliAdres(adres);
    setIsDeleteDialogOpen(true);
  };

  // Form değişikliği işle
  const handleFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Konum değişikliği işle
  const handleLocationChange = (location) => {
    setFormData((prev) => ({
      ...prev,
      lokasyon: location,
    }));
  };

  // Adres kaydetme/güncelleme
  const handleSaveAdres = async () => {
    try {
      setLoading(true);

      // Form validasyonu
      if (!formData.adres.trim()) {
        toast.error("Adres boş olamaz");
        return;
      }

      // API'ye gönderilecek veriyi hazırla
      const adresData = {
        referansId: kisiId,
        referansTur: "Kisi",
        adres: formData.adres,
        il: formData.il,
        ilce: formData.ilce,
        postaKodu: formData.postaKodu,
        ulke: formData.ulke,
        tur: formData.tur,
        lokasyon: formData.lokasyon,
        aciklama: formData.aciklama,
        varsayilan: formData.varsayilan,
        durumu: formData.durumu,
      };

      if (seciliAdres) {
        // Güncelleme işlemi
        const response = await dispatch(
          updateKisiAdres({
            id: seciliAdres._id,
            adresData,
          })
        ).unwrap();

        setAdresler(
          adresler.map((adr) => (adr._id === seciliAdres._id ? response : adr))
        );

        toast.success("Adres bilgisi güncellendi");
      } else {
        // Yeni ekleme
        const response = await dispatch(
          addKisiAdres({
            kisiId,
            adresData,
          })
        ).unwrap();

        setAdresler([response, ...adresler]);
        toast.success("Adres bilgisi eklendi");
      }

      // Formu sıfırla ve modalı kapat
      handleResetForm();
    } catch (error) {
      console.error("Adres kaydedilirken hata:", error);
      toast.error(error?.msg || "Adres kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  // Form ve modal durumlarını sıfırlama
  const handleResetForm = () => {
    setFormData({
      adres: "",
      il: "",
      ilce: "",
      postaKodu: "",
      ulke: "Türkiye",
      tur: "İş",
      lokasyon: {
        lat: null,
        lng: null,
        adres: "",
      },
      aciklama: "",
      varsayilan: false,
      durumu: "Aktif",
    });
    setSeciliAdres(null);
    setIsDialogOpen(false);
  };

  // Adres silme
  const handleDeleteAdres = async () => {
    if (!seciliAdres) return;

    try {
      setLoading(true);
      await dispatch(
        deleteKisiAdres({
          kisiId,
          adresId: seciliAdres._id,
        })
      ).unwrap();

      // Listeyi güncelle
      setAdresler(adresler.filter((adr) => adr._id !== seciliAdres._id));

      toast.success("Adres bilgisi silindi");
      setIsDeleteDialogOpen(false);
      setSeciliAdres(null);
    } catch (error) {
      console.error("Adres silinirken hata:", error);
      toast.error(error.msg || "Adres silinemedi");
    } finally {
      setLoading(false);
    }
  };

  // Adres türüne göre renk belirleme
  const getAddressTypeColor = (type) => {
    switch (type) {
      case "İş":
        return "primary";
      case "Genel Merkez":
        return "error";
      case "Şube":
        return "info";
      case "Fatura":
        return "warning";
      case "Ev":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box component="div">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationOnIcon color="primary" />
            Adres Bilgileri
          </Box>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddAdres}
          size="small"
        >
          Yeni Adres
        </Button>
      </Box>

      {loading && adresler.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <List sx={{ bgcolor: "background.paper" }}>
            {adresler.map((adres) => (
              <Box key={adres._id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditAdres(adres)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteAdresDialog(adres)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocationOnIcon color="action" fontSize="small" />
                        <Typography variant="body1" component="span">
                          {adres.adres}
                          {adres.varsayilan && (
                            <Chip
                              label="Varsayılan"
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span">
                          {adres.il && adres.ilce
                            ? `${adres.il}, ${adres.ilce}`
                            : adres.il || adres.ilce || ""}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mt: 0.5,
                            gap: 1,
                          }}
                        >
                          <Chip
                            label={adres.tur}
                            variant="outlined"
                            size="small"
                            color={getAddressTypeColor(adres.tur)}
                          />
                          {adres.durumu === "Pasif" && (
                            <Chip label="Pasif" size="small" color="error" />
                          )}
                          {adres.aciklama && (
                            <Typography variant="caption" component="span">
                              {adres.aciklama}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </Box>
            ))}
            {adresler.length === 0 && (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ py: 2, textAlign: "center" }}
              >
                Henüz adres bilgisi eklenmemiş.
              </Typography>
            )}
          </List>
        </>
      )}

      {/* Adres Ekle/Düzenle Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {seciliAdres ? "Adres Düzenle" : "Yeni Adres Ekle"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adres"
                name="adres"
                value={formData.adres}
                onChange={handleFormChange}
                required
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="İl"
                name="il"
                value={formData.il}
                onChange={handleFormChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="İlçe"
                name="ilce"
                value={formData.ilce}
                onChange={handleFormChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Posta Kodu"
                name="postaKodu"
                value={formData.postaKodu}
                onChange={handleFormChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ülke"
                name="ulke"
                value={formData.ulke}
                onChange={handleFormChange}
                defaultValue="Türkiye"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tür</InputLabel>
                <Select
                  name="tur"
                  value={formData.tur}
                  onChange={handleFormChange}
                  label="Tür"
                >
                  <MenuItem value="İş">İş</MenuItem>
                  <MenuItem value="Ev">Ev</MenuItem>
                  <MenuItem value="Fatura">Fatura</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <KonumSec
                value={formData.lokasyon}
                onChange={handleLocationChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                name="aciklama"
                value={formData.aciklama}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  name="durumu"
                  value={formData.durumu}
                  onChange={handleFormChange}
                  label="Durum"
                >
                  <MenuItem value="Aktif">Aktif</MenuItem>
                  <MenuItem value="Pasif">Pasif</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl>
                <Typography
                  component="div"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    name="varsayilan"
                    checked={formData.varsayilan}
                    onChange={handleFormChange}
                    style={{ marginRight: 8 }}
                  />
                  Varsayılan adres olarak belirle
                </Typography>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleSaveAdres}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Adres Bilgisini Sil</DialogTitle>
        <DialogContent>
          <Typography>
            {seciliAdres &&
              `"${seciliAdres.adres}" adresini silmek istediğinize emin misiniz?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleDeleteAdres}
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdresListesi;
