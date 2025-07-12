import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  Fade,
  Grow,
  TablePagination,
  InputAdornment,
  Checkbox,
  Toolbar,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  FileDownload as FileDownloadIcon,
  ClearAll as ClearAllIcon,
  Search as SearchIcon,
  CalendarMonth as CalendarMonthIcon,
  StraightenOutlined as MeasureIcon,
} from "@mui/icons-material";
import { getAboneById } from "../../redux/abone/aboneSlice";
import {
  getAboneDetaylarByAbone,
  addAboneDetay,
  updateAboneDetay,
  deleteAboneDetay,
  clearCurrentAboneDetay,
  deleteManyAboneDetaylar,
} from "../../redux/aboneDetay/aboneDetaySlice";
import { getActiveUcretler } from "../../redux/ucret/ucretSlice";
import { toast } from "react-toastify";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import trLocale from "date-fns/locale/tr";
import ExportModal from "../../components/common/ExportModal";
import { formatDate, formatCurrency } from "../../utils/exportService";
import { PermissionRequired, hasPermission } from "../../utils/rbacUtils";

const AboneDetay = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams(); // abone_id

  const { abone, loading: aboneLoading } = useSelector((state) => state.abone);
  const { aboneDetaylar, loading: detayLoading } = useSelector(
    (state) => state.aboneDetay
  );
  const { ucretler } = useSelector((state) => state.ucret);
  const { user } = useSelector((state) => state.auth);

  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);

  // Diğer states...
  // Yeni detay ekleme için state
  const [yeniDetay, setYeniDetay] = useState({
    abone_id: id,
    yil: new Date().getFullYear(),
    ay: new Date().getMonth() + 1,
    ilkTarih: new Date().toISOString().split("T")[0],
    ilkEndeks: 0,
    sonTarih: "",
    sonEndeks: "",
    ucret_id: "",
    durumu: "Okundu", // Varsayılan değeri "Okundu" olarak değiştirdik
    aciklama: "",
  });

  // Detay kaydı silme için state
  const [detayToDelete, setDetayToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Detay kaydı düzenleme için state
  const [detayToEdit, setDetayToEdit] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Görüntüleme seçenekleri
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    yil: "",
    ay: "",
    durumu: "",
  });

  // Dışa aktarma seçenekleri
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Mevcut dönemleri takip etmek için
  const [mevutDonemler, setMevutDonemler] = useState([]);

  // Çoklu silme için dialog state'i
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getAboneById(id));
      dispatch(getAboneDetaylarByAbone(id));
      dispatch(getActiveUcretler());
    }

    return () => {
      dispatch(clearCurrentAboneDetay());
    };
  }, [id, dispatch]);

  // Mevcut dönemleri takip et
  useEffect(() => {
    if (aboneDetaylar && aboneDetaylar.length > 0) {
      const donemler = aboneDetaylar.map((detay) => `${detay.yil}-${detay.ay}`);
      setMevutDonemler(donemler);
    }
  }, [aboneDetaylar]);

  // Son dönem bilgilerini almak için
  useEffect(() => {
    if (aboneDetaylar && aboneDetaylar.length > 0) {
      // Aboneye ait detayları yıl ve ay bazında sıralayalım
      const sortedDetaylar = [...aboneDetaylar].sort((a, b) => {
        if (a.yil !== b.yil) return b.yil - a.yil;
        return b.ay - a.ay;
      });

      // En son dönemin bilgilerini alalım
      const sonDonem = sortedDetaylar[0];

      // Eğer son dönemin son endeks değeri varsa, yeni dönem için ilk değer olarak kullanılabilir
      if (sonDonem && sonDonem.sonEndeks) {
        // Bir sonraki ayı ve yılı hesapla
        let sonrakiAy = sonDonem.ay + 1;
        let sonrakiYil = sonDonem.yil;

        if (sonrakiAy > 12) {
          sonrakiAy = 1;
          sonrakiYil++;
        }

        setYeniDetay((prev) => ({
          ...prev,
          yil: sonrakiYil,
          ay: sonrakiAy,
          ilkTarih: sonDonem.sonTarih || new Date().toISOString().split("T")[0],
          ilkEndeks: sonDonem.sonEndeks,
        }));
      }
    }
  }, [aboneDetaylar]);

  // Filtreleme fonksiyonu
  const filterDetaylar = () => {
    if (!aboneDetaylar) return [];

    let filteredData = [...aboneDetaylar];

    if (filters.yil) {
      filteredData = filteredData.filter(
        (detay) => detay.yil === parseInt(filters.yil)
      );
    }

    if (filters.ay) {
      filteredData = filteredData.filter(
        (detay) => detay.ay === parseInt(filters.ay)
      );
    }

    if (filters.durumu) {
      filteredData = filteredData.filter(
        (detay) => detay.durumu === filters.durumu
      );
    }

    return filteredData;
  };

  const filteredDetaylar = filterDetaylar();

  // Sayfalama işlemleri
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Abone kayıt işlemleri
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      yil: "",
      ay: "",
      durumu: "",
    });
  };

  const handleRefresh = () => {
    dispatch(getAboneDetaylarByAbone(id));
  };

  // Yeni detay ekleme işlemleri
  const handleDetayChange = (e) => {
    const { name, value } = e.target;
    setYeniDetay((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Otomatik tüketim ve toplam tutar hesaplama
    if (name === "sonEndeks" && yeniDetay.ilkEndeks !== undefined) {
      const sonEndeksValue = parseFloat(value) || 0;
      const ilkEndeksValue = parseFloat(yeniDetay.ilkEndeks) || 0;

      if (sonEndeksValue >= ilkEndeksValue) {
        const tuketim = sonEndeksValue - ilkEndeksValue;

        // Seçilen ücret varsa birim fiyatı belirle
        const seciliUcret = yeniDetay.ucret_id
          ? ucretler.find((u) => u._id === yeniDetay.ucret_id)
          : null;

        if (seciliUcret) {
          const birimFiyat = seciliUcret.tutar || 0;
          const toplamTutar = tuketim * birimFiyat;

          setYeniDetay((prev) => ({
            ...prev,
            sonEndeks: value,
            tuketim,
            birimFiyat,
            toplamTutar,
          }));
        } else {
          setYeniDetay((prev) => ({
            ...prev,
            sonEndeks: value,
            tuketim,
          }));
        }
      }
    }

    // Ücret seçildiğinde birim fiyatı güncelle
    if (name === "ucret_id") {
      const seciliUcret = ucretler.find((u) => u._id === value);
      if (seciliUcret && yeniDetay.tuketim !== undefined) {
        const birimFiyat = seciliUcret.tutar || 0;
        const tuketim = yeniDetay.tuketim || 0;
        const toplamTutar = tuketim * birimFiyat;

        setYeniDetay((prev) => ({
          ...prev,
          ucret_id: value,
          birimFiyat,
          toplamTutar,
        }));
      }
    }
  };

  // Tarih değeri değişikliğini işle
  const handleDateChange = (name, date) => {
    // date null veya geçersiz bir değerse, boş string kullan
    const formattedDate =
      date && date instanceof Date && !isNaN(date.getTime())
        ? date.toISOString().split("T")[0]
        : "";

    setYeniDetay((prev) => ({
      ...prev,
      [name]: formattedDate,
    }));
  };

  // Dönem zaten mevcut mu kontrolü
  const isDonemMevcut = (yil, ay) => {
    return mevutDonemler.includes(`${yil}-${ay}`);
  };

  // Detay ekleme fonksiyonu güncellendi
  const handleDetayEkle = async () => {
    if (!hasPermission(user, "abonedetaylar_ekleme")) {
      toast.error("Dönem kaydı eklemek için yetkiniz yok.");
      return;
    }

    // Validasyon
    if (!yeniDetay.ilkEndeks && yeniDetay.ilkEndeks !== 0) {
      toast.error("İlk endeks değeri gereklidir");
      return;
    }

    if (!yeniDetay.ucret_id) {
      toast.error("Lütfen bir ücret türü seçin");
      return;
    }

    // Dönem kontrolü
    if (isDonemMevcut(yeniDetay.yil, yeniDetay.ay)) {
      toast.error(
        `${getAyAdi(yeniDetay.ay)} ${
          yeniDetay.yil
        } dönemi için zaten bir kayıt mevcut`
      );
      return;
    }

    try {
      // İlk endeks değeri sayısal değilse 0 olarak ayarla
      const ilkEndeks = parseFloat(yeniDetay.ilkEndeks) || 0;

      // Son endeks değerini kontrol et
      let sonEndeks = parseFloat(yeniDetay.sonEndeks) || null;
      let tuketim = 0;

      // Eğer son endeks girilmişse ve ilk endeksten küçükse hata ver
      if (sonEndeks !== null && sonEndeks < ilkEndeks) {
        toast.error("Son endeks değeri ilk endeks değerinden küçük olamaz");
        return;
      }

      // Tuketim ve birim fiyat hesapla
      if (sonEndeks !== null) {
        tuketim = sonEndeks - ilkEndeks;
      }

      // Seçilen ücret türüne göre birim fiyatı belirle
      const seciliUcret = ucretler.find((u) => u._id === yeniDetay.ucret_id);
      const birimFiyat = seciliUcret ? seciliUcret.tutar : 0;

      // Toplam tutar hesapla
      const toplamTutar = tuketim * birimFiyat;

      const aboneDetayData = {
        abone_id: id,
        yil: parseInt(yeniDetay.yil),
        ay: parseInt(yeniDetay.ay),
        ilkTarih: yeniDetay.ilkTarih,
        ilkEndeks,
        sonTarih: yeniDetay.sonTarih || null,
        sonEndeks: sonEndeks || null,
        tuketim,
        ucret_id: yeniDetay.ucret_id,
        birimFiyat,
        toplamTutar,
        durumu: sonEndeks ? "Okundu" : "Okunmadı", // Son endeks varsa "Okundu", yoksa "Okunmadı"
        aciklama: yeniDetay.aciklama || "",
      };

      await dispatch(addAboneDetay(aboneDetayData)).unwrap();

      // Formu sıfırla - sonraki dönem için hazırla
      let sonrakiAy = yeniDetay.ay + 1;
      let sonrakiYil = yeniDetay.yil;

      if (sonrakiAy > 12) {
        sonrakiAy = 1;
        sonrakiYil++;
      }

      setYeniDetay({
        abone_id: id,
        yil: sonrakiYil,
        ay: sonrakiAy,
        ilkTarih: yeniDetay.sonTarih || new Date().toISOString().split("T")[0],
        ilkEndeks: sonEndeks || 0,
        sonTarih: "",
        sonEndeks: "",
        ucret_id: "",
        durumu: "Okundu",
        aciklama: "",
      });
    } catch (error) {
      console.error("Abone detayı eklenirken hata oluştu:", error);
      toast.error(error.msg || "Abone detay kaydı eklenemedi");
    }
  };

  // Silme işlemleri
  const handleDeleteClick = (detay) => {
    setDetayToDelete(detay);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!hasPermission(user, "abonedetaylar_silme")) {
      toast.error("Dönem kaydı silmek için yetkiniz yok.");
      setDeleteDialogOpen(false);
      return;
    }

    if (detayToDelete) {
      try {
        await dispatch(deleteAboneDetay(detayToDelete._id)).unwrap();
        toast.success("Abone detay kaydı silindi");
      } catch (error) {
        toast.error(
          error.msg || "Abone detay kaydı silinirken bir hata oluştu"
        );
      }
    }
    setDeleteDialogOpen(false);
    setDetayToDelete(null);
  };

  // Düzenleme işlemleri
  const handleEditClick = (detay) => {
    setDetayToEdit({
      ...detay,
      ilkTarih: detay.ilkTarih
        ? new Date(detay.ilkTarih).toISOString().split("T")[0]
        : "",
      sonTarih: detay.sonTarih
        ? new Date(detay.sonTarih).toISOString().split("T")[0]
        : "",
    });
    setEditDialogOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setDetayToEdit((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Otomatik tüketim ve toplam tutar hesaplama
    if (name === "sonEndeks" && detayToEdit.ilkEndeks !== undefined) {
      const sonEndeksValue = parseFloat(value) || 0;
      const ilkEndeksValue = parseFloat(detayToEdit.ilkEndeks) || 0;

      if (sonEndeksValue >= ilkEndeksValue) {
        const tuketim = sonEndeksValue - ilkEndeksValue;
        const birimFiyat = detayToEdit.birimFiyat || 0;
        const toplamTutar = tuketim * birimFiyat;

        setDetayToEdit((prev) => ({
          ...prev,
          sonEndeks: value,
          tuketim,
          toplamTutar,
        }));
      }
    }

    // İlk endeks değişikliğinde de tuketim ve toplam tutarı güncelle
    if (name === "ilkEndeks" && detayToEdit.sonEndeks !== undefined) {
      const ilkEndeksValue = parseFloat(value) || 0;
      const sonEndeksValue = parseFloat(detayToEdit.sonEndeks) || 0;

      if (sonEndeksValue >= ilkEndeksValue) {
        const tuketim = sonEndeksValue - ilkEndeksValue;
        const birimFiyat = detayToEdit.birimFiyat || 0;
        const toplamTutar = tuketim * birimFiyat;

        setDetayToEdit((prev) => ({
          ...prev,
          ilkEndeks: value,
          tuketim,
          toplamTutar,
        }));
      }
    }
  };

  const handleEditDateChange = (name, date) => {
    // date null veya geçersiz bir değerse, boş string kullan
    const formattedDate =
      date && date instanceof Date && !isNaN(date.getTime())
        ? date.toISOString().split("T")[0]
        : "";

    setDetayToEdit((prev) => ({
      ...prev,
      [name]: formattedDate,
    }));
  };

  const handleEditSubmit = async () => {
    if (!hasPermission(user, "abonedetaylar_guncelleme")) {
      toast.error("Dönem kaydı güncellemek için yetkiniz yok.");
      return;
    }

    if (!detayToEdit) return;

    // Validasyon
    if (
      detayToEdit.sonEndeks &&
      parseFloat(detayToEdit.sonEndeks) < parseFloat(detayToEdit.ilkEndeks)
    ) {
      toast.error("Son endeks değeri ilk endeks değerinden küçük olamaz");
      return;
    }

    try {
      // İlk endeks değeri sayısal değilse 0 olarak ayarla
      const ilkEndeks = parseFloat(detayToEdit.ilkEndeks) || 0;

      // Son endeks değerini kontrol et
      const sonEndeks = parseFloat(detayToEdit.sonEndeks) || null;
      let tuketim = 0;

      // Tuketim ve toplam tutar hesapla
      if (sonEndeks !== null) {
        tuketim = sonEndeks - ilkEndeks;
      }

      const birimFiyat = parseFloat(detayToEdit.birimFiyat) || 0;
      const toplamTutar = tuketim * birimFiyat;

      const aboneDetayData = {
        ilkTarih: detayToEdit.ilkTarih,
        ilkEndeks,
        sonTarih: detayToEdit.sonTarih || null,
        sonEndeks: sonEndeks || null,
        tuketim,
        birimFiyat,
        toplamTutar,
        durumu: detayToEdit.durumu,
        aciklama: detayToEdit.aciklama || "",
      };

      await dispatch(
        updateAboneDetay({
          id: detayToEdit._id,
          aboneDetayData,
        })
      ).unwrap();

      setEditDialogOpen(false);
      setDetayToEdit(null);
    } catch (error) {
      console.error("Abone detay kaydı güncellenirken hata:", error);
      toast.error(error.msg || "Abone detay kaydı güncellenemedi");
    }
  };

  // Duruma göre renk belirleme
  const getStatusColor = (status) => {
    switch (status) {
      case "Okunmadı":
        return "warning";
      case "Okundu":
        return "info";
      case "Fatura Kesildi":
        return "primary";
      case "Ödendi":
        return "success";
      case "Devam Ediyor":
        return "secondary";
      case "İptal":
        return "error";
      default:
        return "default";
    }
  };

  // Ay adını getiren fonksiyon
  const getAyAdi = (ay) => {
    const aylar = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];
    return aylar[ay - 1] || "";
  };

  // Loading durumu kontrolü
  if ((aboneLoading || detayLoading) && !abone) {
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

  if (!abone) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Abone bulunamadı.</Alert>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/aboneler")}
          sx={{ mt: 2 }}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  // Dışa aktarma için sütun tanımları
  const exportColumns = [
    {
      id: "yil",
      header: "Yıl",
      accessor: (item) => item.yil.toString(),
    },
    {
      id: "ay",
      header: "Ay",
      accessor: (item) => getAyAdi(item.ay),
    },
    {
      id: "ilkTarih",
      header: "İlk Okuma Tarihi",
      accessor: (item) => formatDate(item.ilkTarih),
    },
    {
      id: "ilkEndeks",
      header: "İlk Endeks",
      accessor: (item) => item.ilkEndeks?.toString() || "0",
    },
    {
      id: "sonTarih",
      header: "Son Okuma Tarihi",
      accessor: (item) => formatDate(item.sonTarih),
    },
    {
      id: "sonEndeks",
      header: "Son Endeks",
      accessor: (item) => item.sonEndeks?.toString() || "-",
    },
    {
      id: "tuketim",
      header: "Tüketim",
      accessor: (item) => item.tuketim?.toString() || "0",
    },
    {
      id: "ucretAdi",
      header: "Ücret Türü",
      accessor: (item) => item.ucret_id?.ad || "-",
    },
    {
      id: "birimFiyat",
      header: "Birim Fiyat",
      accessor: (item) => formatCurrency(item.birimFiyat),
    },
    {
      id: "toplamTutar",
      header: "Toplam Tutar",
      accessor: (item) => formatCurrency(item.toplamTutar),
    },
    {
      id: "durumu",
      header: "Durumu",
      accessor: (item) => item.durumu || "-",
    },
  ];

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredDetaylar.map((detay) => detay._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleCheckboxClick = (event, id) => {
    event.stopPropagation();
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((item) => item !== id);
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Çoklu silme işlemi
  const handleMultipleDeleteClick = () => {
    if (selected.length > 0) {
      setMultipleDeleteDialogOpen(true);
    } else {
      toast.warning("Lütfen silinecek kayıtları seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    if (!hasPermission(user, "abonedetaylar_silme")) {
      toast.error("Toplu dönem kaydı silmek için yetkiniz yok.");
      setMultipleDeleteDialogOpen(false);
      return;
    }

    try {
      await dispatch(deleteManyAboneDetaylar(selected)).unwrap();
      toast.success(`${selected.length} adet kayıt başarıyla silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || "Kayıtlar silinirken bir hata oluştu");
    }
    setMultipleDeleteDialogOpen(false);
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
          Abone Detayları
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={`/aboneler/duzenle/${id}`}
          >
            Aboneyi Düzenle
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/aboneler")}
          >
            Geri Dön
          </Button>
        </Box>
      </Box>

      <Fade in={true} timeout={500}>
        <Grid container spacing={3}>
          {/* Abone Özet Bilgileri */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Abone No
                      </Typography>
                      <Typography variant="h6" component="div">
                        {abone.aboneNo}
                      </Typography>
                      {abone.defterNo && (
                        <Typography variant="body2" color="textSecondary">
                          Defter No: {abone.defterNo}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Abone Adı
                      </Typography>
                      <Typography variant="h6" component="div">
                        {abone.kisi_id?.ad} {abone.kisi_id?.soyad}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {abone.kisi_id?.telefonNumarasi || "-"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Abone Türü
                      </Typography>
                      <Typography variant="h6" component="div">
                        {abone.aboneTuru}
                      </Typography>
                      <Typography variant="body2">
                        <Chip
                          label={abone.durum}
                          color={getStatusColor(abone.durum)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Şube
                      </Typography>
                      <Typography variant="h6" component="div">
                        {abone.sube_id?.ad || "Belirtilmemiş"}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {abone.isActive ? "Aktif" : "Pasif"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography color="textSecondary" gutterBottom>
                    Başlama Tarihi
                  </Typography>
                  <Typography variant="body1">
                    {abone.baslamaTarihi
                      ? new Date(abone.baslamaTarihi).toLocaleDateString()
                      : "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography color="textSecondary" gutterBottom>
                    Bitiş Tarihi
                  </Typography>
                  <Typography variant="body1">
                    {abone.bitisTarihi
                      ? new Date(abone.bitisTarihi).toLocaleDateString()
                      : "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography color="textSecondary" gutterBottom>
                    Telefon
                  </Typography>
                  <Typography variant="body1">
                    {abone.telefonNo || "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography color="textSecondary" gutterBottom>
                    Kayıt Tarihi
                  </Typography>
                  <Typography variant="body1">
                    {abone.kayitTarihi
                      ? new Date(abone.kayitTarihi).toLocaleDateString()
                      : "-"}
                  </Typography>
                </Grid>

                {abone.adres && (
                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      Adres
                    </Typography>
                    <Typography variant="body1">{abone.adres}</Typography>
                  </Grid>
                )}

                {abone.aciklama && (
                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      Açıklama
                    </Typography>
                    <Typography variant="body1">{abone.aciklama}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* Yeni Detay Ekleme Formu */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Yeni Dönem Kaydı Ekle
              </Typography>
              <PermissionRequired yetkiKodu="abonedetaylar_ekleme">
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={trLocale}
                >
                  <Grid container spacing={2}>
                    {/* Üst satır: Yıl, Ay, Ücret Türü, Açıklama */}
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        fullWidth
                        label="Yıl*"
                        name="yil"
                        type="number"
                        value={yeniDetay.yil}
                        onChange={handleDetayChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarMonthIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>Ay*</InputLabel>
                        <Select
                          name="ay"
                          value={yeniDetay.ay}
                          onChange={handleDetayChange}
                          label="Ay*"
                          renderValue={(selected) => {
                            const ayIsmi = getAyAdi(selected);
                            // Mevcut dönemse uyarı işareti ekle
                            if (isDonemMevcut(yeniDetay.yil, selected)) {
                              return (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography component="span" color="error">
                                    ⚠️
                                  </Typography>
                                  <Typography component="span">
                                    {ayIsmi}
                                  </Typography>
                                </Box>
                              );
                            }
                            return ayIsmi;
                          }}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (ay) => {
                              const mevcut = isDonemMevcut(yeniDetay.yil, ay);
                              return (
                                <MenuItem
                                  key={ay}
                                  value={ay}
                                  disabled={mevcut}
                                  sx={
                                    mevcut
                                      ? {
                                          color: "text.disabled",
                                          textDecoration: "line-through",
                                        }
                                      : {}
                                  }
                                >
                                  {mevcut && (
                                    <Typography
                                      component="span"
                                      color="error"
                                      sx={{ mr: 1 }}
                                    >
                                      ⚠️
                                    </Typography>
                                  )}
                                  {getAyAdi(ay)}
                                </MenuItem>
                              );
                            }
                          )}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth required>
                        <InputLabel>Ücret Türü*</InputLabel>
                        <Select
                          name="ucret_id"
                          value={yeniDetay.ucret_id}
                          onChange={handleDetayChange}
                          label="Ücret Türü*"
                        >
                          {ucretler.map((ucret) => (
                            <MenuItem key={ucret._id} value={ucret._id}>
                              {ucret.ad} - ₺{ucret.tutar}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Açıklama"
                        name="aciklama"
                        value={yeniDetay.aciklama}
                        onChange={handleDetayChange}
                        multiline
                        rows={1}
                      />
                    </Grid>

                    {/* Alt satır: İlk Okuma, İlk Endeks, Son Okuma, Son Endeks, Durum */}
                    <Grid item xs={12} sm={6} md={3}>
                      <DatePicker
                        label="İlk Okuma Tarihi"
                        value={
                          yeniDetay.ilkTarih
                            ? new Date(yeniDetay.ilkTarih)
                            : null
                        }
                        onChange={(date) => handleDateChange("ilkTarih", date)}
                        renderInput={(params) => (
                          <TextField {...params} fullWidth required />
                        )}
                        inputFormat="dd.MM.yyyy"
                        mask="__.__.____"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        fullWidth
                        label="İlk Endeks*"
                        name="ilkEndeks"
                        type="number"
                        value={yeniDetay.ilkEndeks}
                        onChange={handleDetayChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MeasureIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <DatePicker
                        label="Son Okuma Tarihi"
                        value={
                          yeniDetay.sonTarih
                            ? new Date(yeniDetay.sonTarih)
                            : null
                        }
                        onChange={(date) => handleDateChange("sonTarih", date)}
                        renderInput={(params) => (
                          <TextField {...params} fullWidth />
                        )}
                        inputFormat="dd.MM.yyyy"
                        mask="__.__.____"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        fullWidth
                        label="Son Endeks"
                        name="sonEndeks"
                        type="number"
                        value={yeniDetay.sonEndeks}
                        onChange={handleDetayChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MeasureIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleDetayEkle}
                        disabled={
                          !yeniDetay.ucret_id ||
                          detayLoading ||
                          isDonemMevcut(yeniDetay.yil, yeniDetay.ay)
                        }
                        fullWidth
                        sx={{ height: "100%", minHeight: "56px" }}
                      >
                        Kayıt Ekle
                      </Button>
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              </PermissionRequired>
            </Paper>
          </Grid>

          {/* Detay Listesi */}
          <Grid item xs={12}>
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
                  Dönem Kayıtları
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FileDownloadIcon />}
                    onClick={() => setExportModalOpen(true)}
                    disabled={!aboneDetaylar?.length}
                  >
                    Dışa Aktar
                  </Button>
                  <Tooltip title="Filtreler">
                    <IconButton
                      color="primary"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <FilterListIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Listeyi Yenile">
                    <IconButton color="primary" onClick={handleRefresh}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {showFilters && (
                <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Yıl"
                        name="yil"
                        type="number"
                        value={filters.yil}
                        onChange={handleFilterChange}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Ay</InputLabel>
                        <Select
                          name="ay"
                          value={filters.ay}
                          onChange={handleFilterChange}
                          label="Ay"
                        >
                          <MenuItem value="">Tümü</MenuItem>
                          <MenuItem value={1}>Ocak</MenuItem>
                          <MenuItem value={2}>Şubat</MenuItem>
                          <MenuItem value={3}>Mart</MenuItem>
                          <MenuItem value={4}>Nisan</MenuItem>
                          <MenuItem value={5}>Mayıs</MenuItem>
                          <MenuItem value={6}>Haziran</MenuItem>
                          <MenuItem value={7}>Temmuz</MenuItem>
                          <MenuItem value={8}>Ağustos</MenuItem>
                          <MenuItem value={9}>Eylül</MenuItem>
                          <MenuItem value={10}>Ekim</MenuItem>
                          <MenuItem value={11}>Kasım</MenuItem>
                          <MenuItem value={12}>Aralık</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Durum</InputLabel>
                        <Select
                          name="durumu"
                          value={filters.durumu}
                          onChange={handleFilterChange}
                          label="Durum"
                        >
                          <MenuItem value="">Tümü</MenuItem>
                          <MenuItem value="Okunmadı">Okunmadı</MenuItem>
                          <MenuItem value="Okundu">Okundu</MenuItem>
                          <MenuItem value="Fatura Kesildi">
                            Fatura Kesildi
                          </MenuItem>
                          <MenuItem value="Ödendi">Ödendi</MenuItem>
                          <MenuItem value="Devam Ediyor">Devam Ediyor</MenuItem>
                          <MenuItem value="İptal">İptal</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<ClearAllIcon />}
                          onClick={clearFilters}
                        >
                          Temizle
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SearchIcon />}
                          onClick={() => {
                            /* Filtreleme zaten gerçekleşti */
                          }}
                        >
                          Filtrele
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Çoklu seçim için Toolbar ekleyelim */}
              {selected.length > 0 && (
                <Toolbar
                  sx={{
                    pl: { sm: 2 },
                    pr: { xs: 1, sm: 1 },
                    bgcolor: (theme) =>
                      alpha(
                        theme.palette.primary.main,
                        theme.palette.action.activatedOpacity
                      ),
                    marginBottom: 2,
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    sx={{ flex: "1 1 100%" }}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                  >
                    {selected.length} kayıt seçildi
                  </Typography>

                  <PermissionRequired yetkiKodu="abonedetaylar_silme">
                    <Tooltip title="Seçilenleri Sil">
                      <IconButton onClick={handleMultipleDeleteClick}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </PermissionRequired>
                </Toolbar>
              )}

              <Divider sx={{ mb: 2 }} />

              {detayLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : filteredDetaylar.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            indeterminate={
                              selected.length > 0 &&
                              selected.length < filteredDetaylar.length
                            }
                            checked={
                              filteredDetaylar.length > 0 &&
                              selected.length === filteredDetaylar.length
                            }
                            onChange={handleSelectAllClick}
                            inputProps={{ "aria-label": "tüm kayıtları seç" }}
                          />
                        </TableCell>
                        <TableCell>Dönem</TableCell>
                        <TableCell>İlk Okuma</TableCell>
                        <TableCell>Son Okuma</TableCell>
                        <TableCell>Tüketim</TableCell>
                        <TableCell>Ücret</TableCell>
                        <TableCell align="right">Birim Fiyat</TableCell>
                        <TableCell align="right">Toplam Tutar</TableCell>
                        <TableCell>Durum</TableCell>
                        <TableCell align="center">İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredDetaylar
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((detay, index) => {
                          const isItemSelected = isSelected(detay._id);

                          return (
                            <Grow
                              in={true}
                              key={detay._id}
                              style={{
                                transformOrigin: "0 0 0",
                                transitionDelay: `${index * 30}ms`,
                              }}
                            >
                              <TableRow
                                hover
                                selected={isItemSelected}
                                onClick={(event) => {
                                  if (
                                    event.target.type !== "checkbox" &&
                                    !event.target.closest("button")
                                  ) {
                                    handleCheckboxClick(event, detay._id);
                                  }
                                }}
                              >
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    color="primary"
                                    checked={isItemSelected}
                                    onChange={(event) =>
                                      handleCheckboxClick(event, detay._id)
                                    }
                                    inputProps={{
                                      "aria-labelledby": `detay-${detay._id}`,
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="subtitle2">
                                    {getAyAdi(detay.ay)} {detay.yil}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {detay.ilkTarih
                                      ? new Date(
                                          detay.ilkTarih
                                        ).toLocaleDateString()
                                      : "-"}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {detay.ilkEndeks ? detay.ilkEndeks : "0"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {detay.sonTarih
                                      ? new Date(
                                          detay.sonTarih
                                        ).toLocaleDateString()
                                      : "-"}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {detay.sonEndeks ? detay.sonEndeks : "-"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="bold">
                                    {detay.tuketim || "0"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {detay.ucret_id?.ad || "-"}
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2">
                                    ₺{detay.birimFiyat?.toFixed(2) || "0.00"}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color="primary.main"
                                  >
                                    ₺{detay.toplamTutar?.toFixed(2) || "0.00"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={detay.durumu}
                                    color={getStatusColor(detay.durumu)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <PermissionRequired yetkiKodu="abonedetaylar_guncelleme">
                                      <Tooltip title="Düzenle">
                                        <IconButton
                                          color="primary"
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(detay);
                                          }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </PermissionRequired>
                                    <PermissionRequired yetkiKodu="abonedetaylar_silme">
                                      <Tooltip title="Sil">
                                        <IconButton
                                          color="error"
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(detay);
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </PermissionRequired>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            </Grow>
                          );
                        })}
                      <TableRow
                        sx={{ bgcolor: (theme) => theme.palette.action.hover }}
                      >
                        <TableCell colSpan={7} align="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            Toplam:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            color="success.main"
                          >
                            ₺
                            {filteredDetaylar
                              .reduce(
                                (sum, detay) => sum + (detay.toplamTutar || 0),
                                0
                              )
                              .toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredDetaylar.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Sayfa başına satır:"
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} / ${count !== -1 ? count : `${to} üzeri`}`
                    }
                  />
                </TableContainer>
              ) : (
                <Alert severity="info">
                  Henüz dönem kaydı bulunmuyor. Yukarıdaki formu kullanarak
                  kayıt ekleyebilirsiniz.
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Fade>

      {/* Silme onay diyaloğu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Dönem Kaydını Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {detayToDelete &&
              `${detayToDelete.yil} yılı ${getAyAdi(
                detayToDelete.ay
              )} ayı dönem kaydını silmek istediğinize emin misiniz?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            İptal
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Düzenleme diyaloğu */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Dönem Kaydını Düzenle</DialogTitle>
        <DialogContent>
          {detayToEdit && (
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={trLocale}
            >
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Dönem: {getAyAdi(detayToEdit.ay)} {detayToEdit.yil}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Ücret: {detayToEdit.ucret_id?.ad || ""}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="İlk Okuma Tarihi"
                    value={
                      detayToEdit.ilkTarih
                        ? new Date(detayToEdit.ilkTarih)
                        : null
                    }
                    onChange={(date) => handleEditDateChange("ilkTarih", date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                    inputFormat="dd.MM.yyyy"
                    mask="__.__.____"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="İlk Endeks"
                    name="ilkEndeks"
                    type="number"
                    value={detayToEdit.ilkEndeks}
                    onChange={handleEditChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Son Okuma Tarihi"
                    value={
                      detayToEdit.sonTarih
                        ? new Date(detayToEdit.sonTarih)
                        : null
                    }
                    onChange={(date) => handleEditDateChange("sonTarih", date)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                    inputFormat="dd.MM.yyyy"
                    mask="__.__.____"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Son Endeks"
                    name="sonEndeks"
                    type="number"
                    value={detayToEdit.sonEndeks}
                    onChange={handleEditChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Tüketim"
                    type="number"
                    value={detayToEdit.tuketim || 0}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Birim Fiyat"
                    type="number"
                    value={detayToEdit.birimFiyat || 0}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Toplam Tutar"
                    type="number"
                    value={detayToEdit.toplamTutar || 0}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Durum</InputLabel>
                    <Select
                      name="durumu"
                      value={detayToEdit.durumu}
                      onChange={handleEditChange}
                      label="Durum"
                    >
                      <MenuItem value="Okunmadı">Okunmadı</MenuItem>
                      <MenuItem value="Okundu">Okundu</MenuItem>
                      <MenuItem value="Fatura Kesildi">Fatura Kesildi</MenuItem>
                      <MenuItem value="Ödendi">Ödendi</MenuItem>
                      <MenuItem value="Devam Ediyor">Devam Ediyor</MenuItem>
                      <MenuItem value="İptal">İptal</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Açıklama"
                    name="aciklama"
                    value={detayToEdit.aciklama || ""}
                    onChange={handleEditChange}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleEditSubmit}
            color="primary"
            variant="contained"
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dışa aktarma modal'i */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={filteredDetaylar}
        availableColumns={exportColumns}
        entityName="Abone Detayları"
        filename={`abone_kayitlari_${abone.aboneNo}`}
      />

      {/* Çoklu silme onay diyaloğu */}
      <Dialog
        open={multipleDeleteDialogOpen}
        onClose={() => setMultipleDeleteDialogOpen(false)}
      >
        <DialogTitle>Dönem Kayıtlarını Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`${selected.length} adet dönem kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setMultipleDeleteDialogOpen(false)}
            color="primary"
          >
            İptal
          </Button>
          <Button onClick={handleMultipleDeleteConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AboneDetay;
