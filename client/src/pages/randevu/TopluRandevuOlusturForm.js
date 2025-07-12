import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  TextField,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { tr } from "date-fns/locale";
import { format, addDays, differenceInDays, isValid } from "date-fns";
import LoopIcon from "@mui/icons-material/Loop";

import { getActiveRandevuTanimlari } from "../../redux/randevuTanimi/randevuTanimiSlice";
import {
  createBulkRandevuSlotlari,
  clearBulkCreateResult,
} from "../../redux/randevuSlot/randevuSlotSlice";
import LoadingButton from "../../components/LoadingButton";

const DAYS_OF_WEEK = [
  { value: 0, label: "Pazar" },
  { value: 1, label: "Pazartesi" },
  { value: 2, label: "Salı" },
  { value: 3, label: "Çarşamba" },
  { value: 4, label: "Perşembe" },
  { value: 5, label: "Cuma" },
  { value: 6, label: "Cumartesi" },
];

const TopluRandevuOlusturForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux store'dan verileri daha güvenli bir şekilde çekelim
  const randevuTanimiState = useSelector((state) => state.randevuTanimi) || {};
  const {
    randevuTanimlari = [],
    activeRandevuTanimlari = [],
    loading: tanimlarLoading = false,
  } = randevuTanimiState;

  // Yerel state ile veri saklama - Redux'ta sorun olursa bu bizi kurtarır
  const [localRandevuTanimlari, setLocalRandevuTanimlari] = useState([]);

  const randevuSlotState = useSelector((state) => state.randevuSlot) || {};
  const { loading = false, bulkCreateResult = null } = randevuSlotState;

  const [formData, setFormData] = useState({
    randevuTanimi_id: "",
    baslangicTarihi: null,
    bitisTarihi: null,
  });

  const [selectedTanim, setSelectedTanim] = useState(null);
  const [errors, setErrors] = useState({});
  const [previewData, setPreviewData] = useState(null);

  // İlk yüklendiğinde randevu tanımlarını getir
  useEffect(() => {
    console.log("TopluRandevuOlusturForm: Randevu tanımları yükleniyor...");
    dispatch(getActiveRandevuTanimlari())
      .then((response) => {
        console.log("Randevu tanımları API cevabı:", response);
        if (response.payload && response.payload.length > 0) {
          // API'den gelen veriyi doğrudan yerel state'e aktaralım
          setLocalRandevuTanimlari(response.payload);
          console.log(
            `${response.payload.length} randevu tanımı başarıyla yüklendi`
          );
        }
      })
      .catch((err) => {
        console.error("Randevu tanımları yüklenirken hata:", err);
      });
  }, [dispatch]);

  // Görüntülenecek randevu tanımları için daha kapsamlı bir mekanizma
  const displayRandevuTanimlari = useMemo(() => {
    // İlk olarak yerel state'e bak
    if (localRandevuTanimlari.length > 0) {
      return localRandevuTanimlari;
    }

    // Redux store'daki değerlere bak
    if (activeRandevuTanimlari && activeRandevuTanimlari.length > 0) {
      return activeRandevuTanimlari;
    }

    if (randevuTanimlari && randevuTanimlari.length > 0) {
      return randevuTanimlari;
    }

    // Hiçbir veri yoksa boş dizi döndür
    return [];
  }, [localRandevuTanimlari, activeRandevuTanimlari, randevuTanimlari]);

  // Tanımlar yüklendiğinde debug için log basar
  useEffect(() => {
    if (displayRandevuTanimlari.length > 0) {
      console.log(
        `TopluRandevuOlusturForm: ${displayRandevuTanimlari.length} randevu tanımı gösterime hazır`
      );
    }
  }, [displayRandevuTanimlari]);

  // Eğer tanımlar boşsa ve yükleme tamamlandıysa, tekrar yüklemeyi dene
  useEffect(() => {
    if (!tanimlarLoading && displayRandevuTanimlari.length === 0) {
      console.log(
        "TopluRandevuOlusturForm: Randevu tanımları bulunamadı, tekrar yükleniyor..."
      );
      // Redux üzerinden tekrar veri çekmeyi dene
      dispatch(getActiveRandevuTanimlari()).then((response) => {
        // Doğrudan API yanıtını yerel state'e aktar
        if (response.payload && response.payload.length > 0) {
          setLocalRandevuTanimlari(response.payload);
        }
      });
    }
  }, [dispatch, tanimlarLoading, displayRandevuTanimlari.length]);

  useEffect(() => {
    if (bulkCreateResult) {
      return () => {
        dispatch(clearBulkCreateResult());
      };
    }
  }, [bulkCreateResult, dispatch]);

  useEffect(() => {
    if (formData.randevuTanimi_id) {
      const tanim = displayRandevuTanimlari.find(
        (t) => t._id === formData.randevuTanimi_id
      );
      setSelectedTanim(tanim);
    } else {
      setSelectedTanim(null);
    }
  }, [formData.randevuTanimi_id, displayRandevuTanimlari]);

  useEffect(() => {
    if (selectedTanim && formData.baslangicTarihi && formData.bitisTarihi) {
      const preview = calculatePreview(
        selectedTanim,
        formData.baslangicTarihi,
        formData.bitisTarihi
      );
      setPreviewData(preview);
    } else {
      setPreviewData(null);
    }
  }, [selectedTanim, formData.baslangicTarihi, formData.bitisTarihi]);

  const calculatePreview = (tanim, startDate, endDate) => {
    if (!tanim || !startDate || !endDate) return null;

    const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
    const selectedDays = tanim.gunler.length;

    const slotSuresi = parseInt(tanim.slotSuresiDk, 10);

    const [basSaat, basDakika] = tanim.baslangicSaati.split(":").map(Number);
    const [bitSaat, bitDakika] = tanim.bitisSaati.split(":").map(Number);

    const basDakikaToplam = basSaat * 60 + basDakika;
    const bitDakikaToplam =
      (bitSaat < basSaat ? bitSaat + 24 : bitSaat) * 60 + bitDakika;
    const totalMinutes = bitDakikaToplam - basDakikaToplam;

    // Hatalı veya eksik slot süresi/totalMinutes durumunda NaN oluşmasını engelle
    const slotsPerDay =
      slotSuresi > 0 && totalMinutes > 0
        ? Math.floor(totalMinutes / slotSuresi)
        : 0;

    let activeMatchingDays = 0;
    for (let i = 0; i <= days; i++) {
      const currentDate = addDays(new Date(startDate), i);
      const weekday = currentDate.getDay();

      if (tanim.gunler.includes(weekday)) {
        activeMatchingDays++;
      }
    }

    const totalSlots = activeMatchingDays * slotsPerDay;

    return {
      totalDays: days,
      matchingDays: activeMatchingDays,
      slotsPerDay,
      totalSlots,
      selectedDays,
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const handleDateChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.randevuTanimi_id) {
      errors.randevuTanimi_id = "Randevu tanımı seçmelisiniz";
    }

    if (!formData.baslangicTarihi) {
      errors.baslangicTarihi = "Başlangıç tarihi seçmelisiniz";
    }

    if (!formData.bitisTarihi) {
      errors.bitisTarihi = "Bitiş tarihi seçmelisiniz";
    } else if (
      formData.baslangicTarihi &&
      formData.bitisTarihi &&
      new Date(formData.bitisTarihi) < new Date(formData.baslangicTarihi)
    ) {
      errors.bitisTarihi = "Bitiş tarihi başlangıç tarihinden önce olamaz";
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Tarihleri backend'in beklediği formata çevir
      const dataToSend = {
        ...formData,
        baslangicTarihi: formData.baslangicTarihi
          ? format(new Date(formData.baslangicTarihi), "yyyy-MM-dd")
          : null,
        bitisTarihi: formData.bitisTarihi
          ? format(new Date(formData.bitisTarihi), "yyyy-MM-dd")
          : null,
      };

      await dispatch(createBulkRandevuSlotlari(dataToSend)).unwrap();

      navigate("/randevu/slotlar");
    } catch (error) {
      // Backend'den dönen hata mesajını kullanıcıya göster
      toast.error(
        error?.msg ||
          error?.response?.data?.msg ||
          "Randevu slotu oluşturulurken bir hata oluştu"
      );
      console.error("Randevu slotu oluşturulurken hata:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (!isValid(d) || isNaN(d.getTime())) return "";
    try {
      return format(d, "dd.MM.yyyy");
    } catch {
      return "";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Toplu Randevu Oluşturma
      </Typography>

      {/* Randevu tanımları yüklenmediyse uyarı göster */}
      {displayRandevuTanimlari.length === 0 && !tanimlarLoading && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "warning.light" }}>
          <Typography>
            Randevu tanımları yüklenemedi. Lütfen sayfayı yenileyin veya sistem
            yöneticinize başvurun.
          </Typography>
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={Boolean(errors.randevuTanimi_id)}>
              <InputLabel>Randevu Tanımı</InputLabel>
              <Select
                name="randevuTanimi_id"
                value={formData.randevuTanimi_id}
                onChange={handleChange}
                label="Randevu Tanımı"
              >
                <MenuItem value="">
                  <em>Seçiniz</em>
                </MenuItem>
                {displayRandevuTanimlari.map((tanim) => (
                  <MenuItem key={tanim._id} value={tanim._id}>
                    {tanim.ad}
                  </MenuItem>
                ))}
              </Select>
              {errors.randevuTanimi_id && (
                <FormHelperText>{errors.randevuTanimi_id}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={tr}
            >
              <DatePicker
                label="Başlangıç Tarihi"
                value={formData.baslangicTarihi}
                onChange={(date) => handleDateChange("baslangicTarihi", date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={Boolean(errors.baslangicTarihi)}
                    helperText={errors.baslangicTarihi}
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
              <DatePicker
                label="Bitiş Tarihi"
                value={formData.bitisTarihi}
                onChange={(date) => handleDateChange("bitisTarihi", date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={Boolean(errors.bitisTarihi)}
                    helperText={errors.bitisTarihi}
                  />
                )}
                minDate={formData.baslangicTarihi}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        {selectedTanim && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Randevu Tanımı Detayları
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  Başlangıç - Bitiş Saati:
                </Typography>
                <Typography variant="body1">
                  {selectedTanim.baslangicSaati} - {selectedTanim.bitisSaati}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  Slot Süresi:
                </Typography>
                <Typography variant="body1">
                  {selectedTanim.slotSuresiDk} dakika
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  Randevu Günleri:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selectedTanim.gunler.map((gun) => (
                    <Typography key={gun} component="span" variant="body1">
                      {DAYS_OF_WEEK.find((d) => d.value === gun)?.label}
                      {gun !==
                      selectedTanim.gunler[selectedTanim.gunler.length - 1]
                        ? ", "
                        : ""}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {previewData && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Önizleme
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {isNaN(previewData.totalDays) ? "—" : previewData.totalDays}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Toplam Gün
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {isNaN(previewData.matchingDays) ? "—" : previewData.matchingDays}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Randevu Günü
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {isNaN(previewData.slotsPerDay) ? "—" : previewData.slotsPerDay}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Günlük Slot Sayısı
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {isNaN(previewData.totalSlots) ? "—" : previewData.totalSlots}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Toplam Oluşturulacak Slot
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="textSecondary">
                {formData.baslangicTarihi && formData.bitisTarihi
                  ? `${formatDate(formData.baslangicTarihi)} - ${formatDate(
                      formData.bitisTarihi
                    )} tarihleri arasında, seçilen günlerde toplam ${
                      previewData.totalSlots
                    } adet randevu slotu oluşturulacaktır.`
                  : ""}
              </Typography>
            </Box>
          </Box>
        )}

        <Box
          sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/randevu/slotlar")}
          >
            İptal
          </Button>
          <LoadingButton
            loading={loading}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            startIcon={<LoopIcon />}
            disabled={!previewData || previewData.totalSlots === 0}
          >
            Toplu Randevu Oluştur
          </LoadingButton>
        </Box>
      </Paper>

      {bulkCreateResult && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom color="success.main">
            {bulkCreateResult.msg || "Randevu slotları başarıyla oluşturuldu"}
          </Typography>
          <Typography variant="body2">
            Toplam {bulkCreateResult.toplamSlot} adet randevu slotu başarıyla
            oluşturuldu.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/randevu/slotlar")}
            >
              Randevu Slotları Listesine Git
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default TopluRandevuOlusturForm;
