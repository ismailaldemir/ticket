import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
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
  Alert,
  Divider,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Code as CodeIcon,
  Category as CategoryIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  getYetkiById,
  addYetki,
  updateYetki,
  clearCurrentYetki,
  getModuller,
} from "../../redux/yetki/yetkiSlice";

const YetkiForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { yetki, moduller, loading, error } = useSelector(
    (state) => state.yetki
  );

  const isEditMode = !!id;

  // Form state'i
  const [formData, setFormData] = useState({
    kod: "",
    ad: "",
    aciklama: "",
    modul: "",
    islem: "goruntuleme",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: "info",
    message: "",
  });

  // İşlem tipleri
  const islemTipleri = [
    { value: "goruntuleme", label: "Görüntüleme" },
    { value: "ekleme", label: "Ekleme" },
    { value: "duzenleme", label: "Düzenleme" },
    { value: "silme", label: "Silme" },
    { value: "ozel", label: "Özel İşlem" },
  ];

  useEffect(() => {
    dispatch(getModuller());

    if (isEditMode) {
      dispatch(getYetkiById(id));
    }

    // Component unmount olduğunda yetki state'ini temizle
    return () => {
      dispatch(clearCurrentYetki());
    };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (yetki && isEditMode) {
      setFormData({
        kod: yetki.kod || "",
        ad: yetki.ad || "",
        aciklama: yetki.aciklama || "",
        modul: yetki.modul || "",
        islem: yetki.islem || "goruntuleme",
        isActive: yetki.isActive !== undefined ? yetki.isActive : true,
      });
    }
  }, [yetki, isEditMode]);

  useEffect(() => {
    if (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message: error.msg || "Bir hata oluştu",
      });
    }
  }, [error]);

  const validateForm = () => {
    const errors = {};

    if (!formData.kod.trim()) {
      errors.kod = "Yetki kodu gereklidir";
    } else if (!/^[A-Z0-9_]+$/.test(formData.kod)) {
      errors.kod =
        "Yetki kodu sadece büyük harf, rakam ve alt çizgi içerebilir";
    }

    if (!formData.ad.trim()) {
      errors.ad = "Yetki adı gereklidir";
    }

    if (!formData.modul) {
      errors.modul = "Modül seçimi gereklidir";
    }

    if (!formData.islem) {
      errors.islem = "İşlem tipi seçimi gereklidir";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Hata mesajını temizle
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  // Kod alanı için otomatik büyük harfe çevirme
  const handleKodChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
    setFormData((prevState) => ({
      ...prevState,
      kod: value,
    }));

    if (formErrors.kod) {
      setFormErrors((prevErrors) => ({ ...prevErrors, kod: "" }));
    }
  };

  // Modül değiştiğinde kod alanını güncelle (eğer form daha önce gönderilmediyse)
  const handleModulChange = (e) => {
    const modulValue = e.target.value;
    setFormData((prevState) => {
      // Eğer kullanıcı daha önce kod değiştirmediyse veya kod boşsa otomatik oluştur
      let newKod = prevState.kod;
      if (!newKod || !newKod.includes("_")) {
        // Modül prefix'i oluştur
        const modulPrefix = modulValue.substring(0, 3).toUpperCase();
        // İşlem tipi suffix'i oluştur
        const islemSuffix = prevState.islem.substring(0, 1).toUpperCase();
        // Yeni kod oluştur
        newKod = `${modulPrefix}_${islemSuffix}`;
      }

      return {
        ...prevState,
        modul: modulValue,
        kod: newKod,
      };
    });

    if (formErrors.modul) {
      setFormErrors((prevErrors) => ({ ...prevErrors, modul: "" }));
    }
  };

  // İşlem tipi değiştiğinde kod alanını güncelle (eğer form daha önce gönderilmediyse)
  const handleIslemChange = (e) => {
    const islemValue = e.target.value;
    setFormData((prevState) => {
      // Eğer kullanıcı daha önce kod değiştirmediyse veya kod boşsa otomatik oluştur
      let newKod = prevState.kod;
      if (!newKod || !newKod.includes("_")) {
        // Eğer modül seçilmişse kod güncelle
        if (prevState.modul) {
          const modulPrefix = prevState.modul.substring(0, 3).toUpperCase();
          const islemSuffix = islemValue.substring(0, 1).toUpperCase();
          newKod = `${modulPrefix}_${islemSuffix}`;
        }
      }

      return {
        ...prevState,
        islem: islemValue,
        kod: newKod,
      };
    });

    if (formErrors.islem) {
      setFormErrors((prevErrors) => ({ ...prevErrors, islem: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Lütfen form alanlarını kontrol ediniz.");
      return;
    }

    try {
      if (isEditMode) {
        await dispatch(updateYetki({ id, yetkiData: formData })).unwrap();
        toast.success("Yetki başarıyla güncellendi");
        navigate("/yetkiler");
      } else {
        await dispatch(addYetki(formData)).unwrap();
        toast.success("Yetki başarıyla eklendi");
        navigate("/yetkiler");
      }
    } catch (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message: error.msg || "İşlem sırasında bir hata oluştu",
      });
    }
  };

  // İşlem tipine göre chip rengi belirle
  const getIslemColor = (islem) => {
    switch (islem) {
      case "goruntuleme":
        return "info";
      case "ekleme":
        return "success";
      case "duzenleme":
        return "warning";
      case "silme":
        return "error";
      case "ozel":
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading && !yetki && isEditMode) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" component="h1">
          {isEditMode ? "Yetki Düzenle" : "Yeni Yetki Ekle"}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/yetkiler")}
        >
          Geri Dön
        </Button>
      </Box>

      <Collapse in={alertInfo.show}>
        <Alert
          severity={alertInfo.type}
          sx={{ mb: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setAlertInfo({ ...alertInfo, show: false })}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {typeof alertInfo.message === "string"
            ? alertInfo.message
            : alertInfo?.message?.msg || alertInfo?.message?.message || JSON.stringify(alertInfo.message) || "..."}
        </Alert>
      </Collapse>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Önizleme kartı */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Yetki Bilgileri
                </Typography>
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Chip
                      icon={<CodeIcon />}
                      label={formData.kod || "YETKİ_KODU"}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      icon={<CategoryIcon />}
                      label={formData.modul || "Modül"}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      icon={<SecurityIcon />}
                      label={
                        formData.islem
                          ? islemTipleri.find(
                              (tip) => tip.value === formData.islem
                            )?.label
                          : "İşlem"
                      }
                      color={getIslemColor(formData.islem)}
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      label={formData.isActive ? "Aktif" : "Pasif"}
                      color={formData.isActive ? "success" : "error"}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.modul} required>
              <InputLabel id="modul-label">Modül</InputLabel>
              <Select
                labelId="modul-label"
                id="modul"
                name="modul"
                value={formData.modul}
                onChange={handleModulChange}
                label="Modül"
              >
                <MenuItem value="">
                  <em>Seçiniz</em>
                </MenuItem>
                {moduller.map((modul) => (
                  <MenuItem key={modul} value={modul}>
                    {modul}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.modul && (
                <FormHelperText>{formErrors.modul}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.islem} required>
              <InputLabel id="islem-label">İşlem Tipi</InputLabel>
              <Select
                labelId="islem-label"
                id="islem"
                name="islem"
                value={formData.islem}
                onChange={handleIslemChange}
                label="İşlem Tipi"
              >
                {islemTipleri.map((tip) => (
                  <MenuItem key={tip.value} value={tip.value}>
                    {tip.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.islem && (
                <FormHelperText>{formErrors.islem}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Yetki Kodu"
              name="kod"
              value={formData.kod}
              onChange={handleKodChange}
              required
              error={!!formErrors.kod}
              helperText={
                formErrors.kod ||
                "Yetki kodu otomatik oluşturulur, gerekirse değiştirebilirsiniz"
              }
              inputProps={{ style: { textTransform: "uppercase" } }}
              InputProps={{
                startAdornment: (
                  <CodeIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Yetki Adı"
              name="ad"
              value={formData.ad}
              onChange={handleChange}
              required
              error={!!formErrors.ad}
              helperText={formErrors.ad}
              InputProps={{
                startAdornment: (
                  <SecurityIcon sx={{ mr: 1, color: "action.active" }} />
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
              rows={3}
              InputProps={{
                startAdornment: (
                  <DescriptionIcon
                    sx={{ mr: 1, mt: 1, color: "action.active" }}
                  />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
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
            <FormHelperText>
              Pasif yetkiler kullanıcılara atanabilir ancak uygulama içinde
              geçerli olmaz
            </FormHelperText>
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
          >
            <Button
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={() => navigate("/yetkiler")}
            >
              İptal
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              startIcon={
                loading ? <CircularProgress size={24} /> : <SaveIcon />
              }
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : isEditMode ? "Güncelle" : "Kaydet"}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default YetkiForm;
