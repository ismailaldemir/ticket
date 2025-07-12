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
} from "@mui/material";
import {
  Add as AddIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Call as CallIcon,
} from "@mui/icons-material";

import {
  getKisiTelefonlar,
  addKisiTelefon,
  updateKisiTelefon,
  deleteKisiTelefon,
} from "../../redux/kisi/kisiSlice";
import { toast } from "react-toastify";

const TelefonListesi = ({ kisiId }) => {
  const dispatch = useDispatch();
  const [telefonlar, setTelefonlar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seciliTelefon, setSeciliTelefon] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    telefonNumarasi: "",
    tur: "İş",
    aciklama: "",
    durumu: "Aktif",
  });

  // Telefonları yükle
  useEffect(() => {
    const fetchTelefonlar = async () => {
      if (kisiId) {
        try {
          setLoading(true);
          const response = await dispatch(getKisiTelefonlar(kisiId)).unwrap();
          setTelefonlar(response);
        } catch (error) {
          console.error(
            "Telefon bilgileri yüklenirken bir hata oluştu:",
            error
          );
          toast.error("Telefon bilgileri yüklenemedi.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTelefonlar();
  }, [dispatch, kisiId]);

  // Telefon ekleme formunu aç
  const handleAddTelefon = () => {
    setSeciliTelefon(null);
    setFormData({
      telefonNumarasi: "",
      tur: "İş",
      aciklama: "",
      durumu: "Aktif",
    });
    setIsDialogOpen(true);
  };

  // Telefon düzenleme formunu aç
  const handleEditTelefon = (telefon) => {
    setSeciliTelefon(telefon);
    setFormData({
      telefonNumarasi: telefon.telefonNumarasi || "",
      tur: telefon.tur || "İş",
      aciklama: telefon.aciklama || "",
      durumu: telefon.durumu || "Aktif",
    });
    setIsDialogOpen(true);
  };

  // Silme dialog'unu aç
  const handleDeleteTelefonDialog = (telefon) => {
    setSeciliTelefon(telefon);
    setIsDeleteDialogOpen(true);
  };

  // Form değişikliği işle
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Telefon kaydetme/güncelleme
  const handleSaveTelefon = async () => {
    try {
      setLoading(true);

      // Form validasyonu
      if (!formData.telefonNumarasi.trim()) {
        toast.error("Telefon numarası boş olamaz");
        return;
      }

      if (seciliTelefon) {
        // Güncelleme işlemi
        const updatedData = {
          ...formData,
          referansId: kisiId,
          referansTur: "Kisi",
        };

        const result = await dispatch(
          updateKisiTelefon({
            id: seciliTelefon._id,
            telefonData: updatedData,
          })
        ).unwrap();

        // Listeyi güncelle
        setTelefonlar(
          telefonlar.map((tel) =>
            tel._id === seciliTelefon._id ? result : tel
          )
        );

        toast.success("Telefon bilgisi güncellendi");
      } else {
        // Yeni ekleme
        const response = await dispatch(
          addKisiTelefon({
            kisiId,
            telefonData: formData,
          })
        ).unwrap();

        // Listeyi güncelle
        setTelefonlar([response, ...telefonlar]);
        toast.success("Telefon bilgisi eklendi");
      }

      // Form ve modal durumlarını sıfırla
      handleResetForm();
    } catch (error) {
      console.error("Telefon kaydedilirken hata:", error);
      toast.error(error?.msg || "Telefon kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  // Form sıfırlama ve modal kapatma
  const handleResetForm = () => {
    setFormData({
      telefonNumarasi: "",
      tur: "İş",
      aciklama: "",
      durumu: "Aktif",
    });
    setSeciliTelefon(null);
    setIsDialogOpen(false);
  };

  // Dialog kapatma işlemi
  const handleCloseDialog = () => {
    handleResetForm();
  };

  // Telefon silme
  const handleDeleteTelefon = async () => {
    if (!seciliTelefon) return;

    try {
      setLoading(true);
      const result = await dispatch(
        deleteKisiTelefon(seciliTelefon._id)
      ).unwrap();

      if (result.success) {
        toast.success(result.msg || "Telefon başarıyla silindi");
        setIsDeleteDialogOpen(false);
        setSeciliTelefon(null);
      }
    } catch (error) {
      console.error("Telefon silinirken hata:", error);
      toast.error(error?.msg || "Telefon silinemedi");
    } finally {
      setLoading(false);
    }
  };

  // Telefon türüne göre renk belirleme
  const getTelephoneTypeColor = (type) => {
    switch (type) {
      case "İş":
        return "primary";
      case "Cep":
        return "success";
      case "Ev":
        return "info";
      case "Faks":
        return "secondary";
      case "WhatsApp":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Telefon Bilgileri</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddTelefon}
          size="small"
        >
          Yeni Telefon
        </Button>
      </Box>

      {loading && telefonlar.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <List sx={{ bgcolor: "background.paper" }}>
            {telefonlar.map((telefon) => (
              <Box key={telefon._id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditTelefon(telefon)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteTelefonDialog(telefon)}
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
                        <CallIcon color="action" fontSize="small" />
                        <Typography variant="body1">
                          {telefon.telefonNumarasi}
                        </Typography>
                        <Chip
                          label={telefon.tur}
                          variant="outlined"
                          size="small"
                          color={getTelephoneTypeColor(telefon.tur)}
                        />
                        {telefon.durumu === "Pasif" && (
                          <Chip label="Pasif" size="small" color="error" />
                        )}
                      </Box>
                    }
                    secondary={telefon.aciklama}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </Box>
            ))}
            {telefonlar.length === 0 && (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ py: 2, textAlign: "center" }}
              >
                Henüz telefon numarası eklenmemiş.
              </Typography>
            )}
          </List>
        </>
      )}

      {/* Telefon Ekle/Düzenle Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {seciliTelefon ? "Telefon Düzenle" : "Yeni Telefon Ekle"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Telefon Numarası"
              name="telefonNumarasi"
              value={formData.telefonNumarasi}
              onChange={handleFormChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Tür</InputLabel>
              <Select
                name="tur"
                value={formData.tur}
                onChange={handleFormChange}
                label="Tür"
              >
                <MenuItem value="İş">İş</MenuItem>
                <MenuItem value="Cep">Cep</MenuItem>
                <MenuItem value="Ev">Ev</MenuItem>
                <MenuItem value="Faks">Faks</MenuItem>
                <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                <MenuItem value="Diğer">Diğer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Açıklama"
              name="aciklama"
              value={formData.aciklama}
              onChange={handleFormChange}
              multiline
              rows={2}
            />

            <FormControl fullWidth margin="normal">
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button
            onClick={handleSaveTelefon}
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
        <DialogTitle>Telefon Numarasını Sil</DialogTitle>
        <DialogContent>
          <Typography>
            {seciliTelefon &&
              `"${seciliTelefon.telefonNumarasi}" numaralı telefonu silmek istediğinize emin misiniz?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleDeleteTelefon}
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

export default TelefonListesi;
