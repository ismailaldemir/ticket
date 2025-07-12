import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
  Checkbox,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Toolbar,
  alpha,
  Grid,
  Fade,
  Grow,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  FileDownload as FileDownloadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  getKisiler,
  deleteKisi,
  deleteManyKisiler,
} from "../../redux/kisi/kisiSlice";
import { getGruplar } from "../../redux/grup/grupSlice";
import { toast } from "react-toastify";
import ExportModal from "../../components/common/ExportModal";
import { formatDate } from "../../utils/exportService";
import useAnimatedList from "../../hooks/useAnimatedList";
import { calculateAnimationDelay } from "../../utils/animationUtils";
import ListSkeleton from "../../components/skeletons/ListSkeleton";
import DeleteDialog from "../../components/common/DeleteDialog";

const KisiList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { kisiler, loading } = useSelector((state) => state.kisi);
  const { gruplar } = useSelector((state) => state.grup);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    grupId: "",
    durumu: "all",
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmMultipleDialogOpen, setConfirmMultipleDialogOpen] =
    useState(false);
  const [kisiToDelete, setKisiToDelete] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return [];

    let results = [...data];

    // Arama filtresi
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      results = results.filter(
        (kisi) =>
          (kisi.ad && kisi.ad.toLowerCase().includes(search)) ||
          (kisi.soyad && kisi.soyad.toLowerCase().includes(search)) ||
          (kisi.tcKimlik && kisi.tcKimlik.includes(search)) ||
          (kisi.telefonNumarasi && kisi.telefonNumarasi.includes(search)) ||
          (kisi.email && kisi.email.toLowerCase().includes(search))
      );
    }

    // Grup filtresi
    if (filterOptions.grupId) {
      results = results.filter(
        (kisi) =>
          kisi.grup_id &&
          (kisi.grup_id._id === filterOptions.grupId ||
            kisi.grup_id === filterOptions.grupId)
      );
    }

    // Durum filtresi
    if (filterOptions.durumu !== "all") {
      const isActive = filterOptions.durumu === "active";
      results = results.filter((kisi) => kisi.isActive === isActive);
    }

    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredKisiler,
    visibleData: visibleKisiler,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    totalCount,
  } = useAnimatedList({
    data: kisiler || [],
    loading,
    filters: { ...filterOptions, searchTerm },
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    dispatch(getKisiler());
    dispatch(getGruplar());
  }, [dispatch]);

  // Filtreleme işlemleri
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterOptions({
      ...filterOptions,
      [event.target.name]: event.target.value,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterOptions({
      grupId: "",
      durumu: "all",
    });
  };

  // Kişi listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getKisiler());
    refresh();
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelectedIds(filteredKisiler.map((kisi) => kisi._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectClick = (event, id) => {
    const selectedIndex = selectedIds.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedIds, id];
    } else if (selectedIndex === 0) {
      newSelected = selectedIds.slice(1);
    } else if (selectedIndex === selectedIds.length - 1) {
      newSelected = selectedIds.slice(0, -1);
    } else if (selectedIndex > 0) {
      newSelected = [
        ...selectedIds.slice(0, selectedIndex),
        ...selectedIds.slice(selectedIndex + 1),
      ];
    }

    setSelectedIds(newSelected);
  };

  const handleCheckboxClick = (event, id) => {
    event.stopPropagation();
    const selectedIndex = selectedIds.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedIds, id];
    } else {
      newSelected = selectedIds.filter((item) => item !== id);
    }

    setSelectedIds(newSelected);
  };

  const isSelected = (id) => selectedIds.indexOf(id) !== -1;

  const handleDeleteClick = (kisi) => {
    setKisiToDelete(kisi);
    setConfirmDialogOpen(true);
  };

  const handleMultipleDeleteClick = () => {
    if (selectedIds.length > 0) {
      setConfirmMultipleDialogOpen(true);
    } else {
      toast.warning("Lütfen silinecek kişileri seçin");
    }
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteKisi(kisiToDelete._id)).unwrap();
      toast.success(`${kisiToDelete.ad} ${kisiToDelete.soyad} kişisi silindi`);
    } catch (error) {
      toast.error("Silme işlemi sırasında bir hata oluştu");
    }
    setConfirmDialogOpen(false);
    setKisiToDelete(null);
  };

  const confirmMultipleDelete = async () => {
    try {
      await dispatch(deleteManyKisiler(selectedIds)).unwrap();
      setSelectedIds([]);
    } catch (error) {
      toast.error("Toplu silme işlemi sırasında bir hata oluştu");
    }
    setConfirmMultipleDialogOpen(false);
  };

  // Dışa aktarma için sütun tanımlamaları
  const exportColumns = [
    { id: "ad", header: "Ad", accessor: (item) => item.ad },
    { id: "soyad", header: "Soyad", accessor: (item) => item.soyad },
    {
      id: "tcKimlik",
      header: "TC Kimlik No",
      accessor: (item) => item.tcKimlik,
    },
    {
      id: "telefonNumarasi",
      header: "Telefon",
      accessor: (item) => item.telefonNumarasi,
    },
    { id: "email", header: "E-posta", accessor: (item) => item.email },
    { id: "adres", header: "Adres", accessor: (item) => item.adres },
    {
      id: "grup",
      header: "Grup",
      accessor: (item) => item.grup_id?.grupAdi || "",
    },
    {
      id: "dogumTarihi",
      header: "Doğum Tarihi",
      accessor: (item) => formatDate(item.dogumTarihi),
    },
    {
      id: "baslamaTarihi",
      header: "Başlama Tarihi",
      accessor: (item) => formatDate(item.baslamaTarihi),
    },
    {
      id: "bitisTarihi",
      header: "Bitiş Tarihi",
      accessor: (item) => formatDate(item.bitisTarihi),
    },
    {
      id: "durumu",
      header: "Durumu",
      accessor: (item) => (item.isActive ? "Aktif" : "Pasif"),
    },
  ];

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" component="h1">
            Kişiler
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <ListSkeleton width={120} height={36} variant="rectangular" />
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
          Kişiler
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/kisiler/ekle")}
          >
            Yeni Kişi
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
              onClick={() => setFiltersOpen(!filtersOpen)}
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

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              label="Ara"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder="Ad, soyad, TC kimlik veya telefon"
            />
          </Grid>

          {filtersOpen && (
            <>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Grup</InputLabel>
                  <Select
                    name="grupId"
                    value={filterOptions.grupId}
                    onChange={handleFilterChange}
                    label="Grup"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {gruplar.map((grup) => (
                      <MenuItem key={grup._id} value={grup._id}>
                        {grup.grupAdi}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Durum</InputLabel>
                  <Select
                    name="durumu"
                    value={filterOptions.durumu}
                    onChange={handleFilterChange}
                    label="Durum"
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="active">Aktif</MenuItem>
                    <MenuItem value="passive">Pasif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                >
                  Temizle
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam {totalCount} kişi bulundu
        </Typography>
      </Box>

      {selectedIds.length > 0 && (
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
            {selectedIds.length} kişi seçildi
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
            <Table aria-label="kişiler tablosu">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < filteredKisiler.length
                      }
                      checked={
                        filteredKisiler.length > 0 &&
                        selectedIds.length === filteredKisiler.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm kişileri seç" }}
                    />
                  </TableCell>
                  <TableCell>Ad Soyad</TableCell>
                  <TableCell>TC Kimlik</TableCell>
                  <TableCell>İletişim</TableCell>
                  <TableCell>Grup</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleKisiler.length > 0 ? (
                  visibleKisiler.map((kisi, index) => {
                    // Animasyon gecikmesini hesapla
                    const delay = calculateAnimationDelay(
                      index,
                      visibleKisiler.length
                    );
                    const isItemSelected = isSelected(kisi._id);

                    return (
                      <Grow
                        in={contentLoaded}
                        key={kisi._id}
                        timeout={{ enter: 300 + delay }}
                        style={{ transformOrigin: "0 0 0" }}
                      >
                        <TableRow
                          hover
                          onClick={(event) =>
                            handleSelectClick(event, kisi._id)
                          }
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
                                "aria-labelledby": `kisi-${kisi._id}`,
                              }}
                              onClick={(e) => handleCheckboxClick(e, kisi._id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <PersonIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {kisi.ad} {kisi.soyad}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{kisi.tcKimlik || "-"}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.5,
                              }}
                            >
                              {kisi.telefonNumarasi && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <PhoneIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {kisi.telefonNumarasi}
                                  </Typography>
                                </Box>
                              )}
                              {kisi.email && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <EmailIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {kisi.email}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {kisi.grup_id?.grupAdi ? (
                              <Chip
                                label={kisi.grup_id.grupAdi}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={kisi.isActive ? "Aktif" : "Pasif"}
                              color={kisi.isActive ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: "center",
                              }}
                            >
                              <Tooltip title="Düzenle">
                                <IconButton
                                  color="primary"
                                  component={Link}
                                  to={`/kisiler/duzenle/${kisi._id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  size="small"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Sil">
                                <IconButton
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(kisi);
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
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        Kayıt bulunamadı
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredKisiler.length}
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

      <DeleteDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Kişiyi Sil"
        content={
          kisiToDelete &&
          `${kisiToDelete.ad} ${kisiToDelete.soyad} kişisini silmek istediğinize emin misiniz?`
        }
      />

      <DeleteDialog
        open={confirmMultipleDialogOpen}
        onClose={() => setConfirmMultipleDialogOpen(false)}
        onConfirm={confirmMultipleDelete}
        title="Toplu Silme"
        content={`Seçilen ${selectedIds.length} kişiyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
      />

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={filteredKisiler}
        filename="kisiler"
        availableColumns={exportColumns}
        entityName="Kişiler"
      />
    </Box>
  );
};

export default KisiList;
