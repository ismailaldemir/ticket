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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  Slider,
  Chip,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  // Kullanılmayan import kaldırıldı
  // Event as EventIcon,
  Flag as FlagIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import {
  getProjeById,
  addProje,
  updateProje,
  clearCurrentProje,
} from "../../redux/proje/projeSlice";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import { toast } from "react-toastify";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import trLocale from "date-fns/locale/tr";

const ProjeForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { proje, loading, error } = useSelector((state) => state.proje);
  const { kisiler } = useSelector((state) => state.kisi);

  const [formData, setFormData] = useState({
    projeAdi: "",
    aciklama: "",
    baslamaTarihi: new Date().toISOString().split("T")[0],
    bitisTarihi: "",
    durumu: "Planlandı",
    oncelik: "Orta",
    sorumluKisi_id: "",
    isActive: true,
    tamamlanmaDurumu: 0,
    etiketler: [],
  });

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    dispatch(getActiveKisiler());

    // Düzenleme modu için proje verisini getir
    if (id) {
      dispatch(getProjeById(id));
    } else {
      dispatch(clearCurrentProje());
    }

    // Component unmount olduğunda proje verisini temizle
    return () => {
      dispatch(clearCurrentProje());
    };
  }, [id, dispatch]);

  // Eğer düzenleme modundaysak ve proje verisi yüklendiyse formu doldur
  useEffect(() => {
    if (id && proje) {
      const projeBilgileri = {
        projeAdi: proje.projeAdi || "",
        aciklama: proje.aciklama || "",
        baslamaTarihi: proje.baslamaTarihi
          ? new Date(proje.baslamaTarihi).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        bitisTarihi: proje.bitisTarihi
          ? new Date(proje.bitisTarihi).toISOString().split("T")[0]
          : "",
        durumu: proje.durumu || "Planlandı",
        oncelik: proje.oncelik || "Orta",
        sorumluKisi_id: proje.sorumluKisi_id ? proje.sorumluKisi_id._id : "",
        isActive: proje.isActive !== undefined ? proje.isActive : true,
        tamamlanmaDurumu: proje.tamamlanmaDurumu || 0,
        etiketler: proje.etiketler || [],
      };

      setFormData(projeBilgileri);
    }
  }, [id, proje]);

  // Form doğrulama
  const validateForm = () => {
    const errors = {};

    if (!formData.projeAdi.trim()) {
      errors.projeAdi = "Proje adı gereklidir";
    }

    if (!formData.baslamaTarihi) {
      errors.baslamaTarihi = "Başlama tarihi gereklidir";
    }

    // Bitiş tarihi varsa ve başlangıç tarihinden önceyse hata ver
    if (formData.bitisTarihi && formData.baslamaTarihi) {
      const bitisTarihiObj = new Date(formData.bitisTarihi);
      const baslamaTarihiObj = new Date(formData.baslamaTarihi);

      if (bitisTarihiObj < baslamaTarihiObj) {
        errors.bitisTarihi = "Bitiş tarihi, başlama tarihinden önce olamaz";
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

    // Alan dokunuldu olarak işaretle
    setTouchedFields({
      ...touchedFields,
      [name]: true,
    });

    // Hata varsa temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Tarih değişikliğini güvenli şekilde işle (DatePicker için)
  const handleDateChange = (name, date) => {
    let formattedDate = "";
    if (date instanceof Date && !isNaN(date.getTime())) {
      formattedDate = date.toISOString().split("T")[0];
    }
    setFormData((prev) => ({
      ...prev,
      [name]: formattedDate,
    }));
  };

  // Tamamlanma durumu slider değişikliği
  const handleTamamlanmaChange = (e, newValue) => {
    setFormData({
      ...formData,
      tamamlanmaDurumu: newValue,
    });
  };

  // Etiket ekle/çıkar
  const [etiketInput, setEtiketInput] = useState("");

  const handleEtiketEkle = () => {
    if (
      etiketInput.trim() &&
      !formData.etiketler.includes(etiketInput.trim())
    ) {
      setFormData({
        ...formData,
        etiketler: [...formData.etiketler, etiketInput.trim()],
      });
      setEtiketInput("");
    }
  };

  const handleEtiketSil = (etiketToDelete) => {
    setFormData({
      ...formData,
      etiketler: formData.etiketler.filter(
        (etiket) => etiket !== etiketToDelete
      ),
    });
  };

  // Dokunulmuş ve geçerli olmayan alanları kontrol et
  const validateField = (name) => {
    if (!touchedFields[name]) return;

    const errors = { ...formErrors };

    switch (name) {
      case "projeAdi":
        if (!formData.projeAdi.trim()) {
          errors.projeAdi = "Proje adı gereklidir";
        } else {
          delete errors.projeAdi;
        }
        break;

      case "baslamaTarihi":
        if (!formData.baslamaTarihi) {
          errors.baslamaTarihi = "Başlama tarihi gereklidir";
        } else {
          delete errors.baslamaTarihi;
        }
        break;

      case "bitisTarihi":
        if (formData.bitisTarihi && formData.baslamaTarihi) {
          const bitisTarihiObj = new Date(formData.bitisTarihi);
          const baslamaTarihiObj = new Date(formData.baslamaTarihi);

          if (bitisTarihiObj < baslamaTarihiObj) {
            errors.bitisTarihi = "Bitiş tarihi, başlama tarihinden önce olamaz";
          } else {
            delete errors.bitisTarihi;
          }
        }
        break;

      default:
        break;
    }

    setFormErrors(errors);
  };

  // Alan dokunulduğunda validasyon kontrol et
  const handleBlur = (e) => {
    const { name } = e.target;
    validateField(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tüm alanları dokunulmuş olarak işaretle
    const allTouchedFields = {};
    Object.keys(formData).forEach((key) => {
      allTouchedFields[key] = true;
    });
    setTouchedFields(allTouchedFields);

    if (!validateForm()) {
      toast.error("Lütfen gerekli alanları doldurunuz.");
      return;
    }

    try {
      if (id) {
        // Güncelleme
        await dispatch(updateProje({ id, projeData: formData })).unwrap();
        toast.success("Proje başarıyla güncellendi");
        navigate(`/projeler/detay/${id}`);
      } else {
        // Yeni ekle
        const yeniProje = await dispatch(addProje(formData)).unwrap();
        toast.success("Proje başarıyla eklendi");
        navigate(`/projeler/detay/${yeniProje._id}`);
      }
    } catch (error) {
      console.error("Proje kayıt hatası:", error);
      toast.error(error?.msg || "Kayıt sırasında bir hata oluştu");
    }
  };

  // Durum ve öncelik chip'leri için renk belirle
  const getDurumuColor = (durumu) => {
    switch (durumu) {
      case "Planlandı":
        return "default";
      case "Devam Ediyor":
        return "primary";
      case "Tamamlandı":
        return "success";
      case "İptal Edildi":
        return "error";
      case "Durduruldu":
        return "warning";
      case "Askıya Alındı":
        return "info";
      default:
        return "default";
    }
  };

  const getOncelikColor = (oncelik) => {
    switch (oncelik) {
      case "Düşük":
        return "info";
      case "Orta":
        return "warning";
      case "Yüksek":
        return "error";
      case "Kritik":
        return "error";
      default:
        return "default";
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
          {id ? "Proje Düzenle" : "Yeni Proje Ekle"}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/projeler")}
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
        <LocalizationProvider
          dateAdapter={AdapterDateFns}
          adapterLocale={trLocale}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Güncel Durum Bilgisi */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="subtitle1">Proje Bilgileri</Typography>
                    {formData.durumu && (
                      <Chip
                        icon={<FlagIcon />}
                        label={formData.durumu}
                        color={getDurumuColor(formData.durumu)}
                        size="small"
                      />
                    )}
                    {formData.oncelik && (
                      <Chip
                        icon={<FlagIcon />}
                        label={formData.oncelik}
                        color={getOncelikColor(formData.oncelik)}
                        size="small"
                      />
                    )}
                  </Box>
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
                </Box>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Proje Adı*"
                  name="projeAdi"
                  value={formData.projeAdi}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={!!formErrors.projeAdi}
                  helperText={formErrors.projeAdi}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <DatePicker
                  label="Başlama Tarihi*"
                  value={
                    formData.baslamaTarihi
                      ? new Date(formData.baslamaTarihi)
                      : null
                  }
                  onChange={(date) => handleDateChange("baslamaTarihi", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="baslamaTarihi"
                      fullWidth
                      required
                      error={!!formErrors.baslamaTarihi}
                      helperText={formErrors.baslamaTarihi}
                      onBlur={handleBlur}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <DatePicker
                  label="Bitiş Tarihi"
                  value={
                    formData.bitisTarihi ? new Date(formData.bitisTarihi) : null
                  }
                  onChange={(date) => handleDateChange("bitisTarihi", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="bitisTarihi"
                      fullWidth
                      error={!!formErrors.bitisTarihi}
                      helperText={formErrors.bitisTarihi}
                      onBlur={handleBlur}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Sorumlu Kişi</InputLabel>
                  <Select
                    name="sorumluKisi_id"
                    value={formData.sorumluKisi_id}
                    onChange={handleChange}
                    label="Sorumlu Kişi"
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>Seçilmedi</em>
                    </MenuItem>
                    {kisiler.map((kisi) => (
                      <MenuItem key={kisi._id} value={kisi._id}>
                        {`${kisi.ad} ${kisi.soyad}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Durumu</InputLabel>
                  <Select
                    name="durumu"
                    value={formData.durumu}
                    onChange={handleChange}
                    label="Durumu"
                    startAdornment={
                      <InputAdornment position="start">
                        <FlagIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="Planlandı">Planlandı</MenuItem>
                    <MenuItem value="Devam Ediyor">Devam Ediyor</MenuItem>
                    <MenuItem value="Tamamlandı">Tamamlandı</MenuItem>
                    <MenuItem value="İptal Edildi">İptal Edildi</MenuItem>
                    <MenuItem value="Durduruldu">Durduruldu</MenuItem>
                    <MenuItem value="Askıya Alındı">Askıya Alındı</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Öncelik</InputLabel>
                  <Select
                    name="oncelik"
                    value={formData.oncelik}
                    onChange={handleChange}
                    label="Öncelik"
                    startAdornment={
                      <InputAdornment position="start">
                        <FlagIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="Düşük">Düşük</MenuItem>
                    <MenuItem value="Orta">Orta</MenuItem>
                    <MenuItem value="Yüksek">Yüksek</MenuItem>
                    <MenuItem value="Kritik">Kritik</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>
                  Tamamlanma Durumu: %{formData.tamamlanmaDurumu}
                </Typography>
                <Slider
                  value={formData.tamamlanmaDurumu}
                  onChange={handleTamamlanmaChange}
                  aria-labelledby="tamamlanma-durumu-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
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
                  placeholder="Proje hakkında açıklama..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle1">Etiketler</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {formData.etiketler.map((etiket, index) => (
                    <Chip
                      key={index}
                      label={etiket}
                      onDelete={() => handleEtiketSil(etiket)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    size="small"
                    label="Yeni Etiket"
                    value={etiketInput}
                    onChange={(e) => setEtiketInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleEtiketEkle();
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleEtiketEkle}
                    disabled={!etiketInput.trim()}
                  >
                    Ekle
                  </Button>
                </Box>
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
        </LocalizationProvider>
      </Paper>

      {id && (
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            * Proje görevlerini eklemek için proje detay sayfasını
            kullanabilirsiniz.
          </Typography>
        </Box>
      )}
    </Box>
  );
};


export default ProjeForm;