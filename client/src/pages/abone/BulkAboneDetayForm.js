import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  TextField,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  ClearAll as ClearIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "react-toastify";

import { getActiveAboneler } from "../../redux/abone/aboneSlice";
import { getActiveUcretler } from "../../redux/ucret/ucretSlice";
import {
  addBulkAboneDetay,
  clearBulkResults,
} from "../../redux/aboneDetay/aboneDetaySlice";
import { PermissionRequired, hasPermission } from "../../utils/rbacUtils";

const BulkAboneDetayForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { aboneler, loading: aboneLoading } = useSelector(
    (state) => state.abone
  );
  const { ucretler, loading: ucretLoading } = useSelector(
    (state) => state.ucret
  );
  const {
    loading: detayLoading,
    error,
    bulkResults,
  } = useSelector((state) => state.aboneDetay);
  const { user } = useSelector((state) => state.auth);

  // Seçilen aboneler ve dönemler
  const [selectedAboneler, setSelectedAboneler] = useState([]);
  const [selectedYillar, setSelectedYillar] = useState([]);
  const [selectedAylar, setSelectedAylar] = useState([]);
  const [selectedUcretId, setSelectedUcretId] = useState("");

  // Tablo verileri
  const [tableData, setTableData] = useState([]);

  // Filtre seçenekleri
  const [filterOptions, setFilterOptions] = useState({
    aboneNo: "",
    aboneTuru: "",
    durum: "",
    aktifMi: true,
    sube_id: "",
  });

  // Dialog kontrolü
  const [showResults, setShowResults] = useState(false);

  // Gelişmiş seçenekler için
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [defaultDurumu, setDefaultDurumu] = useState("Okundu");

  // Filtrelenmiş abone listesi
  const filteredAboneler = aboneler.filter((abone) => {
    if (
      filterOptions.aboneNo &&
      !abone.aboneNo.toLowerCase().includes(filterOptions.aboneNo.toLowerCase())
    ) {
      return false;
    }
    if (
      filterOptions.aboneTuru &&
      abone.aboneTuru !== filterOptions.aboneTuru
    ) {
      return false;
    }
    if (filterOptions.durum && abone.durum !== filterOptions.durum) {
      return false;
    }
    if (filterOptions.aktifMi && !abone.isActive) {
      return false;
    }
    if (filterOptions.sube_id && abone.sube_id?._id !== filterOptions.sube_id) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    dispatch(getActiveAboneler());
    dispatch(getActiveUcretler());

    return () => {
      dispatch(clearBulkResults()); // Component unmount olduğunda temizle
    };
  }, [dispatch]);

  useEffect(() => {
    if (bulkResults) {
      setShowResults(true);
    }
  }, [bulkResults]);

  // Yıl seçenekleri
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  // Ay adları
  const aylar = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  // DataGrid sütun tanımları
  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
      hide: true,
    },
    {
      field: "aboneNo",
      headerName: "Abone No",
      width: 150,
      valueGetter: (params) => params.row.abone.aboneNo,
    },
    {
      field: "aboneAdi",
      headerName: "Abone Adı",
      width: 220,
      valueGetter: (params) =>
        `${params.row.abone.kisi_id?.ad || ""} ${
          params.row.abone.kisi_id?.soyad || ""
        }`,
    },
    {
      field: "donem",
      headerName: "Dönem",
      width: 130,
      valueGetter: (params) => `${params.row.ay}/${params.row.yil}`,
    },
    {
      field: "ucret",
      headerName: "Ücret Türü",
      width: 180,
      valueGetter: (params) => {
        const ucret = ucretler.find((u) => u._id === params.row.ucret_id);
        return ucret ? `${ucret.ad} - ₺${ucret.tutar}` : "-";
      },
    },
    {
      field: "ilkEndeks",
      headerName: "İlk Endeks",
      width: 130,
      editable: true,
      type: "number",
    },
    {
      field: "sonEndeks",
      headerName: "Son Endeks",
      width: 130,
      editable: true,
      type: "number",
    },
    {
      field: "tuketim",
      headerName: "Tüketim",
      width: 130,
      valueGetter: (params) => {
        const ilkEndeks = parseFloat(params.row.ilkEndeks) || 0;
        const sonEndeks = parseFloat(params.row.sonEndeks) || 0;
        return sonEndeks >= ilkEndeks ? sonEndeks - ilkEndeks : 0;
      },
    },
    {
      field: "aciklama",
      headerName: "Açıklama",
      width: 200,
      editable: true,
    },
    {
      field: "actions",
      headerName: "İşlemler",
      width: 100,
      renderCell: (params) => (
        <IconButton
          color="error"
          size="small"
          onClick={() => handleRemoveRow(params.row.id)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  // Filtre değişikliklerini takip et
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filtreleri sıfırla
  const handleClearFilters = () => {
    setFilterOptions({
      aboneNo: "",
      aboneTuru: "",
      durum: "",
      aktifMi: true,
      sube_id: "",
    });
  };

  // Seçilen aboneler değiştiğinde
  const handleAboneSelectionChange = (newSelection) => {
    setSelectedAboneler(newSelection);
  };

  // Tablodan satır kaldırma
  const handleRemoveRow = (id) => {
    setTableData((prev) => prev.filter((row) => row.id !== id));
  };

  // Tabloda hücre değişikliği
  const handleCellChange = (params) => {
    const { id, field, value } = params;

    setTableData((prevData) =>
      prevData.map((row) => {
        if (row.id === id) {
          // Son endeks değişikliğinde ve ilk endeksten küçükse uyarı ver
          if (field === "sonEndeks") {
            const sonEndeks = parseFloat(value) || 0;
            const ilkEndeks = parseFloat(row.ilkEndeks) || 0;

            if (sonEndeks < ilkEndeks) {
              toast.warning(
                "Son endeks değeri ilk endeks değerinden küçük olamaz"
              );
              return row;
            }
          }
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  // Tablo verilerini hazırla
  const generateTableData = () => {
    if (
      selectedAboneler.length === 0 ||
      selectedYillar.length === 0 ||
      selectedAylar.length === 0 ||
      !selectedUcretId
    ) {
      toast.warning("Lütfen abone, yıl, ay ve ücret seçimlerini yapınız");
      return;
    }

    const newTableData = [];
    let rowId = 1;

    // Seçilen her abone için
    for (const aboneId of selectedAboneler) {
      const abone = aboneler.find((a) => a._id === aboneId);

      if (abone) {
        // Seçilen her yıl için
        for (const yil of selectedYillar) {
          // Seçilen her ay için
          for (const ay of selectedAylar) {
            newTableData.push({
              id: rowId++,
              abone_id: abone._id,
              abone: abone,
              yil: parseInt(yil),
              ay: parseInt(ay),
              ucret_id: selectedUcretId,
              ilkEndeks: 0,
              sonEndeks: "",
              aciklama: "",
              durumu: defaultDurumu,
            });
          }
        }
      }
    }

    setTableData(newTableData);
  };

  // Toplu kayıt işlemi
  const handleSaveAll = () => {
    if (!hasPermission(user, "abonedetaylar_toplu_ekleme")) {
      toast.error("Toplu dönem kaydı eklemek için yetkiniz yok.");
      return;
    }

    if (tableData.length === 0) {
      toast.warning("Kaydedilecek veri bulunamadı");
      return;
    }

    // Veri doğrulaması
    const invalidEntries = tableData.filter((row) => {
      const sonEndeks = parseFloat(row.sonEndeks);
      const ilkEndeks = parseFloat(row.ilkEndeks) || 0;
      return isNaN(sonEndeks) || sonEndeks < ilkEndeks;
    });

    if (invalidEntries.length > 0) {
      toast.error(
        `${invalidEntries.length} adet geçersiz kayıt bulunmaktadır. Lütfen kontrol ediniz.`
      );
      return;
    }

    // API'ye gönderilecek verileri hazırla
    const detaylar = tableData.map((row) => {
      // Tüketim hesapla
      const ilkEndeks = parseFloat(row.ilkEndeks) || 0;
      const sonEndeks = parseFloat(row.sonEndeks) || 0;
      const tuketim = sonEndeks >= ilkEndeks ? sonEndeks - ilkEndeks : 0;

      return {
        abone_id: row.abone_id,
        yil: row.yil,
        ay: row.ay,
        ilkTarih: new Date().toISOString().split("T")[0], // Bugünün tarihi
        ilkEndeks: ilkEndeks,
        sonTarih: sonEndeks ? new Date().toISOString().split("T")[0] : null,
        sonEndeks: sonEndeks || null,
        ucret_id: row.ucret_id,
        durumu: sonEndeks ? defaultDurumu : "Okunmadı",
        aciklama: row.aciklama || "",
      };
    });

    dispatch(addBulkAboneDetay(detaylar));
  };

  // Sonuç penceresini kapat
  const handleCloseResults = () => {
    setShowResults(false);

    // Başarılı sonuç varsa aboneler sayfasına yönlendir
    if (bulkResults && bulkResults.basariliKayitSayisi > 0) {
      navigate("/aboneler");
    }

    dispatch(clearBulkResults());
  };

  // Yükleniyor durumu
  const loading = aboneLoading || ucretLoading || detayLoading;

  return (
    <PermissionRequired
      yetkiKodu="abonedetaylar_toplu_ekleme"
      fallback={
        <Alert severity="error">
          Bu sayfayı görüntülemek için yetkiniz yok.
        </Alert>
      }
    >
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
            Toplu Abone Dönem Kaydı Oluştur
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/aboneler")}
          >
            Geri Dön
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error.msg || "Bir hata oluştu"}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Filtreler */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Abone Filtreleri</Typography>
                <Box>
                  <IconButton
                    color="primary"
                    onClick={handleClearFilters}
                    title="Filtreleri Temizle"
                  >
                    <ClearIcon />
                  </IconButton>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Abone No"
                    name="aboneNo"
                    value={filterOptions.aboneNo}
                    onChange={handleFilterChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Abone Türü</InputLabel>
                    <Select
                      name="aboneTuru"
                      value={filterOptions.aboneTuru}
                      onChange={handleFilterChange}
                      label="Abone Türü"
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      <MenuItem value="Mesken">Mesken</MenuItem>
                      <MenuItem value="İşyeri">İşyeri</MenuItem>
                      <MenuItem value="Resmi Daire">Resmi Daire</MenuItem>
                      <MenuItem value="Tarım">Tarım</MenuItem>
                      <MenuItem value="Ticarethane">Ticarethane</MenuItem>
                      <MenuItem value="Sanayi">Sanayi</MenuItem>
                      <MenuItem value="Diğer">Diğer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Durum</InputLabel>
                    <Select
                      name="durum"
                      value={filterOptions.durum}
                      onChange={handleFilterChange}
                      label="Durum"
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      <MenuItem value="Aktif">Aktif</MenuItem>
                      <MenuItem value="Pasif">Pasif</MenuItem>
                      <MenuItem value="Askıda">Askıda</MenuItem>
                      <MenuItem value="İptal">İptal</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filterOptions.aktifMi}
                        onChange={(e) =>
                          setFilterOptions((prev) => ({
                            ...prev,
                            aktifMi: e.target.checked,
                          }))
                        }
                        color="primary"
                      />
                    }
                    label="Sadece Aktif Aboneler"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Abone Seçimi */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Abone Seçimi
              </Typography>
              <Box sx={{ height: 400, width: "100%", mb: 2 }}>
                <DataGrid
                  rows={filteredAboneler}
                  columns={[
                    { field: "aboneNo", headerName: "Abone No", width: 150 },
                    {
                      field: "aboneAdi",
                      headerName: "Abone Adı",
                      width: 220,
                      valueGetter: (params) =>
                        `${params.row.kisi_id?.ad || ""} ${
                          params.row.kisi_id?.soyad || ""
                        }`,
                    },
                    {
                      field: "aboneTuru",
                      headerName: "Tür",
                      width: 120,
                      renderCell: (params) => (
                        <Chip
                          label={params.value}
                          size="small"
                          color={
                            params.value === "Mesken"
                              ? "primary"
                              : params.value === "İşyeri"
                              ? "secondary"
                              : "default"
                          }
                        />
                      ),
                    },
                  ]}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  disableRowSelectionOnClick
                  loading={loading}
                  onRowSelectionModelChange={handleAboneSelectionChange}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>{selectedAboneler.length} abone seçildi</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Dönem ve Ücret Seçimi */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Dönem ve Ücret Seçimi
              </Typography>

              <Grid container spacing={2}>
                {/* Yıl Seçimi */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Yıl Seçimi</InputLabel>
                    <Select
                      multiple
                      value={selectedYillar}
                      onChange={(e) => setSelectedYillar(e.target.value)}
                      label="Yıl Seçimi"
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {generateYearOptions().map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Ay Seçimi */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Ay Seçimi</InputLabel>
                    <Select
                      multiple
                      value={selectedAylar}
                      onChange={(e) => setSelectedAylar(e.target.value)}
                      label="Ay Seçimi"
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((value) => (
                            <Chip key={value} label={aylar[value - 1]} />
                          ))}
                        </Box>
                      )}
                    >
                      {aylar.map((ay, index) => (
                        <MenuItem key={index + 1} value={index + 1}>
                          {ay}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Ücret Seçimi */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Ücret Türü</InputLabel>
                    <Select
                      value={selectedUcretId}
                      onChange={(e) => setSelectedUcretId(e.target.value)}
                      label="Ücret Türü"
                    >
                      <MenuItem value="">
                        <em>Seçiniz</em>
                      </MenuItem>
                      {ucretler.map((ucret) => (
                        <MenuItem key={ucret._id} value={ucret._id}>
                          {ucret.ad} - ₺{ucret.tutar}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Gelişmiş Seçenekler */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showAdvancedOptions}
                        onChange={(e) =>
                          setShowAdvancedOptions(e.target.checked)
                        }
                        color="primary"
                      />
                    }
                    label="Gelişmiş Seçenekler"
                  />

                  {showAdvancedOptions && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        border: "1px solid #ddd",
                        borderRadius: 1,
                      }}
                    >
                      <FormControl fullWidth size="small">
                        <InputLabel>Varsayılan Durum</InputLabel>
                        <Select
                          value={defaultDurumu}
                          onChange={(e) => setDefaultDurumu(e.target.value)}
                          label="Varsayılan Durum"
                        >
                          <MenuItem value="Okunmadı">Okunmadı</MenuItem>
                          <MenuItem value="Okundu">Okundu</MenuItem>
                          <MenuItem value="Fatura Kesildi">
                            Fatura Kesildi
                          </MenuItem>
                          <MenuItem value="Ödendi">Ödendi</MenuItem>
                          <MenuItem value="Devam Ediyor">Devam Ediyor</MenuItem>
                          <MenuItem value="İptal">İptal</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Grid>

                {/* Tablo Verilerini Oluştur Butonu */}
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={generateTableData}
                    disabled={
                      loading ||
                      selectedAboneler.length === 0 ||
                      selectedYillar.length === 0 ||
                      selectedAylar.length === 0 ||
                      !selectedUcretId
                    }
                  >
                    Tablo Verilerini Oluştur
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Veri Giriş Tablosu */}
          {tableData.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Endeks Değerlerini Girin
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Lütfen tablo üzerinde ilk endeks ve son endeks değerlerini
                  girerek kaydediniz. Son endeks değeri, ilk endeks değerinden
                  küçük olmamalıdır.
                </Alert>
                <Box sx={{ height: 600, width: "100%", mb: 2 }}>
                  <DataGrid
                    rows={tableData}
                    columns={columns}
                    editMode="cell"
                    processRowUpdate={handleCellChange}
                    onProcessRowUpdateError={(error) => {
                      console.error("Hücre güncelleme hatası:", error);
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    onClick={handleSaveAll}
                    disabled={loading || tableData.length === 0}
                  >
                    {loading ? "Kaydediliyor..." : "Tüm Kayıtları Oluştur"}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Sonuçlar Dialog */}
        <Dialog
          open={showResults}
          onClose={handleCloseResults}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>İşlem Sonuçları</DialogTitle>
          <DialogContent>
            {bulkResults && (
              <>
                <Alert
                  severity={
                    bulkResults.basariliKayitSayisi > 0 ? "success" : "warning"
                  }
                  sx={{ mb: 2 }}
                >
                  {bulkResults.basariliKayitSayisi} adet kayıt başarıyla
                  oluşturuldu.
                  {bulkResults.hataliKayitSayisi > 0 &&
                    ` ${bulkResults.hataliKayitSayisi} adet kayıt oluşturulamadı.`}
                </Alert>

                {bulkResults.hataliKayitlar &&
                  bulkResults.hataliKayitlar.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Hatalı Kayıtlar
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                        {bulkResults.hataliKayitlar.map((kayit, index) => (
                          <Box
                            key={index}
                            sx={{
                              mb: 1,
                              p: 1,
                              border: "1px solid #ddd",
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="body2" color="error">
                              Hata: {kayit.hata}
                            </Typography>
                            <Typography variant="body2">
                              Abone ID: {kayit.abone_id}, Dönem: {kayit.ay}/
                              {kayit.yil}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseResults} color="primary">
              Tamam
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionRequired>
  );
};

export default BulkAboneDetayForm;
