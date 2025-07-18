import React from "react";
import { Box, Typography, Chip, Paper, Divider, Grid, Button, Tooltip } from "@mui/material";
// import { useSelector, useDispatch } from "react-redux";
// import { getTalepById, addYorum, atamaYap, dosyaEkle } from "../../redux/talep/talepSlice";

const TalepDetail = ({ talep }) => {
  // const { talepler, loading } = useSelector((state) => state.talep);
  // const dispatch = useDispatch();

  if (!talep) return <Typography>Talep bulunamadı.</Typography>;

  return (
    <Paper sx={{ p: 3, maxWidth: 900, margin: "0 auto" }} elevation={3}>
      <Typography variant="h5" gutterBottom>Talep Detayı</Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Açıklama:</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{talep.talep_aciklama}</Typography>
          <Typography variant="subtitle2">Kaynak:</Typography>
          <Chip label={talep.kaynak} color="primary" sx={{ mb: 2 }} />
          <Typography variant="subtitle2">Öncelik:</Typography>
          <Chip label={talep.oncelik} color="secondary" sx={{ mb: 2 }} />
          <Typography variant="subtitle2">Durum:</Typography>
          <Chip label={talep.durum} color={talep.durum === "kapalı" ? "success" : "warning"} sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2">Kayıt Tarihi:</Typography>
          <Typography variant="body2">{talep.kayit_tarihi ? new Date(talep.kayit_tarihi).toLocaleString() : '-'}</Typography>
          <Typography variant="subtitle2">Bitiş Tarihi:</Typography>
          <Typography variant="body2">{talep.bitis_tarihi ? new Date(talep.bitis_tarihi).toLocaleString() : '-'}</Typography>
          <Typography variant="subtitle2">Atanan Kullanıcı:</Typography>
          <Typography variant="body2">{talep.atanan_user_id || '-'}</Typography>
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />
      {/* Yorumlar, dosyalar, log, atama, işlem butonları burada olacak */}
      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button variant="contained" color="primary">Atama Yap</Button>
        <Button variant="outlined" color="secondary">Yorum Ekle</Button>
        <Button variant="outlined" color="info">Dosya Ekle</Button>
        <Tooltip title="Talebi kapat">
          <Button variant="contained" color="success">Kapat</Button>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default TalepDetail;
