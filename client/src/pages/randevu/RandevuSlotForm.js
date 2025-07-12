import React, { useState, useEffect, useMemo } from "react";
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
  FormHelperText,
  Divider,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { tr } from "date-fns/locale";
import { format, addMinutes } from "date-fns";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import {
  addRandevuSlot,
  updateRandevuSlot,
  getRandevuSlotById,
} from "../../redux/randevuSlot/randevuSlotSlice";
import { getActiveRandevuTanimlari } from "../../redux/randevuTanimi/randevuTanimiSlice";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import { getActiveCariler } from "../../redux/cari/cariSlice";
import LoadingBox from "../../components/LoadingBox";
import LoadingButton from "../../components/LoadingButton";

const RandevuSlotForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux store'dan verileri daha güvenli bir şekilde çekelim
  const randevuSlotState = useSelector((state) => state.randevuSlot) || {};
  const { currentRandevuSlot, loading } = randevuSlotState;

  const randevuTanimiState = useSelector((state) => state.randevuTanimi) || {};
  const {
    randevuTanimlari = [],
    activeRandevuTanimlari = [],
    loading: tanimlarLoading = false,
  } = randevuTanimiState;

  const kisiState = useSelector((state) => state.kisi) || {};
  const { kisiler = [] } = kisiState;

  const cariState = useSelector((state) => state.cari) || {};
  const { cariler = [] } = cariState;

  // Redux store'dan veriyi daha güvenli şekilde almak ve yerel değişkene kaydetmek için
  const [localRandevuTanimlari, setLocalRandevuTanimlari] = useState([]);

  const [formData, setFormData] = useState({
    randevuTanimi_id: "",
    tarih: null,
    baslangicZamani: null,
    bitisZamani: null,
    durum: "Açık",
    aciklama: "",
    kisi_id: "",
    cari_id: "",
    notlar: "",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Sayfa yüklendiğinde tanımları ve diğer verileri yükle - veri yükleme sırasını düzenliyoruz
  useEffect(() => {
    console.log("RandevuSlotForm: Randevu tanımları yükleniyor...");

    // İlk olarak sadece randevu tanımlarını getir
    dispatch(getActiveRandevuTanimlari())
      .then((response) => {
        console.log("Randevu tanımları cevabı:", response);
        if (response.payload && response.payload.length > 0) {
          // Yerel state'e aktarıyoruz, böylece Redux'ta sorun olsa bile elimizde veri olur
          setLocalRandevuTanimlari(response.payload);
        }

        // Ardından diğer verileri yükle
        return Promise.all([
          dispatch(getActiveKisiler()),
          dispatch(getActiveCariler()),
        ]);
      })
      .catch((err) => {
        console.error("Randevu tanımları yüklenirken hata:", err);
      });

    if (id) {
      dispatch(getRandevuSlotById(id));
    }
  }, [dispatch, id]);

  // Görüntülenecek randevu tanımları için alternatif ve daha güvenli bir mekanizma
  const displayRandevuTanimlari = useMemo(() => {
    // Önce yerel state'e bakalım
    if (localRandevuTanimlari.length > 0) {
      return localRandevuTanimlari;
    }

    // Sonra Redux'taki verilere bakalım
    if (activeRandevuTanimlari && activeRandevuTanimlari.length > 0) {
      return activeRandevuTanimlari;
    }

    if (randevuTanimlari && randevuTanimlari.length > 0) {
      return randevuTanimlari;
    }

    // Hiç veri yoksa boş dizi döndürelim
    return [];
  }, [localRandevuTanimlari, activeRandevuTanimlari, randevuTanimlari]);

  // Tanımlar yüklendiğinde debug için log basar
  useEffect(() => {
    if (displayRandevuTanimlari.length > 0) {
      console.log(
        `RandevuSlotForm: ${displayRandevuTanimlari.length} randevu tanımı gösterime hazır`
      );
      console.log("Tanımlar:", displayRandevuTanimlari);
    }
  }, [displayRandevuTanimlari]);

  // Eğer tanımlar boşsa ve yükleme tamamlandıysa, tekrar yüklemeyi dene
  useEffect(() => {
    if (!tanimlarLoading && displayRandevuTanimlari.length === 0) {
      console.log(
        "RandevuSlotForm: Randevu tanımları bulunamadı, tekrar yükleniyor..."
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

  // Slot verilerini yükle (düzenleme durumunda)
  useEffect(() => {
    if (id && currentRandevuSlot) {
      setFormData({
        randevuTanimi_id: currentRandevuSlot.randevuTanimi_id?._id || "",
        tarih: currentRandevuSlot.tarih
          ? new Date(currentRandevuSlot.tarih)
          : null,
        baslangicZamani: currentRandevuSlot.baslangicZamani
          ? new Date(currentRandevuSlot.baslangicZamani)
          : null,
        bitisZamani: currentRandevuSlot.bitisZamani
          ? new Date(currentRandevuSlot.bitisZamani)
          : null,
        durum: currentRandevuSlot.durum || "Açık",
        aciklama: currentRandevuSlot.aciklama || "",
        kisi_id: currentRandevuSlot.kisi_id?._id || "",
        cari_id: currentRandevuSlot.cari_id?._id || "",
        notlar: currentRandevuSlot.notlar || "",
        isActive:
          currentRandevuSlot.isActive !== undefined
            ? currentRandevuSlot.isActive
            : true,
      });
    }
  }, [id, currentRandevuSlot]);

  // Randevu tanımı seçildiğinde slot süresini otomatik hesapla
  useEffect(() => {
    if (formData.randevuTanimi_id && formData.baslangicZamani) {
      const selectedTanim = randevuTanimlari.find(
        (tanim) => tanim._id === formData.randevuTanimi_id
      );
      if (selectedTanim) {
        const slotSuresiDk = selectedTanim.slotSuresiDk || 30;
        const bitisZamani = addMinutes(
          new Date(formData.baslangicZamani),
          slotSuresiDk
        );
        setFormData((prevData) => ({
          ...prevData,
          bitisZamani,
        }));
      }
    }
  }, [formData.randevuTanimi_id, formData.baslangicZamani, randevuTanimlari]);

  // Form değişikliklerini işle
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

  // Tarih değişikliğini işle
  const handleDateChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
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

    if (!formData.randevuTanimi_id) {
      errors.randevuTanimi_id = "Randevu tanımı seçmelisiniz";
    }

    if (!formData.tarih) {
      errors.tarih = "Randevu tarihi seçmelisiniz";
    }

    if (!formData.baslangicZamani) {
      errors.baslangicZamani = "Başlangıç zamanı seçmelisiniz";
    }

    if (!formData.bitisZamani) {
      errors.bitisZamani = "Bitiş zamanı seçmelisiniz";
    }

    if (formData.baslangicZamani && formData.bitisZamani) {
      if (
        new Date(formData.baslangicZamani) >= new Date(formData.bitisZamani)
      ) {
        errors.bitisZamani =
          "Bitiş zamanı başlangıç zamanından sonra olmalıdır";
      }
    }

    if (!formData.durum) {
      errors.durum = "Durum seçmelisiniz";
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
      // Tarihlerin formatını düzelt
      const slotData = {
        ...formData,
        // ISO string yerine yyyy-MM-dd formatında gönder
        tarih: formData.tarih
          ? format(new Date(formData.tarih), "yyyy-MM-dd")
          : null,
        baslangicZamani: formData.baslangicZamani
          ? formData.baslangicZamani
          : null,
        bitisZamani: formData.bitisZamani ? formData.bitisZamani : null,
      };

      if (id) {
        // Güncelleme
        await dispatch(updateRandevuSlot({ id, slotData })).unwrap();
        toast.success("Randevu slotu başarıyla güncellendi");
      } else {
        // Yeni ekleme
        await dispatch(addRandevuSlot(slotData)).unwrap();
        // ÇİFT BİLDİRİMİ ENGELLEMEK İÇİN KALDIRILDI
      }

      navigate("/randevu/slotlar");
    } catch (error) {
      toast.error(error?.msg || "İşlem sırasında bir hata oluştu");
      console.error("Form gönderim hatası:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Yükleniyor durumunu kontrol et
  if (loading && id) {
    return <LoadingBox />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h1">
          {id ? "Randevu Slotu Düzenle" : "Yeni Randevu Slotu"}
        </Typography>
      </Box>

      {/* Randevu tanımları yüklenmediyse uyarı göster */}
      {displayRandevuTanimlari.length === 0 && !tanimlarLoading && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "warning.light" }}>
          <Typography>
            Randevu tanımları yüklenemedi. Lütfen sayfayı yenileyin veya sistem
            yöneticinize başvurun.
          </Typography>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                error={Boolean(
                  touchedFields.randevuTanimi_id && formErrors.randevuTanimi_id
                )}
              >
                <InputLabel id="randevu-tanimi-label">
                  Randevu Tanımı
                </InputLabel>
                <Select
                  labelId="randevu-tanimi-label"
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
                {touchedFields.randevuTanimi_id &&
                  formErrors.randevuTanimi_id && (
                    <FormHelperText>
                      {formErrors.randevuTanimi_id}
                    </FormHelperText>
                  )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={tr}
              >
                <DatePicker
                  label="Tarih"
                  value={formData.tarih}
                  onChange={(date) => handleDateChange("tarih", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={Boolean(touchedFields.tarih && formErrors.tarih)}
                      helperText={touchedFields.tarih && formErrors.tarih}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={tr}
              >
                <TimePicker
                  label="Başlangıç Zamanı"
                  value={formData.baslangicZamani}
                  onChange={(time) => handleDateChange("baslangicZamani", time)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={Boolean(
                        touchedFields.baslangicZamani &&
                          formErrors.baslangicZamani
                      )}
                      helperText={
                        touchedFields.baslangicZamani &&
                        formErrors.baslangicZamani
                      }
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={tr}
              >
                <TimePicker
                  label="Bitiş Zamanı"
                  value={formData.bitisZamani}
                  onChange={(time) => handleDateChange("bitisZamani", time)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={Boolean(
                        touchedFields.bitisZamani && formErrors.bitisZamani
                      )}
                      helperText={
                        touchedFields.bitisZamani && formErrors.bitisZamani
                      }
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                error={Boolean(touchedFields.durum && formErrors.durum)}
              >
                <InputLabel id="durum-label">Durum</InputLabel>
                <Select
                  labelId="durum-label"
                  name="durum"
                  value={formData.durum}
                  onChange={handleChange}
                  label="Durum"
                >
                  <MenuItem value="Açık">Açık</MenuItem>
                  <MenuItem value="Rezerve">Rezerve</MenuItem>
                  <MenuItem value="Kapalı">Kapalı</MenuItem>
                </Select>
                {touchedFields.durum && formErrors.durum && (
                  <FormHelperText>{formErrors.durum}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Açıklama"
                name="aciklama"
                value={formData.aciklama}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Rezervasyon Bilgileri
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="kisi-label">İlgili Kişi</InputLabel>
                <Select
                  labelId="kisi-label"
                  name="kisi_id"
                  value={formData.kisi_id}
                  onChange={handleChange}
                  label="İlgili Kişi"
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {kisiler.map((kisi) => (
                    <MenuItem key={kisi._id} value={kisi._id}>
                      {kisi.ad} {kisi.soyad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="cari-label">İlgili Cari</InputLabel>
                <Select
                  labelId="cari-label"
                  name="cari_id"
                  value={formData.cari_id}
                  onChange={handleChange}
                  label="İlgili Cari"
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {cariler.map((cari) => (
                    <MenuItem key={cari._id} value={cari._id}>
                      {cari.cariAd}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notlar"
                name="notlar"
                value={formData.notlar}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Randevu ile ilgili notlarınızı buraya girebilirsiniz"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/randevu/slotlar")}
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

export default RandevuSlotForm;
