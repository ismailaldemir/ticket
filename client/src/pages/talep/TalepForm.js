import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
// import { useDispatch, useSelector } from "react-redux";
// import notificationService from "../../services/notificationService";

const kaynaklar = [
  { value: "telefon", label: "Telefon" },
  { value: "mail", label: "Mail" },
  { value: "diger", label: "Diğer" },
];
const oncelikler = [
  { value: "dusuk", label: "Düşük" },
  { value: "orta", label: "Orta" },
  { value: "yuksek", label: "Yüksek" },
  { value: "kritik", label: "Kritik" },
];

const TalepForm = () => {
  // const dispatch = useDispatch();
  // const { projeler, subeler, slaList } = useSelector(...);
  const [form, setForm] = useState({
    talepAciklama: "",
    kaynak: "telefon",
    projeId: "",
    subeId: "",
    slaId: "",
    oncelik: "orta",
    kayitTarihi: "",
    bitisTarihi: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // dispatch(createTalep(form));
    // notificationService.success("Talep başarıyla oluşturuldu");
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, margin: "0 auto" }}>
      <Typography variant="h6" gutterBottom>Yeni Talep Oluştur</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Talep Açıklaması"
              name="talepAciklama"
              value={form.talepAciklama}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Kaynak</InputLabel>
              <Select name="kaynak" value={form.kaynak} onChange={handleChange} label="Kaynak">
                {kaynaklar.map((k) => (
                  <MenuItem key={k.value} value={k.value}>{k.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Öncelik</InputLabel>
              <Select name="oncelik" value={form.oncelik} onChange={handleChange} label="Öncelik">
                {oncelikler.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Proje"
              name="projeId"
              value={form.projeId}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Şube"
              name="subeId"
              value={form.subeId}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="SLA"
              name="slaId"
              value={form.slaId}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Kayıt Tarihi"
              name="kayitTarihi"
              type="date"
              value={form.kayitTarihi}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Bitiş Tarihi"
              name="bitisTarihi"
              type="date"
              value={form.bitisTarihi}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, textAlign: "right" }}>
          <Button type="submit" variant="contained" color="primary">Talep Oluştur</Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default TalepForm;
