import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import {
  addKasa,
  getKasaById,
  updateKasa,
  clearKasaError,
} from "../../redux/kasa/kasaSlice";
import { getActiveSubeler } from "../../redux/sube/subeSlice";
import { getActiveUyeler } from "../../redux/uye/uyeSlice";
import { toast } from "react-toastify";

const KasaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { kasa, loading, error } = useSelector((state) => state.kasa);
  const { subeler } = useSelector((state) => state.sube);
  const { uyeler } = useSelector((state) => state.uye);

  const [formData, setFormData] = useState({
    sube_id: "",
    kasaAdi: "",
    sorumlu_uye_id: "",
    aciklama: "",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});

  // Sayfa yüklendiğinde şubeleri ve üyeleri getir
  useEffect(() => {
    dispatch(getActiveSubeler());
    dispatch(getActiveUyeler());

    // Component unmount olduğunda hataları temizle
    return () => {
      dispatch(clearKasaError());
    };
  }, [dispatch]);

  // Düzenleme modu için kasa verisini getir
  useEffect(() => {
    if (id) {
      dispatch(getKasaById(id));
    }
  }, [id, dispatch]);

  // Eğer düzenleme modundaysak ve kasa verisi yüklendiyse formu doldur
  useEffect(() => {
    if (id && kasa) {
      setFormData({
        sube_id: kasa.sube_id?._id || "",
        kasaAdi: kasa.kasaAdi || "",
        sorumlu_uye_id: kasa.sorumlu_uye_id?._id || "",
        aciklama: kasa.aciklama || "",
        isActive: kasa.isActive !== undefined ? kasa.isActive : true,
      });
    }
  }, [id, kasa]);

  // Form doğrulama
  const validateForm = () => {
    const errors = {};
    if (!formData.sube_id) errors.sube_id = "Şube seçimi zorunludur";
    if (!formData.kasaAdi) errors.kasaAdi = "Kasa adı zorunludur";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    // Switch için checked değerini, diğerleri için value değerini kullan
    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
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
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    try {
      if (id) {
        // Güncelleme işlemi
        await dispatch(updateKasa({ id, kasaData: formData })).unwrap();
        // Toast mesajı slice'ta gösterildiği için burada kaldırıldı
      } else {
        // Ekleme işlemi
        await dispatch(addKasa(formData)).unwrap();
        // Toast mesajı slice'ta gösterildiği için burada kaldırıldı
      }
      navigate("/kasalar");
    } catch (error) {
      // Hata mesajları slice'ta gösterildiği için burada bir şey yapmaya gerek yok
      console.error("Kasa kaydedilemedi:", error);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" component="h1">
            {id ? "Kasa Düzenle" : "Yeni Kasa Ekle"}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/kasalar")}
          >
            Geri Dön
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error.msg || "Bir hata oluştu"}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.sube_id}>
                <InputLabel id="sube-label">Şube</InputLabel>
                <Select
                  labelId="sube-label"
                  name="sube_id"
                  value={formData.sube_id}
                  onChange={handleChange}
                  label="Şube"
                  disabled={loading}
                  required
                >
                  <MenuItem value="">
                    <em>Şube Seçin</em>
                  </MenuItem>
                  {subeler?.map((sube) => (
                    <MenuItem key={sube._id} value={sube._id}>
                      {sube.ad}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.sube_id && (
                  <FormHelperText>{formErrors.sube_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kasa Adı"
                name="kasaAdi"
                value={formData.kasaAdi}
                onChange={handleChange}
                error={!!formErrors.kasaAdi}
                helperText={formErrors.kasaAdi}
                disabled={loading}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="sorumlu-uye-label">Sorumlu Üye</InputLabel>
                <Select
                  labelId="sorumlu-uye-label"
                  id="sorumlu_uye_id"
                  name="sorumlu_uye_id"
                  value={formData.sorumlu_uye_id}
                  onChange={handleChange}
                  label="Sorumlu Üye"
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {uyeler.map((uye) => (
                    <MenuItem key={uye._id} value={uye._id}>
                      {`${uye.uyeNo} - ${uye.kisi_id?.ad || ""} ${
                        uye.kisi_id?.soyad || ""
                      }`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                name="aciklama"
                value={formData.aciklama}
                onChange={handleChange}
                disabled={loading}
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
                    disabled={loading}
                  />
                }
                label="Aktif"
              />
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={
                  loading ? <CircularProgress size={20} /> : <SaveIcon />
                }
                disabled={loading}
                fullWidth
              >
                {loading ? "Kaydediliyor..." : id ? "Güncelle" : "Kaydet"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default KasaForm;
