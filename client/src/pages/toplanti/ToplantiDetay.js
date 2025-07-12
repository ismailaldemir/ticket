import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Tooltip,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Fade,
  Tab,
  Tabs,
  Autocomplete,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import trLocale from "date-fns/locale/tr";
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  EventNote as EventNoteIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassIcon,
  FindInPage as FindInPageIcon,
  PeopleAlt as PeopleIcon,
  MeetingRoom as MeetingRoomIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import {
  getToplantiById,
  getToplantiKararlari,
  getToplantiKatilimcilari,
  addToplantiKarar,
  addToplantiKatilimci,
  updateToplantiKarar,
  updateToplantiKatilimci,
  deleteToplantiKarar,
  deleteToplantiKatilimci,
} from "../../redux/toplanti/toplantiSlice";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import { toast } from "react-toastify";
import BulkKatilimciModal from "../../components/toplanti/BulkKatilimciModal";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

// Tab içeriklerini kontrol etmek için kullanılacak bileşen
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`toplanti-tabpanel-${index}`}
      aria-labelledby={`toplanti-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ToplantiDetay = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { toplanti, kararlar, katilimcilar, loading } = useSelector(
    (state) => state.toplanti
  );
  const { kisiler } = useSelector((state) => state.kisi);

  // Aktif tab'ı takip etmek için state
  const [tabValue, setTabValue] = useState(0);

  // Karar ekleme için state
  const [yeniKarar, setYeniKarar] = useState({
    kararNo: "",
    karar: "",
    sorumlu: "",
    sonTarih: null,
    durumu: "Beklemede",
  });

  // Katılımcı ekleme için state
  const [yeniKatilimci, setYeniKatilimci] = useState({
    kisi_id: "",
    katilimDurumu: "Katıldı",
    gorev: "Üye",
  });

  // Düzenleme ve silme işlemleri için state
  const [kararToDelete, setKararToDelete] = useState(null);
  const [kararToEdit, setKararToEdit] = useState(null);
  const [katilimciToDelete, setKatilimciToDelete] = useState(null);
  const [katilimciToEdit, setKatilimciToEdit] = useState(null);

  // Dialog kontrol state'leri
  const [deleteKararDialogOpen, setDeleteKararDialogOpen] = useState(false);
  const [editKararDialogOpen, setEditKararDialogOpen] = useState(false);
  const [deleteKatilimciDialogOpen, setDeleteKatilimciDialogOpen] =
    useState(false);
  const [editKatilimciDialogOpen, setEditKatilimciDialogOpen] = useState(false);

  // Formlar için hata state'leri
  const [kararFormErrors, setKararFormErrors] = useState({});
  const [katilimciFormErrors, setKatilimciFormErrors] = useState({});

  // Toplu katılımcı modalı için state
  const [bulkKatilimciModalOpen, setBulkKatilimciModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getToplantiById(id));
      dispatch(getToplantiKararlari(id));
      dispatch(getToplantiKatilimcilari(id));

      // Kişileri yükleme işlemini iyileştirelim
      // önce loading state'ini aktif et
      dispatch({ type: "kisi/getActiveKisiler/pending" });

      // Kişileri yükle ve olası hataları yönet
      dispatch(getActiveKisiler())
        .unwrap()
        .then((data) => {
          console.log(`Toplantı için ${data.length} aktif kişi yüklendi`);
        })
        .catch((error) => {
          console.error("Kişiler yüklenirken hata:", error);
          // Toast mesajı göster ama sayfayı engelleme
          toast.warning(
            "Kişi listesi yüklenirken sorun oluştu, katılımcı ekleme işlemleri etkilenebilir!"
          );
        });
    }
  }, [id, dispatch]);

  // Tab değiştirme işlemi
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Yeni karar form değişikliklerini takip et
  const handleKararChange = (e) => {
    const { name, value } = e.target;
    setYeniKarar((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Formda hata varsa temizle
    if (kararFormErrors[name]) {
      setKararFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Tarih değişikliğini takip et
  const handleSonTarihChange = (date) => {
    setYeniKarar((prev) => ({
      ...prev,
      sonTarih: date,
    }));
  };

  // Yeni katılımcı form değişikliklerini takip et
  const handleKatilimciChange = (e) => {
    const { name, value } = e.target;
    setYeniKatilimci((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Formda hata varsa temizle
    if (katilimciFormErrors[name]) {
      setKatilimciFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Katılımcı Autocomplete değişikliğini takip et
  const handleKatilimciAutocompleteChange = (event, newValue) => {
    if (newValue) {
      setYeniKatilimci((prev) => ({
        ...prev,
        kisi_id: newValue._id,
      }));

      // Formda hata varsa temizle
      if (katilimciFormErrors.kisi_id) {
        setKatilimciFormErrors((prev) => ({
          ...prev,
          kisi_id: "",
        }));
      }
    } else {
      setYeniKatilimci((prev) => ({
        ...prev,
        kisi_id: "",
      }));
    }
  };

  // Karar formunu doğrula
  const validateKararForm = () => {
    const errors = {};

    if (!yeniKarar.kararNo.trim()) {
      errors.kararNo = "Karar numarası zorunludur";
    }

    if (!yeniKarar.karar.trim()) {
      errors.karar = "Karar metni zorunludur";
    }

    setKararFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Katılımcı formunu doğrula
  const validateKatilimciForm = () => {
    const errors = {};

    if (!yeniKatilimci.kisi_id) {
      errors.kisi_id = "Kişi seçimi zorunludur";
    } else {
      // Aynı kişi daha önce eklenmiş mi kontrol et
      const kisiZatenEkli = katilimcilar.some(
        (k) => k.kisi_id?._id === yeniKatilimci.kisi_id
      );
      if (kisiZatenEkli) {
        errors.kisi_id = "Bu kişi zaten toplantıya katılımcı olarak eklenmiş";
      }
    }

    setKatilimciFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Yeni karar ekleme
  const handleKararEkle = async () => {
    if (!validateKararForm()) {
      toast.error("Lütfen gerekli alanları doldurun");
      return;
    }

    try {
      const kararData = {
        toplanti_id: id,
        ...yeniKarar,
        sonTarih: yeniKarar.sonTarih ? yeniKarar.sonTarih.toISOString() : null,
      };

      await dispatch(addToplantiKarar(kararData)).unwrap();

      // Formu sıfırla
      setYeniKarar({
        kararNo: "",
        karar: "",
        sorumlu: "",
        sonTarih: null,
        durumu: "Beklemede",
      });
    } catch (error) {
      toast.error(error.msg || "Karar eklenirken bir hata oluştu");
    }
  };

  // Yeni katılımcı ekleme
  const handleKatilimciEkle = async () => {
    // Kişinin varlığını tekrar kontrol edelim
    if (!validateKatilimciForm()) {
      toast.error("Lütfen gerekli alanları doldurun");
      return;
    }

    // Seçilen kişinin gerçekten var olduğunu kontrol et
    const selectedKisi = kisiler.find((k) => k._id === yeniKatilimci.kisi_id);
    if (!selectedKisi) {
      toast.error(
        `Seçilen kişi ID: ${yeniKatilimci.kisi_id} bulunamadı. Lütfen kişi listesini yenileyip tekrar deneyin.`
      );
      return;
    }

    try {
      const katilimciData = {
        toplanti_id: id,
        ...yeniKatilimci,
      };

      console.log("Katılımcı ekleniyor:", katilimciData);
      await dispatch(addToplantiKatilimci(katilimciData)).unwrap();

      // Formu sıfırla
      setYeniKatilimci({
        kisi_id: "",
        katilimDurumu: "Katıldı",
        gorev: "Üye",
      });
    } catch (error) {
      console.error("Katılımcı ekleme hatası:", error);
      // Hatayı daha spesifik olarak göster
      if (error.msg && error.msg.includes("kişi bulunamadı")) {
        toast.error(
          "Seçilen kişi bulunamadı. Lütfen sayfayı yenileyip geçerli bir kişi seçin."
        );
      } else if (error.detail) {
        toast.error(`Hata: ${error.msg}. Detay: ${error.detail}`);
      } else {
        toast.error(error.msg || "Katılımcı eklenirken bir hata oluştu");
      }
    }
  };

  // Karar silme işlemleri
  const handleDeleteKararClick = (karar) => {
    setKararToDelete(karar);
    setDeleteKararDialogOpen(true);
  };

  const handleDeleteKararConfirm = async () => {
    if (kararToDelete) {
      try {
        await dispatch(deleteToplantiKarar(kararToDelete._id)).unwrap();
      } catch (error) {
        toast.error(error.msg || "Karar silinirken bir hata oluştu");
      }
    }
    setDeleteKararDialogOpen(false);
    setKararToDelete(null);
  };

  // Karar düzenleme işlemleri
  const handleEditKararClick = (karar) => {
    setKararToEdit({
      ...karar,
      sonTarih: karar.sonTarih ? new Date(karar.sonTarih) : null,
    });
    setEditKararDialogOpen(true);
  };

  const handleKararEditChange = (e) => {
    const { name, value } = e.target;
    setKararToEdit((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKararEditSonTarihChange = (date) => {
    setKararToEdit((prev) => ({
      ...prev,
      sonTarih: date,
    }));
  };

  const handleEditKararConfirm = async () => {
    if (kararToEdit) {
      try {
        const kararData = {
          ...kararToEdit,
          sonTarih: kararToEdit.sonTarih
            ? kararToEdit.sonTarih.toISOString()
            : null,
        };

        await dispatch(
          updateToplantiKarar({
            id: kararToEdit._id,
            kararData: kararData,
          })
        ).unwrap();
      } catch (error) {
        toast.error(error.msg || "Karar güncellenirken bir hata oluştu");
      }
    }
    setEditKararDialogOpen(false);
    setKararToEdit(null);
  };

  // Katılımcı silme işlemleri
  const handleDeleteKatilimciClick = (katilimci) => {
    setKatilimciToDelete(katilimci);
    setDeleteKatilimciDialogOpen(true);
  };

  const handleDeleteKatilimciConfirm = async () => {
    if (katilimciToDelete) {
      try {
        await dispatch(deleteToplantiKatilimci(katilimciToDelete._id)).unwrap();
      } catch (error) {
        toast.error(error.msg || "Katılımcı silinirken bir hata oluştu");
      }
    }
    setDeleteKatilimciDialogOpen(false);
    setKatilimciToDelete(null);
  };

  // Katılımcı düzenleme işlemleri
  const handleEditKatilimciClick = (katilimci) => {
    setKatilimciToEdit(katilimci);
    setEditKatilimciDialogOpen(true);
  };

  const handleKatilimciEditChange = (e) => {
    const { name, value } = e.target;
    setKatilimciToEdit((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditKatilimciConfirm = async () => {
    if (katilimciToEdit) {
      try {
        const katilimciData = {
          katilimDurumu: katilimciToEdit.katilimDurumu,
          gorev: katilimciToEdit.gorev,
        };

        await dispatch(
          updateToplantiKatilimci({
            id: katilimciToEdit._id,
            katilimciData: katilimciData,
          })
        ).unwrap();
      } catch (error) {
        toast.error(
          error.msg || "Katılımcı bilgileri güncellenirken bir hata oluştu"
        );
      }
    }
    setEditKatilimciDialogOpen(false);
    setKatilimciToEdit(null);
  };

  // Karar durumuna göre renk belirleme
  const getStatusColor = (status) => {
    switch (status) {
      case "Tamamlandı":
        return "success";
      case "Devam Ediyor":
        return "primary";
      case "İptal Edildi":
        return "error";
      default:
        return "warning"; // Beklemede
    }
  };

  // Katılım durumuna göre renk belirleme
  const getKatilimColor = (durum) => {
    switch (durum) {
      case "Katıldı":
        return "success";
      case "Mazeretli":
        return "warning";
      case "Katılmadı":
        return "error";
      default:
        return "default";
    }
  };

  // Katılım durumuna göre ikon belirleme
  const getKatilimIcon = (durum) => {
    switch (durum) {
      case "Katıldı":
        return <CheckCircleIcon fontSize="small" />;
      case "Mazeretli":
        return <HourglassIcon fontSize="small" />;
      case "Katılmadı":
        return <CancelIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  // Toplu katılımcı ekleme modalını açma
  const handleBulkKatilimciModalOpen = () => {
    setBulkKatilimciModalOpen(true);
  };

  // Toplu katılımcı ekleme modalını kapatma
  const handleBulkKatilimciModalClose = () => {
    setBulkKatilimciModalOpen(false);
  };

  if (loading && !toplanti) {
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

  if (!toplanti) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Toplantı kaydı bulunamadı.
        </Alert>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/toplantilar")}
          sx={{ mt: 2 }}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

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
          Toplantı Detayları
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={`/toplantilar/duzenle/${id}`}
          >
            Düzenle
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/toplantilar")}
          >
            Geri Dön
          </Button>
        </Box>
      </Box>

      <Fade in={!!toplanti} timeout={500}>
        <Box>
          {/* Toplantı Özet Bilgileri */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Toplantı Türü
                    </Typography>
                    <Chip
                      icon={<EventNoteIcon />}
                      label={toplanti.toplantiTuru}
                      color={
                        toplanti.toplantiTuru === "Planlı Toplantı"
                          ? "primary"
                          : toplanti.toplantiTuru === "Olağanüstü Toplantı"
                          ? "error"
                          : "default"
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Tarih
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarIcon color="action" />
                      <Typography variant="h6" component="div">
                        {new Date(toplanti.tarih).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Saat
                    </Typography>
                    <Typography variant="h6" component="div">
                      {toplanti.baslamaSaati} - {toplanti.bitisSaati}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Toplantı Yeri
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MeetingRoomIcon color="primary" />
                      <Typography variant="h6" component="div">
                        {toplanti.toplantiYeri}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography color="textSecondary" gutterBottom>
                  Oturum No
                </Typography>
                <Typography variant="body1">
                  {toplanti.oturumNo || "-"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography color="textSecondary" gutterBottom>
                  Durum
                </Typography>
                <Chip
                  label={toplanti.isActive ? "Aktif" : "Pasif"}
                  color={toplanti.isActive ? "success" : "error"}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography color="textSecondary" gutterBottom>
                  Kayıt Tarihi
                </Typography>
                <Typography variant="body1">
                  {new Date(toplanti.kayitTarihi).toLocaleDateString()}
                </Typography>
              </Grid>

              {toplanti.aciklama && (
                <Grid item xs={12}>
                  <Typography color="textSecondary" gutterBottom>
                    Açıklama
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1">{toplanti.aciklama}</Typography>
                  </Paper>
                </Grid>
              )}

              {toplanti.gundem && (
                <Grid item xs={12}>
                  <Typography color="textSecondary" gutterBottom>
                    Gündem
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                      {toplanti.gundem}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Karar ve Katılımcı Tabları */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="toplanti detay tabları"
                variant="fullWidth"
              >
                <Tab
                  label="Toplantı Kararları"
                  icon={<AssignmentIcon />}
                  iconPosition="start"
                />
                <Tab
                  label="Katılımcılar"
                  icon={<PeopleIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Kararlar Tab İçeriği */}
            <TabPanel value={tabValue} index={0}>
              <Box>
                {/* Yeni Karar Ekleme Formu */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Yeni Karar Ekle
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        fullWidth
                        label="Karar No*"
                        name="kararNo"
                        value={yeniKarar.kararNo}
                        onChange={handleKararChange}
                        error={!!kararFormErrors.kararNo}
                        helperText={kararFormErrors.kararNo}
                        placeholder="Örn: 2023/5-1"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Sorumlu Kişi"
                        name="sorumlu"
                        value={yeniKarar.sorumlu}
                        onChange={handleKararChange}
                        placeholder="Görevi yerine getirecek kişi"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        adapterLocale={trLocale}
                      >
                        <DatePicker
                          label="Son Tarih"
                          value={yeniKarar.sonTarih}
                          onChange={handleSonTarihChange}
                          renderInput={(params) => (
                            <TextField {...params} fullWidth />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Durumu</InputLabel>
                        <Select
                          name="durumu"
                          value={yeniKarar.durumu}
                          onChange={handleKararChange}
                          label="Durumu"
                        >
                          <MenuItem value="Beklemede">Beklemede</MenuItem>
                          <MenuItem value="Devam Ediyor">Devam Ediyor</MenuItem>
                          <MenuItem value="Tamamlandı">Tamamlandı</MenuItem>
                          <MenuItem value="İptal Edildi">İptal Edildi</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Karar Metni*"
                        name="karar"
                        value={yeniKarar.karar}
                        onChange={handleKararChange}
                        error={!!kararFormErrors.karar}
                        helperText={kararFormErrors.karar}
                        multiline
                        rows={3}
                        placeholder="Alınan karar metni..."
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sx={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleKararEkle}
                        disabled={loading}
                      >
                        Karar Ekle
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Kararlar Listesi */}
                <Paper sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Alınan Kararlar
                    </Typography>
                    <Chip
                      icon={<AssignmentIcon />}
                      label={`${kararlar.length} Karar`}
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {loading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 3 }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : kararlar.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Karar No</TableCell>
                            <TableCell>Karar Metni</TableCell>
                            <TableCell>Sorumlu</TableCell>
                            <TableCell>Son Tarih</TableCell>
                            <TableCell>Durumu</TableCell>
                            <TableCell align="center">İşlemler</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {kararlar.map((karar) => (
                            <TableRow key={karar._id}>
                              <TableCell>{karar.kararNo}</TableCell>
                              <TableCell style={{ maxWidth: "300px" }}>
                                <Tooltip title={karar.karar}>
                                  <Typography
                                    noWrap
                                    sx={{
                                      maxWidth: "300px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {karar.karar}
                                  </Typography>
                                </Tooltip>
                              </TableCell>
                              <TableCell>{karar.sorumlu || "-"}</TableCell>
                              <TableCell>
                                {karar.sonTarih
                                  ? new Date(
                                      karar.sonTarih
                                    ).toLocaleDateString()
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={karar.durumu}
                                  color={getStatusColor(karar.durumu)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    justifyContent: "center",
                                  }}
                                >
                                  <Tooltip title="Düzenle">
                                    <IconButton
                                      color="primary"
                                      size="small"
                                      onClick={() =>
                                        handleEditKararClick(karar)
                                      }
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Sil">
                                    <IconButton
                                      color="error"
                                      size="small"
                                      onClick={() =>
                                        handleDeleteKararClick(karar)
                                      }
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Detay Gör">
                                    <IconButton
                                      color="info"
                                      size="small"
                                      onClick={() =>
                                        handleEditKararClick(karar)
                                      }
                                    >
                                      <FindInPageIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      Henüz karar eklenmemiş. Yukarıdaki formu kullanarak
                      toplantı kararları ekleyebilirsiniz.
                    </Alert>
                  )}
                </Paper>
              </Box>
            </TabPanel>

            {/* Katılımcılar Tab İçeriği */}
            <TabPanel value={tabValue} index={1}>
              <Box>
                {/* Yeni Katılımcı Ekleme Formu */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Yeni Katılımcı Ekle
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Autocomplete
                        options={kisiler || []}
                        getOptionLabel={(option) =>
                          `${option.ad} ${option.soyad}`
                        }
                        value={
                          kisiler.find(
                            (kisi) => kisi._id === yeniKatilimci.kisi_id
                          ) || null
                        }
                        onChange={handleKatilimciAutocompleteChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Kişi Seçin*"
                            error={!!katilimciFormErrors.kisi_id}
                            helperText={katilimciFormErrors.kisi_id}
                          />
                        )}
                        loading={loading}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Katılım Durumu</InputLabel>
                        <Select
                          name="katilimDurumu"
                          value={yeniKatilimci.katilimDurumu}
                          onChange={handleKatilimciChange}
                          label="Katılım Durumu"
                        >
                          <MenuItem value="Katıldı">Katıldı</MenuItem>
                          <MenuItem value="Katılmadı">Katılmadı</MenuItem>
                          <MenuItem value="Mazeretli">Mazeretli</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Görev</InputLabel>
                        <Select
                          name="gorev"
                          value={yeniKatilimci.gorev}
                          onChange={handleKatilimciChange}
                          label="Görev"
                        >
                          <MenuItem value="Başkan">Başkan</MenuItem>
                          <MenuItem value="Sekreter">Sekreter</MenuItem>
                          <MenuItem value="Üye">Üye</MenuItem>
                          <MenuItem value="Gözlemci">Gözlemci</MenuItem>
                          <MenuItem value="Davetli">Davetli</MenuItem>
                          <MenuItem value="Diğer">Diğer</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<GroupAddIcon />}
                        onClick={handleBulkKatilimciModalOpen}
                      >
                        Toplu Katılımcı Ekle
                      </Button>

                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleKatilimciEkle}
                        disabled={loading}
                      >
                        Katılımcı Ekle
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Katılımcılar Listesi */}
                <Paper sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Toplantı Katılımcıları
                    </Typography>
                    <Chip
                      icon={<PeopleIcon />}
                      label={`${katilimcilar.length} Katılımcı`}
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {loading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 3 }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : katilimcilar.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Ad Soyad</TableCell>
                            <TableCell>Görev</TableCell>
                            <TableCell>Üye Rolü</TableCell>
                            <TableCell>Katılım Durumu</TableCell>
                            <TableCell align="center">İşlemler</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {katilimcilar.map((katilimci) => (
                            <TableRow key={katilimci._id}>
                              <TableCell>
                                {katilimci.kisi_id
                                  ? `${katilimci.kisi_id.ad} ${katilimci.kisi_id.soyad}`
                                  : "Bilinmeyen Kişi"}
                              </TableCell>
                              <TableCell>{katilimci.gorev}</TableCell>
                              <TableCell>
                                {katilimci.kisi_id?.rol_id?.ad || "-"}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={getKatilimIcon(katilimci.katilimDurumu)}
                                  label={katilimci.katilimDurumu}
                                  color={getKatilimColor(
                                    katilimci.katilimDurumu
                                  )}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    justifyContent: "center",
                                  }}
                                >
                                  <Tooltip title="Düzenle">
                                    <IconButton
                                      color="primary"
                                      size="small"
                                      onClick={() =>
                                        handleEditKatilimciClick(katilimci)
                                      }
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Sil">
                                    <IconButton
                                      color="error"
                                      size="small"
                                      onClick={() =>
                                        handleDeleteKatilimciClick(katilimci)
                                      }
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      Henüz katılımcı eklenmemiş. Yukarıdaki formu kullanarak
                      toplantı katılımcıları ekleyebilirsiniz.
                    </Alert>
                  )}
                </Paper>
              </Box>
            </TabPanel>
          </Paper>
        </Box>
      </Fade>

      {/* Karar Silme Onay Diyaloğu */}
      <Dialog
        open={deleteKararDialogOpen}
        onClose={() => setDeleteKararDialogOpen(false)}
      >
        <DialogTitle>Toplantı Kararını Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {kararToDelete &&
              `"${kararToDelete.kararNo}" numaralı kararı silmek istediğinize emin misiniz?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteKararDialogOpen(false)}
            color="primary"
          >
            İptal
          </Button>
          <Button onClick={handleDeleteKararConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Karar Düzenleme Diyaloğu */}
      <Dialog
        open={editKararDialogOpen}
        onClose={() => setEditKararDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Toplantı Kararını Düzenle</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Karar No"
                name="kararNo"
                value={kararToEdit?.kararNo || ""}
                onChange={handleKararEditChange}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Sorumlu Kişi"
                name="sorumlu"
                value={kararToEdit?.sorumlu || ""}
                onChange={handleKararEditChange}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={trLocale}
              >
                <DatePicker
                  label="Son Tarih"
                  value={kararToEdit?.sonTarih}
                  onChange={handleKararEditSonTarihChange}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Durumu</InputLabel>
                <Select
                  name="durumu"
                  value={kararToEdit?.durumu || "Beklemede"}
                  onChange={handleKararEditChange}
                  label="Durumu"
                >
                  <MenuItem value="Beklemede">Beklemede</MenuItem>
                  <MenuItem value="Devam Ediyor">Devam Ediyor</MenuItem>
                  <MenuItem value="Tamamlandı">Tamamlandı</MenuItem>
                  <MenuItem value="İptal Edildi">İptal Edildi</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Karar Metni"
                name="karar"
                value={kararToEdit?.karar || ""}
                onChange={handleKararEditChange}
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditKararDialogOpen(false)} color="primary">
            İptal
          </Button>
          <Button onClick={handleEditKararConfirm} color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Katılımcı Silme Onay Diyaloğu */}
      <Dialog
        open={deleteKatilimciDialogOpen}
        onClose={() => setDeleteKatilimciDialogOpen(false)}
      >
        <DialogTitle>Toplantı Katılımcısını Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {katilimciToDelete &&
              katilimciToDelete.kisi_id &&
              `"${katilimciToDelete.kisi_id.ad} ${katilimciToDelete.kisi_id.soyad}" kişisini toplantı katılımcılarından çıkarmak istediğinize emin misiniz?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteKatilimciDialogOpen(false)}
            color="primary"
          >
            İptal
          </Button>
          <Button onClick={handleDeleteKatilimciConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Katılımcı Düzenleme Diyaloğu */}
      <Dialog
        open={editKatilimciDialogOpen}
        onClose={() => setEditKatilimciDialogOpen(false)}
      >
        <DialogTitle>Katılımcı Bilgilerini Düzenle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {katilimciToEdit?.kisi_id
                  ? `${katilimciToEdit.kisi_id.ad} ${katilimciToEdit.kisi_id.soyad}`
                  : "Bilinmeyen Kişi"}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Katılım Durumu</InputLabel>
                <Select
                  name="katilimDurumu"
                  value={katilimciToEdit?.katilimDurumu || "Katıldı"}
                  onChange={handleKatilimciEditChange}
                  label="Katılım Durumu"
                >
                  <MenuItem value="Katıldı">Katıldı</MenuItem>
                  <MenuItem value="Katılmadı">Katılmadı</MenuItem>
                  <MenuItem value="Mazeretli">Mazeretli</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Görev</InputLabel>
                <Select
                  name="gorev"
                  value={katilimciToEdit?.gorev || "Üye"}
                  onChange={handleKatilimciEditChange}
                  label="Görev"
                >
                  <MenuItem value="Başkan">Başkan</MenuItem>
                  <MenuItem value="Sekreter">Sekreter</MenuItem>
                  <MenuItem value="Üye">Üye</MenuItem>
                  <MenuItem value="Gözlemci">Gözlemci</MenuItem>
                  <MenuItem value="Davetli">Davetli</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditKatilimciDialogOpen(false)}
            color="primary"
          >
            İptal
          </Button>
          <Button onClick={handleEditKatilimciConfirm} color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toplu Katılımcı Ekleme Modalı */}
      <BulkKatilimciModal
        open={bulkKatilimciModalOpen}
        onClose={handleBulkKatilimciModalClose}
        toplanti_id={id}
      />
    </Box>
  );
};

export default ToplantiDetay;
