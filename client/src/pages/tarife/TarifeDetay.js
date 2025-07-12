import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MonetizationOn as MoneyIcon,
} from "@mui/icons-material";
import { formatDate, formatCurrency } from "../../utils/exportService";
import { getTarifeById } from "../../redux/tarife/tarifeSlice";
import { getUcretlerByTarife, deleteUcret } from "../../redux/ucret/ucretSlice";
import { toast } from "react-toastify";

const TarifeDetay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentTarife, loading: tarifeLoading } = useSelector(
    (state) => state.tarife
  );
  const { ucretler, loading: ucretLoading } = useSelector(
    (state) => state.ucret
  );

  // Silme işlemi için state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ucretToDelete, setUcretToDelete] = useState(null);

  useEffect(() => {
    // Tarife bilgilerini getir
    if (id) {
      dispatch(getTarifeById(id));
      dispatch(getUcretlerByTarife(id));
    }
  }, [dispatch, id]);

  if (tarifeLoading) {
    return <Typography>Yükleniyor...</Typography>;
  }

  if (!currentTarife) {
    return <Typography>Tarife bulunamadı</Typography>;
  }

  // Ücret silme işlemi
  const handleDeleteClick = (ucret) => {
    setUcretToDelete(ucret);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (ucretToDelete) {
      try {
        await dispatch(deleteUcret(ucretToDelete._id)).unwrap();
        toast.success(`${ucretToDelete.ad} ücreti silindi`);
        // Silme işleminden sonra listeyi yeniden yükle
        dispatch(getUcretlerByTarife(id));
      } catch (error) {
        toast.error(error.msg || "Ücret silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setUcretToDelete(null);
  };

  // Kullanılabilecek alanları göster
  const renderKullanilabilecekAlanlar = () => {
    const { kullanilabilecekAlanlar } = currentTarife;
    return (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {kullanilabilecekAlanlar?.gelirler && (
          <Chip label="Gelirler" color="success" size="small" />
        )}
        {kullanilabilecekAlanlar?.giderler && (
          <Chip label="Giderler" color="error" size="small" />
        )}
        {kullanilabilecekAlanlar?.borclar && (
          <Chip label="Borçlar" color="primary" size="small" />
        )}
        {kullanilabilecekAlanlar?.odemeler && (
          <Chip label="Ödemeler" color="info" size="small" />
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/tarifeler")}
          sx={{ mr: 2 }}
        >
          Geri
        </Button>
        <Typography variant="h5" component="h1">
          Tarife Detayı: {currentTarife.ad}
        </Typography>
        <Box sx={{ ml: "auto", display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={`/tarifeler/duzenle/${id}`}
          >
            Düzenle
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<MoneyIcon />}
            onClick={() => navigate(`/ucretler/tarife/${id}/ekle`)}
          >
            Ücret Ekle
          </Button>
        </Box>
      </Box>

      {/* Tarife Bilgileri */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tarife Bilgileri
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Kod
            </Typography>
            <Typography variant="body1">{currentTarife.kod}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Ad
            </Typography>
            <Typography variant="body1">{currentTarife.ad}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Birim Ücret
            </Typography>
            <Chip
              label={currentTarife.birimUcret ? "Evet" : "Hayır"}
              color={currentTarife.birimUcret ? "primary" : "default"}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Aylık Ücret
            </Typography>
            <Chip
              label={currentTarife.aylıkUcret ? "Evet" : "Hayır"}
              color={currentTarife.aylıkUcret ? "primary" : "default"}
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Açıklama
            </Typography>
            <Typography variant="body1">
              {currentTarife.aciklama || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Kullanılabilecek Alanlar
            </Typography>
            {renderKullanilabilecekAlanlar()}
          </Grid>
        </Grid>
      </Paper>

      {/* Ücretler Listesi */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Bu Tarifeye Ait Ücretler</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/ucretler/tarife/${id}/ekle`)}
        >
          Yeni Ücret Ekle
        </Button>
      </Box>

      {ucretLoading ? (
        <Typography>Ücretler yükleniyor...</Typography>
      ) : ucretler.length === 0 ? (
        <Alert severity="info">
          Bu tarifeye henüz ücret tanımlanmamış. "Ücret Ekle" butonunu
          kullanarak ücret tanımlayabilirsiniz.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tutar</TableCell>
                <TableCell>Başlangıç Tarihi</TableCell>
                <TableCell>Bitiş Tarihi</TableCell>
                <TableCell>Birim Ücret</TableCell>
                <TableCell>Aylık Ücret</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ucretler.map((ucret) => (
                <TableRow key={ucret._id}>
                  <TableCell>{formatCurrency(ucret.tutar)}</TableCell>
                  <TableCell>{formatDate(ucret.baslangicTarihi)}</TableCell>
                  <TableCell>
                    {ucret.bitisTarihi
                      ? formatDate(ucret.bitisTarihi)
                      : "Süresiz"}
                  </TableCell>
                  <TableCell>
                    {ucret.birimUcret ? (
                      <CheckCircleIcon color="primary" fontSize="small" />
                    ) : (
                      <CancelIcon color="disabled" fontSize="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {ucret.aylıkUcret ? (
                      <CheckCircleIcon color="primary" fontSize="small" />
                    ) : (
                      <CancelIcon color="disabled" fontSize="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ucret.isActive ? "Aktif" : "Pasif"}
                      color={ucret.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Düzenle">
                        <IconButton
                          color="primary"
                          component={Link}
                          to={`/ucretler/tarife/${id}/duzenle/${ucret._id}`}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(ucret)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Silme diyaloğu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Ücreti Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {ucretToDelete && (
              <>
                "{ucretToDelete.ad}" ücretini silmek istediğinize emin misiniz?
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TarifeDetay;
