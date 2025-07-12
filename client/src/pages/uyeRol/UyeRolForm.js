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
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import {
  getUyeRolById,
  addUyeRol,
  updateUyeRol,
  clearCurrentUyeRol,
} from "../../redux/uyeRol/uyeRolSlice";

const UyeRolForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { uyeRol, loading, error } = useSelector((state) => state.uyeRol);

  const [formData, setFormData] = useState({
    ad: "",
    aciklama: "",
    aylıkUcrettenMuaf: false,
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});

  // Düzenleme işlemi için veri yükle
  useEffect(() => {
    if (id) {
      dispatch(getUyeRolById(id));
    } else {
      dispatch(clearCurrentUyeRol());
    }

    // Bileşen temizlendiğinde rol verisini temizle
    return () => {
      dispatch(clearCurrentUyeRol());
    };
  }, [dispatch, id]);

  // Redux'tan gelen rol verisi ile formu doldur
  useEffect(() => {
    if (uyeRol && id) {
      setFormData({
        ad: uyeRol.ad || "",
        aciklama: uyeRol.aciklama || "",
        aylıkUcrettenMuaf: uyeRol.aylıkUcrettenMuaf || false,
        isActive: uyeRol.isActive !== undefined ? uyeRol.isActive : true,
      });
    }
  }, [uyeRol, id]);

  const validateForm = () => {
    const errors = {};
    if (!formData.ad) errors.ad = "Rol adı gereklidir";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Hata varsa temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleSwitchChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (id) {
        // Güncelleme işlemi
        await dispatch(updateUyeRol({ id, uyeRolData: formData })).unwrap();
        navigate("/uye-roller");
      } else {
        // Yeni ekleme işlemi
        await dispatch(addUyeRol(formData)).unwrap();
        navigate("/uye-roller");
      }
    } catch (err) {
      // Hata durumu Redux slice'ta işleniyor
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/uye-roller")}
          sx={{ mr: 2 }}
        >
          Geri
        </Button>
        <Typography variant="h5" component="h1">
          {id ? "Üye Rolü Düzenle" : "Yeni Üye Rolü Ekle"}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {typeof error === "string"
            ? error
            : error?.msg || error?.message || JSON.stringify(error) || "Bir hata oluştu"}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Rol Adı"
                  name="ad"
                  value={formData.ad}
                  onChange={handleChange}
                  required
                  error={!!formErrors.ad}
                  helperText={formErrors.ad}
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
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Özel Ayarlar
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.aylıkUcrettenMuaf}
                      onChange={handleSwitchChange}
                      name="aylıkUcrettenMuaf"
                    />
                  }
                  label="Aylık Ücretten Muaf"
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 0.5 }}
                >
                  Bu role sahip üyelere aylık ücret borçları tanımlanmaz
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleSwitchChange}
                      name="isActive"
                    />
                  }
                  label="Aktif"
                />
              </Grid>

              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {id ? "Güncelle" : "Kaydet"}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default UyeRolForm;
