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
  FormControlLabel,
  Switch,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

import {
  getEmailsByKisi,
  getEmailsByOrganizasyon,
  getEmailsBySube,
  addEmail,
  updateEmail,
  deleteEmail,
} from "../../redux/email/emailSlice";
import { toast } from "react-toastify";

// E-posta Listesi Bileşeni
const EmailListesi = ({
  referansTur,
  referansId,
  emails = [],
  loading = false,
}) => {
  const dispatch = useDispatch();

  // Form durumları
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [seciliEmail, setSeciliEmail] = useState(null);
  const [formData, setFormData] = useState({
    emailAdresi: "",
    tur: "İş",
    aciklama: "",
    varsayilan: false,
    durumu: "Aktif",
    dogrulandi: false,
  });

  // Veri yükleme
  useEffect(() => {
    if (referansTur && referansId) {
      loadEmails();
    }
  }, [referansTur, referansId]);

  // E-posta adreslerini yükle
  const loadEmails = () => {
    if (referansTur === "Kisi") {
      dispatch(getEmailsByKisi(referansId));
    } else if (referansTur === "Organizasyon") {
      dispatch(getEmailsByOrganizasyon(referansId));
    } else if (referansTur === "Sube") {
      dispatch(getEmailsBySube(referansId));
    }
  };

  // Form değişikliklerini takip et
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "varsayilan" || name === "dogrulandi") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // E-posta ekleme formunu aç
  const handleAddEmail = () => {
    setSeciliEmail(null);
    setFormData({
      emailAdresi: "",
      tur: "İş",
      aciklama: "",
      varsayilan: false,
      durumu: "Aktif",
      dogrulandi: false,
    });
    setIsDialogOpen(true);
  };

  // E-posta düzenleme formunu aç
  const handleEditEmail = (email) => {
    setSeciliEmail(email);
    setFormData({
      emailAdresi: email.emailAdresi || "",
      tur: email.tur || "İş",
      aciklama: email.aciklama || "",
      varsayilan: email.varsayilan || false,
      durumu: email.durumu || "Aktif",
      dogrulandi: email.dogrulandi || false,
    });
    setIsDialogOpen(true);
  };

  // Silme dialog'unu aç
  const handleDeleteEmailDialog = (email) => {
    setSeciliEmail(email);
    setIsDeleteDialogOpen(true);
  };

  // E-posta ekle veya güncelle
  const handleSaveEmail = async () => {
    if (!formData.emailAdresi.trim()) {
      toast.warning("E-posta adresi gereklidir");
      return;
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailAdresi)) {
      toast.warning("Geçerli bir e-posta adresi giriniz");
      return;
    }

    try {
      if (seciliEmail) {
        // Güncelleme
        await dispatch(
          updateEmail({ id: seciliEmail._id, emailData: formData })
        ).unwrap();
      } else {
        // Ekleme
        await dispatch(
          addEmail({
            ...formData,
            referansTur,
            referansId,
          })
        ).unwrap();
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error.msg || "E-posta bilgisi kaydedilirken bir hata oluştu");
    }
  };

  // E-posta sil
  const handleDeleteEmail = async () => {
    if (seciliEmail) {
      try {
        await dispatch(deleteEmail(seciliEmail._id)).unwrap();
        setIsDeleteDialogOpen(false);
        setSeciliEmail(null);
      } catch (error) {
        toast.error(error.msg || "E-posta silinirken bir hata oluştu");
      }
    }
  };

  // Durumuna göre renk döndür
  const getDurumuChipColor = (durumu) => {
    switch (durumu) {
      case "Aktif":
        return "success";
      case "Pasif":
        return "error";
      case "Doğrulanmamış":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "center",
        }}
      >
        <Typography
          variant="h6"
          component="h3"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <EmailIcon color="primary" sx={{ mr: 1 }} />
          E-posta Adresleri
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddEmail}
        >
          Yeni Ekle
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : emails.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
        >
          <Typography color="textSecondary">
            Henüz e-posta adresi eklenmemiş
          </Typography>
        </Box>
      ) : (
        <List sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
          {emails.map((email, index) => (
            <React.Fragment key={email._id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <Box>
                    <Tooltip title="Düzenle">
                      <IconButton
                        edge="end"
                        onClick={() => handleEditEmail(email)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteEmailDialog(email)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Typography
                        component="span"
                        variant="body1"
                        color="text.primary"
                      >
                        {email.emailAdresi}
                      </Typography>
                      {email.varsayilan && (
                        <Chip
                          icon={<CheckIcon />}
                          label="Varsayılan"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      <Chip label={email.tur} size="small" color="default" />
                      <Chip
                        label={email.durumu}
                        size="small"
                        color={getDurumuChipColor(email.durumu)}
                      />
                      {email.dogrulandi && (
                        <Chip
                          label="Doğrulanmış"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {email.aciklama}
                    </Typography>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      {/* E-posta Ekle/Düzenle Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {seciliEmail
            ? "E-posta Adresini Düzenle"
            : "Yeni E-posta Adresi Ekle"}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              fullWidth
              label="E-posta Adresi"
              name="emailAdresi"
              type="email"
              value={formData.emailAdresi}
              onChange={handleFormChange}
              required
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Tür</InputLabel>
              <Select
                name="tur"
                value={formData.tur}
                onChange={handleFormChange}
                label="Tür"
              >
                <MenuItem value="Kişisel">Kişisel</MenuItem>
                <MenuItem value="İş">İş</MenuItem>
                <MenuItem value="Bilgi">Bilgi</MenuItem>
                <MenuItem value="Destek">Destek</MenuItem>
                <MenuItem value="Genel">Genel</MenuItem>
                <MenuItem value="Diğer">Diğer</MenuItem>
              </Select>
            </FormControl>

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
                <MenuItem value="Doğrulanmamış">Doğrulanmamış</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Açıklama"
              name="aciklama"
              value={formData.aciklama}
              onChange={handleFormChange}
              multiline
              rows={2}
              margin="normal"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.varsayilan}
                  onChange={handleFormChange}
                  name="varsayilan"
                  color="primary"
                />
              }
              label="Varsayılan E-posta Adresi"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.dogrulandi}
                  onChange={handleFormChange}
                  name="dogrulandi"
                  color="primary"
                />
              }
              label="E-posta Doğrulandı"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSaveEmail} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* E-posta Silme Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>E-posta Adresini Sil</DialogTitle>
        <DialogContent>
          <Typography>
            {seciliEmail?.emailAdresi} adresini silmek istediğinize emin
            misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleDeleteEmail} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailListesi;
