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
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Archive as ArchiveIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
} from "@mui/icons-material";
import {
  getEvraklar,
  deleteEvrak,
  deleteManyEvraklar,
} from "../../redux/evrak/evrakSlice";
import { getCariler } from "../../redux/cari/cariSlice";
import { toast } from "react-toastify";
import useAnimatedList from "../../hooks/useAnimatedList";
import {
  ListSkeleton,
  calculateAnimationDelay,
} from "../../utils/animationUtils";
import ExportModal from "../../components/common/ExportModal";
import { formatDate } from "../../utils/exportService";
import DeleteDialog from "../../components/common/DeleteDialog";

const EvrakList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { evraklar, loading } = useSelector((state) => state.evrak);
  const { cariler } = useSelector((state) => state.cari);

  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);
  // Silme işlemi için state
  const [evrakToDelete, setEvrakToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    evrakTuru: "",
    evrakNo: "",
    evrakKonusu: "",
    cari_id: "",
    gizlilikTuru: "",
    tarihBaslangic: "",
    tarihBitis: "",
  });

  // Dışa aktarma için state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return [];

    let results = [...data];

    if (filters.evrakTuru) {
      results = results.filter(
        (evrak) => evrak.evrakTuru === filters.evrakTuru
      );
    }

    if (filters.evrakNo) {
      results = results.filter((evrak) =>
        evrak.evrakNo.toLowerCase().includes(filters.evrakNo.toLowerCase())
      );
    }

    if (filters.evrakKonusu) {
      results = results.filter((evrak) =>
        evrak.evrakKonusu
          .toLowerCase()
          .includes(filters.evrakKonusu.toLowerCase())
      );
    }

    if (filters.cari_id) {
      results = results.filter(
        (evrak) => evrak.cari_id && evrak.cari_id._id === filters.cari_id
      );
    }

    if (filters.gizlilikTuru) {
      results = results.filter(
        (evrak) => evrak.gizlilikTuru === filters.gizlilikTuru
      );
    }

    if (filters.tarihBaslangic) {
      const baslangic = new Date(filters.tarihBaslangic);
      baslangic.setHours(0, 0, 0, 0);
      results = results.filter((evrak) => new Date(evrak.tarih) >= baslangic);
    }

    if (filters.tarihBitis) {
      const bitis = new Date(filters.tarihBitis);
      bitis.setHours(23, 59, 59, 999);
      results = results.filter((evrak) => new Date(evrak.tarih) <= bitis);
    }

    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredEvraklar,
    visibleData: visibleEvraklar,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: evraklar || [],
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    dispatch(getEvraklar());
    dispatch(getCariler());
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
      evrakTuru: "",
      evrakNo: "",
      evrakKonusu: "",
      cari_id: "",
      gizlilikTuru: "",
      tarihBaslangic: "",
      tarihBitis: "",
    });
  };

  // Evrak silme işlemi
  const handleDeleteClick = (evrak) => {
    setEvrakToDelete(evrak);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (evrakToDelete) {
      try {
        await dispatch(deleteEvrak(evrakToDelete._id)).unwrap();
        toast.success(`Evrak ve ekleri silindi`);
      } catch (error) {
        toast.error(error.msg || "Evrak silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setEvrakToDelete(null);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredEvraklar.map((evrak) => evrak._id);
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
      toast.warning("Lütfen silinecek evrakları seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManyEvraklar(selected)).unwrap();
      toast.success(`${selected.length} adet evrak başarıyla silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || "Evraklar silinirken bir hata oluştu");
    }
    setMultipleDeleteDialogOpen(false);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Evrak listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getEvraklar());
    refresh(); // useAnimatedList'in refresh fonksiyonunu çağır
  };

  // Evrak türüne göre renk belirleme
  const getEvrakTuruColor = (evrakTuru) => {
    switch (evrakTuru) {
      case "Gelen Evrak":
        return "primary";
      case "Giden Evrak":
        return "success";
      default:
        return "default";
    }
  };

  // Gizlilik türüne göre renk ve simge belirleme
  const getGizlilikTuruColor = (gizlilikTuru) => {
    switch (gizlilikTuru) {
      case "Kişiye Özel":
        return "error";
      case "Çok Gizli":
        return "error";
      case "Gizli":
        return "warning";
      default:
        return "default";
    }
  };

  // Evrak eklerinin ilk dosyasına göre ikon belirleme
  const getEvrakEkIcon = (evrak) => {
    // Evrakın ekleri varsa ilk ekin türüne göre ikon getir
    if (evrak.ekSayisi && evrak.ekSayisi > 0) {
      // Burada direkt ek bilgisi olmadığı için, evrak türüne göre varsayılan ikonlar atayabiliriz
      if (evrak.ekTur && evrak.ekTur.length > 0) {
        const ekTur = evrak.ekTur.toLowerCase();
        if (ekTur.includes("pdf")) {
          return <PdfIcon fontSize="small" color="error" />;
        } else if (ekTur.includes("resim") || ekTur.includes("image")) {
          return <ImageIcon fontSize="small" color="success" />;
        } else if (ekTur.includes("video")) {
          return <VideoIcon fontSize="small" color="primary" />;
        } else if (ekTur.includes("ses") || ekTur.includes("audio")) {
          return <AudioIcon fontSize="small" color="secondary" />;
        } else if (ekTur.includes("zip") || ekTur.includes("arşiv")) {
          return <ArchiveIcon fontSize="small" color="warning" />;
        }
      }
      // Eğer ek türü tespit edilemezse varsayılan olarak dosya ikonu göster
      return <AttachFileIcon fontSize="small" color="action" />;
    }
    // Ek yoksa null döndür
    return null;
  };

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" component="h1">
            Evraklar
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
      id: "evrakTuru",
      header: "Evrak Türü",
      accessor: (item) => item.evrakTuru || "",
    },
    {
      id: "evrakNo",
      header: "Evrak No",
      accessor: (item) => item.evrakNo || "",
    },
    {
      id: "evrakKonusu",
      header: "Evrak Konusu",
      accessor: (item) => item.evrakKonusu || "",
    },
    {
      id: "cari",
      header: "Cari",
      accessor: (item) => (item.cari_id ? item.cari_id.cariAd : ""),
    },
    {
      id: "tarih",
      header: "Tarih",
      accessor: (item) => formatDate(item.tarih),
    },
    {
      id: "gizlilikTuru",
      header: "Gizlilik Türü",
      accessor: (item) => item.gizlilikTuru || "",
    },
    {
      id: "ilgiliKisi",
      header: "İlgili Kişi",
      accessor: (item) => item.ilgiliKisi || "",
    },
    {
      id: "teslimTarihi",
      header: "Teslim Tarihi",
      accessor: (item) =>
        item.teslimTarihi ? formatDate(item.teslimTarihi) : "",
    },
    {
      id: "teslimAlan",
      header: "Teslim Alan",
      accessor: (item) => item.teslimAlan || "",
    },
    {
      id: "aciklama",
      header: "Açıklama",
      accessor: (item) => item.aciklama || "",
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
          Evraklar
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/evraklar/ekle")}
          >
            Yeni Evrak
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
              <FormControl fullWidth>
                <InputLabel>Evrak Türü</InputLabel>
                <Select
                  name="evrakTuru"
                  value={filters.evrakTuru}
                  onChange={handleFilterChange}
                  label="Evrak Türü"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Gelen Evrak">Gelen Evrak</MenuItem>
                  <MenuItem value="Giden Evrak">Giden Evrak</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Evrak No"
                name="evrakNo"
                value={filters.evrakNo}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Evrak Konusu"
                name="evrakKonusu"
                value={filters.evrakKonusu}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Cari</InputLabel>
                <Select
                  name="cari_id"
                  value={filters.cari_id}
                  onChange={handleFilterChange}
                  label="Cari"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {cariler.map((cari) => (
                    <MenuItem key={cari._id} value={cari._id}>
                      {cari.cariAd}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Gizlilik Türü</InputLabel>
                <Select
                  name="gizlilikTuru"
                  value={filters.gizlilikTuru}
                  onChange={handleFilterChange}
                  label="Gizlilik Türü"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Normal Evrak">Normal Evrak</MenuItem>
                  <MenuItem value="Gizli">Gizli</MenuItem>
                  <MenuItem value="Çok Gizli">Çok Gizli</MenuItem>
                  <MenuItem value="Kişiye Özel">Kişiye Özel</MenuItem>
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
          Toplam {totalCount} evrak kaydı bulundu
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
            {selected.length} evrak seçildi
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
                        selected.length < filteredEvraklar.length
                      }
                      checked={
                        filteredEvraklar.length > 0 &&
                        selected.length === filteredEvraklar.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm evrakları seç" }}
                    />
                  </TableCell>
                  <TableCell>Evrak Türü</TableCell>
                  <TableCell>Evrak No</TableCell>
                  <TableCell>Konu</TableCell>
                  <TableCell>Cari</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Gizlilik</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleEvraklar.length > 0 ? (
                  visibleEvraklar.map((evrak, index) => {
                    // Animasyon gecikmesini hesapla
                    const delay = calculateAnimationDelay(
                      index,
                      visibleEvraklar.length
                    );
                    const isItemSelected = isSelected(evrak._id);

                    return (
                      <Grow
                        in={contentLoaded}
                        key={evrak._id}
                        timeout={{ enter: 300 + delay }}
                        style={{ transformOrigin: "0 0 0" }}
                      >
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, evrak._id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          sx={{
                            "&:hover": {
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, 0.08),
                            },
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{
                                "aria-labelledby": `evrak-${evrak._id}`,
                              }}
                              onClick={(e) => handleCheckboxClick(e, evrak._id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<DescriptionIcon />}
                              label={evrak.evrakTuru}
                              color={getEvrakTuruColor(evrak.evrakTuru)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{evrak.evrakNo}</TableCell>
                          <TableCell>
                            <Tooltip title={evrak.evrakKonusu || ""}>
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 200,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {evrak.evrakKonusu}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {evrak.cari_id ? evrak.cari_id.cariAd : "-"}
                          </TableCell>
                          <TableCell>
                            {new Date(evrak.tarih).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Chip
                                label={evrak.gizlilikTuru}
                                color={getGizlilikTuruColor(evrak.gizlilikTuru)}
                                size="small"
                                variant={
                                  evrak.gizlilikTuru === "Normal Evrak"
                                    ? "outlined"
                                    : "filled"
                                }
                              />
                              {evrak.ekSayisi > 0 && (
                                <Tooltip title={`${evrak.ekSayisi} adet ek`}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {getEvrakEkIcon(evrak)}
                                    <Typography
                                      variant="caption"
                                      sx={{ ml: 0.5 }}
                                    >
                                      {evrak.ekSayisi}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Detayları Gör">
                                <IconButton
                                  color="info"
                                  component={Link}
                                  to={`/evraklar/detay/${evrak._id}`}
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
                                  to={`/evraklar/duzenle/${evrak._id}`}
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
                                    handleDeleteClick(evrak);
                                  }}
                                  size="small"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Ekler">
                                <IconButton
                                  color="secondary"
                                  component={Link}
                                  to={`/evraklar/ekler/${evrak._id}`}
                                  size="small"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <AttachFileIcon fontSize="small" />
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
                      Hiç evrak kaydı bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredEvraklar.length}
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
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Evrak Kaydını Sil"
        content={
          evrakToDelete &&
          `"${evrakToDelete.evrakTuru} - ${evrakToDelete.evrakNo}" evrak kaydını ve eklerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
        }
      />

      {/* Çoklu silme onay diyaloğu */}
      <DeleteDialog
        open={multipleDeleteDialogOpen}
        onClose={() => setMultipleDeleteDialogOpen(false)}
        onConfirm={handleMultipleDeleteConfirm}
        title="Evrak Kayıtlarını Sil"
        content={`Seçtiğiniz ${selected.length} adet evrak kaydını ve eklerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
      />

      {/* Dışa aktarma modal'i */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={filteredEvraklar}
        availableColumns={exportColumns}
        entityName="Evraklar"
      />
    </Box>
  );
};

export default EvrakList;
