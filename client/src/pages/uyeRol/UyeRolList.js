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
  TablePagination,
  alpha,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Fade,
  Grow,
  Skeleton,
  Tooltip,
  Checkbox,
  Toolbar,
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
  getUyeRoller,
  deleteUyeRol,
  deleteManyUyeRoller,
} from "../../redux/uyeRol/uyeRolSlice";
import { toast } from "react-toastify";
import useAnimatedList from "../../hooks/useAnimatedList";
import {
  ListSkeleton,
  calculateAnimationDelay,
} from "../../utils/animationUtils";
import ExportModal from "../../components/common/ExportModal";
import { formatBoolean } from "../../utils/exportService";
import DeleteDialog from "../../components/common/DeleteDialog";

const UyeRolList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { uyeRoller, loading } = useSelector((state) => state.uyeRol);

  // Silme işlemi için state
  const [uyeRolToDelete, setUyeRolToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ad: "",
    aciklama: "",
    aktifMi: "tumu",
  });

  // Dışa aktarma için state ekleyelim
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return []; // Veri yoksa boş dizi döndür

    let results = [...data];

    if (filters.ad) {
      results = results.filter((uyeRol) =>
        uyeRol.ad.toLowerCase().includes(filters.ad.toLowerCase())
      );
    }

    if (filters.aciklama) {
      results = results.filter(
        (uyeRol) =>
          uyeRol.aciklama &&
          uyeRol.aciklama.toLowerCase().includes(filters.aciklama.toLowerCase())
      );
    }

    if (filters.aktifMi !== "tumu") {
      const isActive = filters.aktifMi === "aktif";
      results = results.filter((uyeRol) => uyeRol.isActive === isActive);
    }

    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredUyeRoller,
    visibleData: visibleUyeRoller,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: uyeRoller || [], // null/undefined kontrolü ekle
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    dispatch(getUyeRoller());
  }, [dispatch]);

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
      aciklama: "",
      aktifMi: "tumu",
    });
  };

  // Üye rol silme işlemi
  const handleDeleteClick = (uyeRol) => {
    setUyeRolToDelete(uyeRol);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (uyeRolToDelete) {
      try {
        await dispatch(deleteUyeRol(uyeRolToDelete._id)).unwrap();
        toast.success(`${uyeRolToDelete.ad} rolü silindi`);
      } catch (error) {
        toast.error(error.msg || "Üye rolü silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setUyeRolToDelete(null);
  };

  // Üye rol listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getUyeRoller());
    refresh(); // useAnimatedList'in refresh fonksiyonunu çağır
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredUyeRoller.map((rol) => rol._id);
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
      toast.warning("Lütfen silinecek rolleri seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManyUyeRoller(selected)).unwrap();
      toast.success(`${selected.length} adet üye rolü başarıyla silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || "Üye rolleri silinirken bir hata oluştu");
    }
    setMultipleDeleteDialogOpen(false);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Dışa aktarma için sütun tanımları
  const exportColumns = [
    {
      id: "ad",
      header: "Rol Adı",
      accessor: (item) => item.ad || "",
    },
    {
      id: "aciklama",
      header: "Açıklama",
      accessor: (item) => item.aciklama || "",
    },
    {
      id: "isActive",
      header: "Aktif",
      accessor: (item) => formatBoolean(item.isActive),
    },
  ];

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" component="h1">
            Üye Rolleri
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
          </Box>
        </Box>

        <ListSkeleton
          rowCount={5}
          columnCount={3}
          hasCheckbox={false}
          hasActions={true}
        />
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
          Üye Rolleri
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/uye-roller/ekle")}
          >
            Yeni Üye Rolü
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Rol Adı"
                name="ad"
                value={filters.ad}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Açıklama"
                name="aciklama"
                value={filters.aciklama}
                onChange={handleFilterChange}
              />
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
            {selected.length} rol seçildi
          </Typography>

          <Tooltip title="Seçilenleri Sil">
            <IconButton onClick={handleMultipleDeleteClick}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam {totalCount} üye rolü bulundu
        </Typography>
      </Box>

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
                        selected.length < filteredUyeRoller.length
                      }
                      checked={
                        filteredUyeRoller.length > 0 &&
                        selected.length === filteredUyeRoller.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm rolleri seç" }}
                    />
                  </TableCell>
                  <TableCell>Rol Adı</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleUyeRoller.length > 0 ? (
                  visibleUyeRoller.map((uyeRol, index) => {
                    // Animasyon gecikmesini hesapla
                    const delay = calculateAnimationDelay(
                      index,
                      visibleUyeRoller.length
                    );
                    const isItemSelected = isSelected(uyeRol._id);

                    return (
                      <Grow
                        in={contentLoaded}
                        key={uyeRol._id}
                        timeout={{ enter: 300 + delay }}
                        style={{ transformOrigin: "0 0 0" }}
                      >
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, uyeRol._id)}
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
                                "aria-labelledby": `uyeRol-${uyeRol._id}`,
                              }}
                              onClick={(e) =>
                                handleCheckboxClick(e, uyeRol._id)
                              }
                            />
                          </TableCell>
                          <TableCell>{uyeRol.ad}</TableCell>
                          <TableCell>{uyeRol.aciklama || "-"}</TableCell>
                          <TableCell>
                            <Chip
                              label={uyeRol.isActive ? "Aktif" : "Pasif"}
                              color={uyeRol.isActive ? "success" : "error"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Düzenle">
                                <IconButton
                                  color="primary"
                                  component={Link}
                                  to={`/uye-roller/duzenle/${uyeRol._id}`}
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
                                    handleDeleteClick(uyeRol);
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
                    <TableCell colSpan={5} align="center">
                      Hiç üye rolü bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredUyeRoller.length}
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
        title="Üye Rolünü Sil"
        content={
          uyeRolToDelete &&
          `${uyeRolToDelete.ad} rolünü silmek istediğinize emin misiniz?`
        }
      />

      {/* Çoklu silme onay diyaloğu */}
      <DeleteDialog
        open={multipleDeleteDialogOpen}
        onClose={() => setMultipleDeleteDialogOpen(false)}
        onConfirm={handleMultipleDeleteConfirm}
        title="Toplu Silme"
        content={`Seçtiğiniz ${selected.length} adet üye rolünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
      />

      {/* Dışa aktarma modal'i */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={filteredUyeRoller}
        availableColumns={exportColumns}
        entityName="Üye Rolleri"
      />
    </Box>
  );
};

export default UyeRolList;
