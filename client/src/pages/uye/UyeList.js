import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  Grow,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  FileDownload as FileDownloadIcon,
  CheckCircle as CheckCircleIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import {
  getUyeler,
  getActiveUyeler,
  deleteUye,
  deleteManyUyeler,
} from "../../redux/uye/uyeSlice";
import { getActiveSubeler } from "../../redux/sube/subeSlice";
import { getActiveUyeRoller } from "../../redux/uyeRol/uyeRolSlice";
import ListSkeleton from "../../components/skeletons/ListSkeleton";
import useAnimatedList from "../../hooks/useAnimatedList";
import { toast } from "react-toastify";
import ExportModal from "../../components/common/ExportModal";
import { formatDate, formatBoolean } from "../../utils/exportService";

const UyeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { uyeler, loading } = useSelector((state) => state.uye);
  const { subeler } = useSelector((state) => state.sube);
  const { uyeRoller } = useSelector((state) => state.uyeRol);

  // Sayfalama için state
  const [selected, setSelected] = useState([]);
  // Silme işlemi için state
  const [uyeToDelete, setUyeToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    uyeNo: "",
    durumu: "",
    uyeRol_id: "",
    sube_id: "",
    aktifMi: "tumu",
  });

  // Dışa aktarma için state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return [];

    let results = [...data];

    if (filters.uyeNo) {
      results = results.filter((uye) =>
        uye.uyeNo.toLowerCase().includes(filters.uyeNo.toLowerCase())
      );
    }

    if (filters.durumu) {
      results = results.filter((uye) => uye.durumu === filters.durumu);
    }

    if (filters.uyeRol_id) {
      results = results.filter(
        (uye) => uye.uyeRol_id?._id === filters.uyeRol_id
      );
    }

    if (filters.sube_id) {
      results = results.filter((uye) => uye.sube_id?._id === filters.sube_id);
    }

    if (filters.aktifMi !== "tumu") {
      const isActive = filters.aktifMi === "aktif";
      results = results.filter((uye) => uye.isActive === isActive);
    }

    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredUyeler,
    visibleData: visibleUyeler,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: uyeler || [],
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    dispatch(getUyeler());
    dispatch(getActiveSubeler());
    dispatch(getActiveUyeRoller());
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
      uyeNo: "",
      durumu: "",
      uyeRol_id: "",
      sube_id: "",
      aktifMi: "tumu",
    });
  };

  // Üye listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getUyeler());
    refresh();
  };

  // Sadece aktif üyeleri getirme
  const handleGetActiveUyeler = () => {
    dispatch(getActiveUyeler());
  };

  // Üye silme işlemi
  const handleDeleteClick = (uye) => {
    setUyeToDelete(uye);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (uyeToDelete) {
      try {
        await dispatch(deleteUye(uyeToDelete._id)).unwrap();
        // toast.success bildirimi kaldırıldı - Redux slice'ta zaten var
      } catch (error) {
        // Burada sadece Redux'ta olmayan hata durumları için bildirim gösteriyoruz
        if (!error?.msg) {
          toast.error("Üye silinirken bir hata oluştu");
        }
      }
    }
    setDeleteDialogOpen(false);
    setUyeToDelete(null);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredUyeler.map((uye) => uye._id);
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
      toast.warning("Lütfen silinecek üyeleri seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManyUyeler(selected)).unwrap();
      // toast.success bildirimi kaldırıldı - Redux slice'ta zaten var
      setSelected([]);
    } catch (error) {
      // Burada sadece Redux'ta olmayan hata durumları için bildirim gösteriyoruz
      if (!error?.msg) {
        toast.error("Üyeler silinirken bir hata oluştu");
      }
    }
    setMultipleDeleteDialogOpen(false);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Renklendirme fonksiyonları
  const getDurumColor = (durum) => {
    switch (durum) {
      case "Aktif":
        return "success";
      case "Pasif":
        return "default";
      case "Askıda":
        return "warning";
      case "İptal":
        return "error";
      default:
        return "default";
    }
  };

  // Animasyon gecikmesi hesaplama
  const calculateAnimationDelay = (index, total) => {
    // Max 800ms gecikme, gecikmeyi eşit dağıt
    const maxDelay = 800;
    const itemDuration = maxDelay / total;
    return index * itemDuration;
  };

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" component="h1">
            Üyeler
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <ListSkeleton width={120} height={36} variant="rectangular" />
            <ListSkeleton width={120} height={36} variant="rectangular" />
            <ListSkeleton width={36} height={36} variant="circular" />
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
      id: "uyeNo",
      header: "Üye No",
      accessor: (item) => item.uyeNo || "",
    },
    {
      id: "uyeRol",
      header: "Üye Rolü",
      accessor: (item) => (item.uyeRol_id ? item.uyeRol_id.ad : ""),
    },
    {
      id: "kisi",
      header: "Üye Adı",
      accessor: (item) =>
        item.kisi_id ? `${item.kisi_id.ad} ${item.kisi_id.soyad}` : "",
    },
    {
      id: "telefon",
      header: "Telefon",
      accessor: (item) =>
        item.kisi_id ? item.kisi_id.telefonNumarasi || "" : "",
    },
    {
      id: "sube",
      header: "Şube",
      accessor: (item) => (item.sube_id ? item.sube_id.ad : ""),
    },
    {
      id: "durumu",
      header: "Durumu",
      accessor: (item) => item.durumu || "",
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
        item.bitisTarihi ? formatDate(item.bitisTarihi) : "",
    },
    {
      id: "kayitKararNo",
      header: "Kayıt Karar No",
      accessor: (item) => item.kayitKararNo || "",
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
          Üyeler
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/uyeler/ekle")}
          >
            Yeni Üye
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<CheckCircleIcon />}
            onClick={handleGetActiveUyeler}
          >
            Aktif Üyeler
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
                label="Üye No"
                name="uyeNo"
                value={filters.uyeNo}
                onChange={handleFilterChange}
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
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Aktif">Aktif</MenuItem>
                  <MenuItem value="Pasif">Pasif</MenuItem>
                  <MenuItem value="Askıda">Askıda</MenuItem>
                  <MenuItem value="İptal">İptal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Üye Rolü</InputLabel>
                <Select
                  name="uyeRol_id"
                  value={filters.uyeRol_id}
                  onChange={handleFilterChange}
                  label="Üye Rolü"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {uyeRoller.map((rol) => (
                    <MenuItem key={rol._id} value={rol._id}>
                      {rol.ad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Şube</InputLabel>
                <Select
                  name="sube_id"
                  value={filters.sube_id}
                  onChange={handleFilterChange}
                  label="Şube"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {subeler.map((sube) => (
                    <MenuItem key={sube._id} value={sube._id}>
                      {sube.ad}
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
          Toplam {totalCount} üye bulundu
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
            {selected.length} üye seçildi
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
                        selected.length < filteredUyeler.length
                      }
                      checked={
                        filteredUyeler.length > 0 &&
                        selected.length === filteredUyeler.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm üyeleri seç" }}
                    />
                  </TableCell>
                  <TableCell>Üye No</TableCell>
                  <TableCell>Üye Rolü</TableCell>
                  <TableCell>Üye Adı</TableCell>
                  <TableCell>Şube</TableCell>
                  <TableCell>Durumu</TableCell>
                  <TableCell>İletişim</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleUyeler.length > 0 ? (
                  visibleUyeler.map((uye, index) => {
                    const delay = calculateAnimationDelay(
                      index,
                      visibleUyeler.length
                    );
                    const isItemSelected = isSelected(uye._id);

                    return (
                      <Grow
                        in={contentLoaded}
                        key={uye._id}
                        timeout={{ enter: 300 + delay }}
                        style={{ transformOrigin: "0 0 0" }}
                      >
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, uye._id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          sx={{
                            "&:hover": {
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, 0.08),
                            },
                            opacity: uye.isActive ? 1 : 0.7,
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{
                                "aria-labelledby": `uye-${uye._id}`,
                              }}
                              onClick={(e) => handleCheckboxClick(e, uye._id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {uye.uyeNo}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {uye.kayitKararNo &&
                                `Karar No: ${uye.kayitKararNo}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {uye.uyeRol_id ? (
                              <Chip
                                label={uye.uyeRol_id.ad}
                                color="primary"
                                size="small"
                                variant="outlined"
                              />
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {uye.kisi_id ? (
                              <>
                                <Typography variant="body2">
                                  {`${uye.kisi_id.ad} ${uye.kisi_id.soyad}`}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {uye.kisi_id.telefonNumarasi}
                                </Typography>
                              </>
                            ) : (
                              <Typography color="error" variant="body2">
                                Kişi bilgisi yok
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {uye.sube_id ? uye.sube_id.ad : "-"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={uye.durumu}
                              color={getDurumColor(uye.durumu)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {uye.kisi_id?.telefonNumarasi || "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Detayları Gör">
                                <IconButton
                                  color="info"
                                  component={Link}
                                  to={`/uyeler/detay/${uye._id}`}
                                  size="small"
                                >
                                  <ViewListIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Düzenle">
                                <IconButton
                                  color="primary"
                                  component={Link}
                                  to={`/uyeler/duzenle/${uye._id}`}
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
                                    handleDeleteClick(uye);
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
                      {loading
                        ? "Yükleniyor..."
                        : "Gösterilecek üye kaydı bulunamadı."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredUyeler.length}
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
        <DialogTitle>Üyeyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {uyeToDelete &&
              `"${uyeToDelete.uyeNo}" numaralı üyeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
        <DialogTitle>Üyeleri Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Seçtiğiniz ${selected.length} adet üyeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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

      {/* Dışa aktarma modalı */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={filteredUyeler}
        availableColumns={exportColumns}
        entityName="Üyeler"
      />
    </Box>
  );
};

export default UyeList;
