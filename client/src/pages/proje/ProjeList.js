import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Toolbar,
  alpha,
  Chip,
  Fade,
  Grow,
  Skeleton,
  LinearProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  DateRange as DateRangeIcon,
  Flag as FlagIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import {
  getProjeler,
  deleteProje,
  deleteManyProjeler,
} from "../../redux/proje/projeSlice";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import { toast } from "react-toastify";
import useAnimatedList from "../../hooks/useAnimatedList";
import {
  ListSkeleton,
  calculateAnimationDelay,
} from "../../utils/animationUtils";
import ExportModal from "../../components/common/ExportModal";
import { formatDate, formatBoolean } from "../../utils/exportService";

const ProjeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projeler, loading } = useSelector((state) => state.proje);
  const { kisiler } = useSelector((state) => state.kisi);

  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);
  // Silme işlemi için state
  const [projeToDelete, setProjeToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    projeAdi: "",
    durumu: "",
    oncelik: "",
    sorumluKisi_id: "",
    aktifMi: "tumu",
    tarihBaslangic: "",
    tarihBitis: "",
  });

  // Dışa aktarma için state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return [];

    let results = [...data];

    if (filters.projeAdi) {
      results = results.filter((proje) =>
        proje.projeAdi.toLowerCase().includes(filters.projeAdi.toLowerCase())
      );
    }

    if (filters.durumu) {
      results = results.filter((proje) => proje.durumu === filters.durumu);
    }

    if (filters.oncelik) {
      results = results.filter((proje) => proje.oncelik === filters.oncelik);
    }

    if (filters.sorumluKisi_id) {
      results = results.filter(
        (proje) =>
          proje.sorumluKisi_id &&
          proje.sorumluKisi_id._id === filters.sorumluKisi_id
      );
    }

    if (filters.aktifMi !== "tumu") {
      const isActive = filters.aktifMi === "aktif";
      results = results.filter((proje) => proje.isActive === isActive);
    }

    if (filters.tarihBaslangic) {
      const baslangic = new Date(filters.tarihBaslangic);
      baslangic.setHours(0, 0, 0, 0);
      results = results.filter(
        (proje) => new Date(proje.baslamaTarihi) >= baslangic
      );
    }

    if (filters.tarihBitis) {
      const bitis = new Date(filters.tarihBitis);
      bitis.setHours(23, 59, 59, 999);
      results = results.filter((proje) => {
        const bitTarih = proje.bitisTarihi
          ? new Date(proje.bitisTarihi)
          : new Date(3000, 0, 1); // Eğer bitiş tarihi yoksa çok ileri bir tarih
        return bitTarih <= bitis;
      });
    }

    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredProjeler,
    visibleData: visibleProjeler,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: projeler || [],
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    dispatch(getProjeler());
    dispatch(getActiveKisiler());
  }, [dispatch]);

  // Filtreleme işlemleri
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      projeAdi: "",
      durumu: "",
      oncelik: "",
      sorumluKisi_id: "",
      aktifMi: "tumu",
      tarihBaslangic: "",
      tarihBitis: "",
    });
  };

  // Proje listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getProjeler());
    refresh(); // useAnimatedList'in refresh fonksiyonunu çağır
  };

  // Proje silme işlemi
  const handleDeleteClick = (proje) => {
    setProjeToDelete(proje);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (projeToDelete) {
      try {
        await dispatch(deleteProje(projeToDelete._id)).unwrap();
        toast.success(`"${projeToDelete.projeAdi}" projesi silindi`);
      } catch (error) {
        toast.error(error.msg || "Proje silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setProjeToDelete(null);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredProjeler.map((proje) => proje._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    // Eğer tıklanan öğe checkbox veya buton ise, event propagation'ı durdur
    if (
      event.target.type === "checkbox" ||
      event.target.tagName === "BUTTON" ||
      event.target.closest("button")
    ) {
      return;
    }

    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else if (selectedIndex === 0) {
      newSelected = [...selected.slice(1)];
    } else if (selectedIndex === selected.length - 1) {
      newSelected = [...selected.slice(0, -1)];
    } else if (selectedIndex > 0) {
      newSelected = [
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1),
      ];
    }

    setSelected(newSelected);
  };

  const handleCheckboxClick = (event, id) => {
    // Checkbox tıklanınca satırın kliklenmesini engelle
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

  const handleMultipleDeleteClick = () => {
    if (selected.length > 0) {
      setMultipleDeleteDialogOpen(true);
    } else {
      toast.warning("Lütfen silinecek projeleri seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManyProjeler(selected)).unwrap();
      toast.success(`${selected.length} adet proje başarıyla silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || "Projeler silinirken bir hata oluştu");
    }
    setMultipleDeleteDialogOpen(false);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

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

  // Tamamlanma durumunu gösteren ilerleme çubuğu
  const getTamamlanmaRenk = (tamamlanmaDurumu) => {
    if (tamamlanmaDurumu >= 100) return "success";
    if (tamamlanmaDurumu >= 75) return "info";
    if (tamamlanmaDurumu >= 50) return "primary";
    if (tamamlanmaDurumu >= 25) return "warning";
    return "error";
  };

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" component="h1">
            Projeler
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
          </Box>
        </Box>

        <ListSkeleton
          rowCount={5}
          columnCount={6}
          hasCheckbox={true}
          hasActions={true}
        />
      </Box>
    );
  }

  // Dışa aktarma için sütun tanımları
  const exportColumns = [
    {
      id: "projeAdi",
      header: "Proje Adı",
      accessor: (item) => item.projeAdi || "",
    },
    {
      id: "aciklama",
      header: "Açıklama",
      accessor: (item) => item.aciklama || "",
    },
    {
      id: "durumu",
      header: "Durumu",
      accessor: (item) => item.durumu || "",
    },
    {
      id: "oncelik",
      header: "Öncelik",
      accessor: (item) => item.oncelik || "",
    },
    {
      id: "sorumluKisi",
      header: "Sorumlu Kişi",
      accessor: (item) =>
        item.sorumluKisi_id
          ? `${item.sorumluKisi_id.ad} ${item.sorumluKisi_id.soyad}`
          : "",
    },
    {
      id: "baslamaTarihi",
      header: "Başlama Tarihi",
      accessor: (item) => formatDate(item.baslamaTarihi),
    },
    {
      id: "bitisTarihi",
      header: "Bitiş Tarihi",
      accessor: (item) =>
        item.bitisTarihi ? formatDate(item.bitisTarihi) : "",
    },
    {
      id: "tamamlanmaDurumu",
      header: "Tamamlanma Durumu",
      accessor: (item) => `%${item.tamamlanmaDurumu || 0}`,
    },
    {
      id: "isActive",
      header: "Aktif mi",
      accessor: (item) => formatBoolean(item.isActive),
    },
    {
      id: "kayitTarihi",
      header: "Kayıt Tarihi",
      accessor: (item) => formatDate(item.kayitTarihi),
    },
  ];

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
          Projeler
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/projeler/ekle")}
          >
            Yeni Proje
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={() => setExportModalOpen(true)}
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
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filtreleme Seçenekleri
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Proje Adı"
                name="projeAdi"
                value={filters.projeAdi}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <AssignmentIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Durumu</InputLabel>
                <Select
                  name="durumu"
                  value={filters.durumu}
                  onChange={handleFilterChange}
                  label="Durumu"
                  startAdornment={<FlagIcon color="action" sx={{ mr: 1 }} />}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Planlandı">Planlandı</MenuItem>
                  <MenuItem value="Devam Ediyor">Devam Ediyor</MenuItem>
                  <MenuItem value="Tamamlandı">Tamamlandı</MenuItem>
                  <MenuItem value="İptal Edildi">İptal Edildi</MenuItem>
                  <MenuItem value="Durduruldu">Durduruldu</MenuItem>
                  <MenuItem value="Askıya Alındı">Askıya Alındı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Öncelik</InputLabel>
                <Select
                  name="oncelik"
                  value={filters.oncelik}
                  onChange={handleFilterChange}
                  label="Öncelik"
                  startAdornment={<TimerIcon color="action" sx={{ mr: 1 }} />}
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
                <InputLabel>Sorumlu Kişi</InputLabel>
                <Select
                  name="sorumluKisi_id"
                  value={filters.sorumluKisi_id}
                  onChange={handleFilterChange}
                  label="Sorumlu Kişi"
                  startAdornment={<PersonIcon color="action" sx={{ mr: 1 }} />}
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
                <InputLabel>Aktiflik Durumu</InputLabel>
                <Select
                  name="aktifMi"
                  value={filters.aktifMi}
                  onChange={handleFilterChange}
                  label="Aktiflik Durumu"
                >
                  <MenuItem value="tumu">Tümü</MenuItem>
                  <MenuItem value="aktif">Aktif</MenuItem>
                  <MenuItem value="pasif">Pasif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Başlangıç Tarihi"
                name="tarihBaslangic"
                type="date"
                value={filters.tarihBaslangic}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <DateRangeIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Bitiş Tarihi"
                name="tarihBitis"
                type="date"
                value={filters.tarihBitis}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <DateRangeIcon color="action" sx={{ mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 1,
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ClearAllIcon />}
                onClick={clearFilters}
              >
                Filtreleri Temizle
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={applyFilters}
              >
                Filtrele
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam {totalCount} proje bulundu
        </Typography>
      </Box>

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
            {selected.length} proje seçildi
          </Typography>

          <Tooltip title="Seçilenleri Sil">
            <IconButton onClick={handleMultipleDeleteClick}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      )}

      <Fade in={contentLoaded} timeout={300}>
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selected.length > 0 &&
                        selected.length < filteredProjeler.length
                      }
                      checked={
                        filteredProjeler.length > 0 &&
                        selected.length === filteredProjeler.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm projeleri seç" }}
                    />
                  </TableCell>
                  <TableCell>Proje Adı</TableCell>
                  <TableCell>Durumu</TableCell>
                  <TableCell>Öncelik</TableCell>
                  <TableCell>Sorumlu Kişi</TableCell>
                  <TableCell>Tarih Aralığı</TableCell>
                  <TableCell>Tamamlanma</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleProjeler.length > 0 ? (
                  visibleProjeler.map((proje, index) => {
                    // Animasyon gecikmesini hesapla
                    const delay = calculateAnimationDelay(
                      index,
                      visibleProjeler.length
                    );
                    const isItemSelected = isSelected(proje._id);

                    return (
                      <Grow
                        in={contentLoaded}
                        key={proje._id}
                        timeout={{ enter: 300 + delay }}
                        style={{ transformOrigin: "0 0 0" }}
                      >
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, proje._id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          sx={{
                            "&:hover": {
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, 0.08),
                            },
                            opacity: proje.isActive ? 1 : 0.7,
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{
                                "aria-labelledby": `proje-${proje._id}`,
                              }}
                              onClick={(e) => handleCheckboxClick(e, proje._id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="subtitle2"
                              component="div"
                              sx={{
                                fontWeight: "medium",
                                maxWidth: 250,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {proje.projeAdi}
                            </Typography>
                            {proje.aciklama && (
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
                                {proje.aciklama}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={proje.durumu}
                              color={getDurumuColor(proje.durumu)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={proje.oncelik}
                              color={getOncelikColor(proje.oncelik)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {proje.sorumluKisi_id ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <PersonIcon color="action" fontSize="small" />
                                <Typography variant="body2">
                                  {`${proje.sorumluKisi_id.ad} ${proje.sorumluKisi_id.soyad}`}
                                </Typography>
                              </Box>
                            ) : (
                              "-"
                            )}
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
                                  proje.baslamaTarihi
                                ).toLocaleDateString()}
                              </Typography>
                              {proje.bitisTarihi && (
                                <Typography variant="body2">
                                  <DateRangeIcon
                                    color="action"
                                    fontSize="small"
                                    sx={{ mr: 0.5, verticalAlign: "middle" }}
                                  />
                                  {new Date(
                                    proje.bitisTarihi
                                  ).toLocaleDateString()}
                                </Typography>
                              )}
                            </Box>
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
                                value={proje.tamamlanmaDurumu || 0}
                                color={getTamamlanmaRenk(
                                  proje.tamamlanmaDurumu || 0
                                )}
                                sx={{ flexGrow: 1, height: 8, borderRadius: 5 }}
                              />
                              <Typography variant="body2">
                                %{proje.tamamlanmaDurumu || 0}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Detayları Gör">
                                <IconButton
                                  color="info"
                                  component={Link}
                                  to={`/projeler/detay/${proje._id}`}
                                  size="small"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Düzenle">
                                <IconButton
                                  color="primary"
                                  component={Link}
                                  to={`/projeler/duzenle/${proje._id}`}
                                  size="small"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Sil">
                                <IconButton
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(proje);
                                  }}
                                  size="small"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Grow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Hiç proje bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredProjeler.length}
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
        </Box>
      </Fade>

      {/* Silme onay diyaloğu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Projeyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {projeToDelete &&
              `"${projeToDelete.projeAdi}" projesini ve tüm görevlerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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

      {/* Çoklu silme onay diyaloğu */}
      <Dialog
        open={multipleDeleteDialogOpen}
        onClose={() => setMultipleDeleteDialogOpen(false)}
      >
        <DialogTitle>Projeleri Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Seçtiğiniz ${selected.length} adet projeyi ve tüm görevlerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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

      {/* Dışa aktarma modal'i */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={filteredProjeler}
        availableColumns={exportColumns}
        entityName="Projeler"
      />
    </Box>
  );
};

export default ProjeList;
