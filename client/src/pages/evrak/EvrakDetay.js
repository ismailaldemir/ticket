import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  Description as DescriptionIcon,
  Security as SecurityIcon,
  Download as DownloadIcon,
  Business as BusinessIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Archive as ArchiveIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  Public as PublicIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import DeleteDialog from "../../components/common/DeleteDialog";
import {
  getEvrakById,
  getEvrakEkler,
  deleteEvrak,
  deleteEvrakEk,
} from "../../redux/evrak/evrakSlice";
import { toast } from "react-toastify";
import apiClient from "../../utils/api";
import PreviewModal from "../../components/common/PreviewModal";
import Visibility from "@mui/icons-material/Visibility";

const EvrakDetay = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { evrak, ekler, loading } = useSelector((state) => state.evrak);

  // Silme işlemi için state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteEkDialogOpen, setDeleteEkDialogOpen] = useState(false);
  const [selectedEk, setSelectedEk] = useState(null);
  const [previewEk, setPreviewEk] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getEvrakById(id));
      dispatch(getEvrakEkler(id));
    }
  }, [id, dispatch]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteEvrak(id)).unwrap();
      toast.success("Evrak ve ekleri başarıyla silindi");
      navigate("/evraklar");
    } catch (error) {
      toast.error(error.msg || "Evrak silinirken bir hata oluştu");
    }
    setDeleteDialogOpen(false);
  };

  const handleDeleteEkClick = (ek) => {
    setSelectedEk(ek);
    setDeleteEkDialogOpen(true);
  };

  const handleDeleteEkConfirm = async () => {
    if (selectedEk) {
      try {
        await dispatch(deleteEvrakEk(selectedEk._id)).unwrap();
        toast.success("Evrak eki başarıyla silindi");
      } catch (error) {
        toast.error(error.msg || "Evrak eki silinirken bir hata oluştu");
      }
    }
    setDeleteEkDialogOpen(false);
    setSelectedEk(null);
  };

  const handleDownloadEk = async (ek) => {
    try {
      const response = await apiClient.get(`/evraklar/indir/${ek._id}`, {
        responseType: "blob",
      });

      // Dosyayı indir
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", ek.orijinalDosyaAdi);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Dosya indirme hatası:", error);
      toast.error("Dosya indirilemedi");
    }
  };

  const handlePreview = (ek) => {
    setPreviewEk(ek);
    setPreviewModalOpen(true);
  };

  // Evrak türüne göre renk belirleme
  const getEvrakTuruColor = (evrakTuru) => {
    switch (evrakTuru) {
      case "Gelen Evrak":
        return "primary";
      case "Giden Evrak":
        return "success";
      default:
        return "default";
    }
  };

  // Gizlilik türüne göre renk belirleme
  const getGizlilikTuruColor = (gizlilikTuru) => {
    switch (gizlilikTuru) {
      case "Kişiye Özel":
        return "error";
      case "Çok Gizli":
        return "error";
      case "Gizli":
        return "warning";
      default:
        return "default";
    }
  };

  // Dosya türüne göre renk belirleme
  const getFileColor = (mimeTur) => {
    if (mimeTur.includes("pdf")) {
      return "error";
    } else if (mimeTur.includes("image")) {
      return "success";
    } else if (mimeTur.includes("word") || mimeTur.includes("document")) {
      return "primary";
    } else if (mimeTur.includes("excel") || mimeTur.includes("sheet")) {
      return "success";
    } else if (mimeTur.includes("zip") || mimeTur.includes("rar")) {
      return "warning";
    } else {
      return "info";
    }
  };

  // Dosya türüne göre simge belirle (EvrakEklerYonetim ile uyumlu)
  const getFileIcon = (mimeTur) => {
    if (mimeTur.includes("pdf")) {
      return <PdfIcon color="error" fontSize="small" />;
    } else if (mimeTur.includes("image")) {
      return <ImageIcon color="success" fontSize="small" />;
    } else if (mimeTur.includes("video")) {
      return <VideoIcon color="primary" fontSize="small" />;
    } else if (mimeTur.includes("audio")) {
      return <AudioIcon color="secondary" fontSize="small" />;
    } else if (
      mimeTur.includes("zip") ||
      mimeTur.includes("rar") ||
      mimeTur.includes("compress")
    ) {
      return <ArchiveIcon color="warning" fontSize="small" />;
    } else {
      return <FileIcon color="info" fontSize="small" />;
    }
  };

  // Dosya boyutunu formatla
  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  if (loading && !evrak) {
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

  if (!evrak) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Evrak bulunamadı.</Alert>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/evraklar")}
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
          Evrak Detayı
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={`/evraklar/duzenle/${id}`}
          >
            Düzenle
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
          >
            Sil
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/evraklar")}
          >
            Geri Dön
          </Button>
        </Box>
      </Box>

      <Fade in={!!evrak} timeout={500}>
        <Box>
          {/* Evrak Detay Kartı */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      icon={<DescriptionIcon />}
                      label={evrak.evrakTuru}
                      color={getEvrakTuruColor(evrak.evrakTuru)}
                    />
                    <Chip
                      icon={<SecurityIcon />}
                      label={evrak.gizlilikTuru}
                      color={getGizlilikTuruColor(evrak.gizlilikTuru)}
                      variant={
                        evrak.gizlilikTuru === "Normal Evrak"
                          ? "outlined"
                          : "filled"
                      }
                    />
                    <Typography variant="body2" color="text.secondary">
                      Kayıt Tarihi:{" "}
                      {new Date(evrak.kayitTarihi).toLocaleString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={evrak.isActive ? "Aktif" : "Pasif"}
                    color={evrak.isActive ? "success" : "error"}
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography color="textSecondary" gutterBottom>
                  Evrak No
                </Typography>
                <Typography variant="body1">{evrak.evrakNo}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography color="textSecondary" gutterBottom>
                  Tarih
                </Typography>
                <Typography variant="body1">
                  {new Date(evrak.tarih).toLocaleDateString()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {evrak.cari_id && (
                  <>
                    <Typography color="textSecondary" gutterBottom>
                      Cari
                    </Typography>
                    <Chip
                      icon={<BusinessIcon />}
                      label={evrak.cari_id.cariAd}
                      color="default"
                      variant="outlined"
                    />
                  </>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography color="textSecondary" gutterBottom>
                  Evrak Konusu
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ fontWeight: "medium" }}
                >
                  {evrak.evrakKonusu}
                </Typography>
              </Grid>

              {evrak.ilgiliKisi && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography color="textSecondary" gutterBottom>
                    İlgili Kişi
                  </Typography>
                  <Typography variant="body1">{evrak.ilgiliKisi}</Typography>
                </Grid>
              )}

              {evrak.teslimTarihi && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography color="textSecondary" gutterBottom>
                    Teslim Tarihi
                  </Typography>
                  <Typography variant="body1">
                    {new Date(evrak.teslimTarihi).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}

              {evrak.teslimAlan && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography color="textSecondary" gutterBottom>
                    Teslim Alan
                  </Typography>
                  <Typography variant="body1">{evrak.teslimAlan}</Typography>
                </Grid>
              )}

              {evrak.aciklama && (
                <Grid item xs={12}>
                  <Typography color="textSecondary" gutterBottom>
                    Açıklama
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1">{evrak.aciklama}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Evrak Ekleri */}
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
                Evrak Ekleri
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AttachFileIcon />}
                component={Link}
                to={`/evraklar/ekler/${id}`}
              >
                Ekleri Yönet
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : ekler && ekler.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Dosya Adı</TableCell>
                      <TableCell>Tür</TableCell>
                      <TableCell>Boyut</TableCell>
                      <TableCell>Açıklama</TableCell>
                      <TableCell align="center">Durum</TableCell>
                      <TableCell align="center">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ekler.map((ek) => (
                      <TableRow
                        key={ek._id}
                        sx={
                          ek.sitedeyayimla
                            ? { background: "rgba(46, 125, 50, 0.08)" }
                            : {}
                        }
                      >
                        <TableCell
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {getFileIcon(ek.mimeTur)}
                          <Tooltip title={ek.orijinalDosyaAdi}>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 250,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {ek.orijinalDosyaAdi}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ek.ekTur}
                            color={getFileColor(ek.mimeTur)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatFileSize(ek.dosyaBoyutu)}</TableCell>
                        <TableCell>{ek.aciklama || "-"}</TableCell>
                        <TableCell align="center">
                          {ek.sitedeyayimla ? (
                            <Tooltip title="Bu dosya web sitesinde yayınlanıyor">
                              <Chip
                                size="small"
                                color="success"
                                icon={<PublicIcon />}
                                label="Sitede Yayında"
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Bu dosya sadece sistem içinde görüntülenebilir">
                              <Chip
                                size="small"
                                color="default"
                                icon={<LockIcon />}
                                label="Özel"
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            <Tooltip title="Önizle">
                              <IconButton
                                color="info"
                                size="small"
                                onClick={() => handlePreview(ek)}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="İndir">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleDownloadEk(ek)}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleDeleteEkClick(ek)}
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
            ) : (
              <Alert severity="info">
                Bu evrak için henüz ek dosya bulunmamaktadır. Evrak eki eklemek
                için "Ekleri Yönet" butonunu kullanabilirsiniz.
              </Alert>
            )}
          </Paper>
        </Box>
      </Fade>

      {/* Evrak Silme Onay Diyaloğu */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Evrak Kaydını Sil"
        content={`"${evrak.evrakTuru} - ${evrak.evrakNo}" evrak kaydını ve eklerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
      />

      {/* Evrak Eki Silme Onay Diyaloğu */}
      <DeleteDialog
        open={deleteEkDialogOpen}
        onClose={() => setDeleteEkDialogOpen(false)}
        onConfirm={handleDeleteEkConfirm}
        title="Evrak Ekini Sil"
        content={
          selectedEk
            ? `"${selectedEk.orijinalDosyaAdi}" dosyasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
            : ""
        }
      />

      {/* Önizleme Modalı */}
      <PreviewModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        document={previewEk}
        onDownload={handleDownloadEk}
      />
    </Box>
  );
};

export default EvrakDetay;
