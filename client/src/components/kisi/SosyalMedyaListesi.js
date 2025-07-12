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
  Avatar,
  Link,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Public as PublicIcon,
  Language as LanguageIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Link as LinkIcon,
  Share as ShareIcon,
} from "@mui/icons-material";

import {
  getKisiSosyalMedya,
  addKisiSosyalMedya,
  updateKisiSosyalMedya,
  deleteKisiSosyalMedya,
} from "../../redux/kisi/kisiSlice";
import { toast } from "react-toastify";

const SosyalMedyaListesi = ({ kisiId }) => {
  const dispatch = useDispatch();
  const [hesaplar, setHesaplar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seciliHesap, setSeciliHesap] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    kullaniciAdi: "",
    url: "",
    tur: "Website",
    aciklama: "",
    durumu: "Aktif",
  });

  // Sosyal medya hesaplarını yükle
  useEffect(() => {
    const fetchSosyalMedya = async () => {
      if (kisiId) {
        try {
          setLoading(true);
          const response = await dispatch(getKisiSosyalMedya(kisiId)).unwrap();
          setHesaplar(response);
        } catch (error) {
          console.error(
            "Sosyal medya bilgileri yüklenirken bir hata oluştu:",
            error
          );
          toast.error("Sosyal medya bilgileri yüklenemedi.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSosyalMedya();
  }, [dispatch, kisiId]);

  // Hesap ekleme formunu aç
  const handleAddHesap = () => {
    setSeciliHesap(null);
    setFormData({
      kullaniciAdi: "",
      url: "",
      tur: "Website",
      aciklama: "",
      durumu: "Aktif",
    });
    setIsDialogOpen(true);
  };

  // Hesap düzenleme formunu aç
  const handleEditHesap = (hesap) => {
    setSeciliHesap(hesap);
    setFormData({
      kullaniciAdi: hesap.kullaniciAdi || "",
      url: hesap.url || "",
      tur: hesap.tur || "Website",
      aciklama: hesap.aciklama || "",
      durumu: hesap.durumu || "Aktif",
    });
    setIsDialogOpen(true);
  };

  // Silme dialog'unu aç
  const handleDeleteHesapDialog = (hesap) => {
    setSeciliHesap(hesap);
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

  // Sosyal medya hesabı kaydetme/güncelleme
  const handleSaveHesap = async () => {
    try {
      setLoading(true);

      if (!formData.kullaniciAdi.trim()) {
        toast.error("Kullanıcı adı/hesap ismi boş olamaz");
        return;
      }

      if (seciliHesap) {
        // Güncelleme
        const response = await dispatch(
          updateKisiSosyalMedya({
            kisiId,
            sosyalMedyaId: seciliHesap._id,
            sosyalMedyaData: formData,
          })
        ).unwrap();

        setHesaplar(
          hesaplar.map((h) => (h._id === seciliHesap._id ? response : h))
        );
        toast.success("Sosyal medya bilgisi güncellendi");
      } else {
        const response = await dispatch(
          addKisiSosyalMedya({
            kisiId,
            sosyalMedyaData: formData,
          })
        ).unwrap();

        setHesaplar([response, ...hesaplar]);
        toast.success("Sosyal medya bilgisi eklendi.");
      }

      setIsDialogOpen(false);
      setSeciliHesap(null);
    } catch (error) {
      console.error("Sosyal medya kaydedilirken hata:", error);
      toast.error(error.msg || "Sosyal medya kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  // Sosyal medya hesabı silme
  const handleDeleteHesap = async () => {
    if (!seciliHesap) return;

    try {
      setLoading(true);
      await dispatch(
        deleteKisiSosyalMedya({
          kisiId,
          sosyalMedyaId: seciliHesap._id,
        })
      ).unwrap();

      setHesaplar(hesaplar.filter((h) => h._id !== seciliHesap._id));
      toast.success("Sosyal medya bilgisi silindi");
      setIsDeleteDialogOpen(false);
      setSeciliHesap(null);
    } catch (error) {
      console.error("Sosyal medya silinirken hata:", error);
      toast.error(error.msg || "Sosyal medya silinemedi");
    } finally {
      setLoading(false);
    }
  };

  // Sosyal medya türüne göre ikon ve renk belirleme
  const getSocialMediaInfo = (type) => {
    switch (type) {
      case "Facebook":
        return { icon: <FacebookIcon />, color: "#1877F2" };
      case "Twitter":
        return { icon: <TwitterIcon />, color: "#1DA1F2" };
      case "Instagram":
        return { icon: <InstagramIcon />, color: "#E4405F" };
      case "LinkedIn":
        return { icon: <LinkedInIcon />, color: "#0A66C2" };
      case "YouTube":
        return { icon: <YouTubeIcon />, color: "#FF0000" };
      case "Website":
        return { icon: <LanguageIcon />, color: "#2196F3" };
      default:
        return { icon: <PublicIcon />, color: "#757575" };
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
        <Typography variant="h6">Sosyal Medya Hesapları</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddHesap}
          size="small"
        >
          Yeni Hesap
        </Button>
      </Box>

      {loading && hesaplar.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <List sx={{ bgcolor: "background.paper" }}>
            {hesaplar.map((hesap) => {
              const { icon, color } = getSocialMediaInfo(hesap.tur);
              return (
                <Box key={hesap._id}>
                  <ListItem
                    secondaryAction={
                      <Box>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleEditHesap(hesap)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteHesapDialog(hesap)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <Avatar
                      sx={{
                        bgcolor: color,
                        mr: 2,
                        width: 36,
                        height: 36,
                      }}
                    >
                      {icon}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body1">
                            {hesap.kullaniciAdi}
                          </Typography>
                          <Chip label={hesap.tur} size="small" />
                          {hesap.durumu === "Pasif" && (
                            <Chip label="Pasif" size="small" color="error" />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          {hesap.url && (
                            <Link
                              href={
                                hesap.url.startsWith("http")
                                  ? hesap.url
                                  : `https://${hesap.url}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mt: 0.5,
                              }}
                            >
                              <LinkIcon fontSize="small" />
                              {hesap.url}
                            </Link>
                          )}
                          {hesap.aciklama && (
                            <Typography variant="caption" display="block">
                              {hesap.aciklama}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </Box>
              );
            })}
            {hesaplar.length === 0 && (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ py: 2, textAlign: "center" }}
              >
                Henüz sosyal medya hesabı eklenmemiş.
              </Typography>
            )}
          </List>
        </>
      )}

      {/* Sosyal Medya Ekle/Düzenle Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {seciliHesap
            ? "Sosyal Medya Düzenle"
            : "Yeni Sosyal Medya Hesabı Ekle"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Sosyal Medya Türü</InputLabel>
                <Select
                  name="tur"
                  value={formData.tur}
                  onChange={handleFormChange}
                  label="Sosyal Medya Türü"
                >
                  <MenuItem value="Website">Website</MenuItem>
                  <MenuItem value="Facebook">Facebook</MenuItem>
                  <MenuItem value="Twitter">Twitter</MenuItem>
                  <MenuItem value="Instagram">Instagram</MenuItem>
                  <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                  <MenuItem value="YouTube">YouTube</MenuItem>
                  <MenuItem value="TikTok">TikTok</MenuItem>
                  <MenuItem value="Pinterest">Pinterest</MenuItem>
                  <MenuItem value="Snapchat">Snapchat</MenuItem>
                  <MenuItem value="Reddit">Reddit</MenuItem>
                  <MenuItem value="Telegram">Telegram</MenuItem>
                  <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                  <MenuItem value="Discord">Discord</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kullanıcı Adı / Hesap İsmi"
                name="kullaniciAdi"
                value={formData.kullaniciAdi}
                onChange={handleFormChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ShareIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL"
                name="url"
                value={formData.url}
                onChange={handleFormChange}
                placeholder="https://example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
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

            <Grid item xs={12}>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleSaveHesap}
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
        <DialogTitle>Sosyal Medya Hesabını Sil</DialogTitle>
        <DialogContent>
          <Typography>
            {seciliHesap &&
              `"${seciliHesap.kullaniciAdi}" hesabını silmek istediğinize emin misiniz?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleDeleteHesap}
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

export default SosyalMedyaListesi;
