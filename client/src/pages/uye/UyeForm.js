import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
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
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import trLocale from "date-fns/locale/tr";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import {
  addUye,
  updateUye,
  getUyeById,
  clearCurrentUye,
} from "../../redux/uye/uyeSlice";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import { getActiveSubeler } from "../../redux/sube/subeSlice";
import { getActiveUyeRoller } from "../../redux/uyeRol/uyeRolSlice";
import { toast } from "react-toastify";

const UyeForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { uye, loading, error } = useSelector((state) => state.uye);
  const { kisiler } = useSelector((state) => state.kisi);
  const { subeler } = useSelector((state) => state.sube);
  const { uyeRoller } = useSelector((state) => state.uyeRol);

  const [formData, setFormData] = useState({
    kisi_id: "",
    uyeRol_id: "",
    uyeNo: "",
    sube_id: "",
    durumu: "Aktif",
    baslangicTarihi: new Date().toISOString().split("T")[0],
    bitisTarihi: "",
    kayitKararNo: "",
    aciklama: "",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    dispatch(getActiveKisiler());
    dispatch(getActiveSubeler());
    dispatch(getActiveUyeRoller());

    // Düzenleme modu için üye verisini getir
    if (id) {
      dispatch(getUyeById(id));
    } else {
      dispatch(clearCurrentUye());
    }

    // Component unmount olduğunda üye verisini temizle
    return () => {
      dispatch(clearCurrentUye());
    };
  }, [id, dispatch]);

  // Eğer düzenleme modundaysak ve üye verisi yüklendiyse formu doldur




  useEffect(() => {
    if (id && uye) {
      const uyeBilgileri = {
        kisi_id: uye.kisi_id ? uye.kisi_id._id : "",
        uyeRol_id: uye.uyeRol_id ? uye.uyeRol_id._id : "",
        uyeNo: uye.uyeNo || "",
        sube_id: uye.sube_id ? uye.sube_id._id : "",
        durumu: uye.durumu || "Aktif",
        baslangicTarihi: uye.baslangicTarihi
          ? new Date(uye.baslangicTarihi).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        bitisTarihi: uye.bitisTarihi
          ? new Date(uye.bitisTarihi).toISOString().split("T")[0]
          : "",
        kayitKararNo: uye.kayitKararNo || "",
        aciklama: uye.aciklama || "",
        isActive: uye.isActive !== undefined ? uye.isActive : true,
      };

      setFormData(uyeBilgileri);
    }
  }, [id, uye]);

  // Form doğrulama
  const validateForm = () => {
    const errors = {};

    if (!formData.kisi_id) errors.kisi_id = "Kişi seçimi zorunludur";
    if (!formData.uyeNo || formData.uyeNo.trim() === "")
      errors.uyeNo = "Üye numarası zorunludur";
    if (!formData.sube_id) errors.sube_id = "Şube seçimi zorunludur";
    if (!formData.uyeRol_id) errors.uyeRol_id = "Üye rolü seçimi zorunludur";
    if (!formData.baslangicTarihi)
      errors.baslangicTarihi = "Başlangıç tarihi gereklidir";

    // Bitiş tarihi varsa ve başlangıç tarihinden önceyse hata ver
    if (
      formData.bitisTarihi &&
      formData.baslangicTarihi &&
      new Date(formData.bitisTarihi) < new Date(formData.baslangicTarihi)
    ) {
      errors.bitisTarihi = "Bitiş tarihi, başlangıç tarihinden önce olamaz";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Kişi seçildiğinde otomatik üye numarası oluştur
  const handleKisiChange = (e) => {
    const kisiId = e.target.value;
    setFormData({ ...formData, kisi_id: kisiId });

    // Eğer düzenleme modunda değilse, kişi seçildikten sonra otomatik üye numarası oluştur
    if (!id && kisiId) {
      const secilenKisi = kisiler.find((kisi) => kisi._id === kisiId);

      if (secilenKisi) {
        // TC Kimlik numarasının son 5 hanesi veya telefonun son 4 hanesi + tarih damgası
        const tcSon5 =
          secilenKisi.tcKimlik && secilenKisi.tcKimlik.length >= 5
            ? secilenKisi.tcKimlik.slice(-5)
            : "";
        const telefonSon4 =
          secilenKisi.telefonNumarasi && secilenKisi.telefonNumarasi.length >= 4
            ? secilenKisi.telefonNumarasi.slice(-4)
            : "";
        const tarihDamgasi = new Date()
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "")
          .slice(-4);

        const uyeNo = tcSon5 || telefonSon4 || tarihDamgasi;
        // Boş kontrolü ekleyelim
        const yeniUyeNo = uyeNo ? `U-${uyeNo}` : "";

        setFormData((prevData) => ({
          ...prevData,
          uyeNo: yeniUyeNo,
        }));
      }
    }

    // Doğrulama hatalarını temizle
    if (formErrors.kisi_id) {
      setFormErrors((prevErrors) => ({ ...prevErrors, kisi_id: "" }));
    }
  };

  // Tarih değişikliği işleme
  const handleDateChange = (name, date) => {
    if (date) {
      // Tarih formatını YYYY-MM-DD olarak ayarla
      const formattedDate = date.toISOString().split("T")[0];
      setFormData({ ...formData, [name]: formattedDate });

      // Tarih alanı için validasyon hatasını temizle
      if (formErrors[name]) {
        const updatedErrors = { ...formErrors };
        delete updatedErrors[name];
        setFormErrors(updatedErrors);
      }
    } else {
      setFormData({ ...formData, [name]: "" });
    }
  };

  // Genel form değişikliklerini işleme
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData({ ...formData, [name]: newValue });

    // Hata kontrolü
    if (formErrors[name]) {
      const updatedErrors = { ...formErrors };
      delete updatedErrors[name];
      setFormErrors(updatedErrors);
    }
  };

  // Form alanı odaktan çıkıldığında kontrol
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields({ ...touchedFields, [name]: true });
    validateField(name, formData[name]);
  };

  // Belirli bir alanın validasyonu
  const validateField = (name, value) => {
    const errors = { ...formErrors };

    switch (name) {
      case "kisi_id":
        if (!formData.kisi_id) {
          errors.kisi_id = "Kişi seçimi zorunludur";
        } else {
          delete errors.kisi_id;
        }
        break;

      case "uyeNo":
        if (!value || value.trim() === "") {
          errors.uyeNo = "Üye numarası zorunludur";
        } else {
          delete errors.uyeNo;
        }
        break;

      case "sube_id":
        if (!formData.sube_id) {
          errors.sube_id = "Şube seçimi zorunludur";
        } else {
          delete errors.sube_id;
        }
        break;

      case "baslangicTarihi":
        if (!formData.baslangicTarihi) {
          errors.baslangicTarihi = "Başlangıç tarihi gereklidir";
        } else {
          delete errors.baslangicTarihi;
        }
        break;

      case "bitisTarihi":
        if (
          formData.bitisTarihi &&
          formData.baslangicTarihi &&
          new Date(formData.bitisTarihi) < new Date(formData.baslangicTarihi)
        ) {
          errors.bitisTarihi = "Bitiş tarihi, başlangıç tarihinden önce olamaz";
        } else {
          delete errors.bitisTarihi;
        }
        break;

      default:
        break;
    }

    setFormErrors(errors);
  };

  // Form gönderim işlemi
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dokunulmamış alanlar için tüm alanları dokunulmuş olarak işaretle
    const allFieldsTouched = {};
    Object.keys(formData).forEach((key) => {
      allFieldsTouched[key] = true;
    });
    setTouchedFields(allFieldsTouched);

    if (!validateForm()) {
      toast.error("Lütfen gerekli alanları doldurunuz.");
      return;
    }

    try {
      if (id) {
        // Güncelleme
        await dispatch(updateUye({ id, uyeData: formData })).unwrap();
        navigate("/uyeler");
      } else {
        // Yeni ekleme
        const newUye = await dispatch(addUye(formData)).unwrap();
        navigate(`/uyeler/detay/${newUye._id}`);
      }
    } catch (error) {
      console.error("Üye kayıt hatası:", error);
      // Burada sadece Redux'ta olmayan hata durumları için bildirim gösteriyoruz
      if (!error?.msg) {
        toast.error("İşlem sırasında bir hata oluştu");
      }
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
          {id ? "Üye Düzenle" : "Yeni Üye Ekle"}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/uyeler")}
        >
          Geri Dön
        </Button>
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
              {/* Kişi Seçimi */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.kisi_id}>
                  <InputLabel id="kisi-label">Kişi*</InputLabel>
                  <Select
                    labelId="kisi-label"
                    name="kisi_id"
                    value={formData.kisi_id}
                    onChange={handleKisiChange}
                    onBlur={handleBlur}
                    label="Kişi*"
                    required
                    disabled={id !== undefined} // Düzenleme modunda kişi değiştirilemez
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {kisiler.map((kisi) => (
                      <MenuItem key={kisi._id} value={kisi._id}>
                        {`${kisi.ad} ${kisi.soyad}`}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.kisi_id && (
                    <Typography color="error" variant="caption">
                      {formErrors.kisi_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Üye No */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Üye No*"
                  name="uyeNo"
                  value={formData.uyeNo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={!!formErrors.uyeNo}
                  helperText={formErrors.uyeNo}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Şube Seçimi */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.sube_id}>
                  <InputLabel id="sube-label">Şube*</InputLabel>
                  <Select
                    labelId="sube-label"
                    name="sube_id"
                    value={formData.sube_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Şube*"
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <BusinessIcon />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {subeler.map((sube) => (
                      <MenuItem key={sube._id} value={sube._id}>
                        {sube.ad}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.sube_id && (
                    <Typography color="error" variant="caption">
                      {formErrors.sube_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Üye Rolü Seçimi */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.uyeRol_id}>
                  <InputLabel id="uyeRol-label">Üye Rolü*</InputLabel>
                  <Select
                    labelId="uyeRol-label"
                    name="uyeRol_id"
                    value={formData.uyeRol_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Üye Rolü*"
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <AssignmentIcon />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {uyeRoller.map((rol) => (
                      <MenuItem key={rol._id} value={rol._id}>
                        {rol.ad}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.uyeRol_id && (
                    <Typography color="error" variant="caption">
                      {formErrors.uyeRol_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Durum Seçimi */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="durumu-label">Durum</InputLabel>
                  <Select
                    labelId="durumu-label"
                    name="durumu"
                    value={formData.durumu}
                    onChange={handleChange}
                    label="Durum"
                  >
                    <MenuItem value="Aktif">Aktif</MenuItem>
                    <MenuItem value="Pasif">Pasif</MenuItem>
                    <MenuItem value="Askıda">Askıda</MenuItem>
                    <MenuItem value="İptal">İptal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Başlangıç Tarihi */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Başlangıç Tarihi*"
                  value={
                    formData.baslangicTarihi
                      ? new Date(formData.baslangicTarihi)
                      : null
                  }
                  onChange={(date) => handleDateChange("baslangicTarihi", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!formErrors.baslangicTarihi}
                      helperText={formErrors.baslangicTarihi}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Bitiş Tarihi */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Bitiş Tarihi"
                  value={
                    formData.bitisTarihi ? new Date(formData.bitisTarihi) : null
                  }
                  onChange={(date) => handleDateChange("bitisTarihi", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!formErrors.bitisTarihi}
                      helperText={formErrors.bitisTarihi}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Karar No */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kayıt Karar No"
                  name="kayitKararNo"
                  value={formData.kayitKararNo}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Açıklama */}
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

              {/* Aktif/Pasif */}
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

              {/* Kaydet Butonu */}
              <Grid item xs={12} sx={{ mt: 2, textAlign: "right" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  disabled={loading}
                >
                  {id ? "Güncelle" : "Kaydet"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </LocalizationProvider>
      </Paper>
    </Box>
  );
};

export default UyeForm;
