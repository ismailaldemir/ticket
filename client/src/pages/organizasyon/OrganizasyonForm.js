import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  InputAdornment,
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  BusinessCenter as BusinessCenterIcon,
  DateRange as DateRangeIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { tr } from "date-fns/locale";

import {
  getOrganizasyonById,
  addOrganizasyon,
  updateOrganizasyon,
  uploadOrganizasyonGorsel,
  deleteOrganizasyonGorsel,
  clearCurrentOrganizasyon,
} from "../../redux/organizasyon/organizasyonSlice";

import KonumSec from "../../components/common/KonumSec";
import TelefonListesi from "../../components/organizasyon/TelefonListesi";
import AdresListesi from "../../components/organizasyon/AdresListesi";
import SosyalMedyaListesi from "../../components/organizasyon/SosyalMedyaListesi";
import { toast } from "react-toastify";

// Tab Panel bileşeni
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`organizasyon-tabpanel-${index}`}
      aria-labelledby={`organizasyon-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const OrganizasyonForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRefs = {
    logo: useRef(null),
    amblem: useRef(null),
    favicon: useRef(null),
  };

  const { organizasyon, loading, error, loadingGorsel } = useSelector(
    (state) => state.organizasyon
  );

  const [formData, setFormData] = useState({
    ad: "",
    aciklama: "",
    misyon: "",
    vizyon: "",
    hakkinda: "",
    kurulusTarihi: null,
    lokasyon: {
      lat: null,
      lng: null,
      adres: "",
    },
    iletisimBilgileri: {
      adres: "",
      telefon: "",
      email: "",
      webSite: "",
    },
    isActive: true,
  });

  // Görsel yükleme state'leri
  const [selectedFiles, setSelectedFiles] = useState({
    logo: null,
    amblem: null,
    favicon: null,
  });

  // Tab kontrolü için state
  const [tabValue, setTabValue] = useState(0);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (id) {
      dispatch(getOrganizasyonById(id));
    } else {
      dispatch(clearCurrentOrganizasyon());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (organizasyon && id) {
      setFormData({
        ad: organizasyon.ad || "",
        aciklama: organizasyon.aciklama || "",
        misyon: organizasyon.misyon || "",
        vizyon: organizasyon.vizyon || "",
        hakkinda: organizasyon.hakkinda || "",
        kurulusTarihi: organizasyon.kurulusTarihi
          ? new Date(organizasyon.kurulusTarihi)
          : null,
        lokasyon: organizasyon.lokasyon || { lat: null, lng: null, adres: "" },
        iletisimBilgileri: {
          adres: organizasyon.iletisimBilgileri?.adres || "",
          telefon: organizasyon.iletisimBilgileri?.telefon || "",
          email: organizasyon.iletisimBilgileri?.email || "",
          webSite: organizasyon.iletisimBilgileri?.webSite || "",
        },
        isActive:
          organizasyon.isActive !== undefined ? organizasyon.isActive : true,
      });
    }
  }, [organizasyon, id]);

  // Tab değiştirme
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Form alanları değişikliği
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      // Nested bir alan için (iletisimBilgileri içindeki alanlar)
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      // Üst seviye alanlar için
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Hata mesajlarını temizle
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  // Görsel dosyası seçme
  const handleFileSelect = (type) => (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      // 2MB dosya boyut kontrolü
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Dosya boyutu 2MB'den küçük olmalıdır");
        return;
      }

      setSelectedFiles((prev) => ({
        ...prev,
        [type]: file,
      }));
    }
  };

  // Dosya seçme diyalogunu açma işlevleri
  const openFileDialog = (type) => () => {
    if (fileInputRefs[type]?.current) {
      fileInputRefs[type].current.click();
    }
  };

  // Görsel yükleme
    const handleGorselUpload = async (type) => {
      const file = selectedFiles[type];
      if (!file) return;

      const formData = new FormData();
      formData.append("gorsel", file);

      try {
        await dispatch(
          uploadOrganizasyonGorsel({
            id: organizasyon.id,
            gorselTipi: type,
            formData,
          })
        ).unwrap();      setSelectedFiles((prev) => ({
        ...prev,
        [type]: null,
      }));
      toast.success(`${type} başarıyla yüklendi`);
      // Görsel yüklendikten sonra organizasyonun güncel verisini çek
      if (organizasyon.id) {
        await dispatch(getOrganizasyonById(organizasyon.id));
      }
    } catch (error) {
      toast.error(`${type} yüklenirken bir hata oluştu`);
      console.error("Görsel yükleme hatası:", error);
    }
  };

  // Görsel silme
  const handleGorselDelete = async (type) => {
    try {
      await dispatch(
        deleteOrganizasyonGorsel({
          id: organizasyon.id,
          gorselTipi: type,
        })
      ).unwrap();
      toast.success(`${type} başarıyla silindi`);
      // Görsel silindikten sonra organizasyonun güncel verisini çek
      if (organizasyon.id) {
        await dispatch(getOrganizasyonById(organizasyon.id));
      }
    } catch (error) {
      toast.error(`${type} silinirken bir hata oluştu`);
      console.error("Görsel silme hatası:", error);
    }
  };

  // Konum seçimi
  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      lokasyon: location,
    }));
  };

  // Form doğrulama
  const validateForm = () => {
    const errors = {};
    if (!formData.ad.trim()) {
      errors.ad = "Organizasyon adı gereklidir";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Lütfen formdaki hataları düzeltin");
      return;
    }
    try {
      if (id) {
        await dispatch(
          updateOrganizasyon({ id, organizasyonData: formData })
        ).unwrap();
        toast.success("Organizasyon başarıyla güncellendi");
      } else {
        await dispatch(addOrganizasyon(formData)).unwrap();
        toast.success("Organizasyon başarıyla oluşturuldu");
      }
      // Kayıt sonrası organizasyon listesine yönlendir
      navigate("/organizasyonlar");
    } catch (error) {
      toast.error(error?.msg || "Organizasyon kaydedilirken bir hata oluştu");
      console.error("Form gönderim hatası:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/organizasyonlar")}
          sx={{ mr: 2 }}
        >
          Geri
        </Button>
        <Typography variant="h5" component="h1">
          {id ? "Organizasyon Düzenle" : "Yeni Organizasyon Ekle"}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {typeof error === "string"
            ? error
            : error?.msg ||
              error?.message ||
              JSON.stringify(error) ||
              "Bir hata oluştu"}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {loading && !organizasyon ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="organizasyon form tabs"
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab
                    label="Genel Bilgiler"
                    icon={<BusinessIcon />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Kurumsal"
                    icon={<BusinessCenterIcon />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Görseller"
                    icon={<ImageIcon />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Konum"
                    icon={<LocationOnIcon />}
                    iconPosition="start"
                  />
                  <Tab
                    label="İletişim"
                    icon={<PhoneIcon />}
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Genel Bilgiler Tab Paneli */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Organizasyon Adı"
                      name="ad"
                      value={formData.ad}
                      onChange={handleChange}
                      required
                      error={!!formErrors.ad}
                      helperText={formErrors.ad}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon />
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
                      rows={3}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Kuruluş Tarihi"
                      value={formData.kurulusTarihi}
                      onChange={(date) =>
                        handleChange({
                          target: { name: "kurulusTarihi", value: date },
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
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

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Web Sitesi"
                      name="iletisimBilgileri.webSite"
                      value={formData.iletisimBilgileri.webSite}
                      onChange={handleChange}
                      placeholder="https://www.example.com"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LanguageIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="E-posta"
                      name="iletisimBilgileri.email"
                      type="email"
                      value={formData.iletisimBilgileri.email}
                      onChange={handleChange}
                      placeholder="iletisim@example.com"
                    />
                  </Grid>

                  {/* Buradaki aktif switch'i kaldırdım */}
                </Grid>
              </TabPanel>

              {/* Kurumsal Tab Paneli */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Misyon"
                      name="misyon"
                      value={formData.misyon}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      placeholder="Organizasyonun misyon bilgisi..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Vizyon"
                      name="vizyon"
                      value={formData.vizyon}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      placeholder="Organizasyonun vizyon bilgisi..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Hakkında"
                      name="hakkinda"
                      value={formData.hakkinda}
                      onChange={handleChange}
                      multiline
                      rows={6}
                      placeholder="Organizasyon hakkında detaylı bilgi..."
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Görseller Tab Paneli */}
              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  {/* Dosya yükleme gizli input'ları */}
                  <input
                    ref={fileInputRefs.logo}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileSelect("logo")}
                  />
                  <input
                    ref={fileInputRefs.amblem}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileSelect("amblem")}
                  />
                  <input
                    ref={fileInputRefs.favicon}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileSelect("favicon")}
                  />

                  {/* Logo Kartı */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: "100%" }}>
                      <CardMedia
                        component="div"
                        sx={{
                          height: 180,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        {organizasyon?.gorselBilgileri?.logo?.dosyaYolu ? (
                          <Box
                            component="img"
                            src={`/${organizasyon.gorselBilgileri.logo.dosyaYolu}`}
                            alt="Logo"
                            sx={{
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : selectedFiles.logo ? (
                          <Box
                            component="img"
                            src={URL.createObjectURL(selectedFiles.logo)}
                            alt="Logo Önizleme"
                            sx={{
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              color: "text.secondary",
                              textAlign: "center",
                              p: 2,
                            }}
                          >
                            <ImageIcon sx={{ fontSize: 60 }} />
                            <Typography variant="body2">
                              Logo yüklenmemiş
                            </Typography>
                          </Box>
                        )}
                      </CardMedia>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          Logo
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Organizasyon için logo görseli. Önerilen boyut:
                          200x200px.
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<UploadIcon />}
                          onClick={openFileDialog("logo")}
                          disabled={loadingGorsel}
                        >
                          {selectedFiles.logo ? "Dosya Değiştir" : "Dosya Seç"}
                        </Button>
                        {selectedFiles.logo && (
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => handleGorselUpload("logo")}
                            disabled={loadingGorsel}
                            startIcon={
                              loadingGorsel ? (
                                <CircularProgress size={16} />
                              ) : null
                            }
                          >
                            {loadingGorsel ? "Yükleniyor..." : "Yükle"}
                          </Button>
                        )}
                        {organizasyon?.gorselBilgileri?.logo?.dosyaYolu && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleGorselDelete("logo")}
                            disabled={loadingGorsel}
                          >
                            Sil
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>

                  {/* Amblem Kartı */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: "100%" }}>
                      <CardMedia
                        component="div"
                        sx={{
                          height: 180,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        {organizasyon?.gorselBilgileri?.amblem?.dosyaYolu ? (
                          <Box
                            component="img"
                            src={`/${organizasyon.gorselBilgileri.amblem.dosyaYolu}`}
                            alt="Amblem"
                            sx={{
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : selectedFiles.amblem ? (
                          <Box
                            component="img"
                            src={URL.createObjectURL(selectedFiles.amblem)}
                            alt="Amblem Önizleme"
                            sx={{
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              color: "text.secondary",
                              textAlign: "center",
                              p: 2,
                            }}
                          >
                            <ImageIcon sx={{ fontSize: 60 }} />
                            <Typography variant="body2">
                              Amblem yüklenmemiş
                            </Typography>
                          </Box>
                        )}
                      </CardMedia>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          Amblem
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Organizasyon için amblem görseli. Önerilen boyut:
                          512x512px.
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<UploadIcon />}
                          onClick={openFileDialog("amblem")}
                          disabled={loadingGorsel}
                        >
                          {selectedFiles.amblem
                            ? "Dosya Değiştir"
                            : "Dosya Seç"}
                        </Button>
                        {selectedFiles.amblem && (
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => handleGorselUpload("amblem")}
                            disabled={loadingGorsel}
                            startIcon={
                              loadingGorsel ? (
                                <CircularProgress size={16} />
                              ) : null
                            }
                          >
                            {loadingGorsel ? "Yükleniyor..." : "Yükle"}
                          </Button>
                        )}
                        {organizasyon?.gorselBilgileri?.amblem?.dosyaYolu && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleGorselDelete("amblem")}
                            disabled={loadingGorsel}
                          >
                            Sil
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>

                  {/* Favicon Kartı */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: "100%" }}>
                      <CardMedia
                        component="div"
                        sx={{
                          height: 180,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        {organizasyon?.gorselBilgileri?.favicon?.dosyaYolu ? (
                          <Box
                            component="img"
                            src={`/${organizasyon.gorselBilgileri.favicon.dosyaYolu}`}
                            alt="Favicon"
                            sx={{
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : selectedFiles.favicon ? (
                          <Box
                            component="img"
                            src={URL.createObjectURL(selectedFiles.favicon)}
                            alt="Favicon Önizleme"
                            sx={{
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              color: "text.secondary",
                              textAlign: "center",
                              p: 2,
                            }}
                          >
                            <ImageIcon sx={{ fontSize: 60 }} />
                            <Typography variant="body2">
                              Favicon yüklenmemiş
                            </Typography>
                          </Box>
                        )}
                      </CardMedia>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          Favicon
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Web tarayıcı sekmesi için ikon. Önerilen boyut:
                          32x32px veya 16x16px.
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<UploadIcon />}
                          onClick={openFileDialog("favicon")}
                          disabled={loadingGorsel}
                        >
                          {selectedFiles.favicon
                            ? "Dosya Değiştir"
                            : "Dosya Seç"}
                        </Button>
                        {selectedFiles.favicon && (
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => handleGorselUpload("favicon")}
                            disabled={loadingGorsel}
                            startIcon={
                              loadingGorsel ? (
                                <CircularProgress size={16} />
                              ) : null
                            }
                          >
                            {loadingGorsel ? "Yükleniyor..." : "Yükle"}
                          </Button>
                        )}
                        {organizasyon?.gorselBilgileri?.favicon?.dosyaYolu && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleGorselDelete("favicon")}
                            disabled={loadingGorsel}
                          >
                            Sil
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        Logo, amblem ve favicon yükleme işlemleri için önce
                        organizasyon kaydını oluşturun veya güncelleyin.
                        Görseller 2MB boyutundan küçük olmalıdır.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Konum Tab Paneli */}
              <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Organizasyon Konumu
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      Adres arama kutusunu kullanarak veya haritada bir noktaya
                      tıklayarak organizasyon konumunu belirleyin.
                    </Typography>
                    <KonumSec
                      value={formData.lokasyon}
                      onChange={handleLocationSelect}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* İletişim Tab Paneli - Telefon, Adres ve Sosyal Medya yönetimi */}
              <TabPanel value={tabValue} index={4}>
                {id ? (
                  <Grid container spacing={4}>
                    {/* Telefonlar */}
                    <Grid item xs={12}>
                      <Paper
                        variant="outlined"
                        sx={{ p: 2, mb: 2, borderRadius: 2 }}
                      >
                        <TelefonListesi organizasyonId={id} />
                      </Paper>
                    </Grid>

                    {/* Adresler */}
                    <Grid item xs={12}>
                      <Paper
                        variant="outlined"
                        sx={{ p: 2, mb: 2, borderRadius: 2 }}
                      >
                        <AdresListesi organizasyonId={id} />
                      </Paper>
                    </Grid>

                    {/* Sosyal Medya */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Sosyal Medya Hesapları
                      </Typography>
                      <SosyalMedyaListesi organizasyonId={id} />
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography>
                      İletişim detayları (telefon, adres, sosyal medya)
                      ekleyebilmek için önce organizasyon kaydını oluşturun.
                    </Typography>
                  </Alert>
                )}
              </TabPanel>

              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) =>
                        handleChange({
                          target: {
                            name: "isActive",
                            type: "checkbox",
                            checked: e.target.checked,
                          },
                        })
                      }
                      color="primary"
                    />
                  }
                  label="Aktif"
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={
                    loading ? <CircularProgress size={24} /> : <SaveIcon />
                  }
                  disabled={loading}
                >
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </Box>
            </form>
          </LocalizationProvider>
        )}
      </Paper>
    </Box>
  );
};

export default OrganizasyonForm;
