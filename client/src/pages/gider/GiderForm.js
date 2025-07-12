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
} from "@mui/icons-material";
import {
  getGiderById,
  addGider,
  updateGider,
  clearCurrentGider,
} from "../../redux/gider/giderSlice";
import { getActiveKasalar } from "../../redux/kasa/kasaSlice";
import { toast } from "react-toastify";

const GiderForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { gider, loading, error } = useSelector((state) => state.gider);
  const { kasalar } = useSelector((state) => state.kasa);

  const [formData, setFormData] = useState({
    giderTuru: "Diğer",
    aciklama: "",
    kasa_id: "",
    tarih: new Date().toISOString().split("T")[0], // Bugünün tarihi
    belgeNo: "",
    giderYeri: "Diğer",
    odemeTuru: "Nakit",
    sonOdemeTarihi: "", // Son ödeme tarihi alanı eklendi
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});

  // Gerekli verileri yükle
  useEffect(() => {
    dispatch(getActiveKasalar());

    // Düzenleme modu için gider verisini getir
    if (id) {
      dispatch(getGiderById(id));
    } else {
      dispatch(clearCurrentGider());
    }

    // Component unmount olduğunda gider verisini temizle
    return () => {
      dispatch(clearCurrentGider());
    };
  }, [id, dispatch]);

  // Eğer düzenleme modundaysak ve gider verisi yüklendiyse formu doldur
  useEffect(() => {
    if (id && gider) {
      setFormData({
        giderTuru: gider.giderTuru || "Diğer",
        aciklama: gider.aciklama || "",
        kasa_id: gider.kasa_id?._id || "",
        tarih: gider.tarih
          ? new Date(gider.tarih).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        belgeNo: gider.belgeNo || "",
        giderYeri: gider.giderYeri || "Diğer",
        odemeTuru: gider.odemeTuru || "Nakit",
        sonOdemeTarihi: gider.sonOdemeTarihi
          ? new Date(gider.sonOdemeTarihi).toISOString().split("T")[0]
          : "",
        isActive: gider.isActive !== undefined ? gider.isActive : true,
      });
    }
  }, [id, gider]);

  // Form doğrulama
  const validateForm = () => {
    const errors = {};

    if (!formData.kasa_id) {
      errors.kasa_id = "Kasa seçimi zorunludur";
    }

    if (!formData.tarih) {
      errors.tarih = "Tarih gereklidir";
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
        await dispatch(updateGider({ id, giderData: formData })).unwrap();
        navigate(`/giderler/detay/${id}`);
      } else {
        // Yeni ekle
        const yeniGider = await dispatch(addGider(formData)).unwrap();
        navigate(`/giderler/detay/${yeniGider._id}`);
      }
    } catch (error) {
      console.error("Gider kayıt hatası:", error);
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
          {id ? "Gider Kaydını Düzenle" : "Yeni Gider Kaydı"}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/giderler")}
        >
          Geri Dön
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.msg || "Bir hata oluştu"}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth error={!!formErrors.kasa_id}>
                <InputLabel>Kasa*</InputLabel>
                <Select
                  name="kasa_id"
                  value={formData.kasa_id}
                  onChange={handleChange}
                  label="Kasa*"
                  required
                >
                  {kasalar.map((kasa) => (
                    <MenuItem key={kasa._id} value={kasa._id}>
                      {kasa.kasaAdi}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.kasa_id && (
                  <Typography color="error" variant="caption">
                    {formErrors.kasa_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Gider Türü</InputLabel>
                <Select
                  name="giderTuru"
                  value={formData.giderTuru}
                  onChange={handleChange}
                  label="Gider Türü"
                >
                  <MenuItem value="Fatura Ödemeleri">Fatura Ödemeleri</MenuItem>
                  <MenuItem value="Şahıs Ödemeleri">Şahıs Ödemeleri</MenuItem>
                  <MenuItem value="Kurum Ödemeleri">Kurum Ödemeleri</MenuItem>
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
                label="Belge No"
                name="belgeNo"
                value={formData.belgeNo}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Gider Yeri</InputLabel>
                <Select
                  name="giderYeri"
                  value={formData.giderYeri}
                  onChange={handleChange}
                  label="Gider Yeri"
                >
                  <MenuItem value="Gerçek Kişilere Borçlar">
                    Gerçek Kişilere Borçlar
                  </MenuItem>
                  <MenuItem value="Tüzel Kişilere Borçlar">
                    Tüzel Kişilere Borçlar
                  </MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Ödeme Türü</InputLabel>
                <Select
                  name="odemeTuru"
                  value={formData.odemeTuru}
                  onChange={handleChange}
                  label="Ödeme Türü"
                >
                  <MenuItem value="Nakit">Nakit</MenuItem>
                  <MenuItem value="Banka Hesabı">Banka Hesabı</MenuItem>
                  <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Son Ödeme Tarihi"
                name="sonOdemeTarihi"
                type="date"
                value={formData.sonOdemeTarihi}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Opsiyonel: Son ödeme tarihi belirlemek için seçiniz"
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
                rows={3}
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
            * Gider detaylarını eklemek veya düzenlemek için öncelikle temel
            bilgileri kaydedin. Daha sonra gider detayları sayfasında
            düzenlemelerinizi yapabilirsiniz.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default GiderForm;
