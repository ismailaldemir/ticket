import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Chip,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { format } from "date-fns";
import { getKisiler } from "../../redux/kisi/kisiSlice";
import {
  getOdenmemisBorclar,
  getOdenmemisBorclarByCokluKisi,
} from "../../redux/borc/borcSlice";
import { addBulkOdeme } from "../../redux/odeme/odemeSlice";
import { getActiveKasalar } from "../../redux/kasa/kasaSlice";
import { toast } from "react-toastify";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const BulkOdemeForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { kisiler } = useSelector((state) => state.kisi);
  const { borclar, loading: borcLoading } = useSelector((state) => state.borc);
  const { loading: odemeLoading } = useSelector((state) => state.odeme);
  const { kasalar, loading: kasaLoading } = useSelector((state) => state.kasa);

  const [selectedKisiler, setSelectedKisiler] = useState([]);
  const [selectedBorclar, setSelectedBorclar] = useState([]);
  const [odemeTarihi, setOdemeTarihi] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [odemeYontemi, setOdemeYontemi] = useState("Nakit");
  const [kasa_id, setKasa_id] = useState("");
  const [makbuzNo, setMakbuzNo] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [odemeTutarlari, setOdemeTutarlari] = useState({});
  const [hataliOdemeler, setHataliOdemeler] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toplamOdemeTutari, setToplamOdemeTutari] = useState(0);
  const [didSetInitialBorcs, setDidSetInitialBorcs] = useState(false);

  useEffect(() => {
    dispatch(getKisiler());
    dispatch(getActiveKasalar());
  }, [dispatch]);

  useEffect(() => {
    if (selectedKisiler.length > 0) {
      dispatch(getOdenmemisBorclarByCokluKisi(selectedKisiler));
    } else {
      dispatch(getOdenmemisBorclar());
    }
  }, [dispatch, selectedKisiler]);

  useEffect(() => {
    if (borclar.length > 0) {
      // Ödenmemiş borçlar için varsayılan ödeme tutarlarını ayarla
      const odenmemisBorclar = borclar.filter((borc) => !borc.odendi);
      const yeniOdemeTutarlari = { ...odemeTutarlari };

      odenmemisBorclar.forEach((borc) => {
        if (!yeniOdemeTutarlari[borc._id]) {
          yeniOdemeTutarlari[borc._id] =
            Math.round((borc.kalan || borc.borcTutari) * 100) / 100;
        }
      });

      setOdemeTutarlari(yeniOdemeTutarlari);

      // Seçili borçlar için toplam ödeme tutarını hesapla
      let toplam = 0;
      selectedBorclar.forEach((borcId) => {
        toplam += parseFloat(yeniOdemeTutarlari[borcId] || 0);
      });
      setToplamOdemeTutari(toplam);
    }
  }, [borclar, selectedBorclar]);

  // Ödeme tutarı değiştiğinde toplam tutarı güncelle
  useEffect(() => {
    let toplam = 0;
    selectedBorclar.forEach((borcId) => {
      toplam += parseFloat(odemeTutarlari[borcId] || 0);
    });
    setToplamOdemeTutari(toplam);
  }, [odemeTutarlari, selectedBorclar]);

  const handleKisiChange = (event) => {
    setSelectedKisiler(event.target.value);
    setSelectedBorclar([]);
  };

  const handleOdemeTutariChange = (borcId, value) => {
    // Virgül kullanımını düzelt
    const normalizedValue = value.toString().replace(",", ".");
    const numericValue = parseFloat(normalizedValue);

    const borc = borclar.find((b) => b._id === borcId);
    if (!borc) return;

    const kalanTutarYuvarlanmis =
      Math.round((borc.kalan || borc.borcTutari) * 100) / 100;

    if (numericValue > kalanTutarYuvarlanmis) {
      toast.warning(
        `Ödeme tutarı borç tutarından fazla olamaz! (Maksimum: ${kalanTutarYuvarlanmis})`
      );
      setOdemeTutarlari({
        ...odemeTutarlari,
        [borcId]: kalanTutarYuvarlanmis,
      });
    } else if (isNaN(numericValue) || numericValue <= 0) {
      // Sıfır veya negatif değerler için uyarı ver
      setOdemeTutarlari({
        ...odemeTutarlari,
        [borcId]: "",
      });
    } else {
      setOdemeTutarlari({
        ...odemeTutarlari,
        [borcId]: numericValue,
      });
    }
  };

  // Form geçerli mi kontrol et
  const isFormValid = () => {
    if (
      selectedBorclar.length === 0 ||
      !odemeTarihi ||
      !odemeYontemi ||
      !kasa_id
    ) {
      return false;
    }

    // Tüm seçili borçlar için ödeme tutarı girilmiş mi kontrol et
    for (const borcId of selectedBorclar) {
      const tutar = parseFloat(odemeTutarlari[borcId]);
      if (isNaN(tutar) || tutar <= 0) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.warning(
        "Lütfen en az bir borç seçin, tüm borçlar için ödeme tutarı girin, ödeme bilgilerini eksiksiz doldurun ve kasa seçin!"
      );
      return;
    }

    // Havale/EFT seçiliyse bir uyarı göster
    if (odemeYontemi === "Havale/EFT") {
      toast.info(
        "Havale/EFT için dekont yüklemek istiyorsanız lütfen ödemeleri tekli olarak yapınız. Toplu ödeme ekranında dekont yükleme özelliği bulunmamaktadır."
      );
    }

    // Ödeme verisini hazırla
    const odemeler = selectedBorclar.map((borcId) => {
      const borc = borclar.find((b) => b._id === borcId);
      return {
        borc_id: borcId,
        kisi_id: borc.kisi_id._id,
        kasa_id,
        odemeTarihi,
        odemeTutari: parseFloat(odemeTutarlari[borcId]),
        odemeYontemi,
        aciklama,
        makbuzNo,
      };
    });

    try {
      const sonuc = await dispatch(addBulkOdeme({ odemeler })).unwrap();

      // Hatalı ödemeler varsa dialoga ekle
      if (sonuc.hataliOdemeler && sonuc.hataliOdemeler.length > 0) {
        setHataliOdemeler(sonuc.hataliOdemeler);
        setDialogOpen(true);
      } else {
        // Başarı mesajı zaten Redux tarafında gösteriliyor, burada tekrar göstermeye gerek yok
        navigate("/odemeler");
      }
    } catch (error) {
      console.error("Ödeme ekleme hatası:", error);
      toast.error(
        "Ödemeler eklenirken bir hata oluştu: " +
          (error.msg || error.message || "Bilinmeyen hata")
      );
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    navigate("/odemeler");
  };

  // DataGrid için sütun tanımlamaları
  const columns = [
    {
      field: "kisiAdi",
      headerName: "Kişi Adı",
      width: 200,
      valueGetter: (params) =>
        `${params.row.kisi_id?.ad || ""} ${params.row.kisi_id?.soyad || ""}`,
    },
    {
      field: "donem",
      headerName: "Dönem",
      width: 130,
      valueGetter: (params) => {
        if (params.row.ay && params.row.yil) {
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
          return `${aylar[params.row.ay - 1]} ${params.row.yil}`;
        }
        return "";
      },
    },
    {
      field: "ucretAdi",
      headerName: "Ücret Türü",
      width: 200,
      valueGetter: (params) => {
        if (params.row.ucret_id) {
          if (params.row.ucret_id.tarife_id) {
            return `${params.row.ucret_id.tarife_id.ad || ""} - ${
              params.row.ucret_id.ad || ""
            }`;
          }
          return params.row.ucret_id.ad || "";
        }
        return "";
      },
    },
    {
      field: "borcTutari",
      headerName: "Borç Tutarı",
      width: 120,
      type: "number",
      valueFormatter: (params) => {
        if (params.value != null) {
          return `₺${params.value.toFixed(2)}`;
        }
        return "";
      },
    },
    {
      field: "kalanTutar",
      headerName: "Kalan Tutar",
      width: 120,
      type: "number",
      valueGetter: (params) => params.row.kalan || 0,
      valueFormatter: (params) => {
        if (params.value != null) {
          return `₺${params.value.toFixed(2)}`;
        }
        return "";
      },
    },
    {
      field: "odemeTutari",
      headerName: "Ödeme Tutarı",
      width: 180,
      renderCell: (params) => (
        <TextField
          fullWidth
          size="small"
          type="text"
          value={odemeTutarlari[params.row._id] || ""}
          onChange={(e) =>
            handleOdemeTutariChange(params.row._id, e.target.value)
          }
          disabled={!selectedBorclar.includes(params.row._id)}
          InputProps={{
            startAdornment: <div style={{ marginRight: 5 }}>₺</div>,
          }}
          sx={{ "& .MuiOutlinedInput-root": { paddingLeft: 0 } }}
          onKeyPress={(event) => {
            // Sadece sayılar, nokta ve virgül girişine izin ver
            const regex = /[0-9.,]/;
            if (!regex.test(event.key)) {
              event.preventDefault();
            }
            // Aynı değerde iki adet nokta veya virgül olmasını engelle
            if (
              (event.key === "." || event.key === ",") &&
              (event.target.value.includes(".") ||
                event.target.value.includes(","))
            ) {
              event.preventDefault();
            }
          }}
          onClick={(event) => {
            // Tıklama olayının ebeveyn elemanlara yayılmasını engelle
            event.stopPropagation();
          }}
          onFocus={(event) => {
            // Odaklanma olayının ebeveyn elemanlara yayılmasını engelle
            event.stopPropagation();
          }}
        />
      ),
    },
  ];

  // DataGrid satırları
  const rows = borclar
    .filter((borc) => !borc.odendi)
    .map((borc) => ({
      ...borc,
      id: borc._id,
    }));

  const loading = borcLoading || odemeLoading || kasaLoading;

  // Borç miktarlarını güncelleyen fonksiyon
  const updateOdemeMiktarlari = useCallback(
    (newBorcIds) => {
      const newOdemeTutarlari = { ...odemeTutarlari };

      newBorcIds.forEach((borcId) => {
        const borc = borclar.find((b) => b._id === borcId);
        if (borc && !newOdemeTutarlari[borcId]) {
          newOdemeTutarlari[borcId] = borc.kalan || borc.borcTutari;
        }
      });

      setOdemeTutarlari(newOdemeTutarlari);
    },
    [borclar, odemeTutarlari]
  );

  // Seçilen kişiler değiştiğinde borçları getir
  useEffect(() => {
    if (selectedKisiler.length > 0) {
      dispatch(getOdenmemisBorclarByCokluKisi(selectedKisiler));
    }
  }, [dispatch, selectedKisiler]);

  // Borçlar değiştiğinde ilk kez borç ID'lerini ayarla
  useEffect(() => {
    if (borclar && borclar.length > 0 && !didSetInitialBorcs) {
      const initialBorcIds = borclar.map((borc) => borc._id);
      updateOdemeMiktarlari(initialBorcIds);
      setDidSetInitialBorcs(true);
    }
  }, [borclar, didSetInitialBorcs, updateOdemeMiktarlari]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Toplu Ödeme Ekleme
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Kişi Seçimi
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Kişiler</InputLabel>
          <Select
            multiple
            value={selectedKisiler}
            onChange={handleKisiChange}
            input={<OutlinedInput label="Kişiler" />}
            renderValue={(selected) => {
              const seciliKisiler = kisiler.filter((kisi) =>
                selected.includes(kisi._id)
              );
              return seciliKisiler
                .map((kisi) => `${kisi.ad} ${kisi.soyad}`)
                .join(", ");
            }}
            MenuProps={MenuProps}
            disabled={loading}
          >
            {kisiler.map((kisi) => (
              <MenuItem key={kisi._id} value={kisi._id}>
                <Checkbox checked={selectedKisiler.indexOf(kisi._id) > -1} />
                <ListItemText primary={`${kisi.ad} ${kisi.soyad}`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" gutterBottom>
          Ödeme Bilgileri
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              required
              label="Ödeme Tarihi"
              type="date"
              value={odemeTarihi}
              onChange={(e) => setOdemeTarihi(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Kasa seçim alanını ekleyelim */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth required>
              <InputLabel>Kasa</InputLabel>
              <Select
                value={kasa_id}
                label="Kasa"
                onChange={(e) => setKasa_id(e.target.value)}
              >
                {kasalar.map((kasa) => (
                  <MenuItem key={kasa._id} value={kasa._id}>
                    {kasa.kasaAdi}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth required>
              <InputLabel>Ödeme Yöntemi</InputLabel>
              <Select
                value={odemeYontemi}
                label="Ödeme Yöntemi"
                onChange={(e) => setOdemeYontemi(e.target.value)}
              >
                <MenuItem value="Nakit">Nakit</MenuItem>
                <MenuItem value="Havale/EFT">Havale/EFT</MenuItem>
                <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                <MenuItem value="Diğer">Diğer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Makbuz No"
              value={makbuzNo}
              onChange={(e) => setMakbuzNo(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Açıklama"
              multiline
              rows={2}
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
            />
          </Grid>

          {/* Havale/EFT seçildiğinde bilgi mesajı göster */}
          {odemeYontemi === "Havale/EFT" && (
            <Grid item xs={12}>
              <Alert severity="info">
                Havale/EFT için dekont yüklemek istiyorsanız lütfen ödemeleri
                tekli olarak yapınız. Toplu ödeme ekranında dekont yükleme
                özelliği bulunmamaktadır.
              </Alert>
            </Grid>
          )}
        </Grid>

        <Typography variant="h6" gutterBottom>
          Borç Seçimi
        </Typography>
        <Box sx={{ height: 400, mb: 3 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 25]}
            checkboxSelection
            onRowSelectionModelChange={(newSelectionModel) => {
              setSelectedBorclar(newSelectionModel);
            }}
            rowSelectionModel={selectedBorclar}
            loading={loading}
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-cell:focus-within": {
                outline: "none",
              },
            }}
          />
        </Box>

        {selectedBorclar.length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Toplam Ödeme Tutarı:{" "}
            <strong>₺{toplamOdemeTutari.toFixed(2)}</strong> | Seçili Borç
            Sayısı: {selectedBorclar.length}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/odemeler")}
            disabled={loading}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid() || loading}
            startIcon={
              loading && <CircularProgress size={20} color="inherit" />
            }
          >
            {loading ? "İşleniyor..." : "Ödemeleri Kaydet"}
          </Button>
        </Box>
      </Paper>

      {/* Hatalı Ödemeler Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Hatalı Ödeme Kayıtları
          <Typography variant="subtitle2" color="text.secondary">
            Bazı ödemeler işlenirken hata oluştu. Başarılı olan ödemeler
            kaydedildi.
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {hataliOdemeler.length > 0 ? (
            <List>
              {hataliOdemeler.map((odeme, index) => (
                <ListItem key={index} divider>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={6}>
                      <Typography variant="body1">
                        {kisiler.find((k) => k._id === odeme.kisi_id)?.ad || ""}{" "}
                        {kisiler.find((k) => k._id === odeme.kisi_id)?.soyad ||
                          ""}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Chip
                        label={`Hata: ${odeme.hata}`}
                        color="error"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Hiçbir hatalı ödeme kaydı yok.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained">
            Ödemeler Listesine Dön
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkOdemeForm;
