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
  InputAdornment,
  Skeleton,
  FormControlLabel,
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
  Event as EventIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  getEtkinlikler,
  getActiveEtkinlikler,
  deleteEtkinlik,
  deleteManyEtkinlikler,
  clearEtkinlikError,
} from "../../redux/etkinlik/etkinlikSlice";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import { getActiveOrganizasyonlar } from "../../redux/organizasyon/organizasyonSlice";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/exportService";
import useAnimatedList from "../../hooks/useAnimatedList";
import {
  ListSkeleton,
  calculateAnimationDelay,
} from "../../utils/animationUtils";
import ExportModal from "../../components/common/ExportModal";
import { PermissionRequired, hasPermission } from "../../utils/rbacUtils";

const EtkinlikList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { etkinlikler, loading, error } = useSelector(
    (state) => state.etkinlik
  );
  const { kisiler } = useSelector((state) => state.kisi);
  const { organizasyonlar } = useSelector((state) => state.organizasyon);
  const { user } = useSelector((state) => state.auth);

  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);
  // Silme işlemi için state
  const [etkinlikToDelete, setEtkinlikToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    etkinlikAdi: "",
    durumu: "",
    basTarih: "",
    bitisTarih: "",
    organizasyon_id: "",
    sorumlukisi_id: "",
    aktifMi: true,
  });

  // Dışa aktarma için state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return [];

    let results = [...data];

    if (filters.etkinlikAdi) {
      results = results.filter((etkinlik) =>
        etkinlik.etkinlikAdi
          .toLowerCase()
          .includes(filters.etkinlikAdi.toLowerCase())
      );
    }

    if (filters.durumu) {
      results = results.filter(
        (etkinlik) => etkinlik.durumu === filters.durumu
      );
    }

    if (filters.basTarih) {
      const basTarih = new Date(filters.basTarih);
      results = results.filter(
        (etkinlik) => new Date(etkinlik.baslamaTarihi) >= basTarih
      );
    }

    if (filters.bitisTarih) {
      const bitisTarih = new Date(filters.bitisTarih);
      // bitisTarihi boş olabilir veya baslamaTarihi bu tarihten önce olmalı
      results = results.filter(
        (etkinlik) =>
          !etkinlik.bitisTarihi || new Date(etkinlik.bitisTarihi) <= bitisTarih
      );
    }

    if (filters.organizasyon_id) {
      results = results.filter(
        (etkinlik) => etkinlik.organizasyon_id?._id === filters.organizasyon_id
      );
    }

    if (filters.sorumlukisi_id) {
      results = results.filter(
        (etkinlik) => etkinlik.sorumlukisi_id?._id === filters.sorumlukisi_id
      );
    }

    if (filters.aktifMi) {
      results = results.filter((etkinlik) => etkinlik.isActive);
    }

    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredEtkinlikler,
    visibleData: visibleEtkinlikler,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: etkinlikler || [],
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    dispatch(getEtkinlikler());
    dispatch(getActiveKisiler());
    dispatch(getActiveOrganizasyonlar());

    return () => {
      dispatch(clearEtkinlikError());
    };
  }, [dispatch]);

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error(error.msg || "Etkinlikler yüklenirken bir hata oluştu.");
      dispatch(clearEtkinlikError());
    }
  }, [error, dispatch]);

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
      etkinlikAdi: "",
      durumu: "",
      basTarih: "",
      bitisTarih: "",
      organizasyon_id: "",
      sorumlukisi_id: "",
      aktifMi: true,
    });
  };

  // Etkinlik listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getEtkinlikler());
    refresh();
  };

  // Etkinlik silme işlemi
  const handleDeleteClick = (etkinlik) => {
    setEtkinlikToDelete(etkinlik);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (etkinlikToDelete) {
      if (!hasPermission(user, "etkinlikler_silme")) {
        toast.error("Bu işlemi yapmak için yetkiniz yok.");
        setDeleteDialogOpen(false);
        return;
      }
      try {
        await dispatch(deleteEtkinlik(etkinlikToDelete._id)).unwrap();
        toast.success(`"${etkinlikToDelete.etkinlikAdi}" etkinliği silindi`);
      } catch (error) {
        toast.error(error.msg || "Etkinlik silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setEtkinlikToDelete(null);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredEtkinlikler.map((etkinlik) => etkinlik._id);
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
      toast.warning("Lütfen silinecek etkinlikleri seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    if (!hasPermission(user, "etkinlikler_silme")) {
      toast.error("Bu işlemi yapmak için yetkiniz yok.");
      setMultipleDeleteDialogOpen(false);
      return;
    }
    try {
      await dispatch(deleteManyEtkinlikler(selected)).unwrap();
      toast.success(`${selected.length} adet etkinlik başarıyla silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || "Etkinlikler silinirken bir hata oluştu");
    }
    setMultipleDeleteDialogOpen(false);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Durum chip'i için renk belirle
  const getDurumColor = (durum) => {
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

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" component="h1">
            Etkinlikler
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
      id: "etkinlikAdi",
      header: "Etkinlik Adı",
      accessor: (item) => item.etkinlikAdi || "",
    },
    {
      id: "organizasyon",
      header: "Organizasyon",
      accessor: (item) => item.organizasyon_id?.ad || "",
    },
    {
      id: "sorumlu",
      header: "Sorumlu Kişi",
      accessor: (item) =>
        item.sorumlukisi_id
          ? `${item.sorumlukisi_id.ad} ${item.sorumlukisi_id.soyad}`
          : "",
    },
    {
      id: "baslamaTarihi",
      header: "Başlama Tarihi",
      accessor: (item) => formatDate(item.baslamaTarihi),
    },
    {
      id: "baslamaSaati",
      header: "Başlama Saati",
      accessor: (item) => item.baslamaSaati || "",
    },
    {
      id: "bitisTarihi",
      header: "Bitiş Tarihi",
      accessor: (item) => formatDate(item.bitisTarihi) || "",
    },
    {
      id: "bitisSaati",
      header: "Bitiş Saati",
      accessor: (item) => item.bitisSaati || "",
    },
    {
      id: "yer",
      header: "Yer",
      accessor: (item) => item.yer || "",
    },
    {
      id: "durumu",
      header: "Durumu",
      accessor: (item) => item.durumu || "",
    },
    {
      id: "maksimumKatilimci",
      header: "Maks. Katılımcı",
      accessor: (item) =>
        item.maksimumKatilimci > 0
          ? item.maksimumKatilimci.toString()
          : "Sınırsız",
    },
    {
      id: "aciklama",
      header: "Açıklama",
      accessor: (item) => item.aciklama || "",
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
          Etkinlikler
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <PermissionRequired yetkiKodu="etkinlikler_ekleme">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate("/etkinlikler/ekle")}
            >
              Yeni Etkinlik
            </Button>
          </PermissionRequired>
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
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <TextField
                fullWidth
                label="Etkinlik Adı"
                name="etkinlikAdi"
                value={filters.etkinlikAdi}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <FormControl fullWidth>
                <InputLabel>Durumu</InputLabel>
                <Select
                  name="durumu"
                  value={filters.durumu}
                  onChange={handleFilterChange}
                  label="Durumu"
                  startAdornment={
                    <InputAdornment position="start">
                      <EventIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Planlandı">Planlandı</MenuItem>
                  <MenuItem value="Devam Ediyor">Devam Ediyor</MenuItem>
                  <MenuItem value="Tamamlandı">Tamamlandı</MenuItem>
                  <MenuItem value="İptal Edildi">İptal Edildi</MenuItem>
                  <MenuItem value="Ertelendi">Ertelendi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <FormControl fullWidth>
                <InputLabel>Organizasyon</InputLabel>
                <Select
                  name="organizasyon_id"
                  value={filters.organizasyon_id}
                  onChange={handleFilterChange}
                  label="Organizasyon"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {organizasyonlar.map((org) => (
                    <MenuItem key={org._id} value={org._id}>
                      {org.ad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <FormControl fullWidth>
                <InputLabel>Sorumlu Kişi</InputLabel>
                <Select
                  name="sorumlukisi_id"
                  value={filters.sorumlukisi_id}
                  onChange={handleFilterChange}
                  label="Sorumlu Kişi"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {kisiler.map((kisi) => (
                    <MenuItem key={kisi._id} value={kisi._id}>
                      {kisi.ad} {kisi.soyad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <TextField
                fullWidth
                label="Başlangıç Tarihi"
                name="basTarih"
                type="date"
                value={filters.basTarih}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateRangeIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <TextField
                fullWidth
                label="Bitiş Tarihi"
                name="bitisTarih"
                type="date"
                value={filters.bitisTarih}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateRangeIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.aktifMi}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        aktifMi: e.target.checked,
                      }))
                    }
                    color="primary"
                  />
                }
                label="Sadece Aktif Etkinlikler"
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
          Toplam {totalCount} etkinlik bulundu
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
            {selected.length} etkinlik seçildi
          </Typography>

          <Tooltip title="Seçilenleri Sil">
            <IconButton onClick={handleMultipleDeleteClick}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      )}

      <Fade in={contentLoaded} timeout={500}>
        <Box>
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selected.length > 0 &&
                        selected.length < filteredEtkinlikler.length
                      }
                      checked={
                        filteredEtkinlikler.length > 0 &&
                        selected.length === filteredEtkinlikler.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm etkinlikleri seç" }}
                    />
                  </TableCell>
                  <TableCell>Etkinlik Adı</TableCell>
                  <TableCell>Tarih ve Zaman</TableCell>
                  <TableCell>Yer</TableCell>
                  <TableCell>Organizasyon</TableCell>
                  <TableCell>Sorumlu</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleEtkinlikler.length > 0 ? (
                  visibleEtkinlikler.map((etkinlik, index) => {
                    const isItemSelected = isSelected(etkinlik._id);
                    const delay = calculateAnimationDelay(
                      index,
                      visibleEtkinlikler.length
                    );

                    return (
                      <Grow
                        in={contentLoaded}
                        key={etkinlik._id}
                        timeout={{ enter: 300 + delay }}
                        style={{ transformOrigin: "0 0 0" }}
                      >
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, etkinlik._id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          sx={{
                            "&:hover": {
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, 0.08),
                            },
                            opacity: etkinlik.isActive ? 1 : 0.7,
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{
                                "aria-labelledby": `etkinlik-${etkinlik._id}`,
                              }}
                              onClick={(e) =>
                                handleCheckboxClick(e, etkinlik._id)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold" }}
                            >
                              {etkinlik.etkinlikAdi}
                            </Typography>
                            {etkinlik.etiketler &&
                              etkinlik.etiketler.length > 0 && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    flexWrap: "wrap",
                                    mt: 0.5,
                                  }}
                                >
                                  {etkinlik.etiketler.map((etiket, i) => (
                                    <Chip
                                      key={i}
                                      label={etiket}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: "0.7rem" }}
                                    />
                                  ))}
                                </Box>
                              )}
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <DateRangeIcon fontSize="small" color="action" />
                              <Box>
                                <Typography variant="body2">
                                  {formatDate(etkinlik.baslamaTarihi)}
                                </Typography>
                                {etkinlik.bitisTarihi && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {formatDate(etkinlik.bitisTarihi)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            {(etkinlik.baslamaSaati || etkinlik.bitisSaati) && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 0.5,
                                }}
                              >
                                <AccessTimeIcon
                                  fontSize="small"
                                  color="action"
                                />
                                <Typography variant="body2">
                                  {etkinlik.baslamaSaati || ""}
                                  {etkinlik.bitisSaati &&
                                    etkinlik.baslamaSaati &&
                                    " - "}
                                  {etkinlik.bitisSaati || ""}
                                </Typography>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            {etkinlik.yer && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <LocationOnIcon
                                  fontSize="small"
                                  color="action"
                                />
                                <Typography variant="body2">
                                  {etkinlik.yer}
                                </Typography>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            {etkinlik.organizasyon_id ? (
                              <Typography variant="body2">
                                {etkinlik.organizasyon_id.ad}
                              </Typography>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {etkinlik.sorumlukisi_id ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <PersonIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {etkinlik.sorumlukisi_id.ad}{" "}
                                  {etkinlik.sorumlukisi_id.soyad}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={etkinlik.durumu}
                              color={getDurumColor(etkinlik.durumu)}
                              size="small"
                            />
                            {etkinlik.maksimumKatilimci > 0 && (
                              <Typography variant="caption" display="block">
                                Max: {etkinlik.maksimumKatilimci} kişi
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: "flex-end",
                              }}
                            >
                              <Tooltip title="Detayları Gör">
                                <IconButton
                                  color="info"
                                  component={Link}
                                  to={`/etkinlikler/detay/${etkinlik._id}`}
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
                                  to={`/etkinlikler/duzenle/${etkinlik._id}`}
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
                                    handleDeleteClick(etkinlik);
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
                      Hiç etkinlik bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredEtkinlikler.length}
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
        <DialogTitle>Etkinliği Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {etkinlikToDelete &&
              `"${etkinlikToDelete.etkinlikAdi}" etkinliğini ve tüm ilişkili katılımcı ve dosya kayıtlarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
        <DialogTitle>Etkinlikleri Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Seçtiğiniz ${selected.length} adet etkinliği ve ilişkili tüm kayıtları silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
        data={filteredEtkinlikler}
        availableColumns={exportColumns}
        entityName="Etkinlikler"
      />
    </Box>
  );
};

export default EtkinlikList;
