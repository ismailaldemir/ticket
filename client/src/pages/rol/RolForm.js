import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  getRolById,
  addRol,
  updateRol,
  clearCurrentRol,
  updateYetkilerLocal,
} from "../../redux/rol/rolSlice";
import { getYetkiler } from "../../redux/yetki/yetkiSlice";

const RolForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rol, loading, error } = useSelector((state) => state.rol);
  const { yetkiler, loading: yetkilerLoading } = useSelector(
    (state) => state.yetki
  );

  const isEditMode = !!id;

  // Yerel form state'i
  const [formData, setFormData] = useState({
    ad: "",
    aciklama: "",
    yetkiler: [],
    isActive: true,
    isDefault: false,
    isAdmin: false,
  });

  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: "info",
    message: "",
  });

  // Yetkiler gruplandırılmış olarak
  const [groupedYetkiler, setGroupedYetkiler] = useState({});

  // Seçili yetkileri yönetmek için state ekle
  const [selectedYetkiler, setSelectedYetkiler] = useState([]);
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    // Sunucuya istek atarken yetkiler yüklenemiyorsa hata ayıklama için log ekle
    dispatch(getYetkiler())
      .unwrap()
      .catch((err) => {
        // Sunucuya erişilemiyorsa veya hata varsa kullanıcıya bilgi ver
        console.error("Yetkiler yüklenemedi:", err);
        setAlertInfo({
          show: true,
          type: "error",
          message:
            typeof err === "string"
              ? err
              : err?.msg ||
                err?.message ||
                "Yetkiler yüklenemedi. Sunucu bağlantısını ve yetki API'sini kontrol edin.",
        });
      });

    if (isEditMode) {
      dispatch(getRolById(id));
    }

    // Cleanup
    return () => {
      dispatch(clearCurrentRol());
    };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (rol && isEditMode) {
      setFormData({
        ad: rol.ad || "",
        aciklama: rol.aciklama || "",
        yetkiler:
          rol.yetkiler?.map((y) => (typeof y === "object" ? y._id : y)) || [],
        isActive: rol.isActive !== undefined ? rol.isActive : true,
        isDefault: rol.isDefault !== undefined ? rol.isDefault : false,
        isAdmin: rol.isAdmin !== undefined ? rol.isAdmin : false,
      });
    }
  }, [rol, isEditMode]);

  useEffect(() => {
    // Sunucudan gelen yetkiler yoksa veya boşsa kullanıcıya uyarı göster
    if (
      !yetkiler ||
      !Array.isArray(yetkiler) ||
      yetkiler.length === 0
    ) {
      setGroupedYetkiler({});
      setAlertInfo({
        show: true,
        type: "warning",
        message:
          "Yetki listesi yüklenemedi veya hiç yetki yok. Sunucu bağlantısını ve yetki API'sini kontrol edin.",
      });
      return;
    }
    // Yetkileri modüllerine göre grupla
    const grouped = yetkiler.reduce((acc, yetki) => {
      const modul = yetki.modul || "Diğer";
      if (!acc[modul]) {
        acc[modul] = [];
      }
      acc[modul].push(yetki);
      return acc;
    }, {});
    setGroupedYetkiler(grouped);
  }, [yetkiler]);

  useEffect(() => {
    if (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error?.msg || error?.message || JSON.stringify(error) || "Bir hata oluştu",
      });
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleYetkiToggle = (yetkiId) => {
    setFormData((prevState) => {
      const yetkilerSet = new Set(prevState.yetkiler);
      if (yetkilerSet.has(yetkiId)) {
        yetkilerSet.delete(yetkiId);
      } else {
        yetkilerSet.add(yetkiId);
      }
      return {
        ...prevState,
        yetkiler: Array.from(yetkilerSet),
      };
    });
  };

  const handleModulToggle = (modul) => {
    setFormData((prevState) => {
      const modulYetkiler = groupedYetkiler[modul].map((y) => y._id);
      const yetkilerSet = new Set(prevState.yetkiler);

      // Modüldeki tüm yetkiler seçili mi kontrol et
      const allSelected = modulYetkiler.every((id) => yetkilerSet.has(id));

      if (allSelected) {
        // Tüm yetkileri kaldır
        modulYetkiler.forEach((id) => yetkilerSet.delete(id));
      } else {
        // Tüm yetkileri ekle
        modulYetkiler.forEach((id) => yetkilerSet.add(id));
      }

      return {
        ...prevState,
        yetkiler: Array.from(yetkilerSet),
      };
    });
  };

  const handleSelectAllYetkiler = () => {
    setFormData((prevState) => ({
      ...prevState,
      yetkiler: yetkiler.map((y) => y._id),
    }));
  };

  const handleClearAllYetkiler = () => {
    setFormData((prevState) => ({
      ...prevState,
      yetkiler: [],
    }));
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedYetkiler([]);
  };

  const toggleYetkiSelection = (yetkiId) => {
    if (!selectMode) return;

    setSelectedYetkiler((prevSelected) => {
      if (prevSelected.includes(yetkiId)) {
        return prevSelected.filter((id) => id !== yetkiId);
      } else {
        return [...prevSelected, yetkiId];
      }
    });
  };

  const removeSelectedYetkiler = () => {
    if (selectedYetkiler.length === 0) {
      toast.info("Lütfen kaldırılacak yetkileri seçin");
      return;
    }

    // Yetkileri formData'dan çıkaralım
    setFormData((prevState) => ({
      ...prevState,
      yetkiler: prevState.yetkiler.filter(
        (yetkiId) => !selectedYetkiler.includes(yetkiId)
      ),
    }));

    // Redux store'u da yerel olarak güncelleyelim
    if (rol && rol._id) {
      const updatedYetkiler = (rol.yetkiler || [])
        .filter((yetki) => {
          const yetkiId = typeof yetki === "object" ? yetki._id : yetki;
          return !selectedYetkiler.includes(yetkiId);
        })
        .map((yetki) => (typeof yetki === "object" ? yetki : { _id: yetki }));

      dispatch(updateYetkilerLocal(updatedYetkiler));
    }

    toast.success(`${selectedYetkiler.length} yetki başarıyla kaldırıldı`);
    setSelectedYetkiler([]);
    setSelectMode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await dispatch(updateRol({ id, formData })).unwrap();
        toast.success("Rol başarıyla güncellendi");
        navigate("/roller");
      } else {
        await dispatch(addRol(formData)).unwrap();
        toast.success("Rol başarıyla eklendi");
        navigate("/roller");
      }
    } catch (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error?.msg || error?.message || JSON.stringify(error) || "İşlem sırasında bir hata oluştu",
      });
    }
  };

  const isModuleSelected = (modul) => {
    const modulYetkiler = groupedYetkiler[modul].map((y) => y._id);
    return modulYetkiler.every((id) => formData.yetkiler.includes(id));
  };

  const isModulePartiallySelected = (modul) => {
    const modulYetkiler = groupedYetkiler[modul].map((y) => y._id);
    return (
      modulYetkiler.some((id) => formData.yetkiler.includes(id)) &&
      !modulYetkiler.every((id) => formData.yetkiler.includes(id))
    );
  };

  const isYetkiDisabled = (yetkiId) => {
    // Admin rolü ise tüm yetkiler var kabul edilir
    if (formData.isAdmin) return true;
    return false;
  };

  const renderYetkilerActions = () => (
    <Box sx={{ display: "flex", gap: 1 }}>
      {selectMode ? (
        <>
          <Button
            size="small"
            color="error"
            onClick={removeSelectedYetkiler}
            disabled={selectedYetkiler.length === 0 || formData.isAdmin}
            startIcon={<DeleteIcon />}
          >
            Seçilenleri Kaldır ({selectedYetkiler.length})
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
        <>
          <Button
            size="small"
            onClick={handleSelectAllYetkiler}
            disabled={formData.isAdmin}
            startIcon={<LockOpenIcon />}
          >
            Tümünü Seç
          </Button>
          <Button
            size="small"
            onClick={handleClearAllYetkiler}
            disabled={formData.isAdmin || formData.yetkiler.length === 0}
            startIcon={<LockIcon />}
          >
            Tümünü Kaldır
          </Button>
          <Tooltip title="Yetki seçme modunu aç">
            <Button
              size="small"
              color="secondary"
              onClick={toggleSelectMode}
              disabled={formData.isAdmin}
              startIcon={<DeleteIcon />}
            >
              Seçerek Kaldır
            </Button>
          </Tooltip>
        </>
      )}
    </Box>
  );

  if (loading || yetkilerLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" component="h1">
          {isEditMode ? "Rol Düzenle" : "Yeni Rol Ekle"}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/roller")}
        >
          Geri Dön
        </Button>
      </Box>

      <Collapse in={alertInfo.show}>
        <Alert
          severity={alertInfo.type}
          sx={{ mb: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setAlertInfo({ ...alertInfo, show: false })}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {alertInfo.message}
        </Alert>
      </Collapse>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Rol Bilgileri" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Rol Adı"
                      name="ad"
                      value={formData.ad}
                      onChange={handleChange}
                      disabled={formData.isAdmin && rol?.ad === "Admin"}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Açıklama"
                      name="aciklama"
                      value={formData.aciklama}
                      onChange={handleChange}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isActive}
                          onChange={handleChange}
                          name="isActive"
                          color="primary"
                        />
                      }
                      label="Aktif"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isDefault}
                          onChange={handleChange}
                          name="isDefault"
                          color="info"
                          disabled={formData.isAdmin}
                        />
                      }
                      label="Varsayılan Rol"
                    />
                    <FormHelperText>
                      Varsayılan rol, yeni üyeler kaydedildiğinde otomatik
                      olarak atanır.
                    </FormHelperText>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isAdmin}
                          onChange={handleChange}
                          name="isAdmin"
                          color="error"
                          disabled={isEditMode && rol?.ad === "Admin"}
                        />
                      }
                      label="Admin Rolü"
                    />
                    <FormHelperText>
                      Admin rolüne sahip kullanıcılar tüm yetkilere sahiptir.
                    </FormHelperText>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Yetkiler" action={renderYetkilerActions()} />
              <Divider />
              <CardContent sx={{ maxHeight: "500px", overflow: "auto" }}>
                {formData.isAdmin ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Admin rolü tüm yetkilere sahiptir. Yetkileri tek tek
                    seçmenize gerek yoktur.
                  </Alert>
                ) : Object.keys(groupedYetkiler).length > 0 ? (
                  Object.entries(groupedYetkiler).map(
                    ([modul, modulYetkiler], modulIndex) => (
                      <Box key={modul || modulIndex} sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            bgcolor: "grey.100",
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Checkbox
                            checked={isModuleSelected(modul)}
                            indeterminate={isModulePartiallySelected(modul)}
                            onChange={() => handleModulToggle(modul)}
                            disabled={formData.isAdmin}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold" }}
                          >
                            {modul}
                          </Typography>
                        </Box>
                        <List dense>
                          {modulYetkiler.map((yetki, yetkiIndex) => (
                            <ListItem
                              key={yetki._id || yetkiIndex}
                              button
                              onClick={() => {
                                handleYetkiToggle(yetki._id);
                                toggleYetkiSelection(yetki._id);
                              }}
                              disabled={isYetkiDisabled(yetki._id)}
                              sx={{
                                bgcolor:
                                  selectMode &&
                                  selectedYetkiler.includes(yetki._id)
                                    ? "warning.light"
                                    : formData.yetkiler.includes(yetki._id)
                                    ? "action.selected"
                                    : "transparent",
                                borderRadius: 1,
                                m: 0.5,
                              }}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={
                                    selectMode
                                      ? selectedYetkiler.includes(yetki._id)
                                      : formData.yetkiler.includes(yetki._id) ||
                                        formData.isAdmin
                                  }
                                  tabIndex={-1}
                                  disableRipple
                                  disabled={isYetkiDisabled(yetki._id)}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={yetki.ad}
                                secondary={`${yetki.kod} (${yetki.islem})`}
                                primaryTypographyProps={{
                                  variant: "body2",
                                  fontWeight: formData.yetkiler.includes(
                                    yetki._id
                                  )
                                    ? "bold"
                                    : "normal",
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )
                  )
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Yetkiler yüklenemedi veya hiç yetki yok. Lütfen önce yetki
                    ekleyin.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box
          sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button variant="outlined" onClick={() => navigate("/roller")}>
            İptal
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isEditMode ? (
              "Güncelle"
            ) : (
              "Kaydet"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RolForm;
