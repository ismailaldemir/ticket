import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from "@mui/icons-material";
import {
  getToplantiById,
  addToplanti,
  updateToplanti,
  clearCurrentToplanti,
} from "../../redux/toplanti/toplantiSlice";
import { toast } from "react-toastify";

const ToplantiForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { toplanti, loading, error } = useSelector((state) => state.toplanti);

  const [formData, setFormData] = useState({
    toplantiTuru: "Planlı Toplantı",
    aciklama: "",
    tarih: new Date().toISOString().split("T")[0], // Bugünün tarihi
    baslamaSaati: "10:00",
    bitisSaati: "12:00",
    oturumNo: "",
    toplantiYeri: "",
    gundem: "",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});

  // Gerekli verileri yükle
  useEffect(() => {
    // Düzenleme modu için toplantı verisini getir
    if (id) {
      dispatch(getToplantiById(id));
    } else {
      dispatch(clearCurrentToplanti());
    }

    // Component unmount olduğunda toplantı verisini temizle
    return () => {
      dispatch(clearCurrentToplanti());
    };
  }, [id, dispatch]);

  // Eğer düzenleme modundaysak ve toplantı verisi yüklendiyse formu doldur
  useEffect(() => {
    if (id && toplanti) {
      const toplantiBilgileri = {
        toplantiTuru: toplanti.toplantiTuru || "Planlı Toplantı",
        aciklama: toplanti.aciklama || "",
        tarih: toplanti.tarih
          ? new Date(toplanti.tarih).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        baslamaSaati: toplanti.baslamaSaati || "10:00",
        bitisSaati: toplanti.bitisSaati || "12:00",
        oturumNo: toplanti.oturumNo || "",
        toplantiYeri: toplanti.toplantiYeri || "",
        gundem: toplanti.gundem || "",
        isActive: toplanti.isActive !== undefined ? toplanti.isActive : true,
      };

      setFormData(toplantiBilgileri);
    }
  }, [id, toplanti]);

  // Form doğrulama
  const validateForm = () => {
    const errors = {};

    if (!formData.tarih) {
      errors.tarih = "Tarih gereklidir";
    }

    if (!formData.baslamaSaati) {
      errors.baslamaSaati = "Başlama saati gereklidir";
    }

    if (!formData.bitisSaati) {
      errors.bitisSaati = "Bitiş saati gereklidir";
    }

    if (!formData.toplantiYeri) {
      errors.toplantiYeri = "Toplantı yeri gereklidir";
    }

    // Başlama saati bitiş saatinden önce olmalı
    if (formData.baslamaSaati && formData.bitisSaati) {
      if (formData.baslamaSaati >= formData.bitisSaati) {
        errors.bitisSaati = "Bitiş saati başlama saatinden sonra olmalıdır";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Hata varsa temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Lütfen gerekli alanları doldurunuz.");
      return;
    }

    try {
      if (id) {
        // Güncelleme
        await dispatch(updateToplanti({ id, toplantiData: formData })).unwrap();
        toast.success("Toplantı başarıyla güncellendi"); // Toast mesajı burada gösteriliyor
        navigate(`/toplantilar/detay/${id}`);
      } else {
        // Yeni ekle
        const yeniToplanti = await dispatch(addToplanti(formData)).unwrap();
        toast.success("Toplantı başarıyla eklendi"); // Toast mesajı burada gösteriliyor
        navigate(`/toplantilar/detay/${yeniToplanti._id}`);
      }
    } catch (error) {
      console.error("Toplantı kayıt hatası:", error);
      // Spesifik hata mesajları göster
      if (error.msg) {
        toast.error(error.msg);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1">
          {id ? "Toplantı Düzenle" : "Yeni Toplantı Ekle"}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/toplantilar")}
        >
          Geri Dön
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {typeof error === "string"
            ? error
            : error?.msg || error?.message || JSON.stringify(error) || "Bir hata oluştu"}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Toplantı Türü</InputLabel>
                <Select
                  name="toplantiTuru"
                  value={formData.toplantiTuru}
                  onChange={handleChange}
                  label="Toplantı Türü"
                >
                  <MenuItem value="Planlı Toplantı">Planlı Toplantı</MenuItem>
                  <MenuItem value="Olağanüstü Toplantı">
                    Olağanüstü Toplantı
                  </MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Tarih*"
                name="tarih"
                type="date"
                value={formData.tarih}
                onChange={handleChange}
                required
                error={!!formErrors.tarih}
                helperText={formErrors.tarih}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end">
                        <CalendarIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Oturum No"
                name="oturumNo"
                value={formData.oturumNo}
                onChange={handleChange}
                placeholder="Örn: 2023/5"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Başlama Saati*"
                name="baslamaSaati"
                type="time"
                value={formData.baslamaSaati}
                onChange={handleChange}
                required
                error={!!formErrors.baslamaSaati}
                helperText={formErrors.baslamaSaati}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }} // 5 dakika artırmalar halinde
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end">
                        <AccessTimeIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Bitiş Saati*"
                name="bitisSaati"
                type="time"
                value={formData.bitisSaati}
                onChange={handleChange}
                required
                error={!!formErrors.bitisSaati}
                helperText={formErrors.bitisSaati}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }} // 5 dakika artırmalar halinde
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end">
                        <AccessTimeIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Toplantı Yeri*"
                name="toplantiYeri"
                value={formData.toplantiYeri}
                onChange={handleChange}
                required
                error={!!formErrors.toplantiYeri}
                helperText={formErrors.toplantiYeri}
                placeholder="Örn: Toplantı Salonu 1"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end">
                        <LocationOnIcon />
                      </IconButton>
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
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Toplantı hakkında kısa açıklama..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Gündem"
                name="gundem"
                value={formData.gundem}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="Toplantı gündemi buraya yazılabilir..."
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      sx={{ alignSelf: "flex-start", mt: 1 }}
                    >
                      <AssignmentTurnedInIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Aktif"
              />
            </Grid>

            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
            >
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {id && (
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            * Toplantı kararlarını ve katılımcılarını eklemek için önce temel
            bilgileri kaydedin. Detaylar için toplantı detay sayfasını kullanın.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ToplantiForm;
