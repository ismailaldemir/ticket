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
  Security as SecurityIcon,
} from "@mui/icons-material";
import {
  getYetkiler,
  getModuller,
  deleteYetki,
  deleteManyYetkiler,
} from "../../redux/yetki/yetkiSlice";
import { toast } from "react-toastify";
import DeleteDialog from "../../components/common/DeleteDialog";
import ListSkeleton from "../../components/skeletons/ListSkeleton";
import ExportModal from "../../components/common/ExportModal";
import { formatDate, formatBoolean } from "../../utils/format";
import { PermissionRequired, hasPermission } from "../../utils/rbacUtils";
import permissions from "../../constants/permissions.json";

const YetkiList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { yetkiler, moduller, loading } = useSelector((state) => state.yetki);
  const { user } = useSelector((state) => state.auth);

  // Yerel state'ler
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [yetkiToDelete, setYetkiToDelete] = useState(null);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);
  const [filters, setFilters] = useState({
    kod: "",
    ad: "",
    modul: "",
    islem: "",
    isActive: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    dispatch(getYetkiler());
    dispatch(getModuller());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && yetkiler.length > 0) {
      setContentLoaded(true);
    }
  }, [loading, yetkiler]);

  // Yetkileri filtreleme
  const filteredYetkiler = (Array.isArray(yetkiler) ? yetkiler : []).filter((yetki) => {
    const kodMatch = yetki.kod
      .toLowerCase()
      .includes(filters.kod.toLowerCase());
    const adMatch = yetki.ad.toLowerCase().includes(filters.ad.toLowerCase());
    const modulMatch = !filters.modul || yetki.modul === filters.modul;
    const islemMatch = !filters.islem || yetki.islem === filters.islem;
    const isActiveMatch =
      filters.isActive === "all" ||
      (filters.isActive === "active" && yetki.isActive) ||
      (filters.isActive === "inactive" && !yetki.isActive);

    return kodMatch && adMatch && modulMatch && islemMatch && isActiveMatch;
  });

  // Sayfalama için gerekli fonksiyonlar
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtre işlemleri
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      kod: "",
      ad: "",
      modul: "",
      islem: "",
      isActive: "all",
    });
    setPage(0);
  };

  // Seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredYetkiler.map((yetki) => yetki._id);
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
    } else {
      newSelected = selected.filter((item) => item !== id);
    }

    setSelected(newSelected);
  };

  const handleCheckboxClick = (e, id) => {
    e.stopPropagation();
    handleClick(e, id);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Silme işlemleri
  const handleDeleteClick = (yetki) => {
    setYetkiToDelete(yetki);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!hasPermission(user, "yetkiler_silme")) {
      toast.error("Yetki silmek için yetkiniz yok.");
      setDeleteDialogOpen(false);
      return;
    }
    try {
      await dispatch(deleteYetki(yetkiToDelete._id)).unwrap();
      toast.success(`"${yetkiToDelete.ad}" yetkisi silindi`);
    } catch (error) {
      toast.error(error.msg || "Yetki silinirken bir hata oluştu");
    }
    setDeleteDialogOpen(false);
    setYetkiToDelete(null);
  };

  const handleMultipleDeleteClick = () => {
    if (selected.length > 0) {
      setMultipleDeleteDialogOpen(true);
    } else {
      toast.warning("Lütfen silinecek yetkileri seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    if (!hasPermission(user, "yetkiler_silme")) {
      toast.error("Toplu yetki silmek için yetkiniz yok.");
      setMultipleDeleteDialogOpen(false);
      return;
    }
    try {
      await dispatch(deleteManyYetkiler(selected)).unwrap();
      toast.success(`${selected.length} yetki başarıyla silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || "Yetkiler silinirken bir hata oluştu");
    }
    setMultipleDeleteDialogOpen(false);
  };

  const handleRefresh = () => {
    dispatch(getYetkiler());
    dispatch(getModuller());
  };

  // İşlem tipine göre chip rengi belirle
  const getIslemColor = (islem) => {
    switch (islem) {
      case "goruntuleme":
        return "info";
      case "ekleme":
        return "success";
      case "duzenleme":
        return "warning";
      case "silme":
        return "error";
      case "ozel":
        return "secondary";
      default:
        return "default";
    }
  };

  // Dışa aktarma için sütun tanımları
  const exportColumns = [
    {
      id: "kod",
      header: "Kod",
      accessor: (item) => item.kod,
    },
    {
      id: "ad",
      header: "Yetki Adı",
      accessor: (item) => item.ad,
    },
    {
      id: "aciklama",
      header: "Açıklama",
      accessor: (item) => item.aciklama || "",
    },
    {
      id: "modul",
      header: "Modül",
      accessor: (item) => item.modul,
    },
    {
      id: "islem",
      header: "İşlem",
      accessor: (item) => item.islem,
    },
    {
      id: "isActive",
      header: "Aktif mi",
      accessor: (item) => formatBoolean(item.isActive),
    },
    {
      id: "olusturmaTarihi",
      header: "Oluşturma Tarihi",
      accessor: (item) => formatDate(item.olusturmaTarihi),
    },
  ];

  if (loading && !contentLoaded) {
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
            Yetkiler
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
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
          Yetkiler
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <PermissionRequired yetkiKodu="yetkiler_ekleme">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate("/yetkiler/ekle")}
            >
              Yeni Yetki
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
                label="Kod"
                name="kod"
                value={filters.kod}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Yetki Adı"
                name="ad"
                value={filters.ad}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Modül</InputLabel>
                <Select
                  name="modul"
                  value={filters.modul}
                  onChange={handleFilterChange}
                  label="Modül"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {moduller.map((modul) => (
                    <MenuItem key={modul} value={modul}>
                      {modul}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>İşlem</InputLabel>
                <Select
                  name="islem"
                  value={filters.islem}
                  onChange={handleFilterChange}
                  label="İşlem"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="goruntuleme">Görüntüleme</MenuItem>
                  <MenuItem value="ekleme">Ekleme</MenuItem>
                  <MenuItem value="duzenleme">Düzenleme</MenuItem>
                  <MenuItem value="silme">Silme</MenuItem>
                  <MenuItem value="ozel">Özel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  name="isActive"
                  value={filters.isActive}
                  onChange={handleFilterChange}
                  label="Durum"
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="inactive">Pasif</MenuItem>
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
                onClick={handleClearFilters}
              >
                Filtreleri Temizle
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={() => {}}
              >
                Filtrele
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam {filteredYetkiler.length} yetki bulundu
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
            {selected.length} yetki seçildi
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
                        selected.length < filteredYetkiler.length
                      }
                      checked={
                        filteredYetkiler.length > 0 &&
                        selected.length === filteredYetkiler.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm yetkileri seç" }}
                    />
                  </TableCell>
                  <TableCell>Kod</TableCell>
                  <TableCell>Yetki Adı</TableCell>
                  <TableCell>Modül</TableCell>
                  <TableCell>İşlem</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredYetkiler.length > 0 ? (
                  filteredYetkiler
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((yetki, index) => {
                      const isItemSelected = isSelected(yetki._id);
                      const labelId = `yetki-checkbox-${index}`;

                      return (
                        <Grow
                          in={contentLoaded}
                          key={yetki._id}
                          timeout={{ enter: 300 + index * 50 }}
                          style={{ transformOrigin: "0 0 0" }}
                        >
                          <TableRow
                            hover
                            onClick={(event) => handleClick(event, yetki._id)}
                            role="checkbox"
                            aria-checked={isItemSelected}
                            selected={isItemSelected}
                            sx={{
                              "&:hover": {
                                backgroundColor: (theme) =>
                                  alpha(theme.palette.primary.main, 0.08),
                              },
                              cursor: "pointer",
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                checked={isItemSelected}
                                inputProps={{ "aria-labelledby": labelId }}
                                onClick={(e) =>
                                  handleCheckboxClick(e, yetki._id)
                                }
                              />
                            </TableCell>
                            <TableCell id={labelId} component="th" scope="row">
                              <Typography
                                variant="body2"
                                fontFamily="monospace"
                              >
                                {yetki.kod}
                              </Typography>
                            </TableCell>
                            <TableCell>{yetki.ad}</TableCell>
                            <TableCell>
                              <Chip
                                label={yetki.modul}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={yetki.islem}
                                color={getIslemColor(yetki.islem)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={yetki.isActive ? "Aktif" : "Pasif"}
                                color={yetki.isActive ? "success" : "error"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Tooltip title="Düzenle">
                                  <IconButton
                                    color="primary"
                                    component={Link}
                                    to={`/yetkiler/duzenle/${yetki._id}`}
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
                                      handleDeleteClick(yetki);
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
                      Yetki bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredYetkiler.length}
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
        title="Yetki Sil"
        content={
          yetkiToDelete &&
          `"${yetkiToDelete.ad}" yetkisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
        }
      />

      {/* Çoklu silme onay diyaloğu */}
      <DeleteDialog
        open={multipleDeleteDialogOpen}
        onClose={() => setMultipleDeleteDialogOpen(false)}
        onConfirm={handleMultipleDeleteConfirm}
        title="Yetkileri Sil"
        content={`Seçilen ${selected.length} yetkiyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
      />

      {/* Dışa aktarma modal'i */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={filteredYetkiler}
        availableColumns={exportColumns}
        entityName="Yetkiler"
      />

      {/* Permissions.json'daki yetkiler */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Permissions.json Yetkileri
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kod</TableCell>
                <TableCell>Ad</TableCell>
                <TableCell>Modül</TableCell>
                <TableCell>İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {permissions.map((yetki) => (
                <TableRow key={yetki.kod}>
                  <TableCell>{yetki.kod}</TableCell>
                  <TableCell>{yetki.ad}</TableCell>
                  <TableCell>{yetki.modul}</TableCell>
                  <TableCell>{yetki.islem}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default YetkiList;
