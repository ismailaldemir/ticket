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
  Switch,
  Alert,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import {
  getUcretById,
  addUcret,
  updateUcret,
  clearCurrentUcret,
} from "../../redux/ucret/ucretSlice";
import { getTarifeById } from "../../redux/tarife/tarifeSlice";
import { toast } from "react-toastify";

const UcretTarifeForm = () => {
  const { tarifeId, ucretId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentUcret,
    loading: ucretLoading,
    error: ucretError,
  } = useSelector((state) => state.ucret);
  const { currentTarife, loading: tarifeLoading } = useSelector(
    (state) => state.tarife
  );

  // Bugünün tarihini YYYY-MM-DD formatında alıyoruz
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    tutar: "",
    aciklama: "",
    birimUcret: false,
    aylıkUcret: false,
    baslangicTarihi: today,
    bitisTarihi: "",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});

  // Tarife bilgilerini yükle
  useEffect(() => {
    if (tarifeId) {
      dispatch(getTarifeById(tarifeId));
    }
  }, [dispatch, tarifeId]);

  // Düzenleme işlemi için ücret verisini yükle
  useEffect(() => {
    if (ucretId) {
      dispatch(getUcretById(ucretId));
    } else {
      dispatch(clearCurrentUcret());
    }

    return () => {
      dispatch(clearCurrentUcret());
    };
  }, [dispatch, ucretId]);

  // Tarife bilgilerinden birimUcret ve aylıkUcret değerlerini al
  useEffect(() => {
    if (currentTarife && !ucretId) {
      setFormData((prev) => ({
        ...prev,
        birimUcret: currentTarife.birimUcret || false,
        aylıkUcret: currentTarife.aylıkUcret || false,
      }));
    }
  }, [currentTarife, ucretId]);

  // Redux'tan gelen ücret verisi ile formu doldur
  useEffect(() => {
    if (currentUcret && ucretId) {
      setFormData({
        tutar: currentUcret.tutar || "",
        aciklama: currentUcret.aciklama || "",
        birimUcret: currentUcret.birimUcret || false,
        aylıkUcret: currentUcret.aylıkUcret || false,
        baslangicTarihi: currentUcret.baslangicTarihi
          ? new Date(currentUcret.baslangicTarihi).toISOString().split("T")[0]
          : today,
        bitisTarihi: currentUcret.bitisTarihi
          ? new Date(currentUcret.bitisTarihi).toISOString().split("T")[0]
          : "",
        isActive:
          currentUcret.isActive !== undefined ? currentUcret.isActive : true,
      });
    }
  }, [currentUcret, ucretId, today]);

  const validateForm = () => {
    const errors = {};

    if (!formData.tutar) {
      errors.tutar = "Tutar gereklidir";
    } else if (isNaN(formData.tutar) || parseFloat(formData.tutar) <= 0) {
      errors.tutar = "Geçerli bir tutar giriniz";
    }

    if (!formData.baslangicTarihi) {
      errors.baslangicTarihi = "Başlangıç tarihi gereklidir";
    }

    // Eğer bitiş tarihi girilmişse, başlangıç tarihinden sonra olmalı
    if (formData.bitisTarihi && formData.baslangicTarihi) {
      const baslangic = new Date(formData.baslangicTarihi);
      const bitis = new Date(formData.bitisTarihi);

      if (bitis < baslangic) {
        errors.bitisTarihi = "Bitiş tarihi başlangıç tarihinden önce olamaz";
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
      toast.error("Lütfen gerekli alanları doldurunuz");
      return;
    }

    // Tutar alanını sayıya dönüştür
    const submitData = {
      ...formData,
      tutar: parseFloat(formData.tutar),
      tarife_id: tarifeId, // Tarife ID'sini ekle
    };

    try {
      if (ucretId) {
        await dispatch(
          updateUcret({ id: ucretId, ucretData: submitData })
        ).unwrap();
        toast.success("Ücret bilgileri başarıyla güncellendi");
        navigate(`/tarifeler/detay/${tarifeId}`);
      } else {
        await dispatch(addUcret(submitData)).unwrap();
        toast.success("Ücret başarıyla eklendi");
        navigate(`/tarifeler/detay/${tarifeId}`);
      }
    } catch (err) {
      console.error("Ücret kaydedilemedi:", err);
      toast.error(err?.msg || "Ücret kaydedilemedi");
    }
  };

  // Yükleme durumu
  if (tarifeLoading) {
    return <Typography>Tarife bilgileri yükleniyor...</Typography>;
  }

  // Tarife bulunamadı durumu
  if (!currentTarife && !tarifeLoading) {
    return (
      <Alert severity="error">
        Tarife bulunamadı. Lütfen geçerli bir tarife seçin.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/tarifeler/detay/${tarifeId}`)}
          sx={{ mr: 2 }}
        >
          Geri
        </Button>
        <Typography variant="h5" component="h1">
          {currentTarife?.ad} Tarifesi İçin{" "}
          {ucretId ? "Ücret Düzenle" : "Yeni Ücret Ekle"}
        </Typography>
      </Box>

      {ucretError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {typeof ucretError === "string"
            ? ucretError
            : ucretError?.msg || ucretError?.message || JSON.stringify(ucretError) || "Bir hata oluştu"}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tutar"
                name="tutar"
                type="number"
                value={formData.tutar}
                onChange={handleChange}
                error={!!formErrors.tutar}
                helperText={formErrors.tutar}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₺</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Başlangıç Tarihi"
                name="baslangicTarihi"
                type="date"
                value={formData.baslangicTarihi}
                onChange={handleChange}
                error={!!formErrors.baslangicTarihi}
                helperText={
                  formErrors.baslangicTarihi ||
                  "Ücretin geçerli olduğu başlangıç tarihi"
                }
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bitiş Tarihi"
                name="bitisTarihi"
                type="date"
                value={formData.bitisTarihi}
                onChange={handleChange}
                error={!!formErrors.bitisTarihi}
                helperText={
                  formErrors.bitisTarihi || "Boş bırakılırsa süresiz geçerlidir"
                }
                InputLabelProps={{
                  shrink: true,
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
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Ücret Seçenekleri
              </Typography>
            </Grid>

            <Grid item xs={12}>
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

            <Grid item xs={12}>
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
              sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
            >
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={<SaveIcon />}
                disabled={ucretLoading}
              >
                {ucretId ? "Güncelle" : "Kaydet"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default UcretTarifeForm;
