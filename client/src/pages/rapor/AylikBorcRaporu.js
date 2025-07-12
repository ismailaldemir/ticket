import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Chip,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import {
  getAylikBorcRaporu,
  clearRaporData,
} from "../../redux/rapor/raporSlice";
import { getKisiler } from "../../redux/kisi/kisiSlice";
import { getGruplar } from "../../redux/grup/grupSlice";
import ExportModal from "../../components/common/ExportModal";
import { formatCurrency } from "../../utils/exportService";

const AylikBorcRaporu = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const { aylikBorcRaporu, loading } = useSelector((state) => state.rapor);
  const { kisiler } = useSelector((state) => state.kisi);
  const { gruplar } = useSelector((state) => state.grup);

  // Filtreleme için state'ler
  const [filters, setFilters] = useState({
    baslangicTarihi: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0], // Yılbaşı
    bitisTarihi: new Date(new Date().getFullYear(), 11, 31)
      .toISOString()
      .split("T")[0], // Yılsonu
    kisiId: "",
    grupId: "",
    odemeDurumu: "tumu",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    dispatch(getKisiler());
    dispatch(getGruplar());

    // Sayfa ilk yüklendiğinde varsayılan filtrelerle raporu getir
    // Burada API'ye filtreleri doğru şekilde göndermek için
    // handleSearch fonksiyonunu çağırmak yerine direkt dispatch kullanıyoruz
    dispatch(getAylikBorcRaporu(filters));
  }, [dispatch, filters]);

  // Sayfa yüklendiğinde rapor verilerini temizle
  useEffect(() => {
    // Komponent unmount olduğunda temizleme işlemi için cleanup fonksiyonu
    return () => {
      dispatch(clearRaporData());
    };
  }, [dispatch]);

  // Ay adını getiren yardımcı fonksiyon
  const getAyAdi = (ay) => {
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
    return aylar[ay - 1];
  };

  // Filtre değişikliklerini izle
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filtreleri temizle
  const handleClearFilters = () => {
    const yeniFiltreler = {
      baslangicTarihi: new Date(new Date().getFullYear(), 0, 1)
        .toISOString()
        .split("T")[0],
      bitisTarihi: new Date(new Date().getFullYear(), 11, 31)
        .toISOString()
        .split("T")[0],
      kisiId: "",
      grupId: "",
      odemeDurumu: "tumu",
    };

    setFilters(yeniFiltreler);

    // Filtreleri sıfırladıktan sonra hemen arama yap
    dispatch(getAylikBorcRaporu(yeniFiltreler));
  };

  // Arama işlemi - Filtreleri API'ye gönder
  const handleSearch = () => {
    console.log("Uygulanan filtreler:", filters); // Debug için filtre değerlerini konsola yazdır
    dispatch(getAylikBorcRaporu(filters));
  };

  // Listeyi yenile
  const handleRefresh = () => {
    dispatch(getAylikBorcRaporu(filters));
  };

  // Dışa aktarma için sütunları hazırla
  const generateExportColumns = () => {
    const baseColumns = [
      {
        id: "adSoyad",
        header: "Ad Soyad",
        accessor: (item) => `${item.kisi.ad} ${item.kisi.soyad}`,
      },
      {
        id: "tcKimlik",
        header: "TC Kimlik No",
        accessor: (item) => item.kisi.tcKimlik || "",
      },
      {
        id: "telefonNumarasi",
        header: "Telefon",
        accessor: (item) => item.kisi.telefonNumarasi || "",
      },
      {
        id: "grup",
        header: "Grup",
        accessor: (item) => item.kisi.grup || "",
      },
    ];

    // Ay sütunları için dinamik olarak sütunlar oluştur
    const aylikColumns = aylikBorcRaporu.aylar.map((ayObj) => ({
      id: `ay_${ayObj.yil}_${ayObj.ay}`,
      header: `${getAyAdi(ayObj.ay)} ${ayObj.yil}`,
      accessor: (item) => {
        const aylikBorc = item.aylikBorclar.find(
          (b) => b.yil === ayObj.yil && b.ay === ayObj.ay
        );
        if (!aylikBorc || !aylikBorc.borc) return "-";
        return `${
          aylikBorc.borc.odendi ? "Ödendi" : "Ödenmedi"
        } (${formatCurrency(aylikBorc.borc.borcTutari)})`;
      },
    }));

    // Toplam sütunlarını ekle
    const totalColumns = [
      {
        id: "toplamBorc",
        header: "Toplam Borç",
        accessor: (item) => formatCurrency(item.toplamBorc),
      },
      {
        id: "toplamOdeme",
        header: "Toplam Ödeme",
        accessor: (item) => formatCurrency(item.toplamOdeme),
      },
      {
        id: "kalanTutar",
        header: "Kalan Tutar",
        accessor: (item) => formatCurrency(item.kalanTutar),
      },
    ];

    return [...baseColumns, ...aylikColumns, ...totalColumns];
  };

  // Özet kısmını biraz daha iyileştiren helper fonksiyon
  const calculateSummary = () => {
    if (!aylikBorcRaporu.raporVerileri.length)
      return { toplamBorc: 0, toplamOdeme: 0, kalanTutar: 0 };

    const toplamBorc = aylikBorcRaporu.raporVerileri.reduce(
      (total, item) => total + item.toplamBorc,
      0
    );
    const toplamOdeme = aylikBorcRaporu.raporVerileri.reduce(
      (total, item) => total + item.toplamOdeme,
      0
    );
    const kalanTutar = toplamBorc - toplamOdeme;

    return { toplamBorc, toplamOdeme, kalanTutar };
  };

  const { toplamBorc, toplamOdeme, kalanTutar } = calculateSummary();

  // Özet kartları için güncellenen kod - soft tonlarda renkler
  const renderSummaryCards = () => (
    <Grid container spacing={2} sx={{ my: 2 }}>
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(25, 118, 210, 0.15)"
                : "rgba(25, 118, 210, 0.1)",
            color: "primary.main",
            boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "6px",
              height: "100%",
              backgroundColor: "primary.main",
            },
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              Toplam Borçlar
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {formatCurrency(toplamBorc)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(46, 125, 50, 0.15)"
                : "rgba(46, 125, 50, 0.1)",
            color: "success.main",
            boxShadow: "0 2px 8px rgba(46, 125, 50, 0.15)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "6px",
              height: "100%",
              backgroundColor: "success.main",
            },
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              Toplam Ödemeler
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {formatCurrency(toplamOdeme)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(211, 47, 47, 0.15)"
                : "rgba(211, 47, 47, 0.1)",
            color: "error.main",
            boxShadow: "0 2px 8px rgba(211, 47, 47, 0.15)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "6px",
              height: "100%",
              backgroundColor: "error.main",
            },
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              Kalan Borçlar
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {formatCurrency(kalanTutar)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1">
          Aylık Borç Raporu
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={() => setExportModalOpen(true)}
            disabled={!aylikBorcRaporu.raporVerileri.length}
          >
            Dışa Aktar
          </Button>
          <Tooltip title="Filtreler">
            <IconButton
              color="primary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Listeyi Yenile">
            <IconButton color="primary" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Rapor Filtreleri
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                label="Başlangıç Tarihi"
                type="date"
                name="baslangicTarihi"
                value={filters.baslangicTarihi}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                label="Bitiş Tarihi"
                type="date"
                name="bitisTarihi"
                value={filters.bitisTarihi}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth>
                <InputLabel>Kişi</InputLabel>
                <Select
                  name="kisiId"
                  value={filters.kisiId}
                  onChange={handleFilterChange}
                  label="Kişi"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {kisiler.map((kisi) => (
                    <MenuItem key={kisi._id} value={kisi._id}>
                      {`${kisi.ad} ${kisi.soyad}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth>
                <InputLabel>Grup</InputLabel>
                <Select
                  name="grupId"
                  value={filters.grupId}
                  onChange={handleFilterChange}
                  label="Grup"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {gruplar.map((grup) => (
                    <MenuItem key={grup._id} value={grup._id}>
                      {grup.grupAdi}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth>
                <InputLabel>Ödeme Durumu</InputLabel>
                <Select
                  name="odemeDurumu"
                  value={filters.odemeDurumu}
                  onChange={handleFilterChange}
                  label="Ödeme Durumu"
                >
                  <MenuItem value="tumu">Tümü</MenuItem>
                  <MenuItem value="odendi">Ödendi</MenuItem>
                  <MenuItem value="odenmedi">Ödenmedi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 1,
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ClearAllIcon />}
                onClick={handleClearFilters}
              >
                Filtreleri Temizle
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
              >
                Ara
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Özet Kartları */}
      {aylikBorcRaporu.raporVerileri.length > 0 && renderSummaryCards()}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Toplam {aylikBorcRaporu.raporVerileri.length} kişi listeleniyor
            </Typography>
          </Box>

          <TableContainer
            component={Paper}
            sx={{ mt: 2, overflow: "auto", maxHeight: "60vh" }}
          >
            <Table stickyHeader sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "background.paper",
                    }}
                  >
                    Ad Soyad
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "background.paper",
                    }}
                  >
                    TC Kimlik
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "background.paper",
                    }}
                  >
                    Grup
                  </TableCell>

                  {/* Ayları göster */}
                  {aylikBorcRaporu.aylar.map((ayObj, index) => (
                    <TableCell
                      key={`${ayObj.yil}-${ayObj.ay}`}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor:
                          index % 2 === 0
                            ? "background.default"
                            : "background.paper",
                        minWidth: 120,
                      }}
                    >
                      {getAyAdi(ayObj.ay)}
                      <br />
                      {ayObj.yil}
                    </TableCell>
                  ))}

                  {/* Toplam değerler - soft tonlarda renkler */}
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(25, 118, 210, 0.2)"
                          : "rgba(25, 118, 210, 0.1)",
                      color: "primary.main",
                    }}
                    align="right"
                  >
                    Toplam Borç
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(46, 125, 50, 0.2)"
                          : "rgba(46, 125, 50, 0.1)",
                      color: "success.main",
                    }}
                    align="right"
                  >
                    Toplam Ödeme
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(211, 47, 47, 0.2)"
                          : "rgba(211, 47, 47, 0.1)",
                      color: "error.main",
                    }}
                    align="right"
                  >
                    Kalan Tutar
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {aylikBorcRaporu.raporVerileri.length > 0 ? (
                  aylikBorcRaporu.raporVerileri.map((veri) => (
                    <TableRow key={veri.kisi._id} hover>
                      <TableCell>
                        {veri.kisi.ad} {veri.kisi.soyad}
                        {!veri.kisi.isActive && (
                          <Chip
                            size="small"
                            label="Pasif"
                            color="default"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{veri.kisi.tcKimlik || "-"}</TableCell>
                      <TableCell>{veri.kisi.grup || "-"}</TableCell>

                      {/* Aylık borçlar */}
                      {aylikBorcRaporu.aylar.map((ayObj) => {
                        const aylikBorc = veri.aylikBorclar.find(
                          (b) => b.yil === ayObj.yil && b.ay === ayObj.ay
                        );
                        return (
                          <TableCell
                            key={`${veri.kisi._id}-${ayObj.yil}-${ayObj.ay}`}
                            align="center"
                          >
                            {aylikBorc && aylikBorc.borc ? (
                              <Tooltip title={aylikBorc.borc.ucret || ""}>
                                <Chip
                                  label={`₺${aylikBorc.borc.borcTutari.toFixed(
                                    2
                                  )}`}
                                  color={
                                    aylikBorc.borc.odendi ? "success" : "error"
                                  }
                                  size="small"
                                  sx={{ width: "100%" }}
                                />
                              </Tooltip>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        );
                      })}

                      {/* Toplam değerler - soft tonlarda renkler */}
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color: "primary.main",
                        }}
                      >
                        {formatCurrency(veri.toplamBorc)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color: "success.main",
                        }}
                      >
                        {formatCurrency(veri.toplamOdeme)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color:
                            veri.kalanTutar > 0 ? "error.main" : "success.main",
                          bgcolor:
                            veri.kalanTutar > 0
                              ? theme.palette.mode === "dark"
                                ? "rgba(211, 47, 47, 0.08)"
                                : "rgba(211, 47, 47, 0.04)"
                              : theme.palette.mode === "dark"
                              ? "rgba(46, 125, 50, 0.08)"
                              : "rgba(46, 125, 50, 0.04)",
                        }}
                      >
                        {formatCurrency(veri.kalanTutar)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7 + (aylikBorcRaporu.aylar?.length || 0)}
                      align="center"
                    >
                      {loading ? "Yükleniyor..." : "Veri bulunamadı"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Dışa aktarma modal'ı */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={aylikBorcRaporu.raporVerileri}
        availableColumns={generateExportColumns()}
        entityName="Aylık Borç Raporu"
      />
    </Box>
  );
};

export default AylikBorcRaporu;
