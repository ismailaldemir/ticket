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
  getGruplar,
  deleteGrup,
  deleteManyGruplar,
} from "../../redux/grup/grupSlice";
import { toast } from "react-toastify";
import useAnimatedList from "../../hooks/useAnimatedList";
import {
  ListSkeleton,
  calculateAnimationDelay,
} from "../../utils/animationUtils";
import ExportModal from "../../components/common/ExportModal";
import { formatBoolean } from "../../utils/exportService";

const GrupList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { gruplar, loading } = useSelector((state) => state.grup);

  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);
  // Silme işlemi için state
  const [grupToDelete, setGrupToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    grupAdi: "",
    aktifMi: "tumu",
  });

  // Dışa aktarma için state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return [];

    let results = [...data];

    if (filters.grupAdi) {
      results = results.filter((grup) =>
        grup.grupAdi.toLowerCase().includes(filters.grupAdi.toLowerCase())
      );
    }

    if (filters.aktifMi !== "tumu") {
      const isActive = filters.aktifMi === "aktif";
      results = results.filter((grup) => grup.isActive === isActive);
    }

    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredGruplar,
    visibleData: visibleGruplar,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: gruplar || [], // null/undefined kontrolü ekle
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    dispatch(getGruplar());
  }, [dispatch]);

  // Grup listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getGruplar());
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
      grupAdi: "",
      aktifMi: "tumu",
    });
  };

  // Grup silme işlemi
  const handleDeleteClick = (grup) => {
    // Grup içinde kişi olup olmadığını API üzerinden kontrol etmemiz gerekiyor
    // Bu kontrolü API tarafında yapılıp hata döndürüleceğini varsayıyoruz
    setGrupToDelete(grup);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (grupToDelete) {
      try {
        await dispatch(deleteGrup(grupToDelete._id)).unwrap();
        toast.success(`${grupToDelete.grupAdi} grubu silindi`);
      } catch (error) {
        const errorMessage = error.msg || "Grup silinirken bir hata oluştu";
        // Grup içinde kişi varsa özel bir mesaj gösterelim
        if (error.msg && error.msg.includes("gruba ait kişiler var")) {
          toast.error(
            `Bu grup silinemez çünkü içinde kayıtlı kişiler var. (${error.count} kişi)`
          );
        } else {
          toast.error(errorMessage);
        }
      }
    }
    setDeleteDialogOpen(false);
    setGrupToDelete(null);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = gruplar.map((grup) => grup._id);
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
      toast.warning("Lütfen silinecek grupları seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManyGruplar(selected)).unwrap();
      toast.success(`${selected.length} adet grup silindi`);
      setSelected([]);
    } catch (error) {
      // Hata mesajları kontrolü
      if (error.response?.data?.msg) {
        toast.error(error.response.data.msg);
      } else {
        toast.error("Gruplar silinirken bir hata oluştu");
      }
    }
    setMultipleDeleteDialogOpen(false);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return (
      <Box>
        <Box
          className="page-header"
          sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
        >
          <Typography variant="h5" component="h1">
            Gruplar
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="rectangular" width={36} height={36} />
          </Box>
        </Box>

        <ListSkeleton
          rowCount={5}
          columnCount={2}
          hasCheckbox={true}
          hasActions={true}
        />
      </Box>
    );
  }

  // Dışa aktarma için sütun tanımları
  const exportColumns = [
    {
      id: "grupAdi",
      header: "Grup Adı",
      accessor: (item) => item.grupAdi || "",
    },
    {
      id: "isActive",
      header: "Aktif mi",
      accessor: (item) => formatBoolean(item.isActive),
    },
  ];

  return (
    <Box>
      <Box
        className="page-header"
        sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
      >
        <Typography variant="h5" component="h1">
          Gruplar
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/gruplar/ekle")}
          >
            Grup Ekle
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Grup Adı"
                name="grupAdi"
                value={filters.grupAdi}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
          Toplam {totalCount} grup bulundu
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
            {selected.length} grup seçildi
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
                        selected.length < filteredGruplar.length
                      }
                      checked={
                        filteredGruplar.length > 0 &&
                        selected.length === filteredGruplar.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm grupları seç" }}
                    />
                  </TableCell>
                  <TableCell>Grup Adı</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleGruplar.map((grup, index) => {
                  const isItemSelected = isSelected(grup._id);
                  // Animasyon gecikmesini hesapla
                  const delay = calculateAnimationDelay(
                    index,
                    visibleGruplar.length
                  );

                  return (
                    <Grow
                      in={contentLoaded}
                      key={grup._id}
                      timeout={{ enter: 300 + delay }}
                      style={{ transformOrigin: "0 0 0" }}
                    >
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, grup._id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              "aria-labelledby": `grup-${grup._id}`,
                            }}
                            onClick={(e) => handleCheckboxClick(e, grup._id)}
                          />
                        </TableCell>
                        <TableCell>{grup.grupAdi}</TableCell>
                        <TableCell>
                          <Chip
                            label={grup.isActive ? "Aktif" : "Pasif"}
                            color={grup.isActive ? "success" : "error"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Düzenle">
                              <IconButton
                                color="primary"
                                component={Link}
                                to={`/gruplar/duzenle/${grup._id}`}
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
                                  handleDeleteClick(grup);
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
                })}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredGruplar.length}
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
          {/* <Typography variant="body2" color="text.secondary">
            Toplam {totalCount} grup bulundu
          </Typography> */}
        </Box>
      </Fade>

      {/* Silme onay diyaloğu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Grubu Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {grupToDelete &&
              `${grupToDelete.grupAdi} grubunu silmek istediğinize emin misiniz?`}
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
        <DialogTitle>Toplu Silme</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Seçtiğiniz ${selected.length} adet grubu silmek istediğinize emin misiniz? Bu işlem geri alınamaz. İçinde kişi olan gruplar silinemez.`}
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
        data={filteredGruplar}
        availableColumns={exportColumns}
        entityName="Gruplar"
      />
    </Box>
  );
};

export default GrupList;
