import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Toolbar,
  alpha,
  Chip,
  Fade,
  Grow,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  CheckCircle as CheckCircleIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import {
  getAboneler,
  getActiveAboneler,
  deleteAbone,
  deleteManyAboneler,
} from "../../redux/abone/aboneSlice";
import { getSubeler } from "../../redux/sube/subeSlice";
import { toast } from "react-toastify";
import useAnimatedList from "../../hooks/useAnimatedList";
import {
  ListSkeleton,
  calculateAnimationDelay,
} from "../../utils/animationUtils";
import ExportModal from "../../components/common/ExportModal";
import { formatDate, formatBoolean } from "../../utils/exportService";
import { PermissionRequired, hasPermission } from "../../utils/rbacUtils";

const AboneList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { aboneler, loading } = useSelector((state) => state.abone);
  const { subeler } = useSelector((state) => state.sube);
  const { user } = useSelector((state) => state.auth);

  const [selected, setSelected] = useState([]);
  const [aboneToDelete, setAboneToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    aboneNo: "",
    aboneTuru: "",
    durum: "",
    sube_id: "",
    aktifMi: "tumu",
  });

  const [exportModalOpen, setExportModalOpen] = useState(false);

  const filterFunction = (data, filters) => {
    if (!data) return [];

    let results = [...data];

    if (filters.aboneNo) {
      results = results.filter((abone) =>
        abone.aboneNo.toLowerCase().includes(filters.aboneNo.toLowerCase())
      );
    }

    if (filters.aboneTuru) {
      results = results.filter(
        (abone) => abone.aboneTuru === filters.aboneTuru
      );
    }

    if (filters.durum) {
      results = results.filter((abone) => abone.durum === filters.durum);
    }

    if (filters.sube_id) {
      results = results.filter(
        (abone) => abone.sube_id._id === filters.sube_id
      );
    }

    if (filters.aktifMi !== "tumu") {
      const isActive = filters.aktifMi === "aktif";
      results = results.filter((abone) => abone.isActive === isActive);
    }

    return results;
  };

  const {
    contentLoaded,
    filteredData: filteredAboneler,
    visibleData: visibleAboneler,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: aboneler || [],
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    dispatch(getAboneler());
    dispatch(getSubeler());
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
      aboneNo: "",
      aboneTuru: "",
      durum: "",
      sube_id: "",
      aktifMi: "tumu",
    });
  };

  const handleRefresh = () => {
    dispatch(getAboneler());
    refresh();
  };

  const handleGetActiveAboneler = () => {
    dispatch(getActiveAboneler());
  };

  const handleDeleteClick = (abone) => {
    setAboneToDelete(abone);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (aboneToDelete) {
      if (!hasPermission(user, "aboneler_silme")) {
        toast.error("Abone silmek için yetkiniz yok.");
        setDeleteDialogOpen(false);
        return;
      }
      try {
        await dispatch(deleteAbone(aboneToDelete._id)).unwrap();
        toast.success(`"${aboneToDelete.aboneNo}" numaralı abone silindi`);
      } catch (error) {
        toast.error(error.msg || "Abone silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setAboneToDelete(null);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredAboneler.map((abone) => abone._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
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
      toast.warning("Lütfen silinecek aboneleri seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    if (!hasPermission(user, "aboneler_silme")) {
      toast.error("Toplu abone silmek için yetkiniz yok.");
      setMultipleDeleteDialogOpen(false);
      return;
    }
    try {
      await dispatch(deleteManyAboneler(selected)).unwrap();
      toast.success(`${selected.length} adet abone başarıyla silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || "Aboneler silinirken bir hata oluştu");
    }
    setMultipleDeleteDialogOpen(false);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const getDurumColor = (durum) => {
    switch (durum) {
      case "Aktif":
        return "success";
      case "Pasif":
        return "error";
      case "Askıda":
        return "warning";
      case "İptal":
        return "error";
      default:
        return "default";
    }
  };

  const getAboneTuruColor = (tur) => {
    switch (tur) {
      case "Mesken":
        return "primary";
      case "İşyeri":
        return "secondary";
      case "Resmi Daire":
        return "info";
      case "Tarım":
        return "success";
      case "Ticarethane":
        return "warning";
      case "Sanayi":
        return "error";
      default:
        return "default";
    }
  };

  if (loading && !contentLoaded) {
    return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" component="h1">
            Aboneler
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

  const exportColumns = [
    {
      id: "aboneNo",
      header: "Abone No",
      accessor: (item) => item.aboneNo || "",
    },
    {
      id: "aboneTuru",
      header: "Abone Türü",
      accessor: (item) => item.aboneTuru || "",
    },
    {
      id: "kisi",
      header: "Abone Adı",
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
      id: "durum",
      header: "Durum",
      accessor: (item) => item.durum || "",
    },
    {
      id: "adres",
      header: "Adres",
      accessor: (item) => item.adres || "",
    },
    {
      id: "telefonNo",
      header: "İletişim Telefonu",
      accessor: (item) => item.telefonNo || "",
    },
    {
      id: "baslamaTarihi",
      header: "Başlama Tarihi",
      accessor: (item) => formatDate(item.baslamaTarihi),
    },
    {
      id: "bitisTarihi",
      header: "Bitiş Tarihi",
      accessor: (item) =>
        item.bitisTarihi ? formatDate(item.bitisTarihi) : "",
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
          Aboneler
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              if (!hasPermission(user, "aboneler_ekleme")) {
                toast.error("Abone eklemek için yetkiniz yok.");
                return;
              }
              navigate("/aboneler/ekle");
            }}
          >
            Yeni Abone
          </Button>
          <PermissionRequired yetkiKodu="abonedetaylar_toplu_ekleme">
            <Button
              variant="outlined"
              color="info"
              startIcon={<ViewListIcon />}
              onClick={() => navigate("/aboneler/toplu-kayit")}
            >
              Toplu Dönem Kaydı
            </Button>
          </PermissionRequired>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<CheckCircleIcon />}
            onClick={handleGetActiveAboneler}
          >
            Aktif Aboneler
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
                label="Abone No"
                name="aboneNo"
                value={filters.aboneNo}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Abone Türü</InputLabel>
                <Select
                  name="aboneTuru"
                  value={filters.aboneTuru}
                  onChange={handleFilterChange}
                  label="Abone Türü"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Mesken">Mesken</MenuItem>
                  <MenuItem value="İşyeri">İşyeri</MenuItem>
                  <MenuItem value="Resmi Daire">Resmi Daire</MenuItem>
                  <MenuItem value="Tarım">Tarım</MenuItem>
                  <MenuItem value="Ticarethane">Ticarethane</MenuItem>
                  <MenuItem value="Sanayi">Sanayi</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  name="durum"
                  value={filters.durum}
                  onChange={handleFilterChange}
                  label="Durum"
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
          Toplam {totalCount} abone bulundu
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
            {selected.length} abone seçildi
          </Typography>
          <PermissionRequired yetkiKodu="aboneler_silme">
            <Tooltip title="Seçilenleri Sil">
              <IconButton onClick={handleMultipleDeleteClick}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </PermissionRequired>
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
                        selected.length < filteredAboneler.length
                      }
                      checked={
                        filteredAboneler.length > 0 &&
                        selected.length === filteredAboneler.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm aboneleri seç" }}
                    />
                  </TableCell>
                  <TableCell>Abone No</TableCell>
                  <TableCell>Abone Türü</TableCell>
                  <TableCell>Abone Adı</TableCell>
                  <TableCell>Şube</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İletişim</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleAboneler.length > 0 ? (
                  visibleAboneler.map((abone, index) => {
                    const delay = calculateAnimationDelay(
                      index,
                      visibleAboneler.length
                    );
                    const isItemSelected = isSelected(abone._id);

                    return (
                      <Grow
                        in={contentLoaded}
                        key={abone._id}
                        timeout={{ enter: 300 + delay }}
                        style={{ transformOrigin: "0 0 0" }}
                      >
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, abone._id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          sx={{
                            "&:hover": {
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, 0.08),
                            },
                            opacity: abone.isActive ? 1 : 0.7,
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{
                                "aria-labelledby": `abone-${abone._id}`,
                              }}
                              onClick={(e) => handleCheckboxClick(e, abone._id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {abone.aboneNo}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {abone.defterNo && `Defter No: ${abone.defterNo}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={abone.aboneTuru}
                              color={getAboneTuruColor(abone.aboneTuru)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {abone.kisi_id ? (
                              <>
                                <Typography variant="body2">
                                  {`${abone.kisi_id.ad} ${abone.kisi_id.soyad}`}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {abone.kisi_id.telefonNumarasi}
                                </Typography>
                              </>
                            ) : (
                              <Typography color="error" variant="body2">
                                Kişi bilgisi yok
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {abone.sube_id ? abone.sube_id.ad : "-"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={abone.durum}
                              color={getDurumColor(abone.durum)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {abone.telefonNo || "-"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{
                                display: "block",
                                maxWidth: 200,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {abone.adres || "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Detayları Gör">
                                <IconButton
                                  color="info"
                                  component={Link}
                                  to={`/aboneler/detay/${abone._id}`}
                                  size="small"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <PermissionRequired yetkiKodu="aboneler_guncelleme">
                                <Tooltip title="Düzenle">
                                  <IconButton
                                    color="primary"
                                    component={Link}
                                    to={`/aboneler/duzenle/${abone._id}`}
                                    size="small"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </PermissionRequired>
                              <PermissionRequired yetkiKodu="aboneler_silme">
                                <Tooltip title="Sil">
                                  <IconButton
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(abone);
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
                      </Grow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Hiç abone bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredAboneler.length}
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Aboneyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {aboneToDelete &&
              `"${aboneToDelete.aboneNo}" numaralı aboneyi ve tüm ilişkili detaylarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
        <DialogTitle>Aboneleri Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Seçtiğiniz ${selected.length} adet aboneyi ve ilişkili tüm detaylarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
        data={filteredAboneler}
        availableColumns={exportColumns}
        entityName="Aboneler"
      />
    </Box>
  );
};

export default AboneList;
