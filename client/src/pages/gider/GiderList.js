import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Button,
  Typography,
  IconButton,
  Checkbox,
  Toolbar,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TablePagination,
  alpha,
  Chip,
  Fade,
  Grow,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  FileDownload as FileDownloadIcon,
  Receipt as ReceiptIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  getGiderler,
  deleteGider,
  deleteManyGiderler,
} from "../../redux/gider/giderSlice";
import { getActiveKasalar } from "../../redux/kasa/kasaSlice";
import { toast } from "react-toastify";
import useAnimatedList from "../../hooks/useAnimatedList";
import {
  ListSkeleton,
  calculateAnimationDelay,
} from "../../utils/animationUtils";
import ExportModal from "../../components/common/ExportModal";
import { formatDate, formatCurrency } from "../../utils/exportService";

const GiderList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { giderler, loading } = useSelector((state) => state.gider);
  const { kasalar } = useSelector((state) => state.kasa);

  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);
  // Silme işlemi için state
  const [giderToDelete, setGiderToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    giderTuru: "",
    kasa_id: "",
    tarihBaslangic: "",
    tarihBitis: "",
    belgeNo: "",
    odemeTuru: "",
    minTutar: "",
    maxTutar: "",
    sonOdemeTarihiBaslangic: "",
    sonOdemeTarihiBitis: "",
  });

  // Dışa aktarma için state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return [];

    let results = [...data];

    if (filters.giderTuru) {
      results = results.filter(
        (gider) => gider.giderTuru === filters.giderTuru
      );
    }

    if (filters.kasa_id) {
      results = results.filter(
        (gider) => gider.kasa_id?._id === filters.kasa_id
      );
    }

    if (filters.tarihBaslangic) {
      const baslangic = new Date(filters.tarihBaslangic);
      baslangic.setHours(0, 0, 0, 0);
      results = results.filter((gider) => new Date(gider.tarih) >= baslangic);
    }

    if (filters.tarihBitis) {
      const bitis = new Date(filters.tarihBitis);
      bitis.setHours(23, 59, 59, 999);
      results = results.filter((gider) => new Date(gider.tarih) <= bitis);
    }

    if (filters.belgeNo) {
      results = results.filter(
        (gider) =>
          gider.belgeNo &&
          gider.belgeNo.toLowerCase().includes(filters.belgeNo.toLowerCase())
      );
    }

    if (filters.odemeTuru) {
      results = results.filter(
        (gider) => gider.odemeTuru === filters.odemeTuru
      );
    }

    if (filters.minTutar) {
      results = results.filter(
        (gider) => gider.toplamTutar >= parseFloat(filters.minTutar)
      );
    }

    if (filters.maxTutar) {
      results = results.filter(
        (gider) => gider.toplamTutar <= parseFloat(filters.maxTutar)
      );
    }

    if (filters.sonOdemeTarihiBaslangic) {
      const baslangic = new Date(filters.sonOdemeTarihiBaslangic);
      baslangic.setHours(0, 0, 0, 0);
      results = results.filter(
        (gider) =>
          gider.sonOdemeTarihi && new Date(gider.sonOdemeTarihi) >= baslangic
      );
    }

    if (filters.sonOdemeTarihiBitis) {
      const bitis = new Date(filters.sonOdemeTarihiBitis);
      bitis.setHours(23, 59, 59, 999);
      results = results.filter(
        (gider) =>
          gider.sonOdemeTarihi && new Date(gider.sonOdemeTarihi) <= bitis
      );
    }

    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredGiderler,
    visibleData: visibleGiderler,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: giderler || [],
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    dispatch(getGiderler());
    dispatch(getActiveKasalar());
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
      giderTuru: "",
      kasa_id: "",
      tarihBaslangic: "",
      tarihBitis: "",
      belgeNo: "",
      odemeTuru: "",
      minTutar: "",
      maxTutar: "",
      sonOdemeTarihiBaslangic: "",
      sonOdemeTarihiBitis: "",
    });
  };

  // Gider silme işlemi
  const handleDeleteClick = (gider) => {
    setGiderToDelete(gider);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (giderToDelete) {
      try {
        await dispatch(deleteGider(giderToDelete._id)).unwrap();
        toast.success(`Gider kaydı silindi`);
      } catch (error) {
        toast.error(error.msg || "Gider kaydı silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setGiderToDelete(null);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredGiderler.map((gider) => gider._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    // Eğer tıklanan öğe checkbox veya buton ise, event propagation'ı durdur
    if (event.target.type === "checkbox" || event.target.tagName === "BUTTON") {
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
      toast.warning("Lütfen silinecek gider kayıtlarını seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManyGiderler(selected)).unwrap();
      toast.success(`${selected.length} adet gider kaydı silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || "Gider kayıtları silinirken bir hata oluştu");
    }
    setMultipleDeleteDialogOpen(false);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Listeyi yenileme işlemi
  const handleRefresh = () => {
    dispatch(getGiderler());
    refresh(); // useAnimatedList'in refresh fonksiyonunu çağır
  };

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" component="h1">
            Giderler
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
      id: "giderTuru",
      header: "Gider Türü",
      accessor: (item) => item.giderTuru || "",
    },
    {
      id: "kasa",
      header: "Kasa",
      accessor: (item) => item.kasa_id?.kasaAdi || "",
    },
    {
      id: "tarih",
      header: "Tarih",
      accessor: (item) => formatDate(item.tarih),
    },
    {
      id: "belgeNo",
      header: "Belge No",
      accessor: (item) => item.belgeNo || "",
    },
    {
      id: "giderYeri",
      header: "Gider Yeri",
      accessor: (item) => item.giderYeri || "",
    },
    {
      id: "odemeTuru",
      header: "Ödeme Türü",
      accessor: (item) => item.odemeTuru || "",
    },
    {
      id: "toplamTutar",
      header: "Toplam Tutar",
      accessor: (item) => formatCurrency(item.toplamTutar),
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
    {
      id: "sonOdemeTarihi",
      header: "Son Ödeme Tarihi",
      accessor: (item) =>
        item.sonOdemeTarihi ? formatDate(item.sonOdemeTarihi) : "-",
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
          Giderler
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/giderler/ekle")}
          >
            Yeni Gider
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
                <InputLabel>Gider Türü</InputLabel>
                <Select
                  name="giderTuru"
                  value={filters.giderTuru}
                  onChange={handleFilterChange}
                  label="Gider Türü"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Fatura Ödemeleri">Fatura Ödemeleri</MenuItem>
                  <MenuItem value="Şahıs Ödemeleri">Şahıs Ödemeleri</MenuItem>
                  <MenuItem value="Kurum Ödemeleri">Kurum Ödemeleri</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Kasa</InputLabel>
                <Select
                  name="kasa_id"
                  value={filters.kasa_id}
                  onChange={handleFilterChange}
                  label="Kasa"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {kasalar.map((kasa) => (
                    <MenuItem key={kasa._id} value={kasa._id}>
                      {kasa.kasaAdi}
                    </MenuItem>
                  ))}
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
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Belge No"
                name="belgeNo"
                value={filters.belgeNo}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Ödeme Türü</InputLabel>
                <Select
                  name="odemeTuru"
                  value={filters.odemeTuru}
                  onChange={handleFilterChange}
                  label="Ödeme Türü"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Nakit">Nakit</MenuItem>
                  <MenuItem value="Banka Hesabı">Banka Hesabı</MenuItem>
                  <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min. Tutar"
                name="minTutar"
                type="number"
                value={filters.minTutar}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max. Tutar"
                name="maxTutar"
                type="number"
                value={filters.maxTutar}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Son Ödeme Başlangıç"
                name="sonOdemeTarihiBaslangic"
                type="date"
                value={filters.sonOdemeTarihiBaslangic}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Son Ödeme Bitiş"
                name="sonOdemeTarihiBitis"
                type="date"
                value={filters.sonOdemeTarihiBitis}
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
          Toplam {totalCount} gider kaydı bulundu
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
            {selected.length} gider kaydı seçildi
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
                        selected.length < filteredGiderler.length
                      }
                      checked={
                        filteredGiderler.length > 0 &&
                        selected.length === filteredGiderler.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm gider kayıtlarını seç" }}
                    />
                  </TableCell>
                  <TableCell>Kasa</TableCell>
                  <TableCell>Gider Türü</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Son Ödeme</TableCell>
                  <TableCell>Belge No</TableCell>
                  <TableCell>Ödeme Türü</TableCell>
                  <TableCell>Toplam Tutar</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleGiderler.length > 0 ? (
                  visibleGiderler.map((gider, index) => {
                    // Animasyon gecikmesini hesapla
                    const delay = calculateAnimationDelay(
                      index,
                      visibleGiderler.length
                    );
                    const isItemSelected = isSelected(gider._id);

                    return (
                      <Grow
                        in={contentLoaded}
                        key={gider._id}
                        timeout={{ enter: 300 + delay }}
                        style={{ transformOrigin: "0 0 0" }}
                      >
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, gider._id)}
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
                                "aria-labelledby": `gider-${gider._id}`,
                              }}
                              onClick={(e) => handleCheckboxClick(e, gider._id)}
                            />
                          </TableCell>
                          <TableCell>{gider.kasa_id?.kasaAdi || "-"}</TableCell>
                          <TableCell>
                            <Chip
                              label={gider.giderTuru}
                              color={
                                gider.giderTuru === "Fatura Ödemeleri"
                                  ? "error"
                                  : gider.giderTuru === "Kurum Ödemeleri"
                                  ? "warning"
                                  : gider.giderTuru === "Şahıs Ödemeleri"
                                  ? "info"
                                  : "default"
                              }
                              size="small"
                              icon={<ReceiptIcon />}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(gider.tarih).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {gider.sonOdemeTarihi
                              ? new Date(
                                  gider.sonOdemeTarihi
                                ).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell>{gider.belgeNo || "-"}</TableCell>
                          <TableCell>{gider.odemeTuru}</TableCell>
                          <TableCell>₺{gider.toplamTutar.toFixed(2)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Detayları Gör">
                                <IconButton
                                  color="info"
                                  component={Link}
                                  to={`/giderler/detay/${gider._id}`}
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
                                  to={`/giderler/duzenle/${gider._id}`}
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
                                    handleDeleteClick(gider);
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
                    <TableCell colSpan={9} align="center">
                      Hiç gider kaydı bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredGiderler.length}
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
        <DialogTitle>Gider Kaydını Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {giderToDelete &&
              `Bu gider kaydını ve tüm detaylarını silmek istediğinize emin misiniz? (${
                giderToDelete.giderTuru
              }, ${new Date(
                giderToDelete.tarih
              ).toLocaleDateString()}, ₺${giderToDelete.toplamTutar.toFixed(
                2
              )})`}
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
        <DialogTitle>Gider Kayıtlarını Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Seçtiğiniz ${selected.length} adet gider kaydını ve tüm detaylarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
        data={filteredGiderler}
        availableColumns={exportColumns}
        entityName="Giderler"
      />
    </Box>
  );
};

export default GiderList;
