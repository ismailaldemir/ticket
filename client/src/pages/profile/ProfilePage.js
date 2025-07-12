import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  updateUser,
  loadUser,
  deleteUserAvatar,
} from "../../redux/auth/authSlice";
import { getRoller } from "../../redux/rol/rolSlice"; // Roller bilgilerini getirme action'ını ekledim
import UserAvatar from "../../components/user/UserAvatar";
import config from "../../config";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { roller } = useSelector((state) => state.rol); // Rolleri Redux'tan alıyoruz

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const fetchUserData = useCallback(() => {
    if (!loading && !user) {
      dispatch(loadUser());
    }
  }, [dispatch, loading, user]);

  useEffect(() => {
    fetchUserData();

    // Rolleri getir - eğer henüz yüklenmemişse
    if (!roller || roller.length === 0) {
      dispatch(getRoller());
    }
  }, [fetchUserData, dispatch, roller]);

  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        name: user.name || "",
        email: user.email || "",
      }));
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setAvatarFile(file);
    }
  };

  const handleDeleteAvatar = async () => {
    if (user?._id) {
      try {
        await dispatch(deleteUserAvatar(user._id)).unwrap();
        setAvatarPreview(null);
        setAvatarFile(null);
        toast.success("Profil resminiz başarıyla silindi");
      } catch (error) {
        toast.error("Profil resmi silinirken bir hata oluştu");
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "İsim alanı boş olamaz";
    }

    if (!formData.email.trim()) {
      errors.email = "E-posta alanı boş olamaz";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Geçerli bir e-posta adresi giriniz";
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = "Mevcut şifrenizi girmelisiniz";
      }

      if (formData.newPassword.length < 6) {
        errors.newPassword = "Şifre en az 6 karakter olmalıdır";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = "Şifreler eşleşmiyor";
      }
    }

    return errors;
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const updateData = {
      name: formData.name,
      email: formData.email,
    };

    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    if (avatarFile) {
      updateData.avatar = avatarFile;
    }

    try {
      await dispatch(
        updateUser({
          id: user._id,
          userData: updateData,
        })
      ).unwrap();

      setIsEditing(false);
      setAvatarPreview(null);
      setAvatarFile(null);
      dispatch(loadUser());
    } catch (error) {
      const errorMsg = error?.msg || "Profil güncellenirken bir hata oluştu";
      toast.error(errorMsg);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormErrors({});
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  };

  // Rol ID'sini ad'a dönüştüren yardımcı fonksiyon
  const getRolAdi = (rolId) => {
    if (!roller || roller.length === 0) return "Roller yükleniyor...";
    const rol = roller.find((r) => r._id === rolId);
    return rol ? rol.ad : "Bilinmeyen Rol";
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 0 } }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Kullanıcı Profili
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.msg || "Bir hata oluştu"}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Kişisel Bilgiler</Typography>
              <Button
                startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                variant={isEditing ? "outlined" : "contained"}
                color={isEditing ? "secondary" : "primary"}
                onClick={isEditing ? handleCancel : handleEditToggle}
              >
                {isEditing ? "İptal" : "Düzenle"}
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {isEditing ? (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ad Soyad"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="E-posta"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Şifre Değiştir (İsteğe bağlı)
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mevcut Şifre"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={handleChange}
                      error={!!formErrors.currentPassword}
                      helperText={formErrors.currentPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                              edge="end"
                            >
                              {showCurrentPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
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
                      label="Yeni Şifre"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleChange}
                      error={!!formErrors.newPassword}
                      helperText={formErrors.newPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              edge="end"
                            >
                              {showNewPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
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
                      label="Şifre Tekrar"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!formErrors.confirmPassword}
                      helperText={formErrors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      sx={{ mt: 2 }}
                      fullWidth
                    >
                      Değişiklikleri Kaydet
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ad Soyad
                  </Typography>
                  <Typography variant="body1">{user?.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    E-posta
                  </Typography>
                  <Typography variant="body1">{user?.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Roller
                  </Typography>
                  <Typography variant="body1">
                    {user?.roller && user.roller.length > 0
                      ? user.roller.map((rol, index) => (
                          <span key={rol._id || index}>
                            {typeof rol === "object" && rol.ad
                              ? rol.ad
                              : typeof rol === "string"
                              ? getRolAdi(rol) // Rol adını gösteriyoruz
                              : "Rol Bulunamadı"}
                            {index < user.roller.length - 1 ? ", " : ""}
                          </span>
                        ))
                      : "Rol atanmamış"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Kayıt Tarihi
                  </Typography>
                  <Typography variant="body1">
                    {user?.date
                      ? new Date(user.date).toLocaleDateString("tr-TR")
                      : "Belirtilmemiş"}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3, height: "100%" }}>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 6,
                px: 4,
              }}
            >
              {isEditing ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    mb: 2,
                  }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      <Tooltip title="Profil resmi yükle">
                        <IconButton
                          component="label"
                          sx={{
                            bgcolor: "primary.main",
                            color: "white",
                            "&:hover": {
                              bgcolor: "primary.dark",
                            },
                          }}
                          size="small"
                        >
                          <input
                            hidden
                            accept="image/*"
                            type="file"
                            onChange={handleAvatarChange}
                          />
                          <PhotoCameraIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    {avatarPreview ? (
                      <Avatar
                        src={avatarPreview}
                        sx={{
                          width: 120,
                          height: 120,
                          border: "3px solid",
                          borderColor: "primary.light",
                        }}
                      />
                    ) : (
                      <UserAvatar
                        user={user}
                        size={config.avatar.sizes.extraLarge}
                      />
                    )}
                  </Badge>

                  {(user?.avatar || avatarPreview) && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleDeleteAvatar}
                      sx={{ mt: 2 }}
                    >
                      Resmi Sil
                    </Button>
                  )}

                  <Typography
                    variant="caption"
                    sx={{ mt: 1, textAlign: "center" }}
                  >
                    Desteklenen formatlar: JPG, JPEG, PNG, GIF
                    <br />
                    Maksimum boyut: 5MB
                  </Typography>
                </Box>
              ) : (
                <UserAvatar user={user} size={config.avatar.sizes.extraLarge} />
              )}

              <Typography variant="h5" gutterBottom>
                {user?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Box sx={{ mt: 3, width: "100%" }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" color="text.secondary">
                  Roller:
                </Typography>
                <Typography variant="h6" paragraph>
                  {user?.roller && user.roller.length > 0
                    ? user.roller.map((rol, index) => (
                        <span key={rol._id || index}>
                          {typeof rol === "object" && rol.ad
                            ? rol.ad
                            : typeof rol === "string"
                            ? getRolAdi(rol) // Rol adını gösteriyoruz
                            : "Rol Bulunamadı"}
                          {index < user.roller.length - 1 ? ", " : ""}
                        </span>
                      ))
                    : "Rol atanmamış"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
