import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
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
  Fade,
  Grow,
  Toolbar,
  alpha,
  TablePagination,
  Checkbox,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  ClearAll as ClearAllIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import {
  getUsers,
  deleteUser,
  deleteManyUsers,
  loadUser,
} from "../../redux/auth/authSlice";
import { toast } from "react-toastify";
import useAnimatedList from "../../hooks/useAnimatedList";
import {
  ListSkeleton,
  calculateAnimationDelay,
} from "../../utils/animationUtils";
import ExportModal from "../../components/common/ExportModal";
import { formatDate, formatBoolean } from "../../utils/exportService";
import UserAvatar from "../../components/user/UserAvatar";
import Logger from "../../utils/logger";
import config from "../../config";

const UserList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    users,
    loading,
    user: currentUser,
  } = useSelector((state) => state.auth);

  const allRoles = useSelector((state) => state.rol?.roller) || [];

  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);

  // Silme işlemi için state
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    role: "",
    isActive: "tumu",
  });

  // Dışa aktarma için state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return [];

    let results = [...data];

    if (filters.name) {
      results = results.filter((user) =>
        user.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.email) {
      results = results.filter((user) =>
        user.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }

    if (filters.role) {
      results = results.filter((user) => user.role === filters.role);
    }

    if (filters.isActive !== "tumu") {
      const isActive = filters.isActive === "aktif";
      results = results.filter((user) => user.active === isActive);
    }

    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredUsers,
    visibleData: visibleUsers,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: users || [],
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  // İlk yükleme useEffect'i - Sadece bir kez çalışacak
  useEffect(() => {
    Logger.debug("UserList bileşeni - İlk yükleme useEffect çalıştı");

    // Sayfa ilk yüklendiğinde sadece bir kez çalışacak
    const fetchData = async () => {
      if (!users.length) {
        // Eğer kullanıcılar henüz yüklenmemişse
        Logger.debug("Kullanıcı listesi yükleniyor...");
        await dispatch(getUsers());
      }

      if (!currentUser) {
        Logger.debug("Mevcut kullanıcı bilgisi yükleniyor...");
        await dispatch(loadUser());
      }
    };

    fetchData();

    // Component unmount olduğunda çalışacak temizleme fonksiyonu
    return () => {
      Logger.debug("UserList bileşeni unmount ediliyor");
    };
  }, [dispatch, users.length, currentUser]);

  // Yetki kontrolü için ayrı bir useEffect - currentUser değiştiğinde çalışacak
  useEffect(() => {
    if (currentUser) {
      // Superadmin e-posta kontrolü
      let isAdmin = false;
      if (
        config?.app?.adminEmail &&
        currentUser.email === config.app.adminEmail
      ) {
        isAdmin = true;
      }
      // 1. Eski şema
      if (!isAdmin && currentUser.role === "admin") {
        isAdmin = true;
      }
      // 2. Yeni şema: roller objesi varsa
      if (!isAdmin && Array.isArray(currentUser.roller)) {
        isAdmin = currentUser.roller.some(
          (rol) =>
            (typeof rol === "object" && rol.isAdmin === true) ||
            (typeof rol === "string" && rol === "admin")
        );
      }
      // 3. Sadece ObjectId dizisi varsa, roller state'inden kontrol et
      if (
        !isAdmin &&
        Array.isArray(currentUser.roller) &&
        currentUser.roller.length > 0 &&
        allRoles.length > 0
      ) {
        isAdmin = currentUser.roller.some((rolId) => {
          const rolObj = allRoles.find((r) => r.id === rolId);
          return rolObj && rolObj.isAdmin === true;
        });
      }
      if (!isAdmin) {
        Logger.warn("Kullanıcı admin değil, dashboard'a yönlendiriliyor");
        toast.error("Bu sayfaya erişim izniniz yok");
        navigate("/dashboard");
      }
    }
  }, [currentUser, navigate, allRoles]);

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
      name: "",
      email: "",
      role: "",
      isActive: "tumu",
    });
  };

  // Silme işlemleri
  const handleDeleteClick = (user) => {
    // Kendini silmesini engellemek için kontrol
    if (user.id === currentUser?.id) {
      toast.warning("Kendi hesabınızı buradan silemezsiniz");
      return;
    }

    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await dispatch(deleteUser(userToDelete.id)).unwrap();
      } catch (error) {
        if (!error?.msg) {
          toast.error("Kullanıcı silinirken bir hata oluştu");
        }
      }
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Çoklu silme işlemleri
  const handleMultipleDeleteClick = () => {
    // Kendini içeren seçimi kontrol et
    if (selected.includes(currentUser?.id)) {
      toast.warning("Kendinizi içeren kullanıcı seçimini silemezsiniz");
      return;
    }

    if (selected.length > 0) {
      setMultipleDeleteDialogOpen(true);
    } else {
      toast.warning("Lütfen silinecek kullanıcıları seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManyUsers(selected)).unwrap();
      setSelected([]);
    } catch (error) {
      if (!error?.msg) {
        toast.error("Kullanıcılar silinirken bir hata oluştu");
      }
    }
    setMultipleDeleteDialogOpen(false);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      // Kendini hariç tüm kullanıcıları seç
      const newSelected = filteredUsers
        .filter((user) => user.id !== currentUser?.id)
        .map((user) => user.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    // Eğer bu, giriş yapmış kullanıcının ID'si ise seçime izin verme
    if (id === currentUser?.id) {
      toast.info("Kendi hesabınızı seçemezsiniz");
      return;
    }

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
    // Kendi hesabını seçememe kontrolü
    if (id === currentUser?.id) {
      toast.info("Kendi hesabınızı seçemezsiniz");
      event.preventDefault();
      return;
    }

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

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Kullanıcı listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getUsers());
    refresh(); // useAnimatedList'in refresh fonksiyonunu çağır
  };

  // Dışa aktarma için sütun tanımları
  const exportColumns = [
    {
      id: "name",
      header: "Ad Soyad",
      accessor: (item) => item.name || "",
    },
    {
      id: "email",
      header: "E-posta",
      accessor: (item) => item.email || "",
    },
    {
      id: "role",
      header: "Rol",
      accessor: (item) => (item.role === "admin" ? "Yönetici" : "Kullanıcı"),
    },
    {
      id: "active",
      header: "Durum",
      accessor: (item) => formatBoolean(item.active),
    },
    {
      id: "date",
      header: "Kayıt Tarihi",
      accessor: (item) => formatDate(item.date),
    },
  ];

  // Yükleme durumu kontrolü için daha basit bir koşul
  const isLoading = loading && !users?.length;

  // Loading durumunda skeleton bileşenini göster
  if (isLoading) {
    Logger.debug("Kullanıcı listesi yükleniyor");
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" component="h1">
            Kullanıcılar
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <ListSkeleton width={120} height={36} variant="rectangular" />
            <ListSkeleton width={36} height={36} variant="circular" />
          </Box>
        </Box>

        <ListSkeleton
          rowCount={5}
          columnCount={4}
          hasCheckbox={true}
          hasActions={true}
        />
      </Box>
    );
  }

  Logger.debug("UserList render - Veriler:", {
    users,
    totalCount: users?.length,
  });

  const renderUserRow = (user, index, isItemSelected, isCurrentUser) => {
    const delay = calculateAnimationDelay(index, visibleUsers.length);
    // Benzersiz key için: id > index
    const rowKey = user.id || `user-row-${index}`;
    return (
      <Grow
        in={contentLoaded}
        key={rowKey}
        timeout={{ enter: 300 + delay }}
        style={{ transformOrigin: "0 0 0" }}
      >
        <TableRow
          hover
          onClick={(event) => handleClick(event, user.id)}
          role="checkbox"
          aria-checked={isItemSelected}
          selected={isItemSelected}
          sx={{
            cursor: "pointer",
            bgcolor: isCurrentUser
              ? (theme) => alpha(theme.palette.primary.main, 0.08)
              : "inherit",
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
              disabled={isCurrentUser}
              inputProps={{
                "aria-labelledby": `user-${user.id}`,
              }}
              onClick={(e) => handleCheckboxClick(e, user.id)}
            />
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <UserAvatar
                user={user}
                size={44}
                showTooltip={true}
                sx={{
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                }}
              />
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {user.name}
                </Typography>
                {isCurrentUser && (
                  <Chip
                    size="small"
                    label="Siz"
                    color="primary"
                    sx={{ ml: 1, fontSize: "0.7rem" }}
                  />
                )}
              </Box>
            </Box>
          </TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>
            <Chip
              label={user.role === "admin" ? "Yönetici" : "Kullanıcı"}
              color={user.role === "admin" ? "secondary" : "default"}
              size="small"
            />
          </TableCell>
          <TableCell>
            <Chip
              label={user.active ? "Aktif" : "Pasif"}
              color={user.active ? "success" : "error"}
              size="small"
            />
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Düzenle">
                <IconButton
                  color="primary"
                  component={Link}
                  to={`/users/edit/${user.id}`}
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={isCurrentUser ? "Kendinizi silemezsiniz" : "Sil"}>
                <span>
                  <IconButton
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(user);
                    }}
                    size="small"
                    disabled={isCurrentUser}
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
  };

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
          Kullanıcılar
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/users/add")}
          >
            Yeni Kullanıcı
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
                label="Ad Soyad"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="E-posta"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  label="Rol"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="admin">Yönetici</MenuItem>
                  <MenuItem value="user">Kullanıcı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  name="isActive"
                  value={filters.isActive}
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
          Toplam {totalCount} kullanıcı bulundu
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
            {selected.length} kullanıcı seçildi
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
                        selected.length < filteredUsers.length
                      }
                      checked={
                        filteredUsers.length > 0 &&
                        selected.length === filteredUsers.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm kullanıcıları seç" }}
                    />
                  </TableCell>
                  <TableCell>Ad Soyad</TableCell>
                  <TableCell>E-posta</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleUsers.length > 0 ? (
                  visibleUsers.map((user, index) => {
                    const isItemSelected = isSelected(user.id);
                    const isCurrentUser = user.id === currentUser?.id;
                    return renderUserRow(
                      user,
                      index,
                      isItemSelected,
                      isCurrentUser
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Hiç kullanıcı bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredUsers.length}
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
        <DialogTitle>Kullanıcıyı Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {userToDelete &&
              `${userToDelete.name} kullanıcısını silmek istediğinize emin misiniz?`}
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
        <DialogTitle>Kullanıcıları Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Seçtiğiniz ${selected.length} adet kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
        data={filteredUsers}
        availableColumns={exportColumns}
        entityName="Kullanıcılar"
      />
    </Box>
  );
};

export default UserList;
