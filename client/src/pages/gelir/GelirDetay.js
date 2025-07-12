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
  getGelirById,
  getGelirDetaylari,
  addGelirDetay,
  deleteGelirDetay,
} from "../../redux/gelir/gelirSlice";
import { getUcretlerByKullanimAlani } from "../../redux/ucret/ucretSlice";
import { toast } from "react-toastify";

const GelirDetay = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { gelir, gelirDetaylari, loading, error } = useSelector(
    (state) => state.gelir
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
      dispatch(getGelirById(id));
      dispatch(getGelirDetaylari(id));
      dispatch(getUcretlerByKullanimAlani("gelirler"));
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

      if (name === "miktar" || name === "birimFiyat") {
        yeni.toplamTutar = yeni.miktar * yeni.birimFiyat;
      } else if (name === "toplamTutar") {
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
      const gelirDetayData = {
        gelir_id: id,
        ucret_id: yeniDetay.ucret_id,
        miktar: yeniDetay.miktar,
        birimFiyat: yeniDetay.birimFiyat,
        toplamTutar: yeniDetay.toplamTutar,
      };

      await dispatch(addGelirDetay(gelirDetayData)).unwrap();

      setYeniDetay({
        ucret_id: "",
        miktar: 1,
        birimFiyat: 0,
        toplamTutar: 0,
      });
    } catch (error) {
      console.error("Gelir detayı eklenirken hata oluştu:", error);
    }
  };

  const handleDeleteClick = (detay) => {
    setDetayToDelete(detay);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (detayToDelete) {
      try {
        await dispatch(deleteGelirDetay(detayToDelete._id)).unwrap();
        toast.success("Gelir detayı silindi");
      } catch (error) {
        toast.error(error.msg || "Gelir detayı silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setDetayToDelete(null);
  };

  if (loading && !gelir) {
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
          {error.msg || "Gelir detayları yüklenirken bir hata oluştu."}
        </Alert>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/gelirler")}
          sx={{ mt: 2 }}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  if (!gelir) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Gelir kaydı bulunamadı.</Alert>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/gelirler")}
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
          Gelir Detayları
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={`/gelirler/duzenle/${id}`}
          >
            Geliri Düzenle
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/gelirler")}
          >
            Geri Dön
          </Button>
        </Box>
      </Box>

      <Fade in={!!gelir} timeout={500}>
        <Grid container spacing={3}>
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
                        {gelir.kasa_id?.kasaAdi || "Belirtilmemiş"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Gelir Türü
                      </Typography>
                      <Chip
                        icon={<ReceiptIcon />}
                        label={gelir.gelirTuru}
                        color={
                          gelir.gelirTuru === "Aidat"
                            ? "primary"
                            : gelir.gelirTuru === "Bağış"
                            ? "success"
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
                          {new Date(gelir.tarih).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent
                      sx={{ bgcolor: (theme) => theme.palette.success.light }}
                    >
                      <Typography color="textSecondary" gutterBottom>
                        Toplam Tutar
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PointOfSaleIcon color="success" />
                        <Typography
                          variant="h6"
                          component="div"
                          color="success.dark"
                        >
                          ₺{gelir.toplamTutar.toFixed(2)}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography color="textSecondary" gutterBottom>
                    Tahsilat Türü
                  </Typography>
                  <Typography variant="body1">{gelir.tahsilatTuru}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography color="textSecondary" gutterBottom>
                    Makbuz No
                  </Typography>
                  <Typography variant="body1">
                    {gelir.makbuzNo || "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography color="textSecondary" gutterBottom>
                    Gelir Yeri
                  </Typography>
                  <Typography variant="body1">{gelir.gelirYeri}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography color="textSecondary" gutterBottom>
                    Durum
                  </Typography>
                  <Chip
                    label={gelir.isActive ? "Aktif" : "Pasif"}
                    color={gelir.isActive ? "success" : "error"}
                    size="small"
                  />
                </Grid>

                {gelir.aciklama && (
                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      Açıklama
                    </Typography>
                    <Typography variant="body1">{gelir.aciklama}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Yeni Detay Ekle
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
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
                          {ucret.tarife_id?.ad || "Bilinmeyen Tarife"}
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
                <Grid item xs={12} sm={6} md={2}>
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
                  label={`${gelirDetaylari.length} Detay`}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : gelirDetaylari.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ücret Türü</TableCell>
                        <TableCell align="right">Miktar</TableCell>
                        <TableCell align="right">Birim Fiyat (₺)</TableCell>
                        <TableCell align="right">Toplam Tutar (₺)</TableCell>
                        <TableCell align="center">İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gelirDetaylari.map((detay) => (
                        <TableRow key={detay._id}>
                          <TableCell>
                            {detay.ucret_id
                              ? detay.ucret_id.tarife_id
                                ? `${detay.ucret_id.tarife_id.ad}`
                                : "Tarife Bilgisi Yok"
                              : "Ücret Bilgisi Bulunamadı"}
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
                            color="success.main"
                          >
                            ₺{gelir.toplamTutar?.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  Henüz detay eklenmemiş. Yukarıdaki formu kullanarak gelir
                  detayları ekleyebilirsiniz.
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Fade>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Gelir Detayını Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu gelir detayını silmek istediğinize emin misiniz? Toplam gelir
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

export default GelirDetay;
