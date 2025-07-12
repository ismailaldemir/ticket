import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Divider,
  Chip,
  InputAdornment,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import trLocale from "date-fns/locale/tr";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Label as LabelIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import {
  getEtkinlikById,
  addEtkinlik,
  updateEtkinlik,
  clearCurrentEtkinlik,
  clearEtkinlikError,
} from "../../redux/etkinlik/etkinlikSlice";
import { getActiveOrganizasyonlar } from "../../redux/organizasyon/organizasyonSlice";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import { toast } from "react-toastify";

const EtkinlikForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { etkinlik, loading, error } = useSelector((state) => state.etkinlik);
  const { organizasyonlar } = useSelector((state) => state.organizasyon);
  const { kisiler } = useSelector((state) => state.kisi);

  const [formData, setFormData] = useState({
    etkinlikAdi: "",
    aciklama: "",
    organizasyon_id: "",
    sorumlukisi_id: "",
    baslamaTarihi: new Date().toISOString().substring(0, 10),
    bitisTarihi: "",
    baslamaSaati: "",
    bitisSaati: "",
    yer: "",
    lokasyon: { lat: null, lng: null },
    durumu: "Planlandı",
    etiketler: [],
    maksimumKatilimci: 0,
    isActive: true,
  });

  const [yeniEtiket, setYeniEtiket] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Etkinlik verilerini yükle
  useEffect(() => {
    dispatch(getActiveOrganizasyonlar());
    dispatch(getActiveKisiler());

    if (id) {
      dispatch(getEtkinlikById(id));
    } else {
      dispatch(clearCurrentEtkinlik());
    }

    return () => {
      dispatch(clearCurrentEtkinlik());
      dispatch(clearEtkinlikError());
    };
  }, [id, dispatch]);

  // Etkinlik verileri gelince formu doldur
  useEffect(() => {
    if (id && etkinlik) {
      setFormData({
        etkinlikAdi: etkinlik.etkinlikAdi || "",
        aciklama: etkinlik.aciklama || "",
        organizasyon_id: etkinlik.organizasyon_id?._id || "",
        sorumlukisi_id: etkinlik.sorumlukisi_id?._id || "",
        baslamaTarihi: etkinlik.baslamaTarihi
          ? new Date(etkinlik.baslamaTarihi).toISOString().substring(0, 10)
          : new Date().toISOString().substring(0, 10),
        bitisTarihi: etkinlik.bitisTarihi
          ? new Date(etkinlik.bitisTarihi).toISOString().substring(0, 10)
          : "",
        baslamaSaati: etkinlik.baslamaSaati || "",
        bitisSaati: etkinlik.bitisSaati || "",
        yer: etkinlik.yer || "",
        lokasyon: etkinlik.lokasyon || { lat: null, lng: null },
        durumu: etkinlik.durumu || "Planlandı",
        etiketler: etkinlik.etiketler || [],
        maksimumKatilimci: etkinlik.maksimumKatilimci || 0,
        isActive: etkinlik.isActive !== undefined ? etkinlik.isActive : true,
      });
    }
  }, [id, etkinlik]);

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error(error.msg || "Etkinlik işlemi sırasında bir hata oluştu.");
      dispatch(clearEtkinlikError());
    }
  }, [error, dispatch]);

  // Form input değişikliklerini takip et
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

  // Tarih değişikliklerini işle
  const handleDateChange = (name, date) => {
    if (!date || isNaN(date.getTime())) {
      setFormData({
        ...formData,
        [name]: "",
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: date.toISOString().substring(0, 10),
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

  // Saat değişikliklerini işle
  const handleTimeChange = (name, time) => {
    if (!time || isNaN(time.getTime())) {
      setFormData({
        ...formData,
        [name]: "",
      });
      return;
    }

    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}`;

    setFormData({
      ...formData,
      [name]: timeString,
    });

    // Alan dokunuldu olarak işaretle
    setTouchedFields({
      ...touchedFields,
      [name]: true,
    });
  };

  // Etiket ekleme
  const handleAddEtiket = () => {
    if (
      yeniEtiket.trim() !== "" &&
      !formData.etiketler.includes(yeniEtiket.trim())
    ) {
      setFormData({
        ...formData,
        etiketler: [...formData.etiketler, yeniEtiket.trim()],
      });
      setYeniEtiket("");
    }
  };

  // Etiket silme
  const handleDeleteEtiket = (etiket) => {
    setFormData({
      ...formData,
      etiketler: formData.etiketler.filter((e) => e !== etiket),
    });
  };

  // Enter tuşuna basılınca etiket ekle
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEtiket();
    }
  };

  // Form doğrulama
  const validateForm = () => {
    const errors = {};

    if (!formData.etkinlikAdi.trim()) {
      errors.etkinlikAdi = "Etkinlik adı gereklidir";
    }

    if (!formData.baslamaTarihi) {
      errors.baslamaTarihi = "Başlama tarihi gereklidir";
    }

    // Bitiş tarihi varsa ve başlangıç tarihinden önceyse
    if (
      formData.bitisTarihi &&
      formData.baslamaTarihi &&
      formData.bitisTarihi < formData.baslamaTarihi
    ) {
      errors.bitisTarihi = "Bitiş tarihi başlama tarihinden önce olamaz";
    }

    // Başlama saati ve bitiş saati aynı günde doldurulmuşsa kontrol et
    if (
      formData.baslamaTarihi &&
      formData.bitisTarihi &&
      formData.baslamaTarihi === formData.bitisTarihi
    ) {
      if (
        formData.baslamaSaati &&
        formData.bitisSaati &&
        formData.baslamaSaati > formData.bitisSaati
      ) {
        errors.bitisSaati = "Bitiş saati başlama saatinden önce olamaz";
      }
    }

    if (formData.maksimumKatilimci !== 0 && formData.maksimumKatilimci < 0) {
      errors.maksimumKatilimci =
        "Maksimum katılımcı sayısı 0 veya pozitif olmalıdır";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Alan dokunulmuş ve hata varsa göster
  const validateField = (name) => {
    if (!touchedFields[name]) return;

    const errors = { ...formErrors };

    switch (name) {
      case "etkinlikAdi":
        if (!formData.etkinlikAdi.trim()) {
          errors.etkinlikAdi = "Etkinlik adı gereklidir";
        } else {
          delete errors.etkinlikAdi;
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
        if (
          formData.bitisTarihi &&
          formData.baslamaTarihi &&
          formData.bitisTarihi < formData.baslamaTarihi
        ) {
          errors.bitisTarihi = "Bitiş tarihi başlama tarihinden önce olamaz";
        } else {
          delete errors.bitisTarihi;
        }
        break;

      case "bitisSaati":
        if (
          formData.baslamaTarihi &&
          formData.bitisTarihi &&
          formData.baslamaTarihi === formData.bitisTarihi
        ) {
          if (
            formData.baslamaSaati &&
            formData.bitisSaati &&
            formData.baslamaSaati > formData.bitisSaati
          ) {
            errors.bitisSaati = "Bitiş saati başlama saatinden önce olamaz";
          } else {
            delete errors.bitisSaati;
          }
        }
        break;

      case "maksimumKatilimci":
        if (
          formData.maksimumKatilimci !== 0 &&
          formData.maksimumKatilimci < 0
        ) {
          errors.maksimumKatilimci =
            "Maksimum katılımcı sayısı 0 veya pozitif olmalıdır";
        } else {
          delete errors.maksimumKatilimci;
        }
        break;

      default:
        break;
    }

    setFormErrors(errors);
  };

  // Alan odaktan çıkınca doğrulama yap
  const handleBlur = (e) => {
    const { name } = e.target;
    validateField(name);
  };

  // Formu gönder
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tüm alanları dokunulmuş olarak işaretle
    const allTouchedFields = {};
    Object.keys(formData).forEach((key) => {
      allTouchedFields[key] = true;
    });
    setTouchedFields(allTouchedFields);

    if (!validateForm()) {
      // Burada daha spesifik hata mesajları gösteriyoruz
      if (formErrors.etkinlikAdi) {
        toast.error("Etkinlik adı alanını doldurunuz.");
      }
      if (formErrors.baslamaTarihi) {
        toast.error("Başlama tarihi alanını doldurunuz.");
      }
      if (formErrors.bitisTarihi) {
        toast.error("Bitiş tarihi, başlama tarihinden sonra olmalıdır.");
      }
      if (formErrors.bitisSaati) {
        toast.error("Bitiş saati, başlama saatinden sonra olmalıdır.");
      }
      if (formErrors.maksimumKatilimci) {
        toast.error("Maksimum katılımcı sayısı 0 veya pozitif olmalıdır.");
      }
      return;
    }

    try {
      const etkinlikData = { ...formData };

      if (id) {
        await dispatch(updateEtkinlik({ id, etkinlikData })).unwrap();
        toast.success("Etkinlik başarıyla güncellendi");
        navigate(`/etkinlikler/detay/${id}`);
      } else {
        const yeniEtkinlik = await dispatch(addEtkinlik(etkinlikData)).unwrap();
        toast.success("Etkinlik başarıyla oluşturuldu");
        navigate(`/etkinlikler/detay/${yeniEtkinlik._id}`);
      }
    } catch (error) {
      console.error("Etkinlik kayıt hatası:", error);
      toast.error(error?.msg || "İşlem sırasında bir hata oluştu");
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
          {id ? "Etkinlik Düzenle" : "Yeni Etkinlik Oluştur"}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/etkinlikler")}
        >
          Geri Dön
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <LocalizationProvider
          dateAdapter={AdapterDateFns}
          adapterLocale={trLocale}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Üst kısım: Aktiflik durumu */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="subtitle1">
                    Etkinlik Bilgileri
                  </Typography>
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

              {/* Etkinlik adı */}
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Etkinlik Adı *"
                  name="etkinlikAdi"
                  value={formData.etkinlikAdi}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!formErrors.etkinlikAdi}
                  helperText={formErrors.etkinlikAdi}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Durum */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="durumu-label">Durum *</InputLabel>
                  <Select
                    labelId="durumu-label"
                    name="durumu"
                    value={formData.durumu}
                    onChange={handleChange}
                    label="Durum *"
                    required
                  >
                    <MenuItem value="Planlandı">Planlandı</MenuItem>
                    <MenuItem value="Devam Ediyor">Devam Ediyor</MenuItem>
                    <MenuItem value="Tamamlandı">Tamamlandı</MenuItem>
                    <MenuItem value="İptal Edildi">İptal Edildi</MenuItem>
                    <MenuItem value="Ertelendi">Ertelendi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Organizasyon */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="organizasyon-label">Organizasyon</InputLabel>
                  <Select
                    labelId="organizasyon-label"
                    name="organizasyon_id"
                    value={formData.organizasyon_id}
                    onChange={handleChange}
                    label="Organizasyon"
                    startAdornment={
                      <InputAdornment position="start">
                        <BusinessIcon />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {organizasyonlar.map((org) => (
                      <MenuItem key={org._id} value={org._id}>
                        {org.ad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sorumlu Kişi */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="sorumlu-label">Sorumlu Kişi</InputLabel>
                  <Select
                    labelId="sorumlu-label"
                    name="sorumlukisi_id"
                    value={formData.sorumlukisi_id}
                    onChange={handleChange}
                    label="Sorumlu Kişi"
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {kisiler.map((kisi) => (
                      <MenuItem key={kisi._id} value={kisi._id}>
                        {kisi.ad} {kisi.soyad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Başlama Tarihi */}
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Başlama Tarihi *"
                  value={
                    formData.baslamaTarihi
                      ? new Date(formData.baslamaTarihi)
                      : null
                  }
                  onChange={(date) => handleDateChange("baslamaTarihi", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!formErrors.baslamaTarihi}
                      helperText={formErrors.baslamaTarihi}
                      onBlur={() => validateField("baslamaTarihi")}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRangeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Başlama Saati */}
              <Grid item xs={12} sm={6} md={3}>
                <TimePicker
                  label="Başlama Saati"
                  value={
                    formData.baslamaSaati
                      ? new Date(`2000-01-01T${formData.baslamaSaati}`)
                      : null
                  }
                  onChange={(time) => handleTimeChange("baslamaSaati", time)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Bitiş Tarihi */}
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Bitiş Tarihi"
                  value={
                    formData.bitisTarihi ? new Date(formData.bitisTarihi) : null
                  }
                  onChange={(date) => handleDateChange("bitisTarihi", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!formErrors.bitisTarihi}
                      helperText={formErrors.bitisTarihi}
                      onBlur={() => validateField("bitisTarihi")}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRangeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Bitiş Saati */}
              <Grid item xs={12} sm={6} md={3}>
                <TimePicker
                  label="Bitiş Saati"
                  value={
                    formData.bitisSaati
                      ? new Date(`2000-01-01T${formData.bitisSaati}`)
                      : null
                  }
                  onChange={(time) => handleTimeChange("bitisSaati", time)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!formErrors.bitisSaati}
                      helperText={formErrors.bitisSaati}
                      onBlur={() => validateField("bitisSaati")}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Yer */}
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Etkinlik Yeri"
                  name="yer"
                  value={formData.yer}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Maksimum Katılımcı */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Maksimum Katılımcı"
                  name="maksimumKatilimci"
                  type="number"
                  value={formData.maksimumKatilimci}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!formErrors.maksimumKatilimci}
                  helperText={formErrors.maksimumKatilimci || "0: Sınırsız"}
                  InputProps={{
                    inputProps: { min: 0 },
                  }}
                />
              </Grid>

              {/* Etiketler */}
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Etiketler
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {formData.etiketler.map((etiket, index) => (
                      <Chip
                        key={index}
                        label={etiket}
                        onDelete={() => handleDeleteEtiket(etiket)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Yeni etiket ekle"
                    value={yeniEtiket}
                    onChange={(e) => setYeniEtiket(e.target.value)}
                    onKeyDown={handleKeyDown}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LabelIcon />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddEtiket}
                    disabled={!yeniEtiket.trim()}
                  >
                    Ekle
                  </Button>
                </Box>
              </Grid>

              {/* Açıklama */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  name="aciklama"
                  value={formData.aciklama}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Kaydet Butonu */}
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
                >
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </LocalizationProvider>
      </Paper>
    </Box>
  );
};

export default EtkinlikForm;
