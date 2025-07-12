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

import DeleteDialog from "../../components/common/DeleteDialog";
import {
  getOrganizasyonTelefonlar,
  addOrganizasyonTelefon,
  updateOrganizasyonTelefon,
  deleteOrganizasyonTelefon,
} from "../../redux/organizasyon/organizasyonSlice";
import { toast } from "react-toastify";

const TelefonListesi = ({ organizasyonId }) => {
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
      if (organizasyonId) {
        try {
          setLoading(true);
          const response = await dispatch(
            getOrganizasyonTelefonlar(organizasyonId)
          ).unwrap();
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
  }, [dispatch, organizasyonId]);

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

      // Form doğrulama
      if (!formData.telefonNumarasi.trim()) {
        toast.error("Telefon numarası boş olamaz");
        setLoading(false);
        return;
      }

      if (seciliTelefon) {
        // Güncelleme
        await dispatch(
          updateOrganizasyonTelefon({
            id: seciliTelefon._id,
            telefonData: formData,
          })
        ).unwrap();

        // Listeyi güncelle
        setTelefonlar(
          telefonlar.map((tel) =>
            tel._id === seciliTelefon._id ? { ...tel, ...formData } : tel
          )
        );

        toast.success("Telefon bilgisi güncellendi");
        setIsDialogOpen(false); // Modal'ı kapat
        setSeciliTelefon(null); // Seçili telefonu sıfırla
      } else {
        // Yeni ekleme
        const response = await dispatch(
          addOrganizasyonTelefon({
            organizasyonId,
            telefonData: formData,
          })
        ).unwrap();

        // Listeyi güncelle
        setTelefonlar([response, ...telefonlar]);
        toast.success("Telefon bilgisi eklendi.");
      }
    } catch (error) {
      console.error("Telefon kaydedilirken hata:", error);
      toast.error(error?.msg || "Telefon kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  // Telefon silme
  const handleDeleteTelefon = async () => {
    if (!seciliTelefon) return;

    try {
      setLoading(true);
      await dispatch(deleteOrganizasyonTelefon(seciliTelefon._id)).unwrap();

      // Listeyi güncelle
      setTelefonlar(telefonlar.filter((tel) => tel._id !== seciliTelefon._id));

      toast.success("Telefon bilgisi silindi");
      setIsDeleteDialogOpen(false);
      setSeciliTelefon(null); // Seçili telefonu temizle
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
        onClose={() => setIsDialogOpen(false)}
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
          <Button onClick={() => setIsDialogOpen(false)}>İptal</Button>
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
      <DeleteDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteTelefon}
        title="Telefon Numarasını Sil"
        content={
          seciliTelefon &&
          `"${seciliTelefon.telefonNumarasi}" numaralı telefonu silmek istediğinize emin misiniz?`
        }
        loading={loading}
        confirmButtonText={loading ? "Siliniyor..." : "Sil"}
      />
    </Box>
  );
};

export default TelefonListesi;
