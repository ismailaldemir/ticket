import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
  Switch,
  Alert,
  Divider,
  Tooltip,
  FormGroup,
  FormControl,
  FormLabel,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  MonetizationOn as MoneyIcon,
} from "@mui/icons-material";
import {
  getTarifeById,
  addTarife,
  updateTarife,
  clearCurrentTarife,
} from "../../redux/tarife/tarifeSlice";
import { toast } from "react-toastify";

const TarifeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentTarife, loading, error } = useSelector(
    (state) => state.tarife
  );

  const [formData, setFormData] = useState({
    kod: "",
    ad: "",
    aciklama: "",
    birimUcret: false,
    aylıkUcret: false,
    kullanilabilecekAlanlar: {
      gelirler: true,
      giderler: false,
      borclar: true,
      odemeler: true,
    },
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [ucretDialogOpen, setUcretDialogOpen] = useState(false);

  // Düzenleme işlemi için veri yükle
  useEffect(() => {
    if (id) {
      dispatch(getTarifeById(id));
    } else {
      dispatch(clearCurrentTarife());
    }

    return () => {
      dispatch(clearCurrentTarife());
    };
  }, [dispatch, id]);

  // Redux'tan gelen tarife verisi ile formu doldur
  useEffect(() => {
    if (currentTarife && id) {
      setFormData({
        kod: currentTarife.kod || "",
        ad: currentTarife.ad || "",
        aciklama: currentTarife.aciklama || "",
        birimUcret: currentTarife.birimUcret || false,
        aylıkUcret: currentTarife.aylıkUcret || false,
        kullanilabilecekAlanlar: {
          gelirler:
            currentTarife.kullanilabilecekAlanlar?.gelirler !== undefined
              ? currentTarife.kullanilabilecekAlanlar.gelirler
              : true,
          giderler:
            currentTarife.kullanilabilecekAlanlar?.giderler !== undefined
              ? currentTarife.kullanilabilecekAlanlar.giderler
              : false,
          borclar:
            currentTarife.kullanilabilecekAlanlar?.borclar !== undefined
              ? currentTarife.kullanilabilecekAlanlar.borclar
              : true,
          odemeler:
            currentTarife.kullanilabilecekAlanlar?.odemeler !== undefined
              ? currentTarife.kullanilabilecekAlanlar.odemeler
              : true,
        },
        isActive:
          currentTarife.isActive !== undefined ? currentTarife.isActive : true,
      });
    }
  }, [currentTarife, id]);

  // Form doğrulama
  const validateForm = () => {
    const errors = {};

    if (!formData.kod) {
      errors.kod = "Tarife kodu gereklidir";
    } else if (formData.kod.length < 2) {
      errors.kod = "Kod en az 2 karakter olmalıdır";
    }

    if (!formData.ad) {
      errors.ad = "Tarife adı gereklidir";
    }

    // Kullanılabilecek alanlardan en az biri seçili olmalı
    const { gelirler, giderler, borclar, odemeler } =
      formData.kullanilabilecekAlanlar;
    if (!gelirler && !giderler && !borclar && !odemeler) {
      errors.kullanilabilecekAlanlar = "En az bir kullanım alanı seçmelisiniz";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Input değişikliklerini izle
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name.startsWith("kullanilabilecekAlanlar.")) {
      // Kullanılabilecek alanlar için ayrı işlem
      const alan = name.split(".")[1]; // "kullanilabilecekAlanlar.gelirler" -> "gelirler"

      setFormData({
        ...formData,
        kullanilabilecekAlanlar: {
          ...formData.kullanilabilecekAlanlar,
          [alan]: checked,
        },
      });

      // Hata varsa temizle
      if (formErrors.kullanilabilecekAlanlar) {
        setFormErrors({
          ...formErrors,
          kullanilabilecekAlanlar: "",
        });
      }
    } else if (type === "checkbox") {
      // Diğer switch/checkbox kontrollerine
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      // Text input'lar için
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
    }
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Lütfen gerekli alanları doldurunuz");
      return;
    }

    try {
      if (id) {
        await dispatch(updateTarife({ id, tarifeData: formData })).unwrap();
        toast.success("Tarife başarıyla güncellendi");

        // Tarife-ücret entegrasyonu: Eğer kullanıcı ücret tanımlamak istiyorsa
        if (ucretDialogOpen) {
          navigate(`/ucretler/tarife/${id}/ekle`);
        } else {
          navigate(`/tarifeler/detay/${id}`);
        }
      } else {
        const result = await dispatch(addTarife(formData)).unwrap();
        toast.success("Tarife başarıyla eklendi");

        // Tarife-ücret entegrasyonu: Eğer kullanıcı ücret tanımlamak istiyorsa
        if (ucretDialogOpen) {
          navigate(`/ucretler/tarife/${result._id}/ekle`);
        } else {
          navigate(`/tarifeler/detay/${result._id}`);
        }
      }
    } catch (err) {
      console.error("Tarife kaydedilemedi:", err);
      toast.error(err?.msg || "Tarife kaydedilemedi");
    }
  };

  // Ücret tanımlama penceresini aç
  const handleOpenUcretDialog = () => {
    if (id) {
      // Düzenleme modunda direkt olarak ücret formuna yönlendirme yapabiliriz
      navigate(`/ucretler/tarife/${id}/ekle`);
    } else {
      // Yeni tarife ekleme modunda önce tarifenin kaydedilmesi gerektiğini belirt
      setUcretDialogOpen(true);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/tarifeler")}
          sx={{ mr: 2 }}
        >
          Geri
        </Button>
        <Typography variant="h5" component="h1">
          {id ? "Tarife Düzenle" : "Yeni Tarife Ekle"}
        </Typography>

        {id && (
          <Tooltip title="Bu tarife için ücret tanımla">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<MoneyIcon />}
              onClick={handleOpenUcretDialog}
              sx={{ ml: "auto" }}
            >
              Ücret Tanımla
            </Button>
          </Tooltip>
        )}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tarife Kodu"
                name="kod"
                value={formData.kod}
                onChange={handleChange}
                error={!!formErrors.kod}
                helperText={formErrors.kod}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tarife Adı"
                name="ad"
                value={formData.ad}
                onChange={handleChange}
                error={!!formErrors.ad}
                helperText={formErrors.ad}
                required
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
                Ücret Seçenekleri
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.birimUcret}
                    onChange={handleChange}
                    name="birimUcret"
                  />
                }
                label="Birim Ücret"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 0.5 }}
              >
                Aktifse, miktar ile çarpılarak borç tutarı hesaplanır (örn. su
                ücreti)
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.aylıkUcret}
                    onChange={handleChange}
                    name="aylıkUcret"
                  />
                }
                label="Aylık Ücret"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 0.5 }}
              >
                Bu ücret aylık olarak tahsil edilir (Aylık ücretten muaf olan
                üyeler için borç oluşturulmaz)
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <FormControl
                component="fieldset"
                error={!!formErrors.kullanilabilecekAlanlar}
                sx={{ mt: 2 }}
              >
                <FormLabel component="legend">
                  Kullanılabilecek Alanlar
                </FormLabel>
                <FormHelperText>
                  Bu tarifenin kullanılabileceği alanları seçin (en az bir alan
                  seçilmelidir)
                </FormHelperText>
                <FormGroup>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.kullanilabilecekAlanlar.gelirler}
                            onChange={handleChange}
                            name="kullanilabilecekAlanlar.gelirler"
                          />
                        }
                        label="Gelirler"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.kullanilabilecekAlanlar.giderler}
                            onChange={handleChange}
                            name="kullanilabilecekAlanlar.giderler"
                          />
                        }
                        label="Giderler"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.kullanilabilecekAlanlar.borclar}
                            onChange={handleChange}
                            name="kullanilabilecekAlanlar.borclar"
                          />
                        }
                        label="Borçlar"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.kullanilabilecekAlanlar.odemeler}
                            onChange={handleChange}
                            name="kullanilabilecekAlanlar.odemeler"
                          />
                        }
                        label="Ödemeler"
                      />
                    </Grid>
                  </Grid>
                </FormGroup>
                {formErrors.kullanilabilecekAlanlar && (
                  <FormHelperText>
                    {formErrors.kullanilabilecekAlanlar}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                  />
                }
                label="Aktif"
              />
            </Grid>

            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Button
                variant="outlined"
                color="primary"
                startIcon={<MoneyIcon />}
                onClick={handleOpenUcretDialog}
                disabled={loading}
              >
                {id ? "Ücret Tanımla" : "Kaydet ve Ücret Tanımla"}
              </Button>

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
      </Paper>

      {/* Ücret tanımlama diyalogu - Yeni tarife için */}
      <Dialog
        open={ucretDialogOpen}
        onClose={() => setUcretDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ücret Tanımlamak İster misiniz?</DialogTitle>
        <DialogContent>
          <Typography>
            Tarife kaydedildikten sonra bu tarife için hemen ücret tanımlamak
            ister misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUcretDialogOpen(false)}>Hayır</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Evet, Devam Et
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TarifeForm;
