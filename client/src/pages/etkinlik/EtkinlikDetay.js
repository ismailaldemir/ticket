import {
  // Mevcut importlar...
  LinearProgress,
  // Diğer importlar...
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
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
  Alert,
  Fade,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Event as EventIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  AttachFile as AttachFileIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  GroupAdd as GroupAddIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import {
  getEtkinlikById,
  getEtkinlikKatilimcilari,
  getEtkinlikEkler,
  addEtkinlikKatilimci,
  addBulkEtkinlikKatilimci,
  updateEtkinlikKatilimci,
  deleteEtkinlikKatilimci,
  addEtkinlikEk,
  addEtkinlikEkCoklu,
  deleteEtkinlikEk,
  deleteEtkinlik,
  clearCurrentEtkinlik,
  clearEtkinlikError,
} from "../../redux/etkinlik/etkinlikSlice";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import BulkKatilimciModal from "../../components/etkinlik/BulkKatilimciModal";
import DeleteDialog from "../../components/common/DeleteDialog";
import { PermissionRequired, hasPermission } from "../../utils/rbacUtils";

// Tab içeriklerini kontrol eden bileşen
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`etkinlik-tabpanel-${index}`}
      aria-labelledby={`etkinlik-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const EtkinlikDetay = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { etkinlik, katilimcilar, ekler, loading } = useSelector(
    (state) => state.etkinlik
  );
  const { kisiler } = useSelector((state) => state.kisi);
  const { user } = useSelector((state) => state.auth);

  // Tab state'i
  const [tabValue, setTabValue] = useState(0);

  // Katılımcı formu için state
  const [yeniKatilimci, setYeniKatilimci] = useState({
    kisi_id: "",
    katilimDurumu: "Katılacak",
    not: "",
  });

  // Dosya yükleme için state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileDescription, setFileDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form hataları için state
  const [katilimciFormErrors, setKatilimciFormErrors] = useState({});

  // Dialog state'leri
  const [katilimciToDelete, setKatilimciToDelete] = useState(null);
  const [katilimciToEdit, setKatilimciToEdit] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [etkinlikDeleteDialog, setEtkinlikDeleteDialog] = useState(false);
  const [deleteKatilimciDialog, setDeleteKatilimciDialog] = useState(false);
  const [editKatilimciDialog, setEditKatilimciDialog] = useState(false);
  const [deleteFileDialog, setDeleteFileDialog] = useState(false);
  const [bulkKatilimciDialog, setBulkKatilimciDialog] = useState(false);

  // Verilerimizi yükle
  useEffect(() => {
    if (id) {
      dispatch(getEtkinlikById(id));
      dispatch(getEtkinlikKatilimcilari(id));
      dispatch(getEtkinlikEkler(id));
      dispatch(getActiveKisiler());
    }

    return () => {
      dispatch(clearCurrentEtkinlik());
      dispatch(clearEtkinlikError());
    };
  }, [id, dispatch]);

  // Tab değiştirme işlevi
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Form doğrulama işlevi
  const validateKatilimciForm = () => {
    const errors = {};
    if (!yeniKatilimci.kisi_id) {
      errors.kisi_id = "Lütfen bir katılımcı seçin";
    }
    setKatilimciFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form değişikliklerini takip et
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

  // Katılımcı seçimi değiştiğinde
  const handleKatilimciAutocompleteChange = (event, newValue) => {
    if (newValue) {
      // Kişinin zaten eklenmiş olup olmadığını kontrol et
      const isAlreadyAdded = katilimcilar.some(
        (k) => k.kisi_id?._id === newValue._id
      );

      if (isAlreadyAdded) {
        toast.warning(
          `${newValue.ad} ${newValue.soyad} bu etkinliğe zaten eklenmiş`
        );
        return;
      }

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

  // Dosya seçimi değiştiğinde
  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  // Yeni katılımcı ekleme
  const handleKatilimciEkle = async () => {
    if (!hasPermission(user, "etkinlikler_duzenleme")) {
      toast.error("Katılımcı eklemek için yetkiniz yok.");
      return;
    }

    if (!validateKatilimciForm()) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    try {
      await dispatch(
        addEtkinlikKatilimci({
          etkinlikId: id,
          katilimciData: {
            kisi_id: yeniKatilimci.kisi_id,
            katilimDurumu: yeniKatilimci.katilimDurumu,
            not: yeniKatilimci.not,
          },
        })
      ).unwrap();

      // Formu sıfırla
      setYeniKatilimci({
        kisi_id: "",
        katilimDurumu: "Katılacak",
        not: "",
      });
    } catch (error) {
      console.error("Katılımcı ekleme hatası:", error);
    }
  };

  // Toplu katılımcı ekleme modalını aç
  const handleBulkKatilimciModalOpen = () => {
    setBulkKatilimciDialog(true);
  };

  // Toplu katılımcı ekleme
  const handleBulkKatilimciEkle = async (katilimcilar) => {
    if (!katilimcilar || katilimcilar.length === 0) {
      toast.warning("Lütfen en az bir kişi seçin");
      return;
    }

    try {
      await dispatch(
        addBulkEtkinlikKatilimci({
          etkinlikId: id,
          katilimcilar,
        })
      ).unwrap();

      // Katılımcıları yeniden yükle
      dispatch(getEtkinlikKatilimcilari(id));
      setBulkKatilimciDialog(false);
      toast.success(`${katilimcilar.length} katılımcı başarıyla eklendi`);
    } catch (error) {
      console.error("Toplu katılımcı ekleme hatası:", error);
      toast.error("Katılımcılar eklenirken bir hata oluştu");
    }
  };

  // Katılımcı silme işlemleri
  const handleDeleteKatilimciClick = (katilimci) => {
    setKatilimciToDelete(katilimci);
    setDeleteKatilimciDialog(true);
  };

  const handleDeleteKatilimciConfirm = async () => {
    if (!hasPermission(user, "etkinlikler_duzenleme")) {
      toast.error("Katılımcı silmek için yetkiniz yok.");
      setDeleteKatilimciDialog(false);
      return;
    }

    try {
      await dispatch(deleteEtkinlikKatilimci(katilimciToDelete._id)).unwrap();
      setDeleteKatilimciDialog(false);
      setKatilimciToDelete(null);
    } catch (error) {
      console.error("Katılımcı silme hatası:", error);
    }
  };

  // Katılımcı düzenleme işlemleri
  const handleEditKatilimciClick = (katilimci) => {
    setKatilimciToEdit({
      ...katilimci,
    });
    setEditKatilimciDialog(true);
  };

  const handleEditKatilimciChange = (e) => {
    const { name, value } = e.target;
    setKatilimciToEdit((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditKatilimciSubmit = async () => {
    try {
      await dispatch(
        updateEtkinlikKatilimci({
          katilimciId: katilimciToEdit._id,
          katilimciData: {
            katilimDurumu: katilimciToEdit.katilimDurumu,
            not: katilimciToEdit.not,
          },
        })
      ).unwrap();

      setEditKatilimciDialog(false);
      setKatilimciToEdit(null);
    } catch (error) {
      console.error("Katılımcı güncelleme hatası:", error);
    }
  };

  // Dosya yükleme işlemi
  const handleFileUpload = async () => {
    if (!hasPermission(user, "etkinlikler_duzenleme")) {
      toast.error("Dosya yüklemek için yetkiniz yok.");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.warning("Lütfen en az bir dosya seçin");
      return;
    }

    try {
      const formData = new FormData();

      if (selectedFiles.length === 1) {
        // Tek dosya yükleme
        formData.append("dosya", selectedFiles[0]);
        if (fileDescription) {
          formData.append("aciklama", fileDescription);
        }

        await dispatch(
          addEtkinlikEk({
            etkinlikId: id,
            formData,
          })
        ).unwrap();
      } else {
        // Çoklu dosya yükleme
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append("dosyalar", selectedFiles[i]);
        }
        if (fileDescription) {
          formData.append("aciklama", fileDescription);
        }

        await dispatch(
          addEtkinlikEkCoklu({
            etkinlikId: id,
            formData,
          })
        ).unwrap();
      }

      // Formu sıfırla
      setSelectedFiles([]);
      setFileDescription("");
      setUploadProgress(0);
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
    }
  };

  // Dosya silme işlemleri
  const handleDeleteFileClick = (file) => {
    setFileToDelete(file);
    setDeleteFileDialog(true);
  };

  const handleDeleteFileConfirm = async () => {
    if (!hasPermission(user, "etkinlikler_duzenleme")) {
      toast.error("Dosya silmek için yetkiniz yok.");
      setDeleteFileDialog(false);
      return;
    }

    try {
      await dispatch(deleteEtkinlikEk(fileToDelete._id)).unwrap();
      setDeleteFileDialog(false);
      setFileToDelete(null);
    } catch (error) {
      console.error("Dosya silme hatası:", error);
    }
  };

  // Etkinlik silme işlemleri
  const handleDeleteEtkinlikClick = () => {
    setEtkinlikDeleteDialog(true);
  };

  const handleDeleteEtkinlikConfirm = async () => {
    try {
      await dispatch(deleteEtkinlik(id)).unwrap();
      toast.success("Etkinlik başarıyla silindi");
      navigate("/etkinlikler");
    } catch (error) {
      console.error("Etkinlik silme hatası:", error);
    }
  };

  // Dosyanın boyut bilgisini okunabilir formatta döndürür
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  // Dosya adından uzantıyı almak için yardımcı fonksiyon
  const getFileExtension = (filename) => {
    return filename.split(".").pop().toLowerCase();
  };

  // Dosya türüne göre simge döndür
  const getFileTypeIcon = (mimetype, extension) => {
    if (mimetype.startsWith("image/")) {
      return "🖼️";
    } else if (mimetype.includes("pdf") || extension === "pdf") {
      return "📄";
    } else if (
      mimetype.includes("word") ||
      ["doc", "docx"].includes(extension)
    ) {
      return "📝";
    } else if (
      mimetype.includes("excel") ||
      ["xls", "xlsx"].includes(extension)
    ) {
      return "📊";
    } else if (mimetype.includes("zip") || ["zip", "rar"].includes(extension)) {
      return "📦";
    } else {
      return "📎";
    }
  };

  // Katılım durumu için renk döndürür
  const getKatilimDurumuColor = (durum) => {
    switch (durum) {
      case "Katıldı":
        return "success";
      case "Katılacak":
        return "primary";
      case "Katılmayacak":
        return "error";
      case "Belki":
        return "warning";
      default:
        return "default";
    }
  };

  // Etkinlik durumu için renk döndürür
  const getDurumuColor = (durum) => {
    switch (durum) {
      case "Planlandı":
        return "primary";
      case "Devam Ediyor":
        return "success";
      case "Tamamlandı":
        return "info";
      case "İptal Edildi":
        return "error";
      case "Ertelendi":
        return "warning";
      default:
        return "default";
    }
  };

  if (loading && !etkinlik) {
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

  if (!etkinlik) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Etkinlik bulunamadı.</Alert>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/etkinlikler")}
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
          Etkinlik Detayı
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <PermissionRequired yetkiKodu="etkinlikler_duzenleme">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              component={Link}
              to={`/etkinlikler/duzenle/${id}`}
            >
              Düzenle
            </Button>
          </PermissionRequired>
          <PermissionRequired yetkiKodu="etkinlikler_duzenleme">
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteEtkinlikClick}
            >
              Sil
            </Button>
          </PermissionRequired>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/etkinlikler")}
          >
            Geri Dön
          </Button>
        </Box>
      </Box>

      <Fade in={true} timeout={500}>
        <Box>
          {/* Etkinlik Özet Bilgileri */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h6" component="div">
                      {etkinlik.etkinlikAdi}
                    </Typography>
                    <Chip
                      label={etkinlik.durumu}
                      color={getDurumuColor(etkinlik.durumu)}
                      size="small"
                    />
                  </Box>
                  <Chip
                    label={etkinlik.isActive ? "Aktif" : "Pasif"}
                    color={etkinlik.isActive ? "success" : "error"}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Organizasyon
                    </Typography>
                    <Typography variant="body1">
                      {etkinlik.organizasyon_id?.ad || "Belirtilmemiş"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Sorumlu Kişi
                    </Typography>
                    <Typography variant="body1">
                      {etkinlik.sorumlukisi_id
                        ? `${etkinlik.sorumlukisi_id.ad} ${etkinlik.sorumlukisi_id.soyad}`
                        : "Belirtilmemiş"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Tarih ve Zaman
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DateRangeIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        {new Date(etkinlik.baslamaTarihi).toLocaleDateString()}
                        {etkinlik.bitisTarihi &&
                          ` - ${new Date(
                            etkinlik.bitisTarihi
                          ).toLocaleDateString()}`}
                      </Typography>
                    </Box>
                    {(etkinlik.baslamaSaati || etkinlik.bitisSaati) && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <AccessTimeIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          {etkinlik.baslamaSaati || ""}
                          {etkinlik.bitisSaati &&
                            etkinlik.baslamaSaati &&
                            " - "}
                          {etkinlik.bitisSaati || ""}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Katılımcı Limiti
                    </Typography>
                    <Typography variant="body1">
                      {etkinlik.maksimumKatilimci > 0
                        ? `${
                            katilimcilar.filter(
                              (k) =>
                                k.katilimDurumu === "Katılacak" ||
                                k.katilimDurumu === "Katıldı"
                            ).length
                          } / ${etkinlik.maksimumKatilimci}`
                        : "Sınırsız"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Toplam: {katilimcilar.length} kişi
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {etkinlik.yer && (
                <Grid item xs={12} sm={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Etkinlik Yeri
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon color="action" />
                    <Typography variant="body1">{etkinlik.yer}</Typography>
                  </Box>
                </Grid>
              )}
              {etkinlik.etiketler && etkinlik.etiketler.length > 0 && (
                <Grid item xs={12}>
                  <Typography color="textSecondary" gutterBottom>
                    Etiketler
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {etkinlik.etiketler.map((etiket, index) => (
                      <Chip
                        key={index}
                        label={etiket}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Grid>
              )}
              {etkinlik.aciklama && (
                <Grid item xs={12}>
                  <Typography color="textSecondary" gutterBottom>
                    Açıklama
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                      {etkinlik.aciklama}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Sekme Yapısı */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="etkinlik detay sekmeleri"
                variant="fullWidth"
              >
                <Tab
                  label="Katılımcılar"
                  icon={<PeopleIcon />}
                  iconPosition="start"
                />
                <Tab
                  label="Dosyalar"
                  icon={<AttachFileIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Katılımcılar Sekmesi */}
            <TabPanel value={tabValue} index={0}>
              <Box>
                {/* Katılımcı Ekleme Formu */}
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
                            label="Katılımcı *"
                            error={!!katilimciFormErrors.kisi_id}
                            helperText={katilimciFormErrors.kisi_id}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <PersonIcon />
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        isOptionEqualToValue={(option, value) =>
                          option._id === value._id
                        }
                        filterOptions={(options, state) => {
                          // Seçenekleri filtrelerken eklenmiş kişileri işaretle ama filtreleme dışı bırakma
                          return options.filter((option) => {
                            const searchMatch =
                              option.ad
                                .toLowerCase()
                                .includes(state.inputValue.toLowerCase()) ||
                              option.soyad
                                .toLowerCase()
                                .includes(state.inputValue.toLowerCase());
                            return searchMatch;
                          });
                        }}
                        getOptionDisabled={(option) => {
                          return katilimcilar.some(
                            (k) => k.kisi_id?._id === option._id
                          );
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Katılım Durumu *</InputLabel>
                        <Select
                          name="katilimDurumu"
                          value={yeniKatilimci.katilimDurumu}
                          onChange={handleKatilimciChange}
                          label="Katılım Durumu *"
                          startAdornment={
                            <InputAdornment position="start">
                              <EventIcon />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="Katılacak">Katılacak</MenuItem>
                          <MenuItem value="Katılmayacak">Katılmayacak</MenuItem>
                          <MenuItem value="Belki">Belki</MenuItem>
                          <MenuItem value="Katıldı">Katıldı</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Not"
                        name="not"
                        value={yeniKatilimci.not}
                        onChange={handleKatilimciChange}
                        multiline
                        rows={1}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ display: "flex", gap: 2 }}>
                      <PermissionRequired yetkiKodu="etkinlikler_duzenleme">
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<GroupAddIcon />}
                          onClick={handleBulkKatilimciModalOpen}
                          disabled={loading}
                        >
                          Toplu Katılımcı Ekle
                        </Button>
                      </PermissionRequired>
                      <PermissionRequired yetkiKodu="etkinlikler_duzenleme">
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={handleKatilimciEkle}
                          disabled={loading}
                        >
                          Katılımcı Ekle
                        </Button>
                      </PermissionRequired>
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
                      Etkinlik Katılımcıları
                    </Typography>
                    <Chip
                      icon={<PeopleIcon />}
                      label={`${katilimcilar.length} Katılımcı`}
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Box>
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
                            <TableCell>Adı Soyadı</TableCell>
                            <TableCell>İletişim</TableCell>
                            <TableCell>Katılım Durumu</TableCell>
                            <TableCell>Not</TableCell>
                            <TableCell align="center">İşlemler</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {katilimcilar.map((katilimci) => (
                            <TableRow key={katilimci._id}>
                              <TableCell>
                                <Typography variant="subtitle2">
                                  {katilimci.kisi_id?.ad}{" "}
                                  {katilimci.kisi_id?.soyad}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {katilimci.kisi_id?.telefonNumarasi || "-"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={katilimci.katilimDurumu}
                                  color={getKatilimDurumuColor(
                                    katilimci.katilimDurumu
                                  )}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {katilimci.not}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <PermissionRequired yetkiKodu="etkinlikler_duzenleme">
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
                                  </PermissionRequired>
                                  <PermissionRequired yetkiKodu="etkinlikler_duzenleme">
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
                                  </PermissionRequired>
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
                      etkinlik katılımcıları ekleyebilirsiniz.
                    </Alert>
                  )}
                </Paper>
              </Box>
            </TabPanel>

            {/* Dosyalar Sekmesi */}
            <TabPanel value={tabValue} index={1}>
              <Box>
                {/* Dosya Yükleme Formu */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Dosya Yükle
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="file"
                        inputProps={{ multiple: true }}
                        onChange={handleFileChange}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachFileIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        {selectedFiles.length > 0
                          ? `${selectedFiles.length} dosya seçildi`
                          : "Dosya seçilmedi"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Dosya Açıklaması"
                        value={fileDescription}
                        onChange={(e) => setFileDescription(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <PermissionRequired yetkiKodu="etkinlikler_duzenleme">
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<CloudUploadIcon />}
                          onClick={handleFileUpload}
                          disabled={loading || selectedFiles.length === 0}
                        >
                          Yükle
                        </Button>
                      </PermissionRequired>
                    </Grid>
                    {uploadProgress > 0 && (
                      <Grid item xs={12}>
                        <LinearProgress
                          variant="determinate"
                          value={uploadProgress}
                        />
                        <Typography
                          variant="caption"
                          align="center"
                          display="block"
                        >
                          {uploadProgress}% yüklendi
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>

                {/* Dosyalar Listesi */}
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
                      Etkinlik Dosyaları
                    </Typography>
                    <Chip
                      icon={<AttachFileIcon />}
                      label={`${ekler.length} Dosya`}
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Box>
                  {loading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 3 }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : ekler.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Dosya Adı</TableCell>
                            <TableCell>Tür</TableCell>
                            <TableCell>Boyut</TableCell>
                            <TableCell>Açıklama</TableCell>
                            <TableCell>Yüklenme Tarihi</TableCell>
                            <TableCell align="center">İşlemler</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ekler.map((ek) => {
                            const extension = getFileExtension(
                              ek.orijinalDosyaAdi
                            );
                            const fileIcon = getFileTypeIcon(
                              ek.mimeTur,
                              extension
                            );
                            return (
                              <TableRow key={ek._id}>
                                <TableCell>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography variant="h6">
                                      {fileIcon}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        maxWidth: 200,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {ek.orijinalDosyaAdi}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={ek.ekTur}
                                    color={
                                      ek.ekTur === "Resim"
                                        ? "success"
                                        : ek.ekTur === "Belge"
                                        ? "primary"
                                        : "default"
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {formatFileSize(ek.dosyaBoyutu)}
                                </TableCell>
                                <TableCell>{ek.aciklama || "-"}</TableCell>
                                <TableCell>
                                  {new Date(
                                    ek.yuklemeTarihi
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Tooltip title="İndir">
                                      <IconButton
                                        color="primary"
                                        size="small"
                                        href={`/${ek.dosyaYolu}`}
                                        target="_blank"
                                        download
                                      >
                                        <CloudDownloadIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <PermissionRequired yetkiKodu="etkinlikler_duzenleme">
                                      <Tooltip title="Sil">
                                        <IconButton
                                          color="error"
                                          size="small"
                                          onClick={() =>
                                            handleDeleteFileClick(ek)
                                          }
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </PermissionRequired>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      Henüz dosya yüklenmemiş. Yukarıdaki formu kullanarak
                      etkinlikle ilgili dosyalar yükleyebilirsiniz.
                    </Alert>
                  )}
                </Paper>
              </Box>
            </TabPanel>
          </Paper>
        </Box>
      </Fade>

      {/* Dialog bileşenlerini standardize edelim */}
      {/* Katılımcı Silme Diyaloğu */}
      <DeleteDialog
        open={deleteKatilimciDialog}
        onClose={() => setDeleteKatilimciDialog(false)}
        onConfirm={handleDeleteKatilimciConfirm}
        title="Katılımcı Sil"
        content={
          katilimciToDelete &&
          `${katilimciToDelete.kisi_id?.ad} ${katilimciToDelete.kisi_id?.soyad} isimli katılımcıyı etkinlikten çıkarmak istediğinize emin misiniz?`
        }
      />

      {/* Katılımcı Düzenleme Diyaloğu */}
      <Dialog
        open={editKatilimciDialog}
        onClose={() => setEditKatilimciDialog(false)}
      >
        <DialogTitle>Katılımcı Düzenle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {katilimciToEdit &&
                  `${katilimciToEdit.kisi_id?.ad} ${katilimciToEdit.kisi_id?.soyad}`}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Katılım Durumu</InputLabel>
                <Select
                  name="katilimDurumu"
                  value={katilimciToEdit?.katilimDurumu || ""}
                  onChange={handleEditKatilimciChange}
                  label="Katılım Durumu"
                >
                  <MenuItem value="Katılacak">Katılacak</MenuItem>
                  <MenuItem value="Katılmayacak">Katılmayacak</MenuItem>
                  <MenuItem value="Belki">Belki</MenuItem>
                  <MenuItem value="Katıldı">Katıldı</MenuItem>
                  <MenuItem value="Belirtilmemiş">Belirtilmemiş</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Not"
                name="not"
                value={katilimciToEdit?.not || ""}
                onChange={handleEditKatilimciChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditKatilimciDialog(false)}>İptal</Button>
          <Button onClick={handleEditKatilimciSubmit} color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dosya Silme Diyaloğu */}
      <DeleteDialog
        open={deleteFileDialog}
        onClose={() => setDeleteFileDialog(false)}
        onConfirm={handleDeleteFileConfirm}
        title="Dosya Sil"
        content={
          fileToDelete &&
          `"${fileToDelete.orijinalDosyaAdi}" dosyasını silmek istediğinize emin misiniz?`
        }
      />

      {/* Etkinlik Silme Diyaloğu */}
      <DeleteDialog
        open={etkinlikDeleteDialog}
        onClose={() => setEtkinlikDeleteDialog(false)}
        onConfirm={handleDeleteEtkinlikConfirm}
        title="Etkinlik Sil"
        content={`"${etkinlik.etkinlikAdi}" etkinliğini, tüm katılımcı bilgilerini ve yüklenen dosyaları kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
      />

      {/* Toplu Katılımcı Ekleme Modal'i */}
      <BulkKatilimciModal
        open={bulkKatilimciDialog}
        onClose={() => setBulkKatilimciDialog(false)}
        kisiler={kisiler}
        existingKisiIds={katilimcilar.map((k) => k.kisi_id?._id)}
        title="Etkinliğe Toplu Katılımcı Ekle"
        onSubmit={handleBulkKatilimciEkle}
      />
    </Box>
  );
};

export default EtkinlikDetay;
