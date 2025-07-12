import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Note as NoteIcon,
  AssignmentTurnedIn as AssignmentIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import {
  getEvrakById,
  addEvrak,
  updateEvrak,
  clearCurrentEvrak,
} from "../../redux/evrak/evrakSlice";
import { getCariler } from "../../redux/cari/cariSlice";
import { toast } from "react-toastify";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import trLocale from "date-fns/locale/tr";

const EvrakForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { evrak, loading, error } = useSelector((state) => state.evrak);
  const { cariler } = useSelector((state) => state.cari);

  const [formData, setFormData] = useState({
    evrakTuru: "Gelen Evrak",
    evrakNo: "",
    evrakKonusu: "",
    cari_id: "",
    tarih: new Date().toISOString().split("T")[0],
    aciklama: "",
    gizlilikTuru: "Normal Evrak",
    ilgiliKisi: "",
    teslimTarihi: "",
    teslimAlan: "",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    dispatch(getCariler());

    // Düzenleme modu için evrak verisini getir
    if (id) {
      dispatch(getEvrakById(id));
    } else {
      dispatch(clearCurrentEvrak());
    }

    // Component unmount olduğunda evrak verisini temizle
    return () => {
      dispatch(clearCurrentEvrak());
    };
  }, [id, dispatch]);

  // Eğer düzenleme modundaysak ve evrak verisi yüklendiyse formu doldur
  useEffect(() => {
    if (id && evrak) {
      const evrakBilgileri = {
        evrakTuru: evrak.evrakTuru || "Gelen Evrak",
        evrakNo: evrak.evrakNo || "",
        evrakKonusu: evrak.evrakKonusu || "",
        cari_id: evrak.cari_id ? evrak.cari_id._id : "",
        tarih: evrak.tarih
          ? new Date(evrak.tarih).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        aciklama: evrak.aciklama || "",
        gizlilikTuru: evrak.gizlilikTuru || "Normal Evrak",
        ilgiliKisi: evrak.ilgiliKisi || "",
        teslimTarihi: evrak.teslimTarihi
          ? new Date(evrak.teslimTarihi).toISOString().split("T")[0]
          : "",
        teslimAlan: evrak.teslimAlan || "",
        isActive: evrak.isActive !== undefined ? evrak.isActive : true,
      };

      setFormData(evrakBilgileri);
    }
  }, [id, evrak]);

  // Form doğrulama
  const validateForm = () => {
    const errors = {};

    if (!formData.evrakNo.trim()) {
      errors.evrakNo = "Evrak no gereklidir";
    }

    if (!formData.evrakKonusu.trim()) {
      errors.evrakKonusu = "Evrak konusu gereklidir";
    }

    if (!formData.tarih) {
      errors.tarih = "Tarih gereklidir";
    }

    // Teslim tarihi varsa ve tarihten önce ise uyarı ver
    if (formData.teslimTarihi && formData.tarih) {
      const teslimTarihiObj = new Date(formData.teslimTarihi);
      const tarihObj = new Date(formData.tarih);

      if (teslimTarihiObj < tarihObj) {
        errors.teslimTarihi = "Teslim tarihi, evrak tarihinden önce olamaz";
      }
    }

    // Giden evrak için ilgili kişi zorunlu yap
    if (formData.evrakTuru === "Giden Evrak" && !formData.ilgiliKisi) {
      errors.ilgiliKisi = "Giden evrak için ilgili kişi belirtilmelidir";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Alan dokunuldu olarak işaretle
    setTouchedFields({
      ...touchedFields,
      [name]: true,
    });

    // Hata varsa temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Tarih değeri değişikliğini işle (DatePicker için)
  const handleDateChange = (name, date) => {
    // DatePicker null değer döndürebilir, bu durumda boş string kullan
    const formattedDate = date ? date.toISOString().split("T")[0] : "";

    setFormData({
      ...formData,
      [name]: formattedDate,
    });

    // Alan dokunuldu olarak işaretle
    setTouchedFields({
      ...touchedFields,
      [name]: true,
    });

    // Hata varsa temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Dokunulmuş ve geçerli olmayan alanları kontrol et
  const validateField = (name) => {
    if (!touchedFields[name]) return;

    const errors = { ...formErrors };

    switch (name) {
      case "evrakNo":
        if (!formData.evrakNo.trim()) {
          errors.evrakNo = "Evrak no gereklidir";
        } else {
          delete errors.evrakNo;
        }
        break;

      case "evrakKonusu":
        if (!formData.evrakKonusu.trim()) {
          errors.evrakKonusu = "Evrak konusu gereklidir";
        } else {
          delete errors.evrakKonusu;
        }
        break;

      case "tarih":
        if (!formData.tarih) {
          errors.tarih = "Tarih gereklidir";
        } else {
          delete errors.tarih;
        }
        break;

      case "teslimTarihi":
        if (formData.teslimTarihi && formData.tarih) {
          const teslimTarihiObj = new Date(formData.teslimTarihi);
          const tarihObj = new Date(formData.tarih);

          if (teslimTarihiObj < tarihObj) {
            errors.teslimTarihi = "Teslim tarihi, evrak tarihinden önce olamaz";
          } else {
            delete errors.teslimTarihi;
          }
        }
        break;

      case "ilgiliKisi":
        if (formData.evrakTuru === "Giden Evrak" && !formData.ilgiliKisi) {
          errors.ilgiliKisi = "Giden evrak için ilgili kişi belirtilmelidir";
        } else {
          delete errors.ilgiliKisi;
        }
        break;

      default:
        break;
    }

    setFormErrors(errors);
  };

  // Alan dokunulduğunda validasyon kontrol et
  const handleBlur = (e) => {
    const { name } = e.target;
    validateField(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tüm alanları dokunulmuş olarak işaretle
    const allTouchedFields = {};
    Object.keys(formData).forEach((key) => {
      allTouchedFields[key] = true;
    });
    setTouchedFields(allTouchedFields);

    if (!validateForm()) {
      toast.error("Lütfen gerekli alanları doldurunuz.");
      return;
    }

    try {
      if (id) {
        // Güncelleme
        await dispatch(updateEvrak({ id, evrakData: formData })).unwrap();
        toast.success("Evrak başarıyla güncellendi");
        navigate(`/evraklar/detay/${id}`);
      } else {
        // Yeni ekle
        const yeniEvrak = await dispatch(addEvrak(formData)).unwrap();
        toast.success("Evrak başarıyla eklendi");
        navigate(`/evraklar/detay/${yeniEvrak._id}`);
      }
    } catch (error) {
      console.error("Evrak kayıt hatası:", error);
      toast.error(error?.msg || "Kayıt sırasında bir hata oluştu");
    }
  };

  // Evrak türüne göre renk belirle
  const getEvrakTuruColor = (evrakTuru) => {
    switch (evrakTuru) {
      case "Gelen Evrak":
        return "primary";
      case "Giden Evrak":
        return "success";
      default:
        return "default";
    }
  };

  // Gizlilik türüne göre renk belirle
  const getGizlilikTuruColor = (gizlilikTuru) => {
    switch (gizlilikTuru) {
      case "Kişiye Özel":
        return "error";
      case "Çok Gizli":
        return "error";
      case "Gizli":
        return "warning";
      default:
        return "default";
    }
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
          {id ? "Evrak Düzenle" : "Yeni Evrak Ekle"}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {id && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AttachFileIcon />}
              onClick={() => navigate(`/evraklar/ekler/${id}`)}
            >
              Ekler
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/evraklar")}
          >
            Geri Dön
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {typeof error === "string"
            ? error
            : error?.msg || error?.message || JSON.stringify(error) || "Bir hata oluştu"}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <LocalizationProvider
          dateAdapter={AdapterDateFns}
          adapterLocale={trLocale}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Güncel Durum Bilgisi */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="subtitle1">Evrak Bilgileri</Typography>
                    {formData.evrakTuru && (
                      <Chip
                        icon={<DescriptionIcon />}
                        label={formData.evrakTuru}
                        color={getEvrakTuruColor(formData.evrakTuru)}
                        size="small"
                      />
                    )}
                    {formData.gizlilikTuru && (
                      <Chip
                        icon={<SecurityIcon />}
                        label={formData.gizlilikTuru}
                        color={getGizlilikTuruColor(formData.gizlilikTuru)}
                        size="small"
                        variant={
                          formData.gizlilikTuru === "Normal Evrak"
                            ? "outlined"
                            : "filled"
                        }
                      />
                    )}
                  </Box>
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
                </Box>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Evrak Türü</InputLabel>
                  <Select
                    name="evrakTuru"
                    value={formData.evrakTuru}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Evrak Türü"
                    startAdornment={
                      <InputAdornment position="start">
                        <DescriptionIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="Gelen Evrak">Gelen Evrak</MenuItem>
                    <MenuItem value="Giden Evrak">Giden Evrak</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Evrak No*"
                  name="evrakNo"
                  value={formData.evrakNo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={!!formErrors.evrakNo}
                  helperText={formErrors.evrakNo}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NoteIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <DatePicker
                  label="Tarih*"
                  value={formData.tarih ? new Date(formData.tarih) : null}
                  onChange={(date) => handleDateChange("tarih", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="tarih"
                      fullWidth
                      required
                      error={!!formErrors.tarih}
                      helperText={formErrors.tarih}
                      onBlur={handleBlur}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Evrak Konusu*"
                  name="evrakKonusu"
                  value={formData.evrakKonusu}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={!!formErrors.evrakKonusu}
                  helperText={formErrors.evrakKonusu}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Cari</InputLabel>
                  <Select
                    name="cari_id"
                    value={formData.cari_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Cari"
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    {cariler.map((cari) => (
                      <MenuItem key={cari._id} value={cari._id}>
                        {cari.cariAd}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Gizlilik Türü</InputLabel>
                  <Select
                    name="gizlilikTuru"
                    value={formData.gizlilikTuru}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Gizlilik Türü"
                    startAdornment={
                      <InputAdornment position="start">
                        <SecurityIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="Normal Evrak">Normal Evrak</MenuItem>
                    <MenuItem value="Gizli">Gizli</MenuItem>
                    <MenuItem value="Çok Gizli">Çok Gizli</MenuItem>
                    <MenuItem value="Kişiye Özel">Kişiye Özel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label={
                    formData.evrakTuru === "Giden Evrak"
                      ? "İlgili Kişi*"
                      : "İlgili Kişi"
                  }
                  name="ilgiliKisi"
                  value={formData.ilgiliKisi}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required={formData.evrakTuru === "Giden Evrak"}
                  error={!!formErrors.ilgiliKisi}
                  helperText={formErrors.ilgiliKisi}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <DatePicker
                  label="Teslim Tarihi"
                  value={
                    formData.teslimTarihi
                      ? new Date(formData.teslimTarihi)
                      : null
                  }
                  onChange={(date) => handleDateChange("teslimTarihi", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="teslimTarihi"
                      fullWidth
                      error={!!formErrors.teslimTarihi}
                      helperText={formErrors.teslimTarihi}
                      onBlur={handleBlur}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Teslim Alan"
                  name="teslimAlan"
                  value={formData.teslimAlan}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  name="aciklama"
                  value={formData.aciklama}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  multiline
                  rows={3}
                  placeholder="Evrak ile ilgili açıklamalarınızı buraya yazabilirsiniz..."
                />
              </Grid>

              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </LocalizationProvider>
      </Paper>

      {id ? (
        <Box
          sx={{
            mt: 3,
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            * Evrak eklerini yönetmek için kaydetmenizin ardından "Ekler"
            butonunu kullanabilirsiniz.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AttachFileIcon />}
            onClick={() => navigate(`/evraklar/ekler/${id}`)}
          >
            Evrak Eklerini Yönet
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            * Evrak eklerini yönetmek için önce evrak bilgilerini kaydetmeniz
            gerekmektedir.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EvrakForm;
