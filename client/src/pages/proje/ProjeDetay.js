import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Slider,
  Tabs,
  Tab,
  Card,
  CardContent,
  InputAdornment,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  DateRange as DateRangeIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  getProjeById,
  getProjeGorevleri,
  addGorev,
  updateGorev,
  deleteGorev,
  deleteProje,
  clearCurrentProje,
} from "../../redux/proje/projeSlice";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import { toast } from "react-toastify";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import trLocale from "date-fns/locale/tr";

// TabPanel bileşeni - sekmeler için içerik paneli
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const ProjeDetay = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { proje, gorevler, loading } = useSelector((state) => state.proje);
  const { kisiler } = useSelector((state) => state.kisi);

  const [tabValue, setTabValue] = useState(0);
  const [gorevModalOpen, setGorevModalOpen] = useState(false);
  const [editGorev, setEditGorev] = useState(null);
  const [gorevForm, setGorevForm] = useState({
    gorevAdi: "",
    aciklama: "",
    atananKisi_id: "",
    gorevTuru: "Proje",
    durumu: "Yapılacak",
    oncelik: "Orta",
    baslangicTarihi: new Date().toISOString().split("T")[0],
    bitisTarihi: "",
    tamamlanmaDurumu: 0,
    etiketler: [],
  });

  const [deleteGorevDialogOpen, setDeleteGorevDialogOpen] = useState(false);
  const [deleteProjeDialogOpen, setDeleteProjeDialogOpen] = useState(false);
  const [gorevToDelete, setGorevToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [gorevFilters, setGorevFilters] = useState({
    durumu: "",
    oncelik: "",
    atananKisi_id: "",
    gorevTuru: "",
  });
  const [etiketInput, setEtiketInput] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(getProjeById(id));
      dispatch(getProjeGorevleri(id));
      dispatch(getActiveKisiler());
    }

    return () => {
      dispatch(clearCurrentProje());
    };
  }, [id, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredGorevler = () => {
    if (!gorevler) return [];

    return gorevler.filter((gorev) => {
      if (gorevFilters.durumu && gorev.durumu !== gorevFilters.durumu) {
        return false;
      }
      if (gorevFilters.oncelik && gorev.oncelik !== gorevFilters.oncelik) {
        return false;
      }
      if (
        gorevFilters.atananKisi_id &&
        (!gorev.atananKisi_id ||
          gorev.atananKisi_id._id !== gorevFilters.atananKisi_id)
      ) {
        return false;
      }
      if (
        gorevFilters.gorevTuru &&
        gorev.gorevTuru !== gorevFilters.gorevTuru
      ) {
        return false;
      }
      return true;
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setGorevFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setGorevFilters({
      durumu: "",
      oncelik: "",
      atananKisi_id: "",
      gorevTuru: "",
    });
  };

  const handleRefresh = () => {
    dispatch(getProjeGorevleri(id));
  };

  const handleOpenGorevModal = (gorev = null) => {
    if (gorev) {
      setEditGorev(gorev);
      const gorevBilgileri = {
        gorevAdi: gorev.gorevAdi || "",
        aciklama: gorev.aciklama || "",
        atananKisi_id: gorev.atananKisi_id ? gorev.atananKisi_id._id : "",
        gorevTuru: gorev.gorevTuru || "Proje",
        durumu: gorev.durumu || "Yapılacak",
        oncelik: gorev.oncelik || "Orta",
        baslangicTarihi: gorev.baslangicTarihi
          ? new Date(gorev.baslangicTarihi).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        bitisTarihi: gorev.bitisTarihi
          ? new Date(gorev.bitisTarihi).toISOString().split("T")[0]
          : "",
        tamamlanmaDurumu: gorev.tamamlanmaDurumu || 0,
        etiketler: gorev.etiketler || [],
      };
      setGorevForm(gorevBilgileri);
    } else {
      setEditGorev(null);
      setGorevForm({
        gorevAdi: "",
        aciklama: "",
        atananKisi_id: "",
        gorevTuru: "Proje",
        durumu: "Yapılacak",
        oncelik: "Orta",
        baslangicTarihi: new Date().toISOString().split("T")[0],
        bitisTarihi: "",
        tamamlanmaDurumu: 0,
        etiketler: [],
      });
    }
    setGorevModalOpen(true);
    setFormErrors({});
  };

  const handleGorevFormChange = (e) => {
    const { name, value } = e.target;
    setGorevForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleDateChange = (name, date) => {
    let formattedDate = "";
    if (date instanceof Date && !isNaN(date.getTime())) {
      formattedDate = date.toISOString().split("T")[0];
    }
    // Eğer tarih geçersizse veya boşsa, boş string ata
    setGorevForm((prev) => ({
      ...prev,
      [name]: formattedDate,
    }));

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleTamamlanmaChange = (e, newValue) => {
    setGorevForm((prev) => ({
      ...prev,
      tamamlanmaDurumu: newValue,
    }));
  };

  const handleEtiketEkle = () => {
    if (
      etiketInput.trim() &&
      !gorevForm.etiketler.includes(etiketInput.trim())
    ) {
      setGorevForm((prev) => ({
        ...prev,
        etiketler: [...prev.etiketler, etiketInput.trim()],
      }));
      setEtiketInput("");
    }
  };

  const handleEtiketSil = (etiketToDelete) => {
    setGorevForm((prev) => ({
      ...prev,
      etiketler: prev.etiketler.filter((etiket) => etiket !== etiketToDelete),
    }));
  };

  const validateGorevForm = () => {
    const errors = {};

    if (!gorevForm.gorevAdi.trim()) {
      errors.gorevAdi = "Görev adı gereklidir";
    }

    if (!gorevForm.baslangicTarihi) {
      errors.baslangicTarihi = "Başlangıç tarihi gereklidir";
    }

    if (gorevForm.bitisTarihi && gorevForm.baslangicTarihi) {
      const bitisTarihiObj = new Date(gorevForm.bitisTarihi);
      const baslangicTarihiObj = new Date(gorevForm.baslangicTarihi);

      if (bitisTarihiObj < baslangicTarihiObj) {
        errors.bitisTarihi = "Bitiş tarihi, başlangıç tarihinden önce olamaz";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGorevSubmit = async () => {
    if (!validateGorevForm()) {
      toast.error("Lütfen gerekli alanları doldurunuz.");
      return;
    }

    try {
      if (editGorev) {
        await dispatch(
          updateGorev({
            id: editGorev._id,
            gorevData: gorevForm,
          })
        ).unwrap();
        toast.success("Görev başarıyla güncellendi");
      } else {
        await dispatch(
          addGorev({
            ...gorevForm,
            proje_id: id,
          })
        ).unwrap();
        toast.success("Görev başarıyla eklendi");
      }
      setGorevModalOpen(false);
    } catch (error) {
      console.error("Görev kayıt hatası:", error);
      toast.error(error?.msg || "Görev kaydedilirken bir hata oluştu");
    }
  };

  const handleDeleteGorevClick = (gorev) => {
    setGorevToDelete(gorev);
    setDeleteGorevDialogOpen(true);
  };

  const handleDeleteGorevConfirm = async () => {
    if (gorevToDelete) {
      try {
        await dispatch(deleteGorev(gorevToDelete._id)).unwrap();
        toast.success(`"${gorevToDelete.gorevAdi}" görevi silindi`);
      } catch (error) {
        toast.error(error.msg || "Görev silinirken bir hata oluştu");
      }
    }
    setDeleteGorevDialogOpen(false);
    setGorevToDelete(null);
  };

  const handleDeleteProjeClick = () => {
    setDeleteProjeDialogOpen(true);
  };

  const handleDeleteProjeConfirm = async () => {
    try {
      await dispatch(deleteProje(id)).unwrap();
      toast.success("Proje ve tüm görevleri başarıyla silindi");
      navigate("/projeler");
    } catch (error) {
      toast.error(error.msg || "Proje silinirken bir hata oluştu");
    }
    setDeleteProjeDialogOpen(false);
  };

  const getGorevSayilari = () => {
    if (!gorevler)
      return { toplam: 0, tamamlanan: 0, devamEden: 0, bekleyen: 0 };

    const toplam = gorevler.length;
    const tamamlanan = gorevler.filter(
      (gorev) => gorev.durumu === "Tamamlandı"
    ).length;
    const devamEden = gorevler.filter(
      (gorev) => gorev.durumu === "Devam Ediyor"
    ).length;
    const bekleyen = gorevler.filter(
      (gorev) => gorev.durumu === "Yapılacak"
    ).length;

    return { toplam, tamamlanan, devamEden, bekleyen };
  };

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
      case "Yapılacak":
        return "default";
      case "İncelemede":
        return "warning";
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

  const getTamamlanmaRenk = (tamamlanmaDurumu) => {
    if (tamamlanmaDurumu >= 100) return "success";
    if (tamamlanmaDurumu >= 75) return "info";
    if (tamamlanmaDurumu >= 50) return "primary";
    if (tamamlanmaDurumu >= 25) return "warning";
    return "error";
  };

  if (loading && !proje) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!proje) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Proje bulunamadı.</Alert>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/projeler")}
          sx={{ mt: 2 }}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  const gorevSayilari = getGorevSayilari();

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
          Proje Detayı
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={`/projeler/duzenle/${id}`}
          >
            Düzenle
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteProjeClick}
          >
            Sil
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/projeler")}
          >
            Geri Dön
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" component="div">
                  {proje.projeAdi}
                </Typography>
                <Chip
                  label={proje.durumu}
                  color={getDurumuColor(proje.durumu)}
                  size="small"
                />
                <Chip
                  label={proje.oncelik}
                  color={getOncelikColor(proje.oncelik)}
                  size="small"
                />
              </Box>
              <Chip
                label={proje.isActive ? "Aktif" : "Pasif"}
                color={proje.isActive ? "success" : "error"}
                variant="outlined"
              />
            </Box>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography color="textSecondary" gutterBottom>
              Başlama Tarihi
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DateRangeIcon color="action" fontSize="small" />
              <Typography>
                {new Date(proje.baslamaTarihi).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography color="textSecondary" gutterBottom>
              Bitiş Tarihi
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DateRangeIcon color="action" fontSize="small" />
              <Typography>
                {proje.bitisTarihi
                  ? new Date(proje.bitisTarihi).toLocaleDateString()
                  : "Belirlenmedi"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography color="textSecondary" gutterBottom>
              Sorumlu Kişi
            </Typography>
            {proje.sorumluKisi_id ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon color="action" fontSize="small" />
                <Typography>
                  {`${proje.sorumluKisi_id.ad} ${proje.sorumluKisi_id.soyad}`}
                </Typography>
              </Box>
            ) : (
              <Typography color="text.secondary">Atanmadı</Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography color="textSecondary" gutterBottom>
              Kayıt Tarihi
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DateRangeIcon color="action" fontSize="small" />
              <Typography>
                {new Date(proje.kayitTarihi).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography color="textSecondary" gutterBottom>
              Tamamlanma Durumu
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                maxWidth: 400,
              }}
            >
              <LinearProgress
                variant="determinate"
                value={proje.tamamlanmaDurumu || 0}
                color={getTamamlanmaRenk(proje.tamamlanmaDurumu || 0)}
                sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
              />
              <Typography variant="body1">
                %{proje.tamamlanmaDurumu || 0}
              </Typography>
            </Box>
          </Grid>

          {proje.aciklama && (
            <Grid item xs={12}>
              <Typography color="textSecondary" gutterBottom>
                Açıklama
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, bgcolor: "background.default" }}
              >
                <Typography>{proje.aciklama}</Typography>
              </Paper>
            </Grid>
          )}

          {proje.etiketler && proje.etiketler.length > 0 && (
            <Grid item xs={12}>
              <Typography color="textSecondary" gutterBottom>
                Etiketler
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {proje.etiketler.map((etiket, index) => (
                  <Chip
                    key={index}
                    label={etiket}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Toplam Görev
                </Typography>
                <Typography variant="h4">{gorevSayilari.toplam}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Tamamlanan
                </Typography>
                <Typography variant="h4" color="success.main">
                  {gorevSayilari.tamamlanan}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Devam Eden
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {gorevSayilari.devamEden}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Bekleyen
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {gorevSayilari.bekleyen}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="proje detay sekmeleri"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Görevler" id="tab-0" aria-controls="tabpanel-0" />
            <Tab
              label="Zaman Çizelgesi"
              id="tab-1"
              aria-controls="tabpanel-1"
            />
          </Tabs>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenGorevModal()}
            >
              Yeni Görev
            </Button>
            <Tooltip title="Yenile">
              <IconButton color="primary" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    name="durumu"
                    value={gorevFilters.durumu}
                    onChange={handleFilterChange}
                    label="Durum"
                    size="small"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="Yapılacak">Yapılacak</MenuItem>
                    <MenuItem value="Devam Ediyor">Devam Ediyor</MenuItem>
                    <MenuItem value="İncelemede">İncelemede</MenuItem>
                    <MenuItem value="Tamamlandı">Tamamlandı</MenuItem>
                    <MenuItem value="İptal Edildi">İptal Edildi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Öncelik</InputLabel>
                  <Select
                    name="oncelik"
                    value={gorevFilters.oncelik}
                    onChange={handleFilterChange}
                    label="Öncelik"
                    size="small"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="Düşük">Düşük</MenuItem>
                    <MenuItem value="Orta">Orta</MenuItem>
                    <MenuItem value="Yüksek">Yüksek</MenuItem>
                    <MenuItem value="Kritik">Kritik</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Atanan Kişi</InputLabel>
                  <Select
                    name="atananKisi_id"
                    value={gorevFilters.atananKisi_id}
                    onChange={handleFilterChange}
                    label="Atanan Kişi"
                    size="small"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {kisiler.map((kisi) => (
                      <MenuItem key={kisi._id} value={kisi._id}>
                        {`${kisi.ad} ${kisi.soyad}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Görev Türü</InputLabel>
                  <Select
                    name="gorevTuru"
                    value={gorevFilters.gorevTuru}
                    onChange={handleFilterChange}
                    label="Görev Türü"
                    size="small"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="Proje">Proje</MenuItem>
                    <MenuItem value="Toplantı">Toplantı</MenuItem>
                    <MenuItem value="Etkinlik">Etkinlik</MenuItem>
                    <MenuItem value="Bakım">Bakım</MenuItem>
                    <MenuItem value="Diğer">Diğer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ textAlign: "right" }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={clearFilters}
                >
                  Filtreleri Temizle
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <>
                      <TableCell>Görev Adı</TableCell>
                      <TableCell>Tür</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Öncelik</TableCell>
                      <TableCell>Atanan Kişi</TableCell>
                      <TableCell>Tamamlanma</TableCell>
                      <TableCell>Tarih Aralığı</TableCell>
                      <TableCell align="center">İşlemler</TableCell>
                    </>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredGorevler().length > 0 ? (
                    filteredGorevler().map((gorev) => (
                      <TableRow key={gorev._id} hover>
                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              maxWidth: 250,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {gorev.gorevAdi}
                          </Typography>
                          {gorev.aciklama && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                maxWidth: 250,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {gorev.aciklama}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={gorev.gorevTuru || "Proje"}
                            color="info"
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={gorev.durumu}
                            color={getDurumuColor(gorev.durumu)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={gorev.oncelik}
                            color={getOncelikColor(gorev.oncelik)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {gorev.atananKisi_id ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <PersonIcon color="action" fontSize="small" />
                              <Typography variant="body2">
                                {`${gorev.atananKisi_id.ad} ${gorev.atananKisi_id.soyad}`}
                              </Typography>
                            </Box>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <LinearProgress
                              variant="determinate"
                              value={gorev.tamamlanmaDurumu || 0}
                              color={getTamamlanmaRenk(
                                gorev.tamamlanmaDurumu || 0
                              )}
                              sx={{ flexGrow: 1, height: 6, borderRadius: 5 }}
                            />
                            <Typography variant="body2">
                              %{gorev.tamamlanmaDurumu || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.5,
                            }}
                          >
                            <Typography variant="body2">
                              <DateRangeIcon
                                color="action"
                                fontSize="small"
                                sx={{ mr: 0.5, verticalAlign: "middle" }}
                              />
                              {new Date(
                                gorev.baslangicTarihi
                              ).toLocaleDateString()}
                            </Typography>
                            {gorev.bitisTarihi && (
                              <Typography variant="body2">
                                <DateRangeIcon
                                  color="action"
                                  fontSize="small"
                                  sx={{ mr: 0.5, verticalAlign: "middle" }}
                                />
                                {new Date(
                                  gorev.bitisTarihi
                                ).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Düzenle">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleOpenGorevModal(gorev)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleDeleteGorevClick(gorev)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {gorev.durumu !== "Tamamlandı" && (
                              <Tooltip title="Tamamlandı olarak işaretle">
                                <IconButton
                                  color="success"
                                  size="small"
                                  onClick={() =>
                                    dispatch(
                                      updateGorev({
                                        id: gorev._id,
                                        gorevData: {
                                          durumu: "Tamamlandı",
                                          tamamlanmaDurumu: 100,
                                        },
                                      })
                                    )
                                  }
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {gorev.durumu === "Tamamlandı" && (
                              <Tooltip title="Devam ediyor olarak işaretle">
                                <IconButton
                                  color="primary"
                                  size="small"
                                  onClick={() =>
                                    dispatch(
                                      updateGorev({
                                        id: gorev._id,
                                        gorevData: {
                                          durumu: "Devam Ediyor",
                                          tamamlanmaDurumu: 50,
                                        },
                                      })
                                    )
                                  }
                                >
                                  <RefreshIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        {gorevler && gorevler.length > 0
                          ? "Filtrelere uygun görev bulunamadı"
                          : "Henüz görev bulunmuyor. Yeni görev ekleyebilirsiniz."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Alert severity="info">
              Proje zaman çizelgesi burada gösterilecektir. Bu özellik yakında
              eklenecektir.
            </Alert>
          </Box>
        </TabPanel>
      </Paper>

      <Dialog
        open={gorevModalOpen}
        onClose={() => setGorevModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editGorev ? "Görevi Düzenle" : "Yeni Görev Ekle"}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={trLocale}
          >
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Görev Adı*"
                  name="gorevAdi"
                  value={gorevForm.gorevAdi}
                  onChange={handleGorevFormChange}
                  required
                  error={!!formErrors.gorevAdi}
                  helperText={formErrors.gorevAdi}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="gorevturu-label">Görev Türü</InputLabel>
                  <Select
                    labelId="gorevturu-label"
                    name="gorevTuru"
                    value={gorevForm.gorevTuru}
                    onChange={handleGorevFormChange}
                    label="Görev Türü"
                  >
                    <MenuItem value="Proje">Proje</MenuItem>
                    <MenuItem value="Toplantı">Toplantı</MenuItem>
                    <MenuItem value="Etkinlik">Etkinlik</MenuItem>
                    <MenuItem value="Bakım">Bakım</MenuItem>
                    <MenuItem value="Diğer">Diğer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Başlangıç Tarihi*"
                  value={
                    gorevForm.baslangicTarihi
                      ? new Date(gorevForm.baslangicTarihi)
                      : null
                  }
                  onChange={(date) => handleDateChange("baslangicTarihi", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="baslangicTarihi"
                      fullWidth
                      required
                      error={!!formErrors.baslangicTarihi}
                      helperText={formErrors.baslangicTarihi}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Bitiş Tarihi"
                  value={
                    gorevForm.bitisTarihi
                      ? new Date(gorevForm.bitisTarihi)
                      : null
                  }
                  onChange={(date) => handleDateChange("bitisTarihi", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="bitisTarihi"
                      fullWidth
                      error={!!formErrors.bitisTarihi}
                      helperText={formErrors.bitisTarihi}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="durumu-label">Durumu</InputLabel>
                  <Select
                    labelId="durumu-label"
                    name="durumu"
                    value={gorevForm.durumu}
                    onChange={handleGorevFormChange}
                    label="Durumu"
                  >
                    <MenuItem value="Yapılacak">Yapılacak</MenuItem>
                    <MenuItem value="Devam Ediyor">Devam Ediyor</MenuItem>
                    <MenuItem value="İncelemede">İncelemede</MenuItem>
                    <MenuItem value="Tamamlandı">Tamamlandı</MenuItem>
                    <MenuItem value="İptal Edildi">İptal Edildi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="oncelik-label">Öncelik</InputLabel>
                  <Select
                    labelId="oncelik-label"
                    name="oncelik"
                    value={gorevForm.oncelik}
                    onChange={handleGorevFormChange}
                    label="Öncelik"
                  >
                    <MenuItem value="Düşük">Düşük</MenuItem>
                    <MenuItem value="Orta">Orta</MenuItem>
                    <MenuItem value="Yüksek">Yüksek</MenuItem>
                    <MenuItem value="Kritik">Kritik</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="atananKisi-label">Atanan Kişi</InputLabel>
                  <Select
                    labelId="atananKisi-label"
                    name="atananKisi_id"
                    value={gorevForm.atananKisi_id}
                    onChange={handleGorevFormChange}
                    label="Atanan Kişi"
                  >
                    <MenuItem value="">
                      <em>Atanmadı</em>
                    </MenuItem>
                    {kisiler.map((kisi) => (
                      <MenuItem key={kisi._id} value={kisi._id}>
                        {`${kisi.ad} ${kisi.soyad}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>
                  Tamamlanma Durumu: %{gorevForm.tamamlanmaDurumu}
                </Typography>
                <Slider
                  value={gorevForm.tamamlanmaDurumu}
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
                  value={gorevForm.aciklama}
                  onChange={handleGorevFormChange}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Etiketler
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {gorevForm.etiketler.map((etiket, index) => (
                    <Chip
                      key={index}
                      label={etiket}
                      onDelete={() => handleEtiketSil(etiket)}
                      color="primary"
                      variant="outlined"
                      size="small"
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
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGorevModalOpen(false)}>İptal</Button>
          <Button
            onClick={handleGorevSubmit}
            variant="contained"
            color="primary"
          >
            {editGorev ? "Güncelle" : "Ekle"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteGorevDialogOpen}
        onClose={() => setDeleteGorevDialogOpen(false)}
      >
        <DialogTitle>Görevi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {gorevToDelete &&
              `"${gorevToDelete.gorevAdi}" görevini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteGorevDialogOpen(false)}
            color="primary"
          >
            İptal
          </Button>
          <Button onClick={handleDeleteGorevConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteProjeDialogOpen}
        onClose={() => setDeleteProjeDialogOpen(false)}
      >
        <DialogTitle>Projeyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`"${proje.projeAdi}" projesini ve tüm görevlerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteProjeDialogOpen(false)}
            color="primary"
          >
            İptal
          </Button>
          <Button onClick={handleDeleteProjeConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjeDetay;
