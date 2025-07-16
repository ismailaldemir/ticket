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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
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
  getRoller,
  deleteRol,
  deleteManyRoller,
  getRolById,
} from "../../redux/rol/rolSlice";
import useConfirm from "../../hooks/useConfirm";
import DeleteDialog from "../../components/common/DeleteDialog";
import ListSkeleton from "../../components/skeletons/ListSkeleton";
import ExportModal from "../../components/common/ExportModal";
import { formatDate, formatBoolean } from "../../utils/format";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { toast } from "react-toastify";

const RolList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roller, loading } = useSelector((state) => state.rol);
  const { user } = useSelector((state) => state.auth);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rolToDelete, setRolToDelete] = useState(null);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);
  const [filter, setFilter] = useState({
    ad: "",
    isActive: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [adminYetkilerDialogOpen, setAdminYetkilerDialogOpen] = useState(false);
  const [selectedAdminRol, setSelectedAdminRol] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      dispatch(getRoller());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!loading && roller.length > 0) {
      setContentLoaded(true);
    }
  }, [loading, roller]);

  const filteredRoller = roller.filter((rol) => {
    const adMatch = rol.ad.toLowerCase().includes(filter.ad.toLowerCase());
    const isActiveMatch =
      filter.isActive === "all" ||
      (filter.isActive === "active" && rol.isActive) ||
      (filter.isActive === "inactive" && !rol.isActive);

    return adMatch && isActiveMatch;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilter({
      ad: "",
      isActive: "all",
    });
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredRoller
        .filter((rol) => !rol.isAdmin)
        .map((rol) => rol.id);

      setSelected(newSelected);

      if (filteredRoller.some((rol) => rol.isAdmin)) {
        toast.info("Admin rolü silinemeyeceği için seçime dahil edilmedi.");
      }

      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const rolItem = filteredRoller.find((rol) => rol.id === id);
    if (rolItem && rolItem.isAdmin) {
      toast.warning("Admin rolü seçilemez. Bu rol sistem için gereklidir.");
      return;
    }

    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((item) => item !== id);
    }

    setSelected(newSelected);
  };

  const handleCheckboxClick = (e, id, isAdmin) => {
    e.stopPropagation();

    if (isAdmin && selected.indexOf(id) === -1) {
      toast.warning("Admin rolü silinemez. Bu rol sistem için gereklidir.");
      return;
    }

    handleClick(e, id);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleDeleteClick = (rol) => {
    if (rol.isAdmin) {
      toast.error("Admin rolü silinemez, sistem için gereklidir.");
      return;
    }

    setDeleteDialogOpen(true);
    setRolToDelete(rol);
  };

  const handleDeleteConfirm = async () => {
    await dispatch(deleteRol(rolToDelete._id));
    setDeleteDialogOpen(false);
    setRolToDelete(null);
  };

  const handleMultipleDeleteClick = () => {
    const isAdminRolSelected = selected.some((id) =>
      filteredRoller.find((rol) => rol.id === id && rol.isAdmin)
    );

    if (isAdminRolSelected) {
      toast.error(
        "Admin rolü silinemez. Lütfen admin rolünü seçimden çıkarın."
      );
      return;
    }

    if (selected.length > 0) {
      setMultipleDeleteDialogOpen(true);
    } else {
      toast.warning("Lütfen silinecek rolleri seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    await dispatch(deleteManyRoller(selected));
    setMultipleDeleteDialogOpen(false);
    setSelected([]);
  };

  const handleRefresh = () => {
    dispatch(getRoller());
  };

  const exportColumns = [
    {
      id: "ad",
      header: "Rol Adı",
      accessor: (item) => item.ad,
    },
    {
      id: "aciklama",
      header: "Açıklama",
      accessor: (item) => item.aciklama || "",
    },
    {
      id: "yetkiSayisi",
      header: "Yetki Sayısı",
      accessor: (item) => (item.yetkiler?.length || 0).toString(),
    },
    {
      id: "isActive",
      header: "Aktif mi",
      accessor: (item) => formatBoolean(item.isActive),
    },
    {
      id: "isAdmin",
      header: "Admin mi",
      accessor: (item) => formatBoolean(item.isAdmin),
    },
    {
      id: "isDefault",
      header: "Varsayılan mı",
      accessor: (item) => formatBoolean(item.isDefault),
    },
    {
      id: "olusturmaTarihi",
      header: "Oluşturma Tarihi",
      accessor: (item) => formatDate(item.olusturmaTarihi),
    },
    {
      id: "sonGuncellemeTarihi",
      header: "Son Güncelleme Tarihi",
      accessor: (item) => formatDate(item.sonGuncellemeTarihi),
    },
  ];

  const handleConfirmAction = () => {
    if (confirmAction) {
      confirmAction();
    }
    setConfirmDialogOpen(false);
  };

  const confirmAndExecute = (action, message) => {
    setConfirmAction(() => action);
    setConfirmDialogOpen(true);
  };

  const isAdminUser = () => {
    if (user && user.role === "admin") return true;

    if (user && user.roller && Array.isArray(user.roller)) {
      return user.roller.some((rol) => rol.isAdmin === true);
    }

    if (user && user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.some(
        (perm) => perm === "admin" || perm.kod === "admin"
      );
    }

    return false;
  };

  const canEditOrDeleteRole = (rol) => {
    if (isAdminUser()) {
      return !(rol.isAdmin && rol.ad === "Admin");
    }

    return !(rol.isAdmin || rol.isDefault);
  };

  const handleShowAdminYetkileri = async (rol) => {
    try {
      setSelectedAdminRol(rol);

      if (rol && (!rol.yetkiler || rol.yetkiler.length === 0)) {
        const rolResponse = await dispatch(getRolById(rol.id)).unwrap();
        if (rolResponse) {
          setSelectedAdminRol(rolResponse);
        }
      }

      setAdminYetkilerDialogOpen(true);
    } catch (error) {
      console.error("Admin yetkileri yüklenirken hata:", error);
      toast.error("Yetkiler yüklenirken bir hata oluştu");
    }
  };

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
            Roller
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
          Roller
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/roller/ekle")}
          >
            Yeni Rol
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rol Adı"
                name="ad"
                value={filter.ad}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  name="isActive"
                  value={filter.isActive}
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
          Toplam {filteredRoller.length} rol bulundu
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
            {selected.length} rol seçildi
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
                        selected.length < filteredRoller.length
                      }
                      checked={
                        filteredRoller.length > 0 &&
                        selected.length === filteredRoller.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm rolleri seç" }}
                    />
                  </TableCell>
                  <TableCell>Rol Adı</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Yetkiler</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoller.length > 0 ? (
                  filteredRoller
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((rol, index) => {
                      const isItemSelected = isSelected(rol._id);
                      const labelId = `rol-checkbox-${index}`;
                      const rowKey = rol._id || `rol-row-${index}`;
                      return (
                        <Grow
                          in={contentLoaded}
                          key={rowKey}
                          timeout={{ enter: 300 + index * 50 }}
                          style={{ transformOrigin: "0 0 0" }}
                        >
                          <TableRow
                            key={rowKey}
                            hover
                          onClick={(event) =>
                              rol && !rol.isAdmin
                                ? handleClick(event, rol.id)
                                : null
                            }
                            role="checkbox"
                            aria-checked={isItemSelected}
                            selected={isItemSelected}
                            sx={{
                              "&:hover": {
                                backgroundColor: (theme) =>
                                  rol.isAdmin
                                    ? theme.palette.action.hover
                                    : alpha(theme.palette.primary.main, 0.08),
                              },
                              cursor: rol.isAdmin ? "default" : "pointer",
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                checked={isItemSelected}
                                inputProps={{ "aria-labelledby": labelId }}
                                onClick={(e) =>
                                  handleCheckboxClick(e, rol.id, rol.isAdmin)
                                }
                                disabled={rol.isAdmin}
                              />
                            </TableCell>
                            <TableCell id={labelId} component="th" scope="row">
                              <Typography
                                variant="body1"
                                fontWeight={rol.isAdmin ? "bold" : "normal"}
                              >
                                {rol.ad}
                              </Typography>
                              {rol.isAdmin && (
                                <Chip
                                  label="Admin"
                                  color="error"
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                              {rol.isDefault && (
                                <Chip
                                  label="Varsayılan"
                                  color="info"
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </TableCell>
                            <TableCell>{rol.aciklama || "-"}</TableCell>
                            <TableCell>
                              {rol.isAdmin ? (
                                <Tooltip title="Admin rolü tüm yetkilere sahiptir">
                                  <Chip
                                    label={`Tüm Yetkiler (${
                                      rol.yetkiler?.length || 0
                                    })`}
                                    color="error"
                                    variant="outlined"
                                    size="small"
                                    onClick={() =>
                                      handleShowAdminYetkileri(rol)
                                    }
                                  />
                                </Tooltip>
                              ) : (
                                <Chip
                                  label={`${rol.yetkiler?.length || 0} yetki`}
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={rol.isActive ? "Aktif" : "Pasif"}
                                color={rol.isActive ? "success" : "error"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Tooltip
                                  title={
                                    canEditOrDeleteRole(rol)
                                      ? "Düzenle"
                                      : "Bu rol düzenlenemez"
                                  }
                                >
                                  <span>
                                    <IconButton
                                      color="primary"
                                      component={Link}
                                      to={`/roller/duzenle/${rol.id}`}
                                      size="small"
                                      disabled={!canEditOrDeleteRole(rol)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip
                                  title={
                                    canEditOrDeleteRole(rol)
                                      ? "Sil"
                                      : "Bu rol silinemez"
                                  }
                                >
                                  <span>
                                    <IconButton
                                      color="error"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(rol);
                                      }}
                                      size="small"
                                      disabled={!canEditOrDeleteRole(rol)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        </Grow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Rol bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredRoller.length}
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
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Rol Sil"
        content={
          rolToDelete &&
          `"${rolToDelete.ad}" rolünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
        }
      />

      <DeleteDialog
        open={multipleDeleteDialogOpen}
        onClose={() => setMultipleDeleteDialogOpen(false)}
        onConfirm={handleMultipleDeleteConfirm}
        title="Rolleri Sil"
        content={`Seçilen ${selected.length} rolü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
      />

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={filteredRoller}
        availableColumns={exportColumns}
        entityName="Roller"
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmAction}
        title="İşlem Onayı"
        content="Bu işlemi gerçekleştirmek istediğinize emin misiniz?"
      />

      <Dialog
        open={adminYetkilerDialogOpen}
        onClose={() => setAdminYetkilerDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Admin Rolü Yetkileri
          {selectedAdminRol && ` - ${selectedAdminRol.ad}`}
        </DialogTitle>
        <DialogContent dividers>
          {selectedAdminRol ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Admin rolü sistemdeki tüm yetkilere otomatik olarak sahiptir.
                Aşağıda mevcut tüm yetkiler listelenmiştir.
              </Alert>

              {selectedAdminRol.yetkiler &&
              selectedAdminRol.yetkiler.length > 0 ? (
                <Grid container spacing={2}>
                  {Object.entries(
                    selectedAdminRol.yetkiler.reduce((acc, yetki) => {
                      if (!yetki) return acc;
                      const modul = yetki.modul || "Diğer";
                      if (!acc[modul]) acc[modul] = [];
                      acc[modul].push(yetki);
                      return acc;
                    }, {})
                  ).map(([modul, modulYetkiler]) => (
                    <Grid item xs={12} sm={6} md={4} key={modul}>
                      <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          {modul}
                        </Typography>
                        <Divider sx={{ mb: 1 }} />
                        <List dense>
                          {modulYetkiler.map((yetki) => (
                            <ListItem key={yetki.id || yetki.kod}>
                              <ListItemText
                                primary={yetki.ad}
                                secondary={`${yetki.kod} (${yetki.islem})`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="warning">
                  Bu rol için henüz hiç yetki tanımlanmamış veya yetkiler
                  yüklenemiyor. Lütfen yetkilerin doğru tanımlandığından emin
                  olun.
                </Alert>
              )}
            </>
          ) : (
            <Typography>Rol bilgisi yüklenemedi.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminYetkilerDialogOpen(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolList;
