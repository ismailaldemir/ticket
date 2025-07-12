import React, { useState, useEffect } from "react";
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
  TablePagination,
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
  Event as EventIcon,
  Visibility as VisibilityIcon,
  MeetingRoom as MeetingRoomIcon,
} from "@mui/icons-material";
import {
  getToplantilar,
  deleteToplanti,
  deleteManyToplantilar,
} from "../../redux/toplanti/toplantiSlice";
import { toast } from "react-toastify";
import useAnimatedList from "../../hooks/useAnimatedList";
import {
  ListSkeleton,
  calculateAnimationDelay,
} from "../../utils/animationUtils";
import ExportModal from "../../components/common/ExportModal";
import { formatDate } from "../../utils/exportService";

const ToplantiList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toplantilar, loading } = useSelector((state) => state.toplanti);

  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);
  // Silme işlemi için state
  const [toplantiToDelete, setToplantiToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    toplantiTuru: "",
    tarihBaslangic: "",
    tarihBitis: "",
    toplantiYeri: "",
    oturumNo: "",
  });

  // Dışa aktarma için state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return [];

    let results = [...data];

    if (filters.toplantiTuru) {
      results = results.filter(
        (toplanti) => toplanti.toplantiTuru === filters.toplantiTuru
      );
    }

    if (filters.tarihBaslangic) {
      const baslangic = new Date(filters.tarihBaslangic);
      baslangic.setHours(0, 0, 0, 0);
      results = results.filter(
        (toplanti) => new Date(toplanti.tarih) >= baslangic
      );
    }

    if (filters.tarihBitis) {
      const bitis = new Date(filters.tarihBitis);
      bitis.setHours(23, 59, 59, 999);
      results = results.filter((toplanti) => new Date(toplanti.tarih) <= bitis);
    }

    if (filters.toplantiYeri) {
      results = results.filter(
        (toplanti) =>
          toplanti.toplantiYeri &&
          toplanti.toplantiYeri
            .toLowerCase()
            .includes(filters.toplantiYeri.toLowerCase())
      );
    }

    if (filters.oturumNo) {
      results = results.filter(
        (toplanti) =>
          toplanti.oturumNo && toplanti.oturumNo.includes(filters.oturumNo)
      );
    }

    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredToplantilar,
    visibleData: visibleToplantilar,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: toplantilar || [],
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    dispatch(getToplantilar());
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
      toplantiTuru: "",
      tarihBaslangic: "",
      tarihBitis: "",
      toplantiYeri: "",
      oturumNo: "",
    });
  };

  // Toplantı silme işlemi
  const handleDeleteClick = (toplanti) => {
    setToplantiToDelete(toplanti);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (toplantiToDelete) {
      try {
        await dispatch(deleteToplanti(toplantiToDelete._id)).unwrap();
        toast.success(`Toplantı kaydı silindi`);
      } catch (error) {
        toast.error(error.msg || "Toplantı kaydı silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setToplantiToDelete(null);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredToplantilar.map((toplanti) => toplanti._id);
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
      toast.warning("Lütfen silinecek toplantı kayıtlarını seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManyToplantilar(selected)).unwrap();
      toast.success(`${selected.length} adet toplantı kaydı silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || "Toplantı kayıtları silinirken bir hata oluştu");
    }
    setMultipleDeleteDialogOpen(false);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Toplantı listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getToplantilar());
    refresh(); // useAnimatedList'in refresh fonksiyonunu çağır
  };

  // Toplantı türüne göre chip rengi belirle
  const getToplantiTuruColor = (toplantiTuru) => {
    switch (toplantiTuru) {
      case "Planlı Toplantı":
        return "primary";
      case "Olağanüstü Toplantı":
        return "error";
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
            Toplantılar
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
      id: "toplantiTuru",
      header: "Toplantı Türü",
      accessor: (item) => item.toplantiTuru || "",
    },
    {
      id: "tarih",
      header: "Tarih",
      accessor: (item) => formatDate(item.tarih),
    },
    {
      id: "baslamaSaati",
      header: "Başlama Saati",
      accessor: (item) => item.baslamaSaati || "",
    },
    {
      id: "bitisSaati",
      header: "Bitiş Saati",
      accessor: (item) => item.bitisSaati || "",
    },
    {
      id: "toplantiYeri",
      header: "Toplantı Yeri",
      accessor: (item) => item.toplantiYeri || "",
    },
    {
      id: "oturumNo",
      header: "Oturum No",
      accessor: (item) => item.oturumNo || "",
    },
    {
      id: "aciklama",
      header: "Açıklama",
      accessor: (item) => item.aciklama || "",
    },
    {
      id: "gundem",
      header: "Gündem",
      accessor: (item) => item.gundem || "",
    },
    {
      id: "isActive",
      header: "Aktif mi",
      accessor: (item) => (item.isActive ? "Evet" : "Hayır"),
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
          Toplantılar
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/toplantilar/ekle")}
          >
            Yeni Toplantı
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
                <InputLabel>Toplantı Türü</InputLabel>
                <Select
                  name="toplantiTuru"
                  value={filters.toplantiTuru}
                  onChange={handleFilterChange}
                  label="Toplantı Türü"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Planlı Toplantı">Planlı Toplantı</MenuItem>
                  <MenuItem value="Olağanüstü Toplantı">
                    Olağanüstü Toplantı
                  </MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
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
                label="Toplantı Yeri"
                name="toplantiYeri"
                value={filters.toplantiYeri}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Oturum No"
                name="oturumNo"
                value={filters.oturumNo}
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
          Toplam {totalCount} toplantı kaydı bulundu
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
            {selected.length} toplantı seçildi
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
                        selected.length < filteredToplantilar.length
                      }
                      checked={
                        filteredToplantilar.length > 0 &&
                        selected.length === filteredToplantilar.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm toplantıları seç" }}
                    />
                  </TableCell>
                  <TableCell>Toplantı Türü</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Saat</TableCell>
                  <TableCell>Toplantı Yeri</TableCell>
                  <TableCell>Oturum No</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleToplantilar.length > 0 ? (
                  visibleToplantilar.map((toplanti, index) => {
                    // Animasyon gecikmesini hesapla
                    const delay = calculateAnimationDelay(
                      index,
                      visibleToplantilar.length
                    );
                    const isItemSelected = isSelected(toplanti._id);

                    return (
                      <Grow
                        in={contentLoaded}
                        key={toplanti._id}
                        timeout={{ enter: 300 + delay }}
                        style={{ transformOrigin: "0 0 0" }}
                      >
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, toplanti._id)}
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
                                "aria-labelledby": `toplanti-${toplanti._id}`,
                              }}
                              onClick={(e) =>
                                handleCheckboxClick(e, toplanti._id)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<EventIcon />}
                              label={toplanti.toplantiTuru}
                              color={getToplantiTuruColor(
                                toplanti.toplantiTuru
                              )}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(toplanti.tarih).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{`${toplanti.baslamaSaati} - ${toplanti.bitisSaati}`}</TableCell>
                          <TableCell>
                            <Tooltip title={toplanti.toplantiYeri}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  maxWidth: 150,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <MeetingRoomIcon fontSize="small" />
                                <Typography variant="body2" noWrap>
                                  {toplanti.toplantiYeri}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{toplanti.oturumNo || "-"}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Detayları Gör">
                                <IconButton
                                  color="info"
                                  component={Link}
                                  to={`/toplantilar/detay/${toplanti._id}`}
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
                                  to={`/toplantilar/duzenle/${toplanti._id}`}
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
                                    handleDeleteClick(toplanti);
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
                      Hiç toplantı kaydı bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredToplantilar.length}
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
        <DialogTitle>Toplantı Kaydını Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {toplantiToDelete &&
              `Bu toplantı kaydını, kararlarını ve katılımcılarını silmek istediğinize emin misiniz? (${
                toplantiToDelete.toplantiTuru
              }, ${new Date(toplantiToDelete.tarih).toLocaleDateString()})`}
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
        <DialogTitle>Toplantı Kayıtlarını Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Seçtiğiniz ${selected.length} adet toplantı kaydını ve ilgili tüm verileri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
        data={filteredToplantilar}
        availableColumns={exportColumns}
        entityName="Toplantılar"
      />
    </Box>
  );
};

export default ToplantiList;
