import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Note as NoteIcon,
} from "@mui/icons-material";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { getUyeById, deleteUye } from "../../redux/uye/uyeSlice";
import { toast } from "react-toastify";
import TelefonListesi from "../../components/kisi/TelefonListesi";
import AdresListesi from "../../components/kisi/AdresListesi";
import EmailListesi from "../../components/common/EmailListesi";

const UyeDetay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { uye, loading } = useSelector((state) => state.uye);

  useEffect(() => {
    if (id) {
      dispatch(getUyeById(id));
    }
  }, [id, dispatch]);

  const handleDelete = async () => {
    if (window.confirm("Bu üyeyi silmek istediğinize emin misiniz?")) {
      try {
        await dispatch(deleteUye(id)).unwrap();
        navigate("/uyeler");
      } catch (error) {
        if (!error?.msg) {
          toast.error("Silme işlemi sırasında bir hata oluştu");
        }
      }
    }
  };

  // Duruma göre renk belirle
  const getDurumColor = (durum) => {
    switch (durum) {
      case "Aktif":
        return "success";
      case "Pasif":
        return "default";
      case "Askıda":
        return "warning";
      case "İptal":
        return "error";
      default:
        return "default";
    }
  };

  // Tarihi formatla
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: tr });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!uye) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Üye bulunamadı
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/uyeler")}
          sx={{ mt: 2 }}
        >
          Listeye Dön
        </Button>
      </Box>
    );
  }

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            color="primary"
            onClick={() => navigate("/uyeler")}
            size="small"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Üye Detayları
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to={`/uyeler/duzenle/${id}`}
            startIcon={<EditIcon />}
          >
            Düzenle
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
            startIcon={<DeleteIcon />}
          >
            Sil
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Genel Bilgiler */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  color="primary"
                  gutterBottom
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BadgeIcon color="primary" />
                    Üye Bilgileri
                  </Box>
                </Typography>
                <Chip
                  label={uye.isActive ? "Aktif" : "Pasif"}
                  color={uye.isActive ? "success" : "default"}
                  size="small"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <BadgeIcon color="action" fontSize="small" />
                <Typography variant="subtitle1" fontWeight="bold">
                  {uye.uyeNo || "-"}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Durumu
                  </Typography>
                  <Chip
                    label={uye.durumu}
                    color={getDurumColor(uye.durumu)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Karar No
                  </Typography>
                  <Typography variant="body1">
                    {uye.kayitKararNo || "-"}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Üyelik Başlangıç
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(uye.baslangicTarihi)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Üyelik Bitiş
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(uye.bitisTarihi) || "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Kayıt Tarihi
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(uye.kayitTarihi)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Üye Rolü
                  </Typography>
                  <Typography variant="body1">
                    {uye.uyeRol_id ? uye.uyeRol_id.ad : "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Şube
                  </Typography>
                  <Typography variant="body1">
                    {uye.sube_id ? uye.sube_id.ad : "-"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Kişi Bilgileri */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  color="primary"
                  gutterBottom
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon color="primary" />
                    Kişi Bilgileri
                  </Box>
                </Typography>

                {uye.kisi_id && (
                  <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    to={`/kisiler/duzenle/${uye.kisi_id._id}`}
                  >
                    Kişi Detayları
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              {uye.kisi_id ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Ad Soyad
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {`${uye.kisi_id.ad} ${uye.kisi_id.soyad}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Doğum Yeri
                    </Typography>
                    <Typography variant="body1">
                      {uye.kisi_id.dogumYeri || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Doğum Tarihi
                    </Typography>
                    <Typography variant="body1">
                      {uye.kisi_id.dogumTarihi ? format(new Date(uye.kisi_id.dogumTarihi), "dd.MM.yyyy") : "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Cinsiyet
                    </Typography>
                    <Typography variant="body1">
                      {uye.kisi_id.cinsiyet || "-"}
                    </Typography>
                  </Grid>
                  {/* Telefonlar */}
                  <Grid item xs={12}>
                    <TelefonListesi kisiId={uye.kisi_id._id} />
                  </Grid>
                  {/* E-postalar */}
                  <Grid item xs={12}>
                    <EmailListesi referansTur="Kisi" referansId={uye.kisi_id._id} />
                  </Grid>
                  {/* Adresler */}
                  <Grid item xs={12}>
                    <AdresListesi kisiId={uye.kisi_id._id} />
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body1" color="error">
                  Kişi bilgisi bulunamadı
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Açıklama */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <NoteIcon color="primary" />
                Açıklama
              </Box>
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">
              {uye.aciklama || "Açıklama bulunmuyor."}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UyeDetay;
