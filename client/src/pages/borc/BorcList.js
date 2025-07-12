import React, { useEffect, useState, useCallback } from "react";
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
  CircularProgress,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  LibraryAdd as LibraryAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ClearAll as ClearAllIcon,
  FileDownload as FileDownloadIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import { getBorclar, deleteBorc } from "../../redux/borc/borcSlice";
import { getKisiler } from "../../redux/kisi/kisiSlice";
import { toast } from "react-toastify";
import ExportModal from "../../components/common/ExportModal";
import {
  formatDate,
  formatCurrency,
  formatBoolean,
} from "../../utils/exportService";
import { PermissionRequired, hasPermission } from "../../utils/rbacUtils";

const BorcList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { borclar, loading } = useSelector((state) => state.borc);
  const { kisiler } = useSelector((state) => state.kisi);
  const { user } = useSelector((state) => state.auth);

  const [selected, setSelected] = useState([]);
  const [borcToDelete, setBorcToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filteredBorclar, setFilteredBorclar] = useState([]);
  const [filters, setFilters] = useState({
    kisiId: "",
    yil: "",
    ay: "",
    odenmeDurumu: "tumu",
  });
  const [exportModalOpen, setExportModalOpen] = useState(false);

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

  useEffect(() => {
    dispatch(getBorclar());
    dispatch(getKisiler());
  }, [dispatch]);

  const applyFilters = useCallback(() => {
    if (!borclar || borclar.length === 0) {
      setFilteredBorclar([]);
      return;
    }

    let sonuclar = [...borclar];

    if (filters.kisiId) {
      sonuclar = sonuclar.filter(
        (borc) => borc.kisi_id?._id === filters.kisiId
      );
    }

    if (filters.yil) {
      sonuclar = sonuclar.filter((borc) => borc.yil === parseInt(filters.yil));
    }

    if (filters.ay) {
      sonuclar = sonuclar.filter((borc) => borc.ay === parseInt(filters.ay));
    }

    if (filters.odenmeDurumu !== "tumu") {
      const odenmeDurumu = filters.odenmeDurumu === "odenmis";
      sonuclar = sonuclar.filter((borc) => borc.odendi === odenmeDurumu);
    }

    setFilteredBorclar(sonuclar);
    setPage(0);
  }, [borclar, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getAyAdi = (ayNumarasi) => {
    return aylar[ayNumarasi - 1] || "";
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      kisiId: "",
      yil: "",
      ay: "",
      odenmeDurumu: "tumu",
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (borc) => {
    if (!hasPermission(user, "borclar_silme")) {
      toast.error("Borç silmek için yetkiniz yok.");
      return;
    }
    setBorcToDelete(borc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!hasPermission(user, "borclar_silme")) {
      toast.error("Borç silmek için yetkiniz yok.");
      setDeleteDialogOpen(false);
      return;
    }
    if (borcToDelete) {
      try {
        await dispatch(deleteBorc(borcToDelete._id)).unwrap();
        toast.success(
          `${borcToDelete.kisi_id?.ad} ${borcToDelete.kisi_id?.soyad} kişisine ait borç silindi`
        );
      } catch (error) {
        toast.error(error.msg || "Borç silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setBorcToDelete(null);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredBorclar.map((borc) => borc._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
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

  const handleMultipleDeleteClick = () => {
    if (!hasPermission(user, "borclar_silme")) {
      toast.error("Borç silmek için yetkiniz yok.");
      return;
    }
    if (selected.length > 0) {
      setMultipleDeleteDialogOpen(true);
    } else {
      toast.warning("Lütfen silinecek borçları seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    if (!hasPermission(user, "borclar_silme")) {
      toast.error("Borç silmek için yetkiniz yok.");
      setMultipleDeleteDialogOpen(false);
      return;
    }
    try {
      for (const id of selected) {
        await dispatch(deleteBorc(id)).unwrap();
      }
      toast.success(`${selected.length} adet borç silindi`);
      setSelected([]);
    } catch (error) {
      toast.error("Borçlar silinirken bir hata oluştu");
    }
    setMultipleDeleteDialogOpen(false);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  if (loading) {
    return (
      <Box className="loading-spinner">
        <CircularProgress />
      </Box>
    );
  }

  const visibleBorclar = filteredBorclar.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const exportColumns = [
    {
      id: "kisiAdi",
      header: "Kişi Adı",
      accessor: (item) =>
        `${item.kisi_id?.ad || ""} ${item.kisi_id?.soyad || ""}`,
    },
    {
      id: "donem",
      header: "Dönem",
      accessor: (item) =>
        item.ay && item.yil
          ? `${getAyAdi(item.ay)} ${item.yil}`
          : formatDate(item.borclandirmaTarihi),
    },
    {
      id: "ucretTuru",
      header: "Ücret Türü",
      accessor: (item) => item.ucret_id?.ad || "",
    },
    {
      id: "borcTutari",
      header: "Borç Tutarı",
      accessor: (item) => formatCurrency(item.borcTutari || 0),
    },
    {
      id: "kalanTutar",
      header: "Kalan Tutar",
      accessor: (item) => formatCurrency(item.kalan || 0),
    },
    {
      id: "borclandirmaTarihi",
      header: "Borçlandırma Tarihi",
      accessor: (item) => formatDate(item.borclandirmaTarihi),
    },
    {
      id: "sonOdemeTarihi",
      header: "Son Ödeme Tarihi",
      accessor: (item) => formatDate(item.sonOdemeTarihi),
    },
    {
      id: "odendi",
      header: "Ödendi",
      accessor: (item) => formatBoolean(item.odendi),
    },
    {
      id: "aciklama",
      header: "Açıklama",
      accessor: (item) => item.aciklama || "",
    },
  ];

  return (
    <PermissionRequired
      user={user}
      yetkiKodu="borclar_goruntuleme"
      fallback={
        <Alert severity="error">
          Bu sayfayı görüntülemek için yetkiniz yok.
        </Alert>
      }
    >
      <Box>
        <Box className="page-header">
          <Typography variant="h5" component="h1">
            Borçlar
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <PermissionRequired user={user} yetkiKodu="borclar_ekleme">
              <Button
                variant="contained"
                color="primary"
                startIcon={<LibraryAddIcon />}
                onClick={() => navigate("/borclar/toplu-ekle")}
              >
                Toplu Borç Ekle
              </Button>
            </PermissionRequired>
            <PermissionRequired user={user} yetkiKodu="borclar_ekleme">
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate("/borclar/ekle")}
              >
                Borç Ekle
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
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filtrele
            </Button>
          </Box>
        </Box>

        {filterOpen && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Borçları Filtrele
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Kişi</InputLabel>
                  <Select
                    name="kisiId"
                    value={filters.kisiId}
                    onChange={handleFilterChange}
                    label="Kişi"
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
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Yıl</InputLabel>
                  <Select
                    name="yil"
                    value={filters.yil}
                    onChange={handleFilterChange}
                    label="Yıl"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Ay</InputLabel>
                  <Select
                    name="ay"
                    value={filters.ay}
                    onChange={handleFilterChange}
                    label="Ay"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {aylar.map((ay, index) => (
                      <MenuItem key={index} value={index + 1}>
                        {ay}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Ödeme Durumu</InputLabel>
                  <Select
                    name="odenmeDurumu"
                    value={filters.odenmeDurumu}
                    onChange={handleFilterChange}
                    label="Ödeme Durumu"
                  >
                    <MenuItem value="tumu">Tümü</MenuItem>
                    <MenuItem value="odenmis">Ödendi</MenuItem>
                    <MenuItem value="odenmemis">Ödenmedi</MenuItem>
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
            Toplam {filteredBorclar.length} borç kaydı bulundu
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
              {selected.length} borç seçildi
            </Typography>
            <PermissionRequired user={user} yetkiKodu="borclar_silme">
              <Tooltip title="Seçilenleri Sil">
                <IconButton onClick={handleMultipleDeleteClick}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </PermissionRequired>
          </Toolbar>
        )}

        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < filteredBorclar.length
                    }
                    checked={
                      filteredBorclar.length > 0 &&
                      selected.length === filteredBorclar.length
                    }
                    onChange={handleSelectAllClick}
                    inputProps={{ "aria-label": "tüm borçları seç" }}
                  />
                </TableCell>
                <TableCell>Kişi</TableCell>
                <TableCell>Dönem</TableCell>
                <TableCell>Ücret</TableCell>
                <TableCell>Borç Tutarı</TableCell>
                <TableCell>Kalan</TableCell>
                <TableCell>Son Ödeme</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleBorclar.map((borc) => {
                const isItemSelected = isSelected(borc._id);

                return (
                  <TableRow
                    key={borc._id}
                    hover
                    onClick={(event) => handleClick(event, borc._id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          "aria-labelledby": `enhanced-table-checkbox-${borc._id}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {borc.kisi_id?.ad} {borc.kisi_id?.soyad}
                    </TableCell>
                    <TableCell>
                      {borc.ay && borc.yil
                        ? `${getAyAdi(borc.ay)} ${borc.yil}`
                        : new Date(borc.borclandirmaTarihi).toLocaleDateString(
                            "tr-TR",
                            {
                              year: "numeric",
                              month: "long",
                            }
                          )}
                    </TableCell>
                    <TableCell>
                      {borc.ucret_id?.ad || ""} - ₺{borc.ucret_id?.tutar}
                    </TableCell>
                    <TableCell>₺{borc.borcTutari}</TableCell>
                    <TableCell>₺{borc.kalan || borc.borcTutari}</TableCell>
                    <TableCell>
                      {borc.sonOdemeTarihi
                        ? new Date(borc.sonOdemeTarihi).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={borc.odendi ? "Ödendi" : "Ödenmedi"}
                        color={borc.odendi ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Düzenle">
                          <IconButton
                            color="primary"
                            component={Link}
                            to={`/borclar/duzenle/${borc._id}`}
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <PermissionRequired
                          user={user}
                          yetkiKodu="borclar_silme"
                        >
                          <Tooltip title="Sil">
                            <IconButton
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(borc);
                              }}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </PermissionRequired>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredBorclar.length}
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

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Borcu Sil</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {borcToDelete &&
                `${borcToDelete.kisi_id?.ad} ${
                  borcToDelete.kisi_id?.soyad
                } kişisine ait ${
                  borcToDelete.ay && borcToDelete.yil
                    ? getAyAdi(borcToDelete.ay) + " " + borcToDelete.yil
                    : ""
                } dönemindeki borcu silmek istediğinize emin misiniz?`}
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

        <Dialog
          open={multipleDeleteDialogOpen}
          onClose={() => setMultipleDeleteDialogOpen(false)}
        >
          <DialogTitle>Toplu Silme</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {`Seçtiğiniz ${selected.length} adet borcu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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

        <ExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          data={filteredBorclar}
          availableColumns={exportColumns}
          entityName="Borçlar"
        />
      </Box>
    </PermissionRequired>
  );
};

export default BorcList;
