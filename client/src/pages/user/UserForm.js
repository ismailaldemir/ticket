import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Avatar,
  Badge,
  Tooltip,
  Chip,
  FormHelperText,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  addUser,
  updateUser,
  getUserById,
  clearCurrentUser,
  deleteUserAvatar,
  assignRolesToUser,
} from "../../redux/auth/authSlice";
import { getRoller } from "../../redux/rol/rolSlice";
import { toast } from "react-toastify";
import Logger from "../../utils/logger";

const RolSecimBolumu = ({ userId, atanmisRoller = [], onRollerChange }) => {
  const dispatch = useDispatch();
  const { roller } = useSelector((state) => state.rol);
  const [secilenRoller, setSecilenRoller] = useState(atanmisRoller);

  useEffect(() => {
    dispatch(getRoller());
  }, [dispatch]);

  useEffect(() => {
    setSecilenRoller(atanmisRoller);
  }, [atanmisRoller]);

  const handleChange = (event) => {
    const yeniRoller = event.target.value;
    setSecilenRoller(yeniRoller);
    onRollerChange(yeniRoller);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="roller-select-label">Kullanıcı Rolleri</InputLabel>
      <Select
        labelId="roller-select-label"
        id="roller-select"
        multiple
        value={secilenRoller}
        onChange={handleChange}
        renderValue={(selected) => {
          const secilenRolAdlari = selected
            .map((rolId) => {
              const rol = roller.find((r) => (r.id || r._id) === rolId);
              return rol ? rol.ad : "";
            })
            .filter((ad) => ad)
            .join(", ");
          return secilenRolAdlari || "Rol Seçilmedi";
        }}
      >
        {roller.map((rol) => (
          <MenuItem
            key={rol.id || rol._id}
            value={rol.id || rol._id}
            disabled={rol.isAdmin && rol.ad === "Admin"}
          >
            {rol.ad}
            {rol.isAdmin && (
              <Chip size="small" label="Admin" color="error" sx={{ ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>
        Kullanıcıya birden fazla rol atayabilirsiniz. Admin rolü özel yetkiler
        gerektirir.
      </FormHelperText>
    </FormControl>
  );
};

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.auth);

  const isComponentMounted = useRef(true);
  const previousId = useRef(null);
  const isApiCallInProgress = useRef(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    active: true,
    avatar: null,
    roller: [],
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // id değiştiğinde veya component ilk mount olduğunda, eski kullanıcıyı temizle
  useEffect(() => {
    isComponentMounted.current = true;
    dispatch(clearCurrentUser());
    return () => {
      isComponentMounted.current = false;
      dispatch(clearCurrentUser());
      Logger.debug("UserForm bileşeni temizlendi");
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (
      id &&
      previousId.current !== id &&
      !isApiCallInProgress.current &&
      isComponentMounted.current
    ) {
      const fetchUserData = async () => {
        try {
          isApiCallInProgress.current = true;
          Logger.debug("Kullanıcı verileri getiriliyor", { userId: id });
          await dispatch(getUserById(id)).unwrap();
          previousId.current = id;
        } catch (error) {
          Logger.error("Kullanıcı verileri getirilirken hata", error);
        } finally {
          isApiCallInProgress.current = false;
        }
      };
      fetchUserData();
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (!currentUser || !id) return;

    // Form verisi değişmediyse tekrar setState çağrısı yapma
    const newFormData = {
      name: currentUser.name || "",
      email: currentUser.email || "",
      role: currentUser.role || "user",
      password: "",
      confirmPassword: "",
      active: currentUser.active !== undefined ? currentUser.active : true,
      roller: currentUser.roller || [],
    };

    // Sadece farklıysa güncelle
    const isFormDifferent = Object.keys(newFormData).some(
      (key) => formData[key] !== newFormData[key]
    );
    if (isFormDifferent) {
      Logger.debug("Form verisi güncelleniyor", { currentUser });
      setFormData(newFormData);
    }

    // Avatar sadece farklıysa güncellenir
    if ((currentUser.avatar || null) !== (avatarPreview || null)) {
      setAvatarPreview(currentUser.avatar || null);
    }
  }, [currentUser, id]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Ad Soyad gereklidir";
    }

    if (!formData.email.trim()) {
      errors.email = "E-posta adresi gereklidir";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Geçerli bir e-posta adresi girin";
    }

    if (!id) {
      if (!formData.password) {
        errors.password = "Şifre gereklidir";
      } else if (formData.password.length < 6) {
        errors.password = "Şifre en az 6 karakter olmalıdır";
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Şifreler eşleşmiyor";
      }
    } else if (formData.password) {
      if (formData.password.length < 6) {
        errors.password = "Şifre en az 6 karakter olmalıdır";
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Şifreler eşleşmiyor";
      }
    }

    if (formData.avatar) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

      if (!validTypes.includes(formData.avatar.type)) {
        errors.avatar =
          "Sadece .jpg, .jpeg, .png ve .gif uzantılı resim dosyaları yüklenebilir.";
      }

      if (formData.avatar.size > 5 * 1024 * 1024) {
        errors.avatar = "Dosya boyutu 5MB'ı geçemez";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      setFormData({
        ...formData,
        avatar: file,
      });

      if (formErrors.avatar) {
        setFormErrors({
          ...formErrors,
          avatar: "",
        });
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (id) {
      try {
        await dispatch(deleteUserAvatar(id)).unwrap();
        setAvatarPreview(null);
      } catch (error) {
        console.error("Avatar silme hatası:", error);
      }
    } else {
      setAvatarPreview(null);
      setFormData({
        ...formData,
        avatar: null,
      });
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRollerChange = (roller) => {
    setFormData({
      ...formData,
      roller,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Lütfen tüm gerekli alanları doğru şekilde doldurun");
      return;
    }

    const userData = { ...formData };
    if (id && !userData.password) {
      delete userData.password;
      delete userData.confirmPassword;
    } else {
      delete userData.confirmPassword;
    }

    try {
      if (id) {
        const updatedUser = await dispatch(
          updateUser({ id, userData })
        ).unwrap();
        await dispatch(
          assignRolesToUser({ userId: id, roller: formData.roller })
        );
        toast.success("Kullanıcı ve rolleri başarıyla güncellendi");
        navigate("/users");
      } else {
        const newUser = await dispatch(addUser(userData)).unwrap();
        await dispatch(
          assignRolesToUser({ userId: newUser._id, roller: formData.roller })
        );
        toast.success("Kullanıcı başarıyla oluşturuldu ve roller atandı");
        navigate("/users");
      }
    } catch (error) {
      const errorMessage =
        error?.msg || "Kullanıcı kaydedilirken bir hata oluştu";
      toast.error(errorMessage);
      console.error("API Hatası:", error);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" component="h1">
            {id ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Ekle"}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/users")}
          >
            Geri Dön
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {typeof error === "string"
              ? error
              : error?.msg ||
                error?.message ||
                JSON.stringify(error) ||
                "Bir hata oluştu"}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              mb: 3,
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <Tooltip title="Resim Yükle">
                  <IconButton
                    color="primary"
                    aria-label="profil resmi yükle"
                    component="label"
                    sx={{
                      bgcolor: "white",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      border: "2px solid #fff",
                      "&:hover": {
                        bgcolor: "background.default",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleAvatarChange}
                    />
                    <PhotoCameraIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <Avatar
                src={avatarPreview}
                alt="Profil Resmi"
                sx={{
                  width: 120,
                  height: 120,
                  boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
                  mb: 1,
                  border: "4px solid white",
                  bgcolor: !avatarPreview
                    ? (theme) => theme.palette.primary.main
                    : "transparent",
                  fontSize: "3rem",
                }}
              >
                {!avatarPreview && formData.name
                  ? formData.name.charAt(0).toUpperCase()
                  : null}
              </Avatar>
            </Badge>

            {avatarPreview && (
              <Tooltip title="Resmi Sil">
                <IconButton
                  color="error"
                  onClick={handleDeleteAvatar}
                  sx={{
                    mt: 1,
                    "&:hover": {
                      bgcolor: "rgba(211, 47, 47, 0.1)",
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}

            {formErrors.avatar && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {formErrors.avatar}
              </Typography>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ad Soyad"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="E-posta"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={id ? "Şifre (Değiştirmek için doldurun)" : "Şifre"}
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                disabled={loading}
                required={!id}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="şifre görünürlüğünü değiştir"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={
                  id
                    ? "Şifre Tekrar (Değiştirmek için doldurun)"
                    : "Şifre Tekrar"
                }
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                disabled={loading}
                required={!id || formData.password.length > 0}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="şifre tekrar görünürlüğünü değiştir"
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Rol</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Rol"
                  disabled={loading}
                >
                  <MenuItem value="admin">Yönetici</MenuItem>
                  <MenuItem value="user">Kullanıcı</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={handleChange}
                    name="active"
                    disabled={loading}
                  />
                }
                label="Aktif"
              />
            </Grid>

            <Grid item xs={12}>
              <RolSecimBolumu
                userId={id}
                atanmisRoller={formData.roller}
                onRollerChange={handleRollerChange}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={
                  loading ? <CircularProgress size={20} /> : <SaveIcon />
                }
                disabled={loading}
                fullWidth
              >
                {loading ? "Kaydediliyor..." : id ? "Güncelle" : "Kaydet"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default UserForm;
