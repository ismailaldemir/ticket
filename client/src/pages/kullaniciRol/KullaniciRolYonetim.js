import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  ClearAll as ClearAllIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { getUsers } from "../../redux/auth/authSlice";
import { getRoller } from "../../redux/rol/rolSlice";
import {
  assignRolesToUser,
  assignRolesToManyUsers,
} from "../../redux/auth/authSlice";
import { toast } from "react-toastify";
import { hasPermission } from "../../utils/rbacUtils";
import config from "../../config"; // Konfigürasyon dosyasını import ediyoruz

const KullaniciRolYonetim = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    users,
    loading: usersLoading,
    user: currentUser,
  } = useSelector((state) => state.auth);
  const { roller, loading: rollerLoading } = useSelector((state) => state.rol);

  const [kullanicilar, setKullanicilar] = useState([]);
  const [filteredKullanicilar, setFilteredKullanicilar] = useState([]);
  const [kullaniciRolleri, setKullaniciRolleri] = useState({});
  const [seciliKullanici, setSeciliKullanici] = useState(null);
  const [saving, setSaving] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [topluSecilenRoller, setTopluSecilenRoller] = useState([]);
  const [topluAtamaMode, setTopluAtamaMode] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedRoller, setSelectedRoller] = useState([]);

  const [filters, setFilters] = useState({
    name: "",
    role: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const isSistemAdminUser = (userId) => {
    const user = kullanicilar.find((u) => u._id === userId);
    // Sabit yazılmış değer yerine config değişkeninden alıyoruz
    return user && user.email === config.app.adminEmail;
  };

  const isAdminRol = (rolId) => {
    const rol = roller.find((r) => r._id === rolId);
    return rol && rol.isAdmin && rol.ad === "Admin";
  };

  const isAdminUser = (userId) => {
    const user = kullanicilar.find((u) => u._id === userId);
    if (!user || !user.roller) return false;

    // Kullanıcının rollerinde isAdmin: true bayrağına sahip herhangi bir rol var mı?
    return (
      Array.isArray(user.roller) &&
      user.roller.some((rol) => typeof rol === "object" && rol.isAdmin === true)
    );
  };

  const filteredRoller = useMemo(() => {
    return roller; // Artık filtreleme yapmıyoruz, tüm roller görünecek
  }, [roller]);

  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(getUsers());
    }

    if (!roller || roller.length === 0) {
      dispatch(getRoller());
    }
  }, []);

  useEffect(() => {
    if (users && users.length) {
      const formattedKullanicilar = users.map((user) => ({
        ...user,
        displayRoles:
          user.roller && Array.isArray(user.roller)
            ? user.roller.map((rol) =>
                typeof rol === "object" ? rol._id : rol
              )
            : [],
      }));

      setKullanicilar(formattedKullanicilar);

      let filtered = [...formattedKullanicilar];
      if (filters.name) {
        filtered = filtered.filter((user) =>
          user.name.toLowerCase().includes(filters.name.toLowerCase())
        );
      }

      if (filters.role) {
        filtered = filtered.filter((user) => {
          const userRoles = user.displayRoles || [];
          return userRoles.includes(filters.role);
        });
      }

      setFilteredKullanicilar(filtered);

      const rolMap = {};
      formattedKullanicilar.forEach((user) => {
        rolMap[user._id] = user.displayRoles || [];
      });

      setKullaniciRolleri((prevRoller) => {
        return { ...prevRoller, ...rolMap };
      });
    }
  }, [users, filters.name, filters.role]);

  const handleRolChange = (userId, newRoles) => {
    // Sadece sistem admin kullanıcısı için admin rolü koruması yapıyoruz
    if (isSistemAdminUser(userId)) {
      const adminRolId = roller.find((r) => r.isAdmin && r.ad === "Admin")?._id;

      if (adminRolId && !newRoles.includes(adminRolId)) {
        toast.error("Sistem admin kullanıcısından Admin rolü çıkarılamaz!");
        return;
      }
    }

    setKullaniciRolleri((prev) => ({
      ...prev,
      [userId]: newRoles,
    }));
  };

  const handleKullaniciSelect = (kullanici) => {
    if (topluAtamaMode) return;

    if (selectMode) {
      setSelectMode(false);
      setSelectedRoller([]);
    }

    setSeciliKullanici(kullanici);
    setSelectedUsers([]);
  };

  const handleUserCheckboxClick = (event, userId) => {
    event.stopPropagation();
    if (isSistemAdminUser(userId)) {
      toast.error("Sistem admin kullanıcı seçilemez!");
      return;
    }

    const selectedIndex = selectedUsers.indexOf(userId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedUsers, userId];
    } else {
      newSelected = selectedUsers.filter((id) => id !== userId);
    }

    setSelectedUsers(newSelected);

    if (newSelected.length > 0) {
      setTopluAtamaMode(true);
      setSeciliKullanici(null);

      if (selectMode) {
        setSelectMode(false);
        setSelectedRoller([]);
      }
    } else {
      setTopluAtamaMode(false);
    }
  };

  const handleSelectAllUsers = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredKullanicilar
        .filter((user) => !isSistemAdminUser(user._id))
        .map((user) => user._id);
      setSelectedUsers(newSelecteds);
      setTopluAtamaMode(true);
      setSeciliKullanici(null);

      if (selectMode) {
        setSelectMode(false);
        setSelectedRoller([]);
      }
    } else {
      setSelectedUsers([]);
      setTopluAtamaMode(false);
    }
  };

  const handleTopluRolChange = (event) => {
    setTopluSecilenRoller(event.target.value);
  };

  const handleTopluRolAtama = async () => {
    if (selectedUsers.length === 0 || topluSecilenRoller.length === 0) {
      toast.warning("Lütfen en az bir kullanıcı ve bir rol seçin");
      return;
    }

    try {
      setSaving(true);

      const yeniKullaniciRolleri = { ...kullaniciRolleri };
      let adminKorumasiUygulandi = false;
      const adminRol = roller.find((r) => r.isAdmin && r.ad === "Admin");

      selectedUsers.forEach((userId) => {
        let userRoles = [...topluSecilenRoller];

        if (adminRol && isSistemAdminUser(userId)) {
          if (!userRoles.includes(adminRol._id)) {
            userRoles.push(adminRol._id);
            adminKorumasiUygulandi = true;
          }
        }

        yeniKullaniciRolleri[userId] = userRoles;
      });

      if (adminKorumasiUygulandi) {
        toast.info("Sistem admin kullanıcısı için Admin rolü korundu");
      }

      setKullaniciRolleri(yeniKullaniciRolleri);

      setFilteredKullanicilar((prevKullanicilar) =>
        prevKullanicilar.map((user) => {
          if (selectedUsers.includes(user._id)) {
            return {
              ...user,
              displayRoles: yeniKullaniciRolleri[user._id] || [],
            };
          }
          return user;
        })
      );

      await dispatch(
        assignRolesToManyUsers({
          userIds: selectedUsers,
          roller: topluSecilenRoller,
          skipRefresh: true,
        })
      ).unwrap();

      toast.success(`${selectedUsers.length} kullanıcıya rol ataması yapıldı`);
      setSelectedUsers([]);
      setTopluSecilenRoller([]);
      setTopluAtamaMode(false);
    } catch (error) {
      toast.error("Roller atanırken bir hata oluştu");
      console.error("Toplu rol atama hatası:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRoles = async (userId) => {
    if (!userId || !kullaniciRolleri[userId]) return;

    try {
      setSaving(true);

      // Sadece sistem admin kullanıcısı için admin rolü koruması
      let updatedRoles = [...(kullaniciRolleri[userId] || [])];
      const adminRol = roller.find((r) => r.isAdmin && r.ad === "Admin");

      if (isSistemAdminUser(userId) && adminRol) {
        if (!updatedRoles.includes(adminRol._id)) {
          updatedRoles = [...updatedRoles, adminRol._id];
          toast.info("Sistem admin kullanıcısı için Admin rolü korundu");
        }
      }

      // Önce yerel state'i güncelleme (Redux'tan yanıt beklemeye gerek yok)
      setFilteredKullanicilar((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, displayRoles: updatedRoles } : user
        )
      );

      setKullaniciRolleri((prev) => ({
        ...prev,
        [userId]: updatedRoles,
      }));

      // Redux action'ını çağırırken toast mesajı göstermeyi engelle
      await dispatch(
        assignRolesToUser({
          userId,
          roller: updatedRoles,
          isSistemAdmin: isSistemAdminUser(userId),
          skipRefresh: true,
          skipToast: true, // Toast mesajını Redux'ta gösterme
        })
      ).unwrap();

      // Redux'tan bağımsız olarak UI'da tek bir başarı mesajı göster
      toast.success("Kullanıcı rolleri başarıyla güncellendi");
    } catch (error) {
      toast.error("Roller kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleRolSilme = (userId, rolId) => {
    if (isSistemAdminUser(userId) && isAdminRol(rolId)) {
      toast.error("Sistem admin kullanıcısından Admin rolü kaldırılamaz!");
      return;
    }

    const yeniRoller = (kullaniciRolleri[userId] || []).filter(
      (id) => id !== rolId
    );

    setKullaniciRolleri((prev) => ({
      ...prev,
      [userId]: yeniRoller,
    }));

    setFilteredKullanicilar((prevKullanicilar) =>
      prevKullanicilar.map((user) => {
        if (user._id === userId) {
          return {
            ...user,
            displayRoles: yeniRoller,
          };
        }
        return user;
      })
    );
  };

  const toggleSelectMode = () => {
    if (!seciliKullanici) return;

    setSelectMode(!selectMode);
    setSelectedRoller([]);
  };

  const removeSelectedRoller = async () => {
    if (!seciliKullanici || selectedRoller.length === 0) {
      toast.info("Lütfen kaldırılacak rolleri seçin");
      return;
    }

    if (
      isSistemAdminUser(seciliKullanici._id) &&
      selectedRoller.some((rolId) => isAdminRol(rolId))
    ) {
      toast.error("Sistem admin kullanıcısından Admin rolü kaldırılamaz!");
      return;
    }

    try {
      setSaving(true);

      const updatedRoles = (kullaniciRolleri[seciliKullanici._id] || []).filter(
        (rolId) => !selectedRoller.includes(rolId)
      );

      setKullaniciRolleri((prev) => ({
        ...prev,
        [seciliKullanici._id]: updatedRoles,
      }));

      setFilteredKullanicilar((prevKullanicilar) =>
        prevKullanicilar.map((user) => {
          if (user._id === seciliKullanici._id) {
            return {
              ...user,
              displayRoles: updatedRoles,
            };
          }
          return user;
        })
      );

      await dispatch(
        assignRolesToUser({
          userId: seciliKullanici._id,
          roller: updatedRoles,
          skipRefresh: true,
        })
      ).unwrap();

      toast.success(`${selectedRoller.length} rol başarıyla kaldırıldı`);
      setSelectedRoller([]);
      setSelectMode(false);
    } catch (error) {
      toast.error("Roller kaldırılırken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const toggleRolSelection = (rolId) => {
    if (!selectMode) return;

    if (isAdminRol(rolId) && isSistemAdminUser(seciliKullanici._id)) {
      toast.warning(
        "Sistem admin kullanıcısının Admin rolü seçilemez ve kaldırılamaz."
      );
      return;
    }

    setSelectedRoller((prevSelected) => {
      if (prevSelected.includes(rolId)) {
        return prevSelected.filter((id) => id !== rolId);
      } else {
        return [...prevSelected, rolId];
      }
    });
  };

  const handleCancelTopluAtama = () => {
    setSelectedUsers([]);
    setTopluSecilenRoller([]);
    setTopluAtamaMode(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filtered = [...kullanicilar];

    if (filters.name) {
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.role) {
      filtered = filtered.filter((user) => {
        const userRoles = kullaniciRolleri[user._id] || [];
        return userRoles.includes(filters.role);
      });
    }

    setFilteredKullanicilar(filtered);
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      role: "",
    });
    setFilteredKullanicilar(kullanicilar);
  };

  const renderRolActions = () => (
    <Box sx={{ display: "flex", gap: 1 }}>
      {selectMode ? (
        <>
          <Button
            size="small"
            color="error"
            onClick={removeSelectedRoller}
            disabled={selectedRoller.length === 0 || saving}
            startIcon={<DeleteIcon />}
          >
            Seçilenleri Kaldır ({selectedRoller.length})
          </Button>
          <Button
            size="small"
            color="primary"
            onClick={toggleSelectMode}
            startIcon={<CloseIcon />}
          >
            İptal
          </Button>
        </>
      ) : (
        <Tooltip title="Rol seçme modunu aç">
          <Button
            size="small"
            color="secondary"
            onClick={toggleSelectMode}
            startIcon={<DeleteIcon />}
            disabled={
              !seciliKullanici ||
              !(kullaniciRolleri[seciliKullanici?._id]?.length > 0)
            }
          >
            Rolleri Seçerek Kaldır
          </Button>
        </Tooltip>
      )}
    </Box>
  );

  if (usersLoading || rollerLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!hasPermission(currentUser, "users_duzenleme")) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Bu sayfaya erişim yetkiniz bulunmamaktadır. Lütfen yöneticinizle
          iletişime geçiniz.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Kullanıcı Rol Yönetimi
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, gap: 1 }}>
        <Tooltip title="Filtreleri Göster/Gizle">
          <IconButton
            color="primary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Listeyi Yenile">
          <IconButton color="primary" onClick={() => dispatch(getUsers())}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
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
                label="Kullanıcı Adı"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  label="Rol"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {filteredRoller.map((rol) => (
                    <MenuItem key={rol._id} value={rol._id}>
                      {rol.ad}
                    </MenuItem>
                  ))}
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: "100%", minHeight: 400 }}>
            <Typography
              variant="h6"
              sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}
            >
              Kullanıcılar
            </Typography>

            <TableContainer
              sx={{ maxHeight: 600, overflowX: "auto", width: "100%" }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        indeterminate={
                          selectedUsers.length > 0 &&
                          selectedUsers.length < filteredKullanicilar.length
                        }
                        checked={
                          filteredKullanicilar.length > 0 &&
                          selectedUsers.length === filteredKullanicilar.length
                        }
                        onChange={handleSelectAllUsers}
                      />
                    </TableCell>
                    <TableCell style={{ minWidth: 180, maxWidth: 220 }}>
                      Kullanıcı
                    </TableCell>
                    <TableCell style={{ minWidth: 180, maxWidth: 220 }}>
                      E-posta
                    </TableCell>
                    <TableCell style={{ minWidth: 200 }}>Roller</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredKullanicilar.map((user) => (
                    <TableRow
                      key={user._id}
                      hover
                      selected={
                        (seciliKullanici && seciliKullanici._id === user._id) ||
                        selectedUsers.indexOf(user._id) !== -1
                      }
                      onClick={() => handleKullaniciSelect(user)}
                      sx={{
                        cursor: "pointer",
                        ...(isSistemAdminUser(user._id)
                          ? {
                              bgcolor: (theme) => theme.palette.error.light,
                              "&:hover": {
                                bgcolor: (theme) => theme.palette.error.dark,
                              },
                            }
                          : {}),
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={selectedUsers.indexOf(user._id) !== -1}
                          disabled={isSistemAdminUser(user._id)}
                          onClick={(event) =>
                            isSistemAdminUser(user._id)
                              ? event.preventDefault()
                              : handleUserCheckboxClick(event, user._id)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {user.name}
                        {isSistemAdminUser(user._id) && (
                          <Chip
                            size="small"
                            color="error"
                            label="Sistem Admin"
                            sx={{ ml: 1 }}
                          />
                        )}
                        {isAdminUser(user._id) &&
                          !isSistemAdminUser(user._id) && (
                            <Chip
                              size="small"
                              color="warning"
                              label="Admin Rolü"
                              sx={{ ml: 1 }}
                            />
                          )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {(kullaniciRolleri[user._id] || []).map((rolId) => {
                          const rol = roller.find((r) => r._id === rolId);
                          return rol ? (
                            <Chip
                              key={rolId}
                              label={rol.ad}
                              size="small"
                              color={rol.isAdmin ? "error" : "primary"}
                              onDelete={
                                !selectMode &&
                                !(
                                  isSistemAdminUser(user._id) &&
                                  isAdminRol(rolId)
                                )
                                  ? () => handleRolSilme(user._id, rolId)
                                  : undefined
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  selectMode &&
                                  seciliKullanici &&
                                  seciliKullanici._id === user._id &&
                                  !(
                                    isSistemAdminUser(user._id) &&
                                    isAdminRol(rolId)
                                  )
                                ) {
                                  toggleRolSelection(rolId);
                                }
                              }}
                              sx={{
                                mr: 0.5,
                                mb: 0.5,
                                bgcolor:
                                  selectMode &&
                                  seciliKullanici &&
                                  seciliKullanici._id === user._id &&
                                  selectedRoller.includes(rolId)
                                    ? "warning.light"
                                    : undefined,
                              }}
                            />
                          ) : null;
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredKullanicilar.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Kullanıcı bulunamadı
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ height: "100%", p: 2, minHeight: 400 }}>
            {topluAtamaMode ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Toplu Rol Ataması ({selectedUsers.length} kullanıcı seçildi)
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Seçili kullanıcılara atamak istediğiniz rolleri seçin:
                  </Typography>

                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="toplu-roller-label">Roller</InputLabel>
                    <Select
                      labelId="toplu-roller-label"
                      multiple
                      value={topluSecilenRoller}
                      onChange={handleTopluRolChange}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((value) => {
                            const rol = filteredRoller.find(
                              (r) => r._id === value
                            );
                            return rol ? (
                              <Chip
                                key={value}
                                label={rol.ad}
                                size="small"
                                color="primary"
                              />
                            ) : null;
                          })}
                        </Box>
                      )}
                    >
                      {filteredRoller.map((rol) => (
                        <MenuItem key={rol._id} value={rol._id}>
                          {rol.ad}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1 }}
                  >
                    Not: Bu işlem seçili kullanıcıların mevcut rollerini
                    seçtiğiniz rollerle değiştirecektir.
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                      mt: 3,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleCancelTopluAtama}
                      disabled={saving}
                    >
                      İptal
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AssignmentIcon />}
                      onClick={handleTopluRolAtama}
                      disabled={saving || topluSecilenRoller.length === 0}
                    >
                      {saving ? "Kaydediliyor..." : "Rolleri Ata"}
                    </Button>
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Seçili Kullanıcılar:
                    </Typography>
                    <TableContainer sx={{ maxHeight: 300 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Kullanıcı</TableCell>
                            <TableCell>E-posta</TableCell>
                            <TableCell>Mevcut Roller</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedUsers.map((userId) => {
                            const user = kullanicilar.find(
                              (u) => u._id === userId
                            );
                            if (!user) return null;

                            return (
                              <TableRow key={userId}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  {(kullaniciRolleri[user._id] || []).map(
                                    (rolId) => {
                                      const rol = roller.find(
                                        (r) => r._id === rolId
                                      );
                                      return rol ? (
                                        <Chip
                                          key={rolId}
                                          label={rol.ad}
                                          size="small"
                                          color={
                                            rol.isAdmin ? "error" : "primary"
                                          }
                                          sx={{ mr: 0.5, mb: 0.5 }}
                                        />
                                      ) : null;
                                    }
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              </>
            ) : seciliKullanici ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {seciliKullanici.name} - Rol Ataması
                  </Typography>
                  {renderRolActions()}
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Kullanıcı Bilgileri:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>E-posta:</strong> {seciliKullanici.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Durum:</strong>{" "}
                        {seciliKullanici.active ? "Aktif" : "Pasif"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="user-roles-select-label">Roller</InputLabel>
                  <Select
                    labelId="user-roles-select-label"
                    multiple
                    value={kullaniciRolleri[seciliKullanici._id] || []}
                    onChange={(e) =>
                      handleRolChange(seciliKullanici._id, e.target.value)
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => {
                          const rol = roller.find((r) => r._id === value);
                          return rol ? (
                            <Chip
                              key={value}
                              label={rol.ad}
                              size="small"
                              color={
                                selectMode && selectedRoller.includes(value)
                                  ? "warning"
                                  : rol.isAdmin
                                  ? "error"
                                  : "primary"
                              }
                              onClick={() => {
                                if (selectMode) toggleRolSelection(value);
                              }}
                              onDelete={
                                !selectMode &&
                                seciliKullanici &&
                                !(
                                  isSistemAdminUser(seciliKullanici._id) &&
                                  isAdminRol(value)
                                )
                                  ? () =>
                                      handleRolSilme(seciliKullanici._id, value)
                                  : undefined
                              }
                            />
                          ) : null;
                        })}
                      </Box>
                    )}
                    label="Roller"
                  >
                    {filteredRoller.map((rol) => (
                      <MenuItem key={rol._id} value={rol._id}>
                        {rol.ad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveRoles(seciliKullanici._id)}
                    disabled={saving}
                  >
                    {saving ? "Kaydediliyor..." : "Rolleri Kaydet"}
                  </Button>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                >
                  Rol atamak için:
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mb: 2 }}
                >
                  • Tek bir kullanıcı seçin, veya
                  <br />• Birden fazla kullanıcıyı checkbox ile işaretleyerek
                  toplu atama yapın
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PersonAddIcon />}
                  sx={{ mt: 2 }}
                  onClick={() => navigate("/users/add")}
                >
                  Yeni Kullanıcı Ekle
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KullaniciRolYonetim;
