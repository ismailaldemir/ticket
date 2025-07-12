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
} from "@mui/icons-material";
import {
  getUcretler,
  deleteUcret,
  deleteManyUcretler,
} from "../../redux/ucret/ucretSlice";
import { toast } from "react-toastify";
import useAnimatedList from "../../hooks/useAnimatedList";
import {
  ListSkeleton,
  calculateAnimationDelay,
} from "../../utils/animationUtils";
import ExportModal from "../../components/common/ExportModal";
import {
  formatDate,
  formatBoolean,
  formatCurrency,
} from "../../utils/exportService";

const UcretList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ucretler, loading } = useSelector((state) => state.ucret);

  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);
  // Silme işlemi için state
  const [ucretToDelete, setUcretToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ad: "",
    birimUcret: "tumu",
    aktifMi: "tumu",
    minTutar: "",
    maxTutar: "",
  });

  // Dışa aktarma için state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return [];

    let results = [...data];

    if (filters.ad) {
      results = results.filter((ucret) =>
        ucret.ad.toLowerCase().includes(filters.ad.toLowerCase())
      );
    }

    if (filters.birimUcret !== "tumu") {
      const birimUcret = filters.birimUcret === "evet";
      results = results.filter((ucret) => ucret.birimUcret === birimUcret);
    }

    if (filters.aktifMi !== "tumu") {
      const aktif = filters.aktifMi === "aktif";
      results = results.filter((ucret) => ucret.aktif === aktif);
    }

    if (filters.minTutar) {
      results = results.filter(
        (ucret) => ucret.tutar >= parseFloat(filters.minTutar)
      );
    }

    if (filters.maxTutar) {
      results = results.filter(
        (ucret) => ucret.tutar <= parseFloat(filters.maxTutar)
      );
    }

    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredUcretler,
    visibleData: visibleUcretler,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: ucretler || [], // null/undefined kontrolü ekle
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    dispatch(getUcretler());
  }, [dispatch]);

  // Ücret listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getUcretler());
    refresh(); // useAnimatedList'in refresh fonksiyonunu çağır
  };

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
      ad: "",
      birimUcret: "tumu",
      aktifMi: "tumu",
      minTutar: "",
      maxTutar: "",
    });
  };

  // Ücret silme işlemi
  const handleDeleteClick = (ucret) => {
    setUcretToDelete(ucret);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (ucretToDelete) {
      try {
        await dispatch(deleteUcret(ucretToDelete._id)).unwrap();
        toast.success(`${ucretToDelete.ad} ücreti silindi`);
      } catch (error) {
        toast.error(error.msg || "Ücret silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setUcretToDelete(null);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredUcretler.map((ucret) => ucret._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    // Eğer tıklanan öğe checkbox ise, event propagation'ı durdur
    if (event.target.type === "checkbox") {
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
    // Checkbox tıklanınca satırın kliklenmesini engelle, sadece checkbox'ın durumunu değiştir
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
    setMultipleDeleteDialogOpen(true);
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManyUcretler(selected)).unwrap();
      toast.success(`${selected.length} adet ücret başarıyla silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || "Ücretler silinirken bir hata oluştu");
    }
    setMultipleDeleteDialogOpen(false);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" component="h1">
            Ücretler
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
          </Box>
        </Box>

        <ListSkeleton
          rowCount={5}
          columnCount={5}
          hasCheckbox={true}
          hasActions={true}
        />
      </Box>
    );
  }

  // Dışa aktarma için sütun tanımları
  const exportColumns = [
    {
      id: "ad",
      header: "Ücret Adı",
      accessor: (item) => item.ad || "",
    },
    {
      id: "baslangicTarihi",
      header: "Başlangıç Tarihi",
      accessor: (item) => formatDate(item.baslangicTarihi),
    },
    {
      id: "bitisTarihi",
      header: "Bitiş Tarihi",
      accessor: (item) =>
        item.bitisTarihi ? formatDate(item.bitisTarihi) : "Devam Ediyor",
    },
    {
      id: "tutar",
      header: "Tutar",
      accessor: (item) => formatCurrency(item.tutar),
    },
    {
      id: "birimUcret",
      header: "Birim Ücret",
      accessor: (item) => formatBoolean(item.birimUcret),
    },
    {
      id: "aktif",
      header: "Aktif",
      accessor: (item) => formatBoolean(item.aktif),
    },
  ];

  const renderUcretRow = (ucret, index) => {
    // Animasyon gecikmesini hesapla
    const delay = calculateAnimationDelay(index, visibleUcretler.length);

    // Bitiş tarihi kontrolü
    const bugun = new Date();
    const bitisTarihi = ucret.bitisTarihi ? new Date(ucret.bitisTarihi) : null;

    // Geçerlilik durumu
    let gecerlilikDurumu = "Geçerli";
    let gecerlilikRenk = "success";

    if (bitisTarihi && bitisTarihi <= bugun) {
      gecerlilikDurumu = "Süresi Dolmuş";
      gecerlilikRenk = "error";
    }

    const isItemSelected = isSelected(ucret._id);

    return (
      <Grow
        in={contentLoaded}
        key={ucret._id}
        timeout={{ enter: 300 + delay }}
        style={{ transformOrigin: "0 0 0" }}
      >
        <TableRow
          hover
          onClick={(event) => handleClick(event, ucret._id)}
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
              inputProps={{ "aria-labelledby": `ucret-${ucret._id}` }}
              onClick={(e) => handleCheckboxClick(e, ucret._id)}
            />
          </TableCell>
          <TableCell>{ucret.tarife_id?.ad || "Bilinmeyen Tarife"}</TableCell>
          <TableCell>{formatCurrency(ucret.tutar)}</TableCell>
          <TableCell align="center">
            {ucret.birimUcret ? (
              <Chip label="Evet" color="primary" size="small" />
            ) : (
              <Chip label="Hayır" color="default" size="small" />
            )}
          </TableCell>
          <TableCell>
            {ucret.baslangicTarihi ? formatDate(ucret.baslangicTarihi) : "-"}
          </TableCell>
          <TableCell>
            {ucret.bitisTarihi ? formatDate(ucret.bitisTarihi) : "Süresiz"}
          </TableCell>
          <TableCell>
            <Chip
              label={ucret.isActive ? "Aktif" : "Pasif"}
              color={ucret.isActive ? "success" : "default"}
              size="small"
            />
          </TableCell>
          <TableCell>
            <Chip
              label={gecerlilikDurumu}
              color={gecerlilikRenk}
              size="small"
            />
          </TableCell>
          <TableCell>
            {/* İşlem butonları */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Düzenle">
                <IconButton
                  color="primary"
                  component={Link}
                  to={`/ucretler/duzenle/${ucret._id}`}
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
                    handleDeleteClick(ucret);
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
  };

  return (
    <Box>
      <Box
        className="page-header"
        sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
      >
        <Typography variant="h5" component="h1">
          Ücretler
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/ucretler/ekle")}
          >
            Ücret Ekle
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
          <IconButton
            color="primary"
            onClick={handleRefresh}
            title="Listeyi Yenile"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filtreleme Seçenekleri
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Ücret Adı"
                name="ad"
                value={filters.ad}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Birim Ücret</InputLabel>
                <Select
                  name="birimUcret"
                  value={filters.birimUcret}
                  onChange={handleFilterChange}
                  label="Birim Ücret"
                >
                  <MenuItem value="tumu">Tümü</MenuItem>
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayir">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  name="aktifMi"
                  value={filters.aktifMi}
                  onChange={handleFilterChange}
                  label="Durum"
                >
                  <MenuItem value="tumu">Tümü</MenuItem>
                  <MenuItem value="aktif">Aktif</MenuItem>
                  <MenuItem value="pasif">Pasif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Min. Tutar"
                name="minTutar"
                type="number"
                value={filters.minTutar}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Max. Tutar"
                name="maxTutar"
                type="number"
                value={filters.maxTutar}
                onChange={handleFilterChange}
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
          Toplam {totalCount} ücret bulundu
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
            {selected.length} ücret seçildi
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
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selected.length > 0 &&
                        selected.length < filteredUcretler.length
                      }
                      checked={
                        filteredUcretler.length > 0 &&
                        selected.length === filteredUcretler.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm ücretleri seç" }}
                    />
                  </TableCell>
                  <TableCell>Tarife</TableCell>
                  <TableCell>Tutar</TableCell>
                  <TableCell align="center">Birim Ücret</TableCell>
                  <TableCell>Başlangıç Tarihi</TableCell>
                  <TableCell>Bitiş Tarihi</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Geçerlilik</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleUcretler.length > 0 ? (
                  visibleUcretler.map((ucret, index) =>
                    renderUcretRow(ucret, index)
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Hiç ücret bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredUcretler.length}
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

      {/* Tekli silme onay diyaloğu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Ücreti Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {ucretToDelete &&
              `${ucretToDelete.ad} ücretini silmek istediğinize emin misiniz?`}
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
        <DialogTitle>Seçili Ücretleri Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selected.length} ücret kaydını silmek istediğinize emin misiniz? Bu
            işlem geri alınamaz.
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
        data={filteredUcretler}
        availableColumns={exportColumns}
        entityName="Ücretler"
      />
    </Box>
  );
};

export default UcretList;
