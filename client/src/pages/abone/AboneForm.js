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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Numbers as NumbersIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import {
  getAboneById,
  addAbone,
  updateAbone,
  clearCurrentAbone,
} from "../../redux/abone/aboneSlice";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import { getSubeler } from "../../redux/sube/subeSlice";
import { toast } from "react-toastify";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import trLocale from "date-fns/locale/tr";
import { PermissionRequired, hasPermission } from "../../utils/rbacUtils";

const AboneForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { abone, loading, error } = useSelector((state) => state.abone);
  const { kisiler } = useSelector((state) => state.kisi);
  const { subeler } = useSelector((state) => state.sube);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    kisi_id: "",
    aboneTuru: "Mesken",
    aboneNo: "",
    sube_id: "",
    durum: "Aktif",
    baslamaTarihi: new Date().toISOString().split("T")[0],
    bitisTarihi: "",
    defterNo: "",
    aciklama: "",
    adres: "",
    telefonNo: "",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    dispatch(getActiveKisiler());
    dispatch(getSubeler());

    // Düzenleme modu için abone verisini getir
    if (id) {
      dispatch(getAboneById(id));
    } else {
      dispatch(clearCurrentAbone());
    }

    // Component unmount olduğunda abone verisini temizle
    return () => {
      dispatch(clearCurrentAbone());
    };
  }, [id, dispatch]);

  // Eğer düzenleme modundaysak ve abone verisi yüklendiyse formu doldur
  useEffect(() => {
    if (id && abone) {
      const aboneBilgileri = {
        kisi_id: abone.kisi_id ? abone.kisi_id._id : "",
        aboneTuru: abone.aboneTuru || "Mesken",
        aboneNo: abone.aboneNo || "",
        sube_id: abone.sube_id ? abone.sube_id._id : "",
        durum: abone.durum || "Aktif",
        baslamaTarihi: abone.baslamaTarihi
          ? new Date(abone.baslamaTarihi).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        bitisTarihi: abone.bitisTarihi
          ? new Date(abone.bitisTarihi).toISOString().split("T")[0]
          : "",
        defterNo: abone.defterNo || "",
        aciklama: abone.aciklama || "",
        adres: abone.adres || "",
        telefonNo: abone.telefonNo || "",
        isActive: abone.isActive !== undefined ? abone.isActive : true,
      };

      setFormData(aboneBilgileri);
    }
  }, [id, abone]);

  // Form doğrulama
  const validateForm = () => {
    const errors = {};

    if (!formData.kisi_id) {
      errors.kisi_id = "Kişi seçimi zorunludur";
    }

    if (!formData.aboneNo.trim()) {
      errors.aboneNo = "Abone numarası gereklidir";
    }

    if (!formData.sube_id) {
      errors.sube_id = "Şube seçimi zorunludur";
    }

    if (!formData.baslamaTarihi) {
      errors.baslamaTarihi = "Başlama tarihi gereklidir";
    }

    // Bitiş tarihi varsa ve başlangıç tarihinden önceyse hata ver
    if (formData.bitisTarihi && formData.baslamaTarihi) {
      const bitisTarihiObj = new Date(formData.bitisTarihi);
      const baslamaTarihiObj = new Date(formData.baslamaTarihi);

      if (bitisTarihiObj < baslamaTarihiObj) {
        errors.bitisTarihi = "Bitiş tarihi, başlama tarihinden önce olamaz";
      }
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

  // Kişi seçildiğinde adres ve telefon bilgilerini otomatik doldur
  const handleKisiChange = (e) => {
    const kisiId = e.target.value;
    handleChange(e);

    if (kisiId) {
      const seciliKisi = kisiler.find((kisi) => kisi._id === kisiId);
      if (seciliKisi) {
        // Eğer abone formunda adres ve telefon alanları boşsa, kişinin bilgileriyle doldur
        setFormData((prev) => ({
          ...prev,
          kisi_id: kisiId,
          adres: prev.adres || seciliKisi.adres || "",
          telefonNo: prev.telefonNo || seciliKisi.telefonNumarasi || "",
        }));
      }
    }
  };

  // Dokunulmuş ve geçerli olmayan alanları kontrol et
  const validateField = (name) => {
    if (!touchedFields[name]) return;

    const errors = { ...formErrors };

    switch (name) {
      case "kisi_id":
        if (!formData.kisi_id) {
          errors.kisi_id = "Kişi seçimi zorunludur";
        } else {
          delete errors.kisi_id;
        }
        break;

      case "aboneNo":
        if (!formData.aboneNo.trim()) {
          errors.aboneNo = "Abone numarası gereklidir";
        } else {
          delete errors.aboneNo;
        }
        break;

      case "sube_id":
        if (!formData.sube_id) {
          errors.sube_id = "Şube seçimi zorunludur";
        } else {
          delete errors.sube_id;
        }
        break;

      case "baslamaTarihi":
        if (!formData.baslamaTarihi) {
          errors.baslamaTarihi = "Başlama tarihi gereklidir";
        } else {
          delete errors.baslamaTarihi;
        }
        break;

      case "bitisTarihi":
        if (formData.bitisTarihi && formData.baslamaTarihi) {
          const bitisTarihiObj = new Date(formData.bitisTarihi);
          const baslamaTarihiObj = new Date(formData.baslamaTarihi);

          if (bitisTarihiObj < baslamaTarihiObj) {
            errors.bitisTarihi = "Bitiş tarihi, başlama tarihinden önce olamaz";
          } else {
            delete errors.bitisTarihi;
          }
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

    setTouchedFields(
      Object.keys(formData).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );

    if (!validateForm()) {
      toast.error("Lütfen gerekli alanları doldurunuz.");
      return;
    }

    // Yetki kontrolü
    if (id) {
      if (!hasPermission(user, "aboneler_guncelleme")) {
        toast.error("Abone güncellemek için yetkiniz yok.");
        return;
      }
    } else {
      if (!hasPermission(user, "aboneler_ekleme")) {
        toast.error("Abone eklemek için yetkiniz yok.");
        return;
      }
    }

    try {
      if (id) {
        // Güncelleme
        await dispatch(updateAbone({ id, aboneData: formData })).unwrap();
        toast.success("Abone başarıyla güncellendi");
        navigate(`/aboneler/detay/${id}`);
      } else {
        // Yeni ekle
        const yeniAbone = await dispatch(addAbone(formData)).unwrap();
        toast.success("Abone başarıyla eklendi");
        navigate(`/aboneler/detay/${yeniAbone._id}`);
      }
    } catch (error) {
      console.error("Abone kayıt hatası:", error);
      toast.error(error?.msg || "Kayıt sırasında bir hata oluştu");
    }
  };

  return (
    <PermissionRequired
      yetkiKodu={id ? "aboneler_guncelleme" : "aboneler_ekleme"}
      fallback={
        <Alert severity="error">
          Bu sayfayı görüntülemek için yetkiniz yok.
        </Alert>
      }
    >
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
            {id ? "Abone Düzenle" : "Yeni Abone Ekle"}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/aboneler")}
          >
            Geri Dön
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error.msg || "Bir hata oluştu"}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={trLocale}
          >
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Aktiflik Durumu */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="subtitle1">Abone Bilgileri</Typography>
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

                {/* Kişi Seçimi */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!formErrors.kisi_id}>
                    <InputLabel id="kisi-label">Abone Kişi*</InputLabel>
                    <Select
                      labelId="kisi-label"
                      name="kisi_id"
                      value={formData.kisi_id}
                      onChange={handleKisiChange}
                      label="Abone Kişi*"
                      onBlur={handleBlur}
                      required
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

                {/* Şube Seçimi */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!formErrors.sube_id}>
                    <InputLabel id="sube-label">Şube*</InputLabel>
                    <Select
                      labelId="sube-label"
                      name="sube_id"
                      value={formData.sube_id}
                      onChange={handleChange}
                      label="Şube*"
                      onBlur={handleBlur}
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

                {/* Abone No */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Abone Numarası*"
                    name="aboneNo"
                    value={formData.aboneNo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={!!formErrors.aboneNo}
                    helperText={formErrors.aboneNo}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NumbersIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Abone Türü */}
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="aboneturu-label">Abone Türü*</InputLabel>
                    <Select
                      labelId="aboneturu-label"
                      name="aboneTuru"
                      value={formData.aboneTuru}
                      onChange={handleChange}
                      label="Abone Türü*"
                      required
                      startAdornment={
                        <InputAdornment position="start">
                          <HomeIcon />
                        </InputAdornment>
                      }
                    >
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

                {/* Durum */}
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="durum-label">Durum</InputLabel>
                    <Select
                      labelId="durum-label"
                      name="durum"
                      value={formData.durum}
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

                {/* Defter No */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Defter No"
                    name="defterNo"
                    value={formData.defterNo}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Başlama Tarihi */}
                <Grid item xs={12} sm={6} md={4}>
                  <DatePicker
                    label="Başlama Tarihi*"
                    value={
                      formData.baslamaTarihi
                        ? new Date(formData.baslamaTarihi)
                        : null
                    }
                    onChange={(date) => handleDateChange("baslamaTarihi", date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="baslamaTarihi"
                        fullWidth
                        required
                        error={!!formErrors.baslamaTarihi}
                        helperText={formErrors.baslamaTarihi}
                        onBlur={handleBlur}
                      />
                    )}
                  />
                </Grid>

                {/* Bitiş Tarihi */}
                <Grid item xs={12} sm={6} md={4}>
                  <DatePicker
                    label="Bitiş Tarihi"
                    value={
                      formData.bitisTarihi
                        ? new Date(formData.bitisTarihi)
                        : null
                    }
                    onChange={(date) => handleDateChange("bitisTarihi", date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="bitisTarihi"
                        fullWidth
                        error={!!formErrors.bitisTarihi}
                        helperText={formErrors.bitisTarihi}
                        onBlur={handleBlur}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    İletişim Bilgileri
                  </Typography>
                </Grid>

                {/* Telefon */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telefon Numarası"
                    name="telefonNo"
                    value={formData.telefonNo}
                    onChange={handleChange}
                    placeholder="İletişim için telefon numarası"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Adres */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Adres"
                    name="adres"
                    value={formData.adres}
                    onChange={handleChange}
                    multiline
                    rows={1}
                    placeholder="Abone adresi"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon />
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
                    rows={2}
                    placeholder="Varsa eklemek istediğiniz notlar..."
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
      </Box>
    </PermissionRequired>
  );
};

export default AboneForm;
