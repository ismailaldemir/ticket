import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { format } from "date-fns";

import { createRezervasyon } from "../../redux/randevuSlot/randevuSlotSlice";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import { getActiveCariler } from "../../redux/cari/cariSlice";
import LoadingButton from "../LoadingButton";

const RandevuRezervasyonForm = ({ open, onClose, slot }) => {
  const dispatch = useDispatch();
  const { kisiler = [] } = useSelector((state) => state.kisi) || {};
  const { cariler = [] } = useSelector((state) => state.cari) || {};

  // Güvenli selector kullanımı - undefined kontrolü ve varsayılan değer eklendi
  const randevuSlotState = useSelector((state) => state.randevuSlot) || {};
  const { loading = false } = randevuSlotState;

  const [formData, setFormData] = useState({
    rezervasyonTipi: "kisi", // "kisi" veya "cari"
    kisi_id: "",
    cari_id: "",
    notlar: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      // Eğer hali hazırda atanmış bir kişi veya cari varsa, formu ona göre doldur
      if (slot) {
        if (slot.kisi_id) {
          setFormData({
            rezervasyonTipi: "kisi",
            kisi_id: slot.kisi_id._id,
            cari_id: "",
            notlar: slot.notlar || "",
          });
        } else if (slot.cari_id) {
          setFormData({
            rezervasyonTipi: "cari",
            kisi_id: "",
            cari_id: slot.cari_id._id,
            notlar: slot.notlar || "",
          });
        } else {
          // Yeni rezervasyon
          setFormData({
            rezervasyonTipi: "kisi",
            kisi_id: "",
            cari_id: "",
            notlar: "",
          });
        }
      }

      // Kişi ve cari listelerini yükle
      dispatch(getActiveKisiler());
      dispatch(getActiveCariler());
    }
  }, [open, slot, dispatch]);

  const validateForm = () => {
    const errors = {};

    if (formData.rezervasyonTipi === "kisi" && !formData.kisi_id) {
      errors.kisi_id = "Lütfen bir kişi seçin";
    }

    if (formData.rezervasyonTipi === "cari" && !formData.cari_id) {
      errors.cari_id = "Lütfen bir cari seçin";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Rezervasyon tipi değiştiğinde ilgili alanı sıfırla
    if (name === "rezervasyonTipi") {
      setFormData({
        ...formData,
        [name]: value,
        kisi_id: value === "kisi" ? formData.kisi_id : "",
        cari_id: value === "cari" ? formData.cari_id : "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // İlgili hata mesajını temizle
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Rezervasyon verilerini hazırla
      const rezervasyonData = {
        durum: "Rezerve",
        notlar: formData.notlar,
      };

      // Kişi veya cari ID'sini ekle
      if (formData.rezervasyonTipi === "kisi") {
        rezervasyonData.kisi_id = formData.kisi_id;
      } else {
        rezervasyonData.cari_id = formData.cari_id;
      }

      // Rezervasyon işlemini gerçekleştir
      await dispatch(
        createRezervasyon({
          id: slot._id,
          rezervasyonData,
        })
      ).unwrap();

      // Başarılı işlem sonrası formu kapat
      onClose(true); // Güncelleme yapıldığı bilgisiyle kapat
    } catch (error) {
      console.error("Rezervasyon yapılırken hata:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return format(new Date(date), "dd.MM.yyyy");
  };

  const formatTime = (date) => {
    if (!date) return "";
    return format(new Date(date), "HH:mm");
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>Randevu Rezervasyonu</DialogTitle>

      <DialogContent dividers>
        {slot && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Randevu Bilgileri
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  Tarih:
                </Typography>
                <Typography variant="body1">
                  {formatDate(slot.tarih)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  Saat:
                </Typography>
                <Typography variant="body1">
                  {formatTime(slot.baslangicZamani)} -{" "}
                  {formatTime(slot.bitisZamani)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">
                  Tanım:
                </Typography>
                <Typography variant="body1">
                  {slot.randevuTanimi_id?.ad}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Rezervasyon Detayları
          </Typography>

          <FormControl component="fieldset" margin="normal">
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Rezervasyon Tipi
            </Typography>
            <RadioGroup
              row
              name="rezervasyonTipi"
              value={formData.rezervasyonTipi}
              onChange={handleChange}
            >
              <FormControlLabel value="kisi" control={<Radio />} label="Kişi" />
              <FormControlLabel value="cari" control={<Radio />} label="Cari" />
            </RadioGroup>
          </FormControl>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {formData.rezervasyonTipi === "kisi" && (
              <Grid item xs={12}>
                <FormControl fullWidth error={Boolean(errors.kisi_id)}>
                  <InputLabel>İlgili Kişi</InputLabel>
                  <Select
                    name="kisi_id"
                    value={formData.kisi_id}
                    onChange={handleChange}
                    label="İlgili Kişi"
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {kisiler?.map((kisi) => (
                      <MenuItem key={kisi._id} value={kisi._id}>
                        {kisi.ad} {kisi.soyad}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.kisi_id && (
                    <FormHelperText>{errors.kisi_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            {formData.rezervasyonTipi === "cari" && (
              <Grid item xs={12}>
                <FormControl fullWidth error={Boolean(errors.cari_id)}>
                  <InputLabel>İlgili Cari</InputLabel>
                  <Select
                    name="cari_id"
                    value={formData.cari_id}
                    onChange={handleChange}
                    label="İlgili Cari"
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {cariler?.map((cari) => (
                      <MenuItem key={cari._id} value={cari._id}>
                        {cari.cariAd}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.cari_id && (
                    <FormHelperText>{errors.cari_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

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
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose(false)}>İptal</Button>
        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Rezervasyon Yap
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default RandevuRezervasyonForm;
