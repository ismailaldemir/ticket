import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Archive as ArchiveIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  HighlightOff as RemoveIcon,
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Block as BlockIcon,
  Description as WordIcon,
  Calculate as ExcelIcon,
  Slideshow as PowerPointIcon,
  TextFields as TextIcon,
  Code as CodeIcon,
  Article as MarkdownIcon,
  InsertDriveFile as InsertDriveFileIcon,
} from "@mui/icons-material";
import {
  getEvrakById,
  getEvrakEkler,
  addEvrakEk,
  addEvrakEkCoklu,
  deleteEvrakEk,
  updateEvrakEk,
} from "../../redux/evrak/evrakSlice";
import { toast } from "react-toastify";
import apiClient from "../../utils/api";
import PreviewModal from "../../components/common/PreviewModal";
import Visibility from "@mui/icons-material/Visibility";

const EvrakEklerYonetim = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const multipleFileInputRef = useRef(null);

  const { evrak, ekler, loading } = useSelector((state) => state.evrak);

  // Dosya ekleme için state
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [aciklama, setAciklama] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sitedeyayimla, setSitedeyayimla] = useState(false);

  // Silme işlemi için state
  const [deleteEkDialogOpen, setDeleteEkDialogOpen] = useState(false);
  const [selectedEk, setSelectedEk] = useState(null);

  // Düzenleme işlemi için state
  const [editEkDialogOpen, setEditEkDialogOpen] = useState(false);
  const [ekToEdit, setEkToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    orijinalDosyaAdi: "",
    aciklama: "",
    sitedeyayimla: false,
  });

  // Önizleme işlemi için state
  const [previewEk, setPreviewEk] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getEvrakById(id));
      dispatch(getEvrakEkler(id));
    }
  }, [id, dispatch]);

  // Tek dosya seçildiğinde
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Çoklu dosya seçildiğinde
  const handleMultipleFilesChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Tek dosya yükleme
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Lütfen bir dosya seçin");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("dosya", selectedFile);
    formData.append("evrak_id", id);
    formData.append("aciklama", aciklama);
    formData.append("sitedeyayimla", sitedeyayimla);

    try {
      await dispatch(addEvrakEk({ formData })).unwrap();
      setSelectedFile(null);
      setAciklama("");
      setSitedeyayimla(false);
      // Dosya input'unu sıfırla
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(error.msg || "Dosya yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  // Çoklu dosya yükleme
  const handleMultipleFilesUpload = async () => {
    if (!selectedFiles.length) {
      toast.error("Lütfen en az bir dosya seçin");
      return;
    }

    setUploading(true);
    const formData = new FormData();

    // Birden fazla dosya ekle
    selectedFiles.forEach((file) => {
      formData.append("dosyalar", file);
    });

    formData.append("evrak_id", id);
    formData.append("aciklama", aciklama);
    formData.append("sitedeyayimla", sitedeyayimla);

    try {
      await dispatch(addEvrakEkCoklu({ formData })).unwrap();
      setSelectedFiles([]);
      setAciklama("");
      setSitedeyayimla(false);
      // Dosya input'unu sıfırla
      if (multipleFileInputRef.current) {
        multipleFileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(error.msg || "Dosyalar yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  // Seçili dosyayı temizle
  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Seçili dosyaları temizle
  const handleClearSelectedFiles = () => {
    setSelectedFiles([]);
    if (multipleFileInputRef.current) {
      multipleFileInputRef.current.value = "";
    }
  };

  // Dosya silme işlemi
  const handleDeleteClick = (ek) => {
    setSelectedEk(ek);
    setDeleteEkDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedEk) {
      try {
        // Redux action ile silme işlemi
        await dispatch(deleteEvrakEk(selectedEk._id)).unwrap();
      } catch (error) {
        // Hata durumunda toast göster
        toast.error(error.msg || "Dosya silinirken bir hata oluştu");
      }
    }
    setDeleteEkDialogOpen(false);
    setSelectedEk(null);
  };

  // Dosya indirme işlemi
  const handleDownload = async (ek) => {
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

      toast.success("Dosya indirme başladı");
    } catch (error) {
      console.error("Dosya indirme hatası:", error);
      toast.error("Dosya indirilemedi");
    }
  };

  // Dosya düzenleme işlemi
  const handleEditClick = (ek) => {
    setEkToEdit(ek);
    setEditFormData({
      orijinalDosyaAdi: ek.orijinalDosyaAdi,
      aciklama: ek.aciklama || "",
      sitedeyayimla: ek.sitedeyayimla || false,
    });
    setEditEkDialogOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateConfirm = async () => {
    if (!ekToEdit) return;

    try {
      // Boş dosya adı kontrolü
      if (!editFormData.orijinalDosyaAdi.trim()) {
        toast.error("Dosya adı boş olamaz");
        return;
      }

      await dispatch(
        updateEvrakEk({
          ekId: ekToEdit._id,
          ekData: editFormData,
        })
      ).unwrap();

      setEditEkDialogOpen(false);
      setEkToEdit(null);
    } catch (error) {
      console.error("Evrak eki güncellenirken hata:", error);
    }
  };

  // Dosya türüne göre simge belirle
  const getFileIcon = (mimeTur, orijinalDosyaAdi) => {
    const fileExt = orijinalDosyaAdi.split(".").pop().toLowerCase();

    if (mimeTur.includes("pdf") || fileExt === "pdf") {
      return <PdfIcon color="error" />;
    } else if (mimeTur.includes("image")) {
      return <ImageIcon color="success" />;
    } else if (mimeTur.includes("video")) {
      return <VideoIcon color="primary" />;
    } else if (
      mimeTur.includes("audio") ||
      ["mp3", "wav", "ogg"].includes(fileExt)
    ) {
      return <AudioIcon color="secondary" />;
    } else if (
      mimeTur.includes("word") ||
      ["doc", "docx", "rtf"].includes(fileExt)
    ) {
      return <WordIcon color="primary" />;
    } else if (
      mimeTur.includes("excel") ||
      ["xls", "xlsx", "csv"].includes(fileExt)
    ) {
      return <ExcelIcon color="success" />;
    } else if (
      mimeTur.includes("powerpoint") ||
      ["ppt", "pptx"].includes(fileExt)
    ) {
      return <PowerPointIcon color="warning" />;
    } else if (
      mimeTur.includes("zip") ||
      mimeTur.includes("rar") ||
      ["zip", "rar", "7z", "tar", "gz"].includes(fileExt)
    ) {
      return <ArchiveIcon color="action" />;
    } else if (mimeTur.includes("text") || ["txt", "log"].includes(fileExt)) {
      return <TextIcon color="info" />;
    } else if (
      mimeTur.includes("code") ||
      [
        "js",
        "ts",
        "jsx",
        "tsx",
        "php",
        "py",
        "java",
        "c",
        "cpp",
        "cs",
      ].includes(fileExt)
    ) {
      return <CodeIcon color="default" />;
    } else if (mimeTur.includes("markdown") || fileExt === "md") {
      return <MarkdownIcon color="action" />;
    }

    return <InsertDriveFileIcon color="disabled" />;
  };

  // Dosya türüne göre renk belirle
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

  // Önizleme işlemi
  const handlePreview = (ek) => {
    setPreviewEk(ek);
    setPreviewModalOpen(true);
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
          Evrak Ekleri Yönetimi
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DescriptionIcon />}
            component={Link}
            to={`/evraklar/detay/${id}`}
          >
            Evrak Detayı
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

      {/* Evrak Bilgileri Özeti */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <Typography variant="subtitle1" component="span">
              {evrak.evrakTuru} - {evrak.evrakNo}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={7}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              {evrak.evrakKonusu}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Tek Dosya Yükleme */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Tek Dosya Yükle
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <input
                  ref={fileInputRef}
                  accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, image/jpeg, image/png, video/mp4, audio/mpeg, application/zip, application/x-rar-compressed"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AttachFileIcon />}
                  fullWidth
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                >
                  Dosya Seç
                </Button>
              </Grid>

              {selectedFile && (
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={handleClearSelectedFile}
                        >
                          <RemoveIcon />
                        </IconButton>
                      }
                      sx={{ bgcolor: "background.paper", borderRadius: 1 }}
                    >
                      <ListItemIcon>
                        {getFileIcon(selectedFile.type, selectedFile.name)}
                      </ListItemIcon>
                      <ListItemText
                        primary={selectedFile.name}
                        secondary={formatFileSize(selectedFile.size)}
                      />
                    </ListItem>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  value={aciklama}
                  onChange={(e) => setAciklama(e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Dosya açıklaması..."
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sitedeyayimla}
                      onChange={(e) => setSitedeyayimla(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Sitede Yayımla"
                />
                <Typography variant="caption" color="text.secondary">
                  Bu dosya kurumsal sitede genel erişime açık olacak
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={
                    uploading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <UploadIcon />
                    )
                  }
                  fullWidth
                  onClick={handleFileUpload}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? "Yükleniyor..." : "Dosyayı Yükle"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Çoklu Dosya Yükleme */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Çoklu Dosya Yükle
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <input
                  ref={multipleFileInputRef}
                  accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, image/jpeg, image/png, video/mp4, audio/mpeg, application/zip, application/x-rar-compressed"
                  type="file"
                  style={{ display: "none" }}
                  multiple
                  onChange={handleMultipleFilesChange}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  onClick={() => multipleFileInputRef.current.click()}
                  disabled={uploading}
                >
                  Çoklu Dosya Seç (max. 10)
                </Button>
              </Grid>

              {selectedFiles.length > 0 && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      my: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {selectedFiles.length} dosya seçildi
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<RemoveIcon />}
                        onClick={handleClearSelectedFiles}
                      >
                        Temizle
                      </Button>
                    </Box>
                    <Box
                      sx={{
                        maxHeight: "150px",
                        overflow: "auto",
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      <List dense>
                        {selectedFiles.map((file, index) => (
                          <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: "30px" }}>
                              {getFileIcon(file.type, file.name)}
                            </ListItemIcon>
                            <ListItemText
                              primary={file.name}
                              secondary={formatFileSize(file.size)}
                              primaryTypographyProps={{ noWrap: true }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ortak Açıklama"
                  value={aciklama}
                  onChange={(e) => setAciklama(e.target.value)}
                  placeholder="Tüm dosyalar için açıklama..."
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sitedeyayimla}
                      onChange={(e) => setSitedeyayimla(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Sitede Yayımla"
                />
                <Typography variant="caption" color="text.secondary">
                  Seçilen tüm dosyalar kurumsal sitede genel erişime açık olacak
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={
                    uploading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <CloudUploadIcon />
                    )
                  }
                  fullWidth
                  onClick={handleMultipleFilesUpload}
                  disabled={selectedFiles.length === 0 || uploading}
                >
                  {uploading
                    ? "Yükleniyor..."
                    : `${selectedFiles.length} Dosyayı Yükle`}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Mevcut Ekler Listesi */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Mevcut Ekler
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : ekler && ekler.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Dosya Adı</TableCell>
                      <TableCell>Tür</TableCell>
                      <TableCell>Boyut</TableCell>
                      <TableCell>Açıklama</TableCell>
                      <TableCell align="center">Sitede Yayımla</TableCell>
                      <TableCell align="center">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ekler.map((ek) => (
                      <TableRow key={ek._id} hover>
                        <TableCell
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {getFileIcon(ek.mimeTur, ek.orijinalDosyaAdi)}
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
                            <Chip
                              size="small"
                              color="success"
                              icon={<CheckIcon />}
                              label="Yayında"
                            />
                          ) : (
                            <Chip
                              size="small"
                              color="default"
                              icon={<BlockIcon />}
                              label="Yayınlanmıyor"
                            />
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
                                onClick={() => handleDownload(ek)}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleDeleteClick(ek)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Düzenle">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleEditClick(ek)}
                              >
                                <EditIcon fontSize="small" />
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
                Bu evrak için henüz ek bulunmamaktadır. Yukarıdaki formları
                kullanarak ek yükleyebilirsiniz.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dosya Silme Onay Diyaloğu */}
      <Dialog
        open={deleteEkDialogOpen}
        onClose={() => setDeleteEkDialogOpen(false)}
      >
        <DialogTitle>Evrak Ekini Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedEk &&
              `"${selectedEk.orijinalDosyaAdi}" dosyasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteEkDialogOpen(false)} color="primary">
            İptal
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dosya Düzenleme Diyaloğu */}
      <Dialog
        open={editEkDialogOpen}
        onClose={() => setEditEkDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EditIcon color="primary" />
            <Typography variant="h6">Evrak Eki Düzenle</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {ekToEdit && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Dosya Adı"
                name="orijinalDosyaAdi"
                value={editFormData.orijinalDosyaAdi}
                onChange={handleEditFormChange}
                helperText="Bu isim dosya indirilirken kullanılacaktır"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {getFileIcon(ekToEdit.mimeTur, ekToEdit.orijinalDosyaAdi)}
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Açıklama"
                name="aciklama"
                value={editFormData.aciklama}
                onChange={handleEditFormChange}
                multiline
                rows={3}
                placeholder="Dosya hakkında açıklama ekleyin"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editFormData.sitedeyayimla}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        sitedeyayimla: e.target.checked,
                      })
                    }
                    color="primary"
                    name="sitedeyayimla"
                  />
                }
                label="Sitede Yayımla"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Dosya kurumsal sitede genel erişime açık olacak
              </Typography>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                }}
              >
                <InfoIcon fontSize="small" />
                <Typography variant="body2">
                  Ek bilgiler: {formatFileSize(ekToEdit.dosyaBoyutu)} | Eklenme:{" "}
                  {new Date(ekToEdit.kayitTarihi).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditEkDialogOpen(false)} color="inherit">
            İptal
          </Button>
          <Button
            onClick={handleUpdateConfirm}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Önizleme Modalı */}
      <PreviewModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        document={previewEk}
        onDownload={handleDownload}
      />
    </Box>
  );
};

export default EvrakEklerYonetim;
