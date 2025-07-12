import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
  Grid,
  Checkbox,
  FormGroup,
  FormLabel,
  Divider,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { tr } from "date-fns/locale";
import { format, parse } from "date-fns";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import LoadingButton from "../../components/LoadingButton";
import {
  addRandevuTanimi,
  getRandevuTanimiById,
  updateRandevuTanimi,
} from "../../redux/randevuTanimi/randevuTanimiSlice";
import LoadingBox from "../../components/LoadingBox";

const GUNLER = [
  { value: 0, label: "Pazar" },
  { value: 1, label: "Pazartesi" },
  { value: 2, label: "Salı" },
  { value: 3, label: "Çarşamba" },
  { value: 4, label: "Perşembe" },
  { value: 5, label: "Cuma" },
  { value: 6, label: "Cumartesi" },
];

const RandevuTanimForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentRandevuTanimi, loading } = useSelector(
    (state) => state.randevuTanimi || {}
  );

  const [formData, setFormData] = useState({
    ad: "",
    aciklama: "",
    gunler: [],
    baslangicSaati: null,
    bitisSaati: null,
    slotSuresiDk: 30,
    maksimumKisi: 1,
    lokasyon: "",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ID varsa mevcut randevu tanımını getir
  useEffect(() => {
    if (id) {
      dispatch(getRandevuTanimiById(id));
    }
  }, [dispatch, id]);

  // Mevcut tanım bilgilerini forma yükle
  useEffect(() => {
    if (id && currentRandevuTanimi) {
      const tanim = currentRandevuTanimi;

      // Saat değerlerini Date objesine dönüştür
      const getTimeAsDate = (timeString) => {
        if (!timeString) return null;
        try {
          return parse(timeString, "HH:mm", new Date());
        } catch (error) {
          return null;
        }
      };

      setFormData({
        ad: tanim.ad || "",
        aciklama: tanim.aciklama || "",
        gunler: tanim.gunler || [],
        baslangicSaati: getTimeAsDate(tanim.baslangicSaati),
        bitisSaati: getTimeAsDate(tanim.bitisSaati),
        slotSuresiDk: tanim.slotSuresiDk || 30,
        maksimumKisi: tanim.maksimumKisi || 1,
        lokasyon: tanim.lokasyon || "",
        isActive: tanim.isActive !== undefined ? tanim.isActive : true,
      });
    }
  }, [id, currentRandevuTanimi]);

  // Form verisi değişikliklerini işle
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Alanı dokunulmuş olarak işaretle
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

  // Günleri işle
  const handleGunChange = (gun) => {
    const gunlerYeni = [...formData.gunler];
    const index = gunlerYeni.indexOf(gun);

    if (index === -1) {
      gunlerYeni.push(gun);
    } else {
      gunlerYeni.splice(index, 1);
    }

    setFormData({
      ...formData,
      gunler: gunlerYeni,
    });

    // Hata varsa temizle
    if (formErrors.gunler) {
      setFormErrors({
        ...formErrors,
        gunler: "",
      });
    }
  };

  // Saat değişikliklerini işle
  const handleTimeChange = (name, time) => {
    setFormData({
      ...formData,
      [name]: time,
    });

    // Alanı dokunulmuş olarak işaretle
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

  // Form validasyonu
  const validateForm = () => {
    const errors = {};

    if (!formData.ad) {
      errors.ad = "Tanım adı gereklidir";
    }

    if (!formData.gunler || formData.gunler.length === 0) {
      errors.gunler = "En az bir gün seçilmelidir";
    }

    if (!formData.baslangicSaati) {
      errors.baslangicSaati = "Başlangıç saati gereklidir";
    }

    if (!formData.bitisSaati) {
      errors.bitisSaati = "Bitiş saati gereklidir";
    }

    if (formData.baslangicSaati && formData.bitisSaati) {
      if (formData.baslangicSaati > formData.bitisSaati) {
        errors.bitisSaati = "Bitiş saati başlangıç saatinden sonra olmalıdır";
      }
    }

    if (!formData.slotSuresiDk) {
      errors.slotSuresiDk = "Slot süresi gereklidir";
    } else if (formData.slotSuresiDk < 5) {
      errors.slotSuresiDk = "Slot süresi en az 5 dakika olmalıdır";
    } else if (formData.slotSuresiDk > 240) {
      errors.slotSuresiDk = "Slot süresi en fazla 240 dakika olmalıdır";
    }

    if (!formData.maksimumKisi) {
      errors.maksimumKisi = "Maksimum kişi sayısı gereklidir";
    } else if (formData.maksimumKisi < 1) {
      errors.maksimumKisi = "Maksimum kişi sayısı en az 1 olmalıdır";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Formu kaydet
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tüm alanları dokunulmuş olarak işaretle
    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouchedFields(allTouched);

    if (!validateForm()) {
      toast.error("Lütfen form alanlarını kontrol ediniz");
      return;
    }

    setSubmitting(true);

    try {
      // Saat değerlerini string formatına dönüştür
      const formatTime = (date) => {
        if (!date) return null;
        return format(date, "HH:mm");
      };

      const tanimData = {
        ...formData,
        baslangicSaati: formatTime(formData.baslangicSaati),
        bitisSaati: formatTime(formData.bitisSaati),
      };

      if (id) {
        // Güncelleme
        await dispatch(
          updateRandevuTanimi({ id, tanımData: tanimData })
        ).unwrap();
        toast.success("Randevu tanımı başarıyla güncellendi");
      } else {
        // Yeni ekleme
        await dispatch(addRandevuTanimi(tanimData)).unwrap();
        toast.success("Randevu tanımı başarıyla eklendi");
      }

      navigate("/randevu/tanimlar");
    } catch (error) {
      toast.error(error?.msg || "İşlem sırasında bir hata oluştu");
      console.error("Form gönderim hatası:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Yükleniyor durumu kontrolü
  if (loading && id) {
    return <LoadingBox />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h1">
          {id ? "Randevu Tanımı Düzenle" : "Yeni Randevu Tanımı"}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tanım Adı"
                name="ad"
                value={formData.ad}
                onChange={handleChange}
                error={Boolean(touchedFields.ad && formErrors.ad)}
                helperText={touchedFields.ad && formErrors.ad}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lokasyon"
                name="lokasyon"
                value={formData.lokasyon}
                onChange={handleChange}
                placeholder="Randevuların gerçekleşeceği yer (opsiyonel)"
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
              <FormLabel component="legend">Randevu Günleri</FormLabel>
              <FormHelperText
                error={Boolean(touchedFields.gunler && formErrors.gunler)}
              >
                {touchedFields.gunler && formErrors.gunler}
              </FormHelperText>
              <FormGroup row>
                {GUNLER.map((gun) => (
                  <FormControlLabel
                    key={gun.value}
                    control={
                      <Checkbox
                        checked={formData.gunler.includes(gun.value)}
                        onChange={() => handleGunChange(gun.value)}
                      />
                    }
                    label={gun.label}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={12} md={4}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={tr}
              >
                <TimePicker
                  label="Başlangıç Saati"
                  value={formData.baslangicSaati}
                  onChange={(time) => handleTimeChange("baslangicSaati", time)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={Boolean(
                        touchedFields.baslangicSaati &&
                          formErrors.baslangicSaati
                      )}
                      helperText={
                        touchedFields.baslangicSaati &&
                        formErrors.baslangicSaati
                      }
                      required
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={4}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={tr}
              >
                <TimePicker
                  label="Bitiş Saati"
                  value={formData.bitisSaati}
                  onChange={(time) => handleTimeChange("bitisSaati", time)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={Boolean(
                        touchedFields.bitisSaati && formErrors.bitisSaati
                      )}
                      helperText={
                        touchedFields.bitisSaati && formErrors.bitisSaati
                      }
                      required
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Slot Süresi (Dakika)"
                name="slotSuresiDk"
                type="number"
                value={formData.slotSuresiDk}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 5, max: 240 } }}
                error={Boolean(
                  touchedFields.slotSuresiDk && formErrors.slotSuresiDk
                )}
                helperText={
                  touchedFields.slotSuresiDk && formErrors.slotSuresiDk
                }
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maksimum Kişi"
                name="maksimumKisi"
                type="number"
                value={formData.maksimumKisi}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 1 } }}
                error={Boolean(
                  touchedFields.maksimumKisi && formErrors.maksimumKisi
                )}
                helperText={
                  touchedFields.maksimumKisi && formErrors.maksimumKisi
                }
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
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
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/randevu/tanimlar")}
                >
                  İptal
                </Button>
                <LoadingButton
                  loading={submitting}
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                >
                  Kaydet
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default RandevuTanimForm;
