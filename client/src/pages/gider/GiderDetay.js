import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Fade,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  PointOfSale as PointOfSaleIcon,
  CalendarToday as CalendarIcon,
  ReceiptLong as ReceiptLongIcon,
} from "@mui/icons-material";
import {
  getGiderById,
  getGiderDetaylari,
  addGiderDetay,
  deleteGiderDetay,
} from "../../redux/gider/giderSlice";
import { getUcretlerByKullanimAlani } from "../../redux/ucret/ucretSlice";
import { toast } from "react-toastify";

const GiderDetay = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { gider, giderDetaylari, loading, error } = useSelector(
    (state) => state.gider
  );
  const { ucretler } = useSelector((state) => state.ucret);

  // Detay ekleme için state
  const [yeniDetay, setYeniDetay] = useState({
    ucret_id: "",
    miktar: 1,
    birimFiyat: 0,
    toplamTutar: 0,
  });

  // Silme işlemi için state
  const [detayToDelete, setDetayToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getGiderById(id));
      dispatch(getGiderDetaylari(id));
      dispatch(getUcretlerByKullanimAlani("giderler"));
    }
  }, [id, dispatch]);

  // Ücret seçildiğinde birim fiyatı güncelle
  useEffect(() => {
    if (yeniDetay.ucret_id) {
      const seciliUcret = ucretler.find((u) => u._id === yeniDetay.ucret_id);
      if (seciliUcret) {
        const birimFiyat = seciliUcret.tutar;
        const toplamTutar = birimFiyat * yeniDetay.miktar;
        setYeniDetay((prev) => ({
          ...prev,
          birimFiyat,
          toplamTutar,
        }));
      }
    }
  }, [yeniDetay.ucret_id, yeniDetay.miktar, ucretler]);

  const handleDetayChange = (e) => {
    const { name, value } = e.target;
    const numericValue =
      name === "miktar" || name === "birimFiyat"
        ? parseFloat(value) || 0
        : value;

    setYeniDetay((prev) => {
      const yeni = {
        ...prev,
        [name]: numericValue,
      };

      // Miktar veya birimFiyat değiştiğinde toplam tutarı güncelle
      if (name === "miktar" || name === "birimFiyat") {
        yeni.toplamTutar = yeni.miktar * yeni.birimFiyat;
      } else if (name === "toplamTutar") {
        // Toplam tutar manuel değiştirilirse birim fiyatı güncelle (miktar sabit)
        if (yeni.miktar !== 0) {
          yeni.birimFiyat = numericValue / yeni.miktar;
        }
      }

      return yeni;
    });
  };

  const handleDetayEkle = async () => {
    if (!yeniDetay.ucret_id) {
      toast.error("Lütfen bir ücret türü seçin");
      return;
    }

    if (yeniDetay.miktar <= 0) {
      toast.error("Miktar 0 veya negatif olamaz");
      return;
    }

    if (yeniDetay.toplamTutar <= 0) {
      toast.error("Toplam tutar 0 veya negatif olamaz");
      return;
    }

    try {
      const giderDetayData = {
        gider_id: id,
        ucret_id: yeniDetay.ucret_id,
        miktar: yeniDetay.miktar,
        birimFiyat: yeniDetay.birimFiyat,
        toplamTutar: yeniDetay.toplamTutar,
      };

      await dispatch(addGiderDetay(giderDetayData)).unwrap();

      // Formu sıfırla
      setYeniDetay({
        ucret_id: "",
        miktar: 1,
        birimFiyat: 0,
        toplamTutar: 0,
      });
    } catch (error) {
      console.error("Gider detayı eklenirken hata oluştu:", error);
    }
  };

  // Silme işlemi
  const handleDeleteClick = (detay) => {
    setDetayToDelete(detay);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (detayToDelete) {
      try {
        await dispatch(deleteGiderDetay(detayToDelete._id)).unwrap();
        toast.success("Gider detayı silindi");
      } catch (error) {
        toast.error(error.msg || "Gider detayı silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setDetayToDelete(null);
  };

  if (loading && !gider) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error.msg || "Gider detayları yüklenirken bir hata oluştu."}
        </Alert>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/giderler")}
          sx={{ mt: 2 }}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  if (!gider) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Gider kaydı bulunamadı.</Alert>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/giderler")}
          sx={{ mt: 2 }}
        >
          Geri Dön
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
        <Typography variant="h5" component="h1">
          Gider Detayları
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={`/giderler/duzenle/${id}`}
          >
            Gideri Düzenle
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/giderler")}
          >
            Geri Dön
          </Button>
        </Box>
      </Box>

      <Fade in={!!gider} timeout={500}>
        <Grid container spacing={3}>
          {/* Gider Özet Bilgileri */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Kasa
                      </Typography>
                      <Typography variant="h6" component="div">
                        {gider.kasa_id?.kasaAdi || "Belirtilmemiş"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Gider Türü
                      </Typography>
                      <Chip
                        icon={<ReceiptIcon />}
                        label={gider.giderTuru}
                        color={
                          gider.giderTuru === "Fatura Ödemeleri"
                            ? "error"
                            : gider.giderTuru === "Kurum Ödemeleri"
                            ? "warning"
                            : gider.giderTuru === "Şahıs Ödemeleri"
                            ? "info"
                            : "default"
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Tarih
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarIcon color="action" />
                        <Typography variant="h6" component="div">
                          {new Date(gider.tarih).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Son Ödeme Tarihi
                      </Typography>
                      {gider.sonOdemeTarihi ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarIcon color="warning" />
                          <Typography variant="h6" component="div">
                            {new Date(
                              gider.sonOdemeTarihi
                            ).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Belirtilmemiş
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent
                      sx={{ bgcolor: (theme) => theme.palette.error.light }}
                    >
                      <Typography color="textSecondary" gutterBottom>
                        Toplam Tutar
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PointOfSaleIcon color="error" />
                        <Typography
                          variant="h6"
                          component="div"
                          color="error.dark"
                        >
                          ₺{gider.toplamTutar.toFixed(2)}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography color="textSecondary" gutterBottom>
                    Ödeme Türü
                  </Typography>
                  <Typography variant="body1">{gider.odemeTuru}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography color="textSecondary" gutterBottom>
                    Belge No
                  </Typography>
                  <Typography variant="body1">
                    {gider.belgeNo || "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography color="textSecondary" gutterBottom>
                    Gider Yeri
                  </Typography>
                  <Typography variant="body1">{gider.giderYeri}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography color="textSecondary" gutterBottom>
                    Durum
                  </Typography>
                  <Chip
                    label={gider.isActive ? "Aktif" : "Pasif"}
                    color={gider.isActive ? "success" : "error"}
                    size="small"
                  />
                </Grid>

                {gider.aciklama && (
                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      Açıklama
                    </Typography>
                    <Typography variant="body1">{gider.aciklama}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* Yeni Detay Ekleme Formu */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Yeni Detay Ekle
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Ücret Türü*</InputLabel>
                    <Select
                      name="ucret_id"
                      value={yeniDetay.ucret_id}
                      onChange={handleDetayChange}
                      label="Ücret Türü*"
                    >
                      {ucretler.map((ucret) => (
                        <MenuItem key={ucret._id} value={ucret._id}>
                          {ucret.tarife_id?.ad || "Tarife Tanımlanmamış"} -
                          {ucret.tutar ? `₺${ucret.tutar.toFixed(2)}` : "₺0.00"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Miktar*"
                    name="miktar"
                    type="number"
                    value={yeniDetay.miktar}
                    onChange={handleDetayChange}
                    inputProps={{ min: 1, step: "1" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Birim Fiyat (₺)*"
                    name="birimFiyat"
                    type="number"
                    value={yeniDetay.birimFiyat}
                    onChange={handleDetayChange}
                    inputProps={{ min: 0, step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Toplam Tutar (₺)*"
                    name="toplamTutar"
                    type="number"
                    value={yeniDetay.toplamTutar}
                    onChange={handleDetayChange}
                    inputProps={{ min: 0, step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleDetayEkle}
                    disabled={
                      !yeniDetay.ucret_id ||
                      yeniDetay.miktar <= 0 ||
                      yeniDetay.toplamTutar <= 0 ||
                      loading
                    }
                    fullWidth
                  >
                    Detay Ekle
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Detay Listesi */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Detaylar
                </Typography>
                <Chip
                  icon={<ReceiptLongIcon />}
                  label={`${giderDetaylari.length} Detay`}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : giderDetaylari.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tarife</TableCell>
                        <TableCell align="right">Miktar</TableCell>
                        <TableCell align="right">Birim Fiyat (₺)</TableCell>
                        <TableCell align="right">Toplam Tutar (₺)</TableCell>
                        <TableCell align="center">İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {giderDetaylari.map((detay) => (
                        <TableRow key={detay._id}>
                          <TableCell>
                            {detay.ucret_id?.tarife_id?.ad ||
                              "Tarife Tanımlanmamış"}
                          </TableCell>
                          <TableCell align="right">{detay.miktar}</TableCell>
                          <TableCell align="right">
                            ₺{detay.birimFiyat?.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            ₺{detay.toplamTutar?.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Sil">
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteClick(detay)}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow
                        sx={{ bgcolor: (theme) => theme.palette.action.hover }}
                      >
                        <TableCell colSpan={3} align="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            Toplam:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            color="error.main"
                          >
                            ₺{gider.toplamTutar?.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  Henüz detay eklenmemiş. Yukarıdaki formu kullanarak gider
                  detayları ekleyebilirsiniz.
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Fade>

      {/* Silme onay diyaloğu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Gider Detayını Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu gider detayını silmek istediğinize emin misiniz? Toplam gider
            tutarı güncellenecektir.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            İptal
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GiderDetay;
