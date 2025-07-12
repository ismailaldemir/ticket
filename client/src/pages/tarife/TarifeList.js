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
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import {
  getTarifeler,
  deleteTarife,
  deleteManyTarifeler,
} from "../../redux/tarife/tarifeSlice";
import { toast } from "react-toastify";
import useAnimatedList from "../../hooks/useAnimatedList";
import {
  ListSkeleton,
  calculateAnimationDelay,
} from "../../utils/animationUtils";
import ExportModal from "../../components/common/ExportModal";
import { formatBoolean } from "../../utils/exportService";

const TarifeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tarifeler, loading } = useSelector((state) => state.tarife);

  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);
  // Silme işlemi için state
  const [tarifeToDelete, setTarifeToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    kod: "",
    ad: "",
    birimUcret: "tumu",
    aylıkUcret: "tumu",
    gelirler: "tumu",
    giderler: "tumu",
    borclar: "tumu",
    odemeler: "tumu",
    aktifMi: "tumu",
  });

  // Dışa aktarma için state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return [];

    let results = [...data];

    if (filters.kod) {
      results = results.filter((tarife) =>
        tarife.kod.toLowerCase().includes(filters.kod.toLowerCase())
      );
    }

    if (filters.ad) {
      results = results.filter((tarife) =>
        tarife.ad.toLowerCase().includes(filters.ad.toLowerCase())
      );
    }

    if (filters.birimUcret !== "tumu") {
      const birimUcret = filters.birimUcret === "evet";
      results = results.filter((tarife) => tarife.birimUcret === birimUcret);
    }

    if (filters.aylıkUcret !== "tumu") {
      const aylıkUcret = filters.aylıkUcret === "evet";
      results = results.filter((tarife) => tarife.aylıkUcret === aylıkUcret);
    }

    if (filters.gelirler !== "tumu") {
      const gelirler = filters.gelirler === "evet";
      results = results.filter(
        (tarife) => tarife.kullanilabilecekAlanlar?.gelirler === gelirler
      );
    }

    if (filters.giderler !== "tumu") {
      const giderler = filters.giderler === "evet";
      results = results.filter(
        (tarife) => tarife.kullanilabilecekAlanlar?.giderler === giderler
      );
    }

    if (filters.borclar !== "tumu") {
      const borclar = filters.borclar === "evet";
      results = results.filter(
        (tarife) => tarife.kullanilabilecekAlanlar?.borclar === borclar
      );
    }

    if (filters.odemeler !== "tumu") {
      const odemeler = filters.odemeler === "evet";
      results = results.filter(
        (tarife) => tarife.kullanilabilecekAlanlar?.odemeler === odemeler
      );
    }

    if (filters.aktifMi !== "tumu") {
      const aktif = filters.aktifMi === "aktif";
      results = results.filter((tarife) => tarife.isActive === aktif);
    }

    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredTarifeler,
    visibleData: visibleTarifeler,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: tarifeler || [],
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    dispatch(getTarifeler());
  }, [dispatch]);

  // Tarife listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getTarifeler());
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
      kod: "",
      ad: "",
      birimUcret: "tumu",
      aylıkUcret: "tumu",
      gelirler: "tumu",
      giderler: "tumu",
      borclar: "tumu",
      odemeler: "tumu",
      aktifMi: "tumu",
    });
  };

  // Tarife silme işlemi
  const handleDeleteClick = (tarife) => {
    setTarifeToDelete(tarife);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (tarifeToDelete) {
      try {
        await dispatch(deleteTarife(tarifeToDelete._id)).unwrap();
        toast.success(`${tarifeToDelete.ad} tarifesi silindi`);
      } catch (error) {
        toast.error(error.msg || "Tarife silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setTarifeToDelete(null);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredTarifeler.map((tarife) => tarife._id);
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
      toast.warning("Lütfen silinecek tarifeleri seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManyTarifeler(selected)).unwrap();
      toast.success(`${selected.length} adet tarife silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || "Tarifeler silinirken bir hata oluştu");
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
            Tarifeler
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <ListSkeleton width={120} height={36} variant="rectangular" />
            <ListSkeleton width={36} height={36} variant="circular" />
          </Box>
        </Box>

        <ListSkeleton
          rowCount={5}
          columnCount={7}
          hasCheckbox={true}
          hasActions={true}
        />
      </Box>
    );
  }

  // Dışa aktarma için sütun tanımları
  const exportColumns = [
    {
      id: "kod",
      header: "Kod",
      accessor: (item) => item.kod || "",
    },
    {
      id: "ad",
      header: "Tarife Adı",
      accessor: (item) => item.ad || "",
    },
    {
      id: "aciklama",
      header: "Açıklama",
      accessor: (item) => item.aciklama || "",
    },
    {
      id: "birimUcret",
      header: "Birim Ücret",
      accessor: (item) => formatBoolean(item.birimUcret),
    },
    {
      id: "aylıkUcret",
      header: "Aylık Ücret",
      accessor: (item) => formatBoolean(item.aylıkUcret),
    },
    {
      id: "gelirler",
      header: "Gelirler",
      accessor: (item) =>
        formatBoolean(item.kullanilabilecekAlanlar?.gelirler || false),
    },
    {
      id: "giderler",
      header: "Giderler",
      accessor: (item) =>
        formatBoolean(item.kullanilabilecekAlanlar?.giderler || false),
    },
    {
      id: "borclar",
      header: "Borçlar",
      accessor: (item) =>
        formatBoolean(item.kullanilabilecekAlanlar?.borclar || false),
    },
    {
      id: "odemeler",
      header: "Ödemeler",
      accessor: (item) =>
        formatBoolean(item.kullanilabilecekAlanlar?.odemeler || false),
    },
    {
      id: "isActive",
      header: "Aktif",
      accessor: (item) => formatBoolean(item.isActive),
    },
  ];

  const renderTarifeRow = (tarife, index) => {
    // Animasyon gecikmesini hesapla
    const delay = calculateAnimationDelay(index, visibleTarifeler.length);
    const isItemSelected = isSelected(tarife._id);

    return (
      <Grow
        in={contentLoaded}
        key={tarife._id}
        timeout={{ enter: 300 + delay }}
        style={{ transformOrigin: "0 0 0" }}
      >
        <TableRow
          hover
          onClick={(event) => handleClick(event, tarife._id)}
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
              inputProps={{ "aria-labelledby": `tarife-${tarife._id}` }}
              onClick={(e) => handleCheckboxClick(e, tarife._id)}
            />
          </TableCell>
          <TableCell>{tarife.kod}</TableCell>
          <TableCell>{tarife.ad}</TableCell>
          <TableCell align="center">
            {tarife.birimUcret ? (
              <Chip label="Evet" color="primary" size="small" />
            ) : (
              <Chip label="Hayır" color="default" size="small" />
            )}
          </TableCell>
          <TableCell align="center">
            {tarife.aylıkUcret ? (
              <Chip label="Evet" color="primary" size="small" />
            ) : (
              <Chip label="Hayır" color="default" size="small" />
            )}
          </TableCell>
          <TableCell align="center">
            {/* Kullanım alanlarını göster */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                justifyContent: "center",
              }}
            >
              {tarife.kullanilabilecekAlanlar?.gelirler && (
                <Chip label="Gelirler" color="success" size="small" />
              )}
              {tarife.kullanilabilecekAlanlar?.giderler && (
                <Chip label="Giderler" color="error" size="small" />
              )}
              {tarife.kullanilabilecekAlanlar?.borclar && (
                <Chip label="Borçlar" color="primary" size="small" />
              )}
              {tarife.kullanilabilecekAlanlar?.odemeler && (
                <Chip label="Ödemeler" color="info" size="small" />
              )}
            </Box>
          </TableCell>
          <TableCell>
            <Chip
              label={tarife.isActive ? "Aktif" : "Pasif"}
              color={tarife.isActive ? "success" : "default"}
              size="small"
            />
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Düzenle">
                <IconButton
                  color="primary"
                  component={Link}
                  to={`/tarifeler/duzenle/${tarife._id}`}
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Detay">
                <IconButton
                  color="info"
                  component={Link}
                  to={`/tarifeler/detay/${tarife._id}`}
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoneyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sil">
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(tarife);
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
    <Box sx={{ p: 3 }}>
      <Box
        className="page-header"
        sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
      >
        <Typography variant="h5" component="h1">
          Tarifeler
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/tarifeler/ekle")}
          >
            Tarife Ekle
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
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Kod"
                name="kod"
                value={filters.kod}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Tarife Adı"
                name="ad"
                value={filters.ad}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Aylık Ücret</InputLabel>
                <Select
                  name="aylıkUcret"
                  value={filters.aylıkUcret}
                  onChange={handleFilterChange}
                  label="Aylık Ücret"
                >
                  <MenuItem value="tumu">Tümü</MenuItem>
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayir">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Gelirler</InputLabel>
                <Select
                  name="gelirler"
                  value={filters.gelirler}
                  onChange={handleFilterChange}
                  label="Gelirler"
                >
                  <MenuItem value="tumu">Tümü</MenuItem>
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayir">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Giderler</InputLabel>
                <Select
                  name="giderler"
                  value={filters.giderler}
                  onChange={handleFilterChange}
                  label="Giderler"
                >
                  <MenuItem value="tumu">Tümü</MenuItem>
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayir">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Borçlar</InputLabel>
                <Select
                  name="borclar"
                  value={filters.borclar}
                  onChange={handleFilterChange}
                  label="Borçlar"
                >
                  <MenuItem value="tumu">Tümü</MenuItem>
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayir">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Ödemeler</InputLabel>
                <Select
                  name="odemeler"
                  value={filters.odemeler}
                  onChange={handleFilterChange}
                  label="Ödemeler"
                >
                  <MenuItem value="tumu">Tümü</MenuItem>
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayir">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
          Toplam {totalCount} tarife bulundu
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
            {selected.length} tarife seçildi
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
                        selected.length < filteredTarifeler.length
                      }
                      checked={
                        filteredTarifeler.length > 0 &&
                        selected.length === filteredTarifeler.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm tarifeleri seç" }}
                    />
                  </TableCell>
                  <TableCell>Kod</TableCell>
                  <TableCell>Tarife Adı</TableCell>
                  <TableCell align="center">Birim Ücret</TableCell>
                  <TableCell align="center">Aylık Ücret</TableCell>
                  <TableCell align="center">Kullanım Alanları</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleTarifeler.length > 0 ? (
                  visibleTarifeler.map((tarife, index) =>
                    renderTarifeRow(tarife, index)
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Hiç tarife bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredTarifeler.length}
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

      {/* Tarife silme onay diyaloğu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Tarifeyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {tarifeToDelete &&
              `${tarifeToDelete.ad} tarifesini silmek istediğinize emin misiniz?`}
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
        <DialogTitle>Tarifeleri Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selected.length} tarifeyi silmek istediğinize emin misiniz? Bu
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
        data={filteredTarifeler}
        availableColumns={exportColumns}
        entityName="Tarifeler"
      />
    </Box>
  );
};

export default TarifeList;
