import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  addKisi,
  getKisiById,
  updateKisi,
  uploadKisiDokumanlar,
  deleteKisiDokuman,
} from "../../redux/kisi/kisiSlice";
import { getActiveGruplar } from "../../redux/grup/grupSlice";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as InsertDriveFileIcon,
  CloudDownload as CloudDownloadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import FileUpload from "../../components/common/FileUpload";
import { toast } from "react-toastify";

import TelefonListesi from "../../components/kisi/TelefonListesi";
import AdresListesi from "../../components/kisi/AdresListesi";
import SosyalMedyaListesi from "../../components/kisi/SosyalMedyaListesi";
import DeleteDialog from "../../components/common/DeleteDialog";

// TabPanel fonksiyonunu güncelliyoruz, children içeriğini uygun şekilde sarmalıyoruz
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {/* children elemanını Typography yerine doğrudan Box ile sarmalıyoruz */}
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const KisiForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    kisi,
    loading: kisiLoading,
    error,
  } = useSelector((state) => state.kisi);
  const { gruplar } = useSelector((state) => state.grup);

  const [tabValue, setTabValue] = useState(0);
  const [formHata, setFormHata] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDokumanId, setDeletingDokumanId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const initialFormState = {
    tcKimlik: "",
    ad: "",
    soyad: "",
    babaAdi: "",
    anaAd: "",
    dogumYeri: "",
    dogumTarihi: "",
    cinsiyet: "",
    medeniDurum: "",
    kanGrubu: "",
    seriNo: "",
    cuzdanNo: "",
    verildigiYer: "",
    verilmeNedeni: "",
    kayitNo: "",
    verilmeTarihi: "",
    ciltNo: "",
    aileSiraNo: "",
    sayfaNo: "",
    grup_id: "",
    aciklamalar: "",
    isActive: true,
    dokumanlar: [],
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (id) {
      dispatch(getKisiById(id));
    }
    dispatch(getActiveGruplar()); // Bu fonksiyon zaten sadece aktif grupları getiriyor
  }, [dispatch, id]);

  useEffect(() => {
    if (gruplar && gruplar.length > 0) {
      console.log("Aktif gruplar:", gruplar);
    }

    if (id && kisi) {
      console.log("Kişinin grup bilgisi:", kisi.grup_id);
    }
  }, [id, kisi, gruplar]);

  useEffect(() => {
    if (id && kisi) {
      const kisiData = {
        ...kisi,
        // Grup_id doğru şekilde çözümlenecek
        grup_id: kisi.grup_id ? kisi.grup_id._id || kisi.grup_id : "",
        tcKimlik: kisi.tcKimlik || "",
        ad: kisi.ad || "",
        soyad: kisi.soyad || "",
        babaAdi: kisi.babaAdi || "",
        anaAd: kisi.anaAd || "",
        dogumYeri: kisi.dogumYeri || "",
        dogumTarihi: kisi.dogumTarihi ? kisi.dogumTarihi.substring(0, 10) : "",
        cinsiyet: kisi.cinsiyet || "",
        medeniDurum: kisi.medeniDurum || "",
        kanGrubu: kisi.kanGrubu || "",
        // Nüfus bilgileri için düzgün varsayılan değerler ve null kontrolü
        seriNo: kisi.seriNo !== undefined ? kisi.seriNo : "",
        cuzdanNo: kisi.cuzdanNo !== undefined ? kisi.cuzdanNo : "",
        verildigiYer: kisi.verildigiYer !== undefined ? kisi.verildigiYer : "",
        verilmeNedeni:
          kisi.verilmeNedeni !== undefined ? kisi.verilmeNedeni : "",
        kayitNo: kisi.kayitNo !== undefined ? kisi.kayitNo : "",
        verilmeTarihi: kisi.verilmeTarihi
          ? kisi.verilmeTarihi.substring(0, 10)
          : "",
        ciltNo: kisi.ciltNo !== undefined ? kisi.ciltNo : "",
        aileSiraNo: kisi.aileSiraNo !== undefined ? kisi.aileSiraNo : "",
        sayfaNo: kisi.sayfaNo !== undefined ? kisi.sayfaNo : "",
        aciklamalar: kisi.aciklamalar || "",
        isActive: kisi.isActive !== undefined ? kisi.isActive : true,
        dokumanlar: kisi.dokumanlar || [],
      };
      setFormData(kisiData);

      // Debug için konsola yazdırma
      console.log("Form verileri yüklendi:", kisiData);
      console.log("Nüfus bilgileri:", {
        seriNo: kisiData.seriNo,
        cuzdanNo: kisiData.cuzdanNo,
        verildigiYer: kisiData.verildigiYer,
        verilmeNedeni: kisiData.verilmeNedeni,
        kayitNo: kisiData.kayitNo,
        verilmeTarihi: kisiData.verilmeTarihi,
        ciltNo: kisiData.ciltNo,
        aileSiraNo: kisiData.aileSiraNo,
        sayfaNo: kisiData.sayfaNo,
      });

      if (kisiData.grup_id) {
        console.log("Grup ID yüklendi:", kisiData.grup_id);
      }
    }
  }, [id, kisi]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileUpload = async (files, descriptions) => {
    if (!id) {
      toast.error("Kişi ID bulunamadı");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();

      // Dosyaları formData'ya ekle
      Array.from(files).forEach((file, index) => {
        formData.append("dokumanlar", file);
      });

      // Açıklamaları ayrı ayrı ekle
      if (descriptions && descriptions.length > 0) {
        descriptions.forEach((desc, index) => {
          if (desc) formData.append(`aciklama_${index}`, desc);
        });
      }

      const result = await dispatch(
        uploadKisiDokumanlar({
          kisiId: id,
          formData,
        })
      ).unwrap();

      if (result) {
        dispatch(getKisiById(id));
        toast.success("Dokümanlar başarıyla yüklendi");
      }
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
      toast.error(error?.msg || "Dokümanlar yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDokuman = (dokuman) => {
    setDeletingDokumanId(dokuman._id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await dispatch(
        deleteKisiDokuman({
          kisiId: id,
          dokumanId: deletingDokumanId,
        })
      ).unwrap();

      // State'i güncelle
      setFormData((prev) => ({
        ...prev,
        dokumanlar: prev.dokumanlar.filter(
          (doc) => doc._id !== deletingDokumanId
        ),
      }));

      toast.success("Doküman başarıyla silindi");
    } catch (error) {
      console.error("Silme hatası:", error);
      toast.error(error?.msg || "Doküman silinirken bir hata oluştu");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingDokumanId(null);
    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setFormHata(null);
    // Zorunlu enum alanlar için kontroller
    if (!formData.medeniDurum) {
      setFormHata("Lütfen medeni durum bilgisini seçiniz.");
      toast.error("Lütfen medeni durum bilgisini seçiniz.");
      return;
    }
    if (!formData.cinsiyet) {
      setFormHata("Lütfen cinsiyet bilgisini seçiniz.");
      toast.error("Lütfen cinsiyet bilgisini seçiniz.");
      return;
    }
    setIsSubmitting(true);

    // Form verilerini göndermeden önce kontrol et ve temizle
    const submitData = { ...formData };

    // Boş string değerlerinin null olarak gönderilmesini önle
    Object.keys(submitData).forEach((key) => {
      // Eğer değer boş string ise o alanı null değer yerine boş string olarak koru
      if (submitData[key] === "" || submitData[key] === null) {
        submitData[key] = "";
      }
    });

    console.log("Gönderilecek form verileri:", submitData);

    // Nüfus bilgileri kontrolü - bu loglar sorunun tespitinde faydalı olabilir
    console.log("Nüfus bilgileri gönderiliyor:", {
      seriNo: submitData.seriNo,
      cuzdanNo: submitData.cuzdanNo,
      verildigiYer: submitData.verildigiYer,
      verilmeNedeni: submitData.verilmeNedeni,
      kayitNo: submitData.kayitNo,
      verilmeTarihi: submitData.verilmeTarihi,
      ciltNo: submitData.ciltNo,
      aileSiraNo: submitData.aileSiraNo,
      sayfaNo: submitData.sayfaNo,
    });

    try {
      if (id) {
        // Nüfus bilgilerini de içeren güncellenmiş kişi nesnesini gönder
        await dispatch(updateKisi({ id, kisiData: submitData })).unwrap();
        toast.success("Kişi başarıyla güncellendi");
      } else {
        // Yeni kişi kaydı için tüm bilgileri içeren form verilerini gönder
        const result = await dispatch(addKisi(submitData)).unwrap();
        toast.success("Kişi başarıyla eklendi");

        if (result.error) {
          setFormHata(result.error);
          return;
        }
      }

      navigate("/kisiler");
    } catch (error) {
      setFormHata(error.msg || "Bir hata oluştu");
      toast.error(error.msg || "Bir hata oluştu");
      console.error("Form gönderim hatası:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (kisiLoading && id) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <IconButton
            onClick={() => navigate("/kisiler")}
            color="primary"
            size="small"
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h5" component="h1">
              {id ? "Kişi Düzenle" : "Yeni Kişi Ekle"}
            </Typography>
            {id && formData.ad && formData.soyad && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  sx={{
                    ml: 1,
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  - {formData.ad} {formData.soyad}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {(error || formHata) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error?.msg || formHata || "Bir hata oluştu"}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="kisi form tabları"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Kişisel Bilgiler" {...a11yProps(0)} />
              <Tab label="Nüfus Bilgileri" {...a11yProps(1)} />
              <Tab label="İletişim Bilgileri" {...a11yProps(2)} />
              <Tab label="Diğer Bilgiler" {...a11yProps(3)} />
              <Tab label="Dokümanlar" {...a11yProps(4)} />
              <Tab label="Soyağacı" {...a11yProps(5)} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="TC Kimlik No"
                  name="tcKimlik"
                  value={formData.tcKimlik}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Ad"
                  name="ad"
                  value={formData.ad}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Soyad"
                  name="soyad"
                  value={formData.soyad}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Baba Adı"
                  name="babaAdi"
                  value={formData.babaAdi}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ana Adı"
                  name="anaAd"
                  value={formData.anaAd}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Doğum Yeri"
                  name="dogumYeri"
                  value={formData.dogumYeri}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Doğum Tarihi"
                  name="dogumTarihi"
                  type="date"
                  value={formData.dogumTarihi}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Cinsiyet</InputLabel>
                  <Select
                    name="cinsiyet"
                    value={formData.cinsiyet}
                    onChange={handleChange}
                    label="Cinsiyet"
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    <MenuItem value="Erkek">Erkek</MenuItem>
                    <MenuItem value="Kadın">Kadın</MenuItem>
                    <MenuItem value="Diğer">Diğer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Medeni Durum</InputLabel>
                  <Select
                    name="medeniDurum"
                    value={formData.medeniDurum}
                    onChange={handleChange}
                    label="Medeni Durum"
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    <MenuItem value="Evli">Evli</MenuItem>
                    <MenuItem value="Bekar">Bekar</MenuItem>
                    <MenuItem value="Boşanmış">Boşanmış</MenuItem>
                    <MenuItem value="Dul">Dul</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Kan Grubu</InputLabel>
                  <Select
                    name="kanGrubu"
                    value={formData.kanGrubu}
                    onChange={handleChange}
                    label="Kan Grubu"
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    <MenuItem value="A Rh+">A Rh+</MenuItem>
                    <MenuItem value="A Rh-">A Rh-</MenuItem>
                    <MenuItem value="B Rh+">B Rh+</MenuItem>
                    <MenuItem value="B Rh-">B Rh-</MenuItem>
                    <MenuItem value="AB Rh+">AB Rh+</MenuItem>
                    <MenuItem value="AB Rh-">AB Rh-</MenuItem>
                    <MenuItem value="0 Rh+">0 Rh+</MenuItem>
                    <MenuItem value="0 Rh-">0 Rh-</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Seri No"
                  name="seriNo"
                  value={formData.seriNo || ""}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cüzdan No"
                  name="cuzdanNo"
                  value={formData.cuzdanNo || ""}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Verildiği Yer"
                  name="verildigiYer"
                  value={formData.verildigiYer || ""}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Verilme Nedeni"
                  name="verilmeNedeni"
                  value={formData.verilmeNedeni || ""}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Kayıt No"
                  name="kayitNo"
                  value={formData.kayitNo || ""}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Verilme Tarihi"
                  name="verilmeTarihi"
                  type="date"
                  value={formData.verilmeTarihi || ""}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Cilt No"
                  name="ciltNo"
                  value={formData.ciltNo || ""}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Aile Sıra No"
                  name="aileSiraNo"
                  value={formData.aileSiraNo || ""}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Sayfa No"
                  name="sayfaNo"
                  value={formData.sayfaNo || ""}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {id ? (
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, mb: 2, borderRadius: 2 }}
                  >
                    <TelefonListesi kisiId={id} />
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, mb: 2, borderRadius: 2 }}
                  >
                    <AdresListesi kisiId={id} />
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <SosyalMedyaListesi kisiId={id} />
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography>
                  İletişim detayları (telefon, adres, sosyal medya) ekleyebilmek
                  için önce kişi kaydını oluşturun.
                </Typography>
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="grup-label">Grup</InputLabel>
                  <Select
                    labelId="grup-label"
                    id="grup_id"
                    name="grup_id"
                    value={formData.grup_id || ""}
                    onChange={handleChange}
                    label="Grup"
                  >
                    <MenuItem value="">
                      <em>Grup Seçiniz</em>
                    </MenuItem>
                    {gruplar?.map((grup) => (
                      <MenuItem key={grup._id} value={grup._id}>
                        {grup.grupAdi || grup.ad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Debug bilgisi - geliştirme sırasında yardımcı olması için */}
              {formData.grup_id && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ my: 1 }}>
                    Şu anki grup ID: {formData.grup_id}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklamalar"
                  name="aciklamalar"
                  value={formData.aciklamalar || ""}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AttachFileIcon color="primary" />
                      Doküman Yükle
                    </Box>
                  </Typography>

                  <FileUpload
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    multiple={true}
                    maxSize={10485760} // 10MB
                    onUpload={handleFileUpload}
                    uploading={uploading}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Yüklü Dokümanlar
                  </Typography>

                  {kisiLoading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 3 }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : formData.dokumanlar && formData.dokumanlar.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Doküman Adı</TableCell>
                            <TableCell>Tür</TableCell>
                            <TableCell>Boyut</TableCell>
                            <TableCell>Yükleme Tarihi</TableCell>
                            <TableCell align="center">İşlemler</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formData.dokumanlar.map((dokuman, index) => (
                            <TableRow key={`${dokuman._id}_${index}`}>
                              <TableCell>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <InsertDriveFileIcon
                                    color="action"
                                    fontSize="small"
                                  />
                                  <Typography>
                                    {dokuman.orijinalDosyaAdi}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={dokuman.dosyaTipi}
                                  color={
                                    dokuman.dosyaTipi === "PDF"
                                      ? "error"
                                      : "primary"
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{dokuman.dosyaBoyutu}</TableCell>
                              <TableCell>
                                {new Date(
                                  dokuman.yuklemeTarihi
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell align="center">
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    justifyContent: "center",
                                  }}
                                >
                                  <Tooltip title="İndir">
                                    <IconButton
                                      color="primary"
                                      size="small"
                                      href={`/${dokuman.dosyaYolu}`}
                                      target="_blank"
                                      download
                                    >
                                      <CloudDownloadIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Sil">
                                    <IconButton
                                      color="error"
                                      size="small"
                                      onClick={() =>
                                        handleDeleteDokuman(dokuman)
                                      }
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
                      Henüz doküman yüklenmemiş. Yukarıdaki formu kullanarak
                      dokümanlar ekleyebilirsiniz.
                    </Alert>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <Typography variant="body1" color="textSecondary" align="center">
              Soyağacı bilgileri yakında eklenecek...
            </Typography>
          </TabPanel>

          <Box
            sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/kisiler")}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />
              }
            >
              {isSubmitting ? "İşleniyor..." : id ? "Güncelle" : "Ekle"}
            </Button>
          </Box>
        </form>
      </Paper>

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Doküman Sil"
        content={
          deletingDokumanId
            ? `"${
                formData.dokumanlar.find(
                  (dokuman) => dokuman._id === deletingDokumanId
                )?.orijinalDosyaAdi
              }" dokümanını silmek istediğinize emin misiniz?`
            : "Bu dokümanı silmek istediğinize emin misiniz?"
        }
        loading={isDeleting}
      />
    </Box>
  );
};

export default KisiForm;
