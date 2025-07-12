import React, { useState, useEffect } from "react";
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
import { getKisiler } from "../../redux/kisi/kisiSlice";
import { getUcretlerByKullanimAlani } from "../../redux/ucret/ucretSlice";
import { addBulkBorc } from "../../redux/borc/borcSlice";
import { toast } from "react-toastify";
import { PermissionRequired, hasPermission } from "../../utils/rbacUtils";

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

const BulkBorcForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { kisiler } = useSelector((state) => state.kisi);
  const { ucretler, loading: ucretLoading } = useSelector(
    (state) => state.ucret
  );
  const { loading: borcLoading } = useSelector((state) => state.borc);
  const { user } = useSelector((state) => state.auth);
  const [selectedKisiler, setSelectedKisiler] = useState([]);
  const [selectedAylar, setSelectedAylar] = useState([]);
  const [selectedYillar, setSelectedYillar] = useState([]);
  const [selectedUcret, setSelectedUcret] = useState("");
  const [atlanilacakBorclar, setAtlanilacakBorclar] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Birim ücret özelliği için yeni state'ler
  const [secilenUcretBilgisi, setSecilenUcretBilgisi] = useState(null);
  const [miktar, setMiktar] = useState(1);
  const [hesaplananTutar, setHesaplananTutar] = useState(0);
  const [sonOdemeTarihi, setSonOdemeTarihi] = useState("");

  // Kişiye özel miktar değerleri için yeni state
  const [kisiMiktarlari, setKisiMiktarlari] = useState({});
  // Kişi bazlı miktar değiştirildiğinde hesaplanan tutarları saklamak için state
  const [kisiHesaplananTutarlari, setKisiHesaplananTutarlari] = useState({});

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

  const yillar = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  useEffect(() => {
    dispatch(getKisiler());
    dispatch(getUcretlerByKullanimAlani("borclar")); // Sadece borçlar kullanım alanı işaretli ücretleri getir
  }, [dispatch]);

  // Form geçerli mi kontrol eder
  const isFormValid = () => {
    if (
      !selectedUcret ||
      selectedKisiler.length === 0 ||
      selectedAylar.length === 0 ||
      selectedYillar.length === 0
    ) {
      return false;
    }

    // Birim ücret ise ve kişi seçilmişse her kişi için miktar değeri girilmiş mi kontrol et
    if (secilenUcretBilgisi?.birimUcret) {
      // Hiç kişiye özel miktar girilmemişse genel miktar değeriyle devam edilebilir
      if (Object.keys(kisiMiktarlari).length === 0) {
        return miktar > 0;
      }

      // Her seçili kişi için miktar kontrolü yap
      for (const kisiId of selectedKisiler) {
        const kisiMiktar = kisiMiktarlari[kisiId] || miktar;
        if (isNaN(kisiMiktar) || kisiMiktar <= 0) {
          return false;
        }
      }
    }

    return true;
  };

  // Ücret seçildiğinde detaylarını güncelle
  useEffect(() => {
    if (selectedUcret) {
      const ucret = ucretler.find((u) => u._id === selectedUcret);
      setSecilenUcretBilgisi(ucret);

      // Birim ücret ise hesaplanmış tutarı güncelle
      if (ucret?.birimUcret) {
        setHesaplananTutar(ucret.tutar * miktar);

        // Kişiye özel miktar değerlerini varsayılan miktar ile başlat
        const yeniKisiMiktarlari = {};
        const yeniKisiHesaplananTutarlari = {};

        selectedKisiler.forEach((kisiId) => {
          const kisiMiktar = kisiMiktarlari[kisiId] || miktar;
          yeniKisiMiktarlari[kisiId] = kisiMiktar;
          yeniKisiHesaplananTutarlari[kisiId] = ucret.tutar * kisiMiktar;
        });

        // Sadece seçili kişilerin miktarlarını güncelleyerek diğerlerini koru
        setKisiMiktarlari((prev) => ({
          ...prev,
          ...yeniKisiMiktarlari,
        }));

        setKisiHesaplananTutarlari(yeniKisiHesaplananTutarlari);
      } else {
        setHesaplananTutar(ucret?.tutar || 0);
        // Birim ücret değilse kişiye özel miktar değerlerini temizle
        setKisiMiktarlari({});
        setKisiHesaplananTutarlari({});
      }
    } else {
      setSecilenUcretBilgisi(null);
      setHesaplananTutar(0);
      setKisiMiktarlari({});
      setKisiHesaplananTutarlari({});
    }
  }, [selectedUcret, ucretler, selectedKisiler, miktar]); // kisiMiktarlari dependency'i kaldırıldı

  // Varsayılan miktar değiştiğinde, henüz özelleştirilmemiş kişilerin miktarlarını güncelle
  useEffect(() => {
    if (secilenUcretBilgisi?.birimUcret) {
      const yeniKisiHesaplananTutarlari = { ...kisiHesaplananTutarlari };

      selectedKisiler.forEach((kisiId) => {
        // Kişiye özel miktar yoksa varsayılan miktarı kullan
        if (!kisiMiktarlari[kisiId]) {
          setKisiMiktarlari((prev) => ({
            ...prev,
            [kisiId]: miktar,
          }));
          yeniKisiHesaplananTutarlari[kisiId] =
            secilenUcretBilgisi.tutar * miktar;
        }
      });

      setKisiHesaplananTutarlari(yeniKisiHesaplananTutarlari);
    }
  }, [
    secilenUcretBilgisi,
    selectedKisiler,
    kisiMiktarlari,
    miktar,
    kisiHesaplananTutarlari,
  ]);

  // Miktar değiştiğinde hesaplanan tutarı güncelle
  const handleMiktarChange = (event) => {
    // Virgül ve nokta kullanımını düzgün şekilde işleme
    const yeniDeger = event.target.value.replace(",", ".");
    setMiktar(yeniDeger);

    // Geçerli bir sayı ise hesaplamayı yap
    const sayisalDeger = parseFloat(yeniDeger);
    if (!isNaN(sayisalDeger) && secilenUcretBilgisi?.birimUcret) {
      setHesaplananTutar(secilenUcretBilgisi.tutar * sayisalDeger);
    }
  };

  const handleKisiMiktarChange = (kisiId, yeniMiktar) => {
    // Virgül ve nokta kullanımını düzgün şekilde işleme
    const yeniDeger =
      typeof yeniMiktar === "string"
        ? yeniMiktar.replace(",", ".")
        : yeniMiktar;

    // String olarak sakla ama hesaplama için sayıya çevir
    setKisiMiktarlari((prev) => ({
      ...prev,
      [kisiId]: yeniDeger,
    }));

    // Sayısal değer hesaplama için
    const sayisalDeger = parseFloat(yeniDeger);

    // Kişiye özel hesaplanan tutarı güncelle
    if (!isNaN(sayisalDeger) && secilenUcretBilgisi?.birimUcret) {
      setKisiHesaplananTutarlari((prev) => ({
        ...prev,
        [kisiId]: secilenUcretBilgisi.tutar * sayisalDeger,
      }));
    }
  };

  // Mevcut borçları kontrol edip, mükerrer olanları tespit eder
  const checkExistingBorclar = async (borclar) => {
    const kontrolEdilecekler = [];
    const atlanacaklar = [];

    // Her kişi, yıl ve ay kombinasyonu için API çağrısı yap
    for (const borc of borclar) {
      const { kisi_id, yil, ay } = borc;
      try {
        const response = await fetch(
          `/api/borclar/donem-kontrol/${kisi_id}/${yil}/${ay}`,
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        );
        const data = await response.json();

        if (data.borcVar) {
          // Kişi bilgilerini bul
          const kisi = kisiler.find((k) => k._id === kisi_id);
          atlanacaklar.push({
            kisi: kisi ? `${kisi.ad} ${kisi.soyad}` : "Bilinmeyen Kişi",
            yil,
            ay,
            ayAdi: aylar[ay - 1],
          });
        } else {
          kontrolEdilecekler.push(borc);
        }
      } catch (error) {
        // Hata durumunda, varsayılan olarak borcu kontrole dahil et
        kontrolEdilecekler.push(borc);
      }
    }

    return { kontrolEdilecekler, atlanacaklar };
  };

  const handleSubmit = async () => {
    if (!hasPermission(user, "borclar_toplu_ekleme")) {
      toast.error("Toplu borç eklemek için yetkiniz yok.");
      return;
    }
    if (!isFormValid()) {
      toast.warning("Lütfen ücret, kişi, yıl ve ay seçimlerini yapınız.");
      return;
    }

    const ucret = ucretler.find((u) => u._id === selectedUcret);
    const borclar = [];

    selectedKisiler.forEach((kisiId) => {
      selectedYillar.forEach((yil) => {
        selectedAylar.forEach((ay) => {
          const ayIndex = aylar.indexOf(ay);
          const ayNumara = ayIndex + 1; // 1-12 arası ay değeri

          // Kişiye özel miktar değerini al, yoksa genel miktar değerini kullan
          const kisiMiktarString = kisiMiktarlari[kisiId] || miktar.toString();
          const kisiMiktar = parseFloat(kisiMiktarString) || 0;

          // Birim ücret hesaplaması
          const hesaplananBorcTutari = ucret.birimUcret
            ? ucret.tutar * kisiMiktar
            : ucret.tutar;

          borclar.push({
            kisi_id: kisiId,
            ucret_id: selectedUcret,
            borclandirmaTarihi: new Date(yil, ayIndex),
            borcTutari: hesaplananBorcTutari,
            miktar: ucret.birimUcret ? kisiMiktar : 1, // Her kişi için özel miktar değerini gönder
            yil: parseInt(yil),
            ay: ayNumara,
            sonOdemeTarihi: sonOdemeTarihi || null,
          });
        });
      });
    });

    if (borclar.length === 0) {
      toast.error("Seçilen tarih aralığında geçerli ücret bulunamadı!");
      return;
    }

    try {
      // Mevcut borçları kontrol et
      const { kontrolEdilecekler, atlanacaklar } = await checkExistingBorclar(
        borclar
      );
      setAtlanilacakBorclar(atlanacaklar);

      if (kontrolEdilecekler.length === 0) {
        toast.warning(
          "Tüm seçilen borçlar zaten mevcut. Hiçbir işlem yapılmadı."
        );
        if (atlanacaklar.length > 0) {
          setDialogOpen(true);
        }
        return;
      }

      if (atlanacaklar.length > 0) {
        setDialogOpen(true);
      }

      // Sadece mükerrer olmayan borçları ekle
      await dispatch(addBulkBorc({ borclar: kontrolEdilecekler })).unwrap();

      // Başarı mesajını burada göster
      toast.success(`${kontrolEdilecekler.length} adet borç başarıyla eklendi`);

      // Eğer dialog açık değilse (yani hiç atlanılan borç yoksa) direkt listeye dön
      if (atlanacaklar.length === 0) {
        navigate("/borclar");
      }
    } catch (error) {
      console.error("Borç ekleme hatası:", error);
      toast.error(
        "Borç eklenirken bir hata oluştu: " +
          (error.msg || error.message || "Bilinmeyen hata")
      );
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    // İşlem tamamlandığında borçlar listesine dön
    navigate("/borclar");
  };

  // DataGrid için sütun tanımlamaları
  const columns = [
    { field: "ad", headerName: "Ad", flex: 1 },
    { field: "soyad", headerName: "Soyad", flex: 1 },
    // Birim ücret seçilirse miktar ve hesaplanan tutar sütunlarını göster
    ...(secilenUcretBilgisi?.birimUcret
      ? [
          {
            field: "miktar",
            headerName: "Miktar",
            width: 120,
            editable: false, // DataGrid'in kendi düzenleme özelliğini kapatıyoruz
            renderCell: (params) => (
              <TextField
                type="text"
                size="small"
                fullWidth
                variant="outlined"
                value={kisiMiktarlari[params.row._id] || miktar}
                onChange={(e) =>
                  handleKisiMiktarChange(params.row._id, e.target.value)
                }
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
                inputProps={{
                  style: { textAlign: "right" },
                }}
              />
            ),
          },
          {
            field: "hesaplananTutar",
            headerName: "Hesaplanan Tutar",
            width: 150,
            valueGetter: (params) => {
              const kisiMiktarString = kisiMiktarlari[params.row._id] || miktar;
              const kisiMiktar = parseFloat(kisiMiktarString) || 0;
              return secilenUcretBilgisi.tutar * kisiMiktar;
            },
            renderCell: (params) => (
              <Typography variant="body2" fontWeight="medium">
                ₺
                {(
                  kisiHesaplananTutarlari[params.row._id] ||
                  secilenUcretBilgisi.tutar * (parseFloat(miktar) || 0)
                ).toFixed(2)}
              </Typography>
            ),
          },
        ]
      : []),
    {
      field: "email",
      headerName: "E-posta",
      flex: 1,
      hide: secilenUcretBilgisi?.birimUcret || false,
    },
  ];

  const loading = ucretLoading || borcLoading;

  return (
    <PermissionRequired
      user={user} // user prop'unu ekliyoruz
      yetkiKodu="borclar_toplu_ekleme"
      fallback={
        <div style={{ padding: 32 }}>
          <h2>Bu sayfayı görüntülemek için yetkiniz yok.</h2>
        </div>
      }
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Toplu Borç Ekleme
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ücret Seçimi
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Ücret</InputLabel>
            <Select
              value={selectedUcret}
              onChange={(e) => setSelectedUcret(e.target.value)}
              label="Ücret"
              disabled={loading}
            >
              {ucretler.map((ucret) => (
                <MenuItem key={ucret._id} value={ucret._id}>
                  {ucret.tarife_id && ucret.tarife_id.ad
                    ? `${ucret.tarife_id.ad} - ₺${ucret.tutar}`
                    : `Tarife Tanımlanmamış - ₺${ucret.tutar}`}
                  {ucret.birimUcret ? " (Birim)" : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Seçilen ücret bilgileri ve miktar girişi */}
          {secilenUcretBilgisi && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: "background.paper",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Seçilen Ücret:{" "}
                {secilenUcretBilgisi &&
                secilenUcretBilgisi.tarife_id &&
                secilenUcretBilgisi.tarife_id.ad
                  ? secilenUcretBilgisi.tarife_id.ad
                  : "Tarife Tanımlanmamış"}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Birim Fiyat: ₺{secilenUcretBilgisi.tutar.toFixed(2)}
              </Typography>

              {secilenUcretBilgisi.birimUcret && (
                <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Varsayılan Miktar"
                      type="text"
                      value={miktar}
                      onChange={handleMiktarChange}
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
                      helperText="Tüm kişiler için varsayılan miktar (aşağıda özelleştirebilirsiniz)"
                      size="small"
                      inputProps={{ style: { textAlign: "right" } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Alert severity="info" sx={{ py: 0 }}>
                      Varsayılan Hesaplanan Tutar:{" "}
                      <strong>₺{hesaplananTutar.toFixed(2)}</strong>
                    </Alert>
                  </Grid>
                </Grid>
              )}

              {/* Son Ödeme Tarihi Alanını daha belirgin hale getir */}
              <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Son Ödeme Tarihi"
                    type="date"
                    value={sonOdemeTarihi}
                    onChange={(e) => setSonOdemeTarihi(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    helperText="Tüm borçlar için son ödeme tarihi"
                    size="medium"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  {sonOdemeTarihi ? (
                    <Alert severity="success" sx={{ py: 0 }}>
                      Son ödeme tarihi:{" "}
                      <strong>
                        {new Date(sonOdemeTarihi).toLocaleDateString("tr-TR")}
                      </strong>
                    </Alert>
                  ) : (
                    <Alert severity="warning" sx={{ py: 0 }}>
                      Son ödeme tarihi belirlenmedi. Zorunlu değildir, isteğe
                      bağlı olarak ekleyebilirsiniz.
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Yıl ve Ay seçimlerini yan yana yerleştiriyoruz */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>
                Dönem Seçimi
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Yıllar</InputLabel>
                  <Select
                    multiple
                    value={selectedYillar}
                    onChange={(e) => setSelectedYillar(e.target.value)}
                    input={<OutlinedInput label="Yıllar" />}
                    renderValue={(selected) => selected.join(", ")}
                    MenuProps={MenuProps}
                    disabled={loading}
                  >
                    {yillar.map((yil) => (
                      <MenuItem key={yil} value={yil}>
                        <Checkbox checked={selectedYillar.indexOf(yil) > -1} />
                        <ListItemText primary={yil} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Aylar</InputLabel>
                  <Select
                    multiple
                    value={selectedAylar}
                    onChange={(e) => setSelectedAylar(e.target.value)}
                    input={<OutlinedInput label="Aylar" />}
                    renderValue={(selected) => selected.join(", ")}
                    MenuProps={MenuProps}
                    disabled={loading}
                  >
                    {aylar.map((ay) => (
                      <MenuItem key={ay} value={ay}>
                        <Checkbox checked={selectedAylar.indexOf(ay) > -1} />
                        <ListItemText primary={ay} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>

          {selectedKisiler.length > 0 &&
            selectedAylar.length > 0 &&
            selectedYillar.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Oluşturulacak toplam borç sayısı:{" "}
                {selectedKisiler.length *
                  selectedAylar.length *
                  selectedYillar.length}
                {secilenUcretBilgisi?.birimUcret && (
                  <>
                    {" "}
                    - Her borç için miktar: <strong>{miktar}</strong>, Birim
                    tutar:{" "}
                    <strong>₺{secilenUcretBilgisi.tutar.toFixed(2)}</strong>
                  </>
                )}
              </Alert>
            )}

          <Typography variant="h6" gutterBottom>
            Kişi Seçimi
          </Typography>
          <Box sx={{ height: 400, mb: 3 }}>
            <DataGrid
              rows={kisiler}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              checkboxSelection
              disableRowSelectionOnClick={secilenUcretBilgisi?.birimUcret}
              getRowId={(row) => row._id}
              onRowSelectionModelChange={(newSelectionModel) => {
                setSelectedKisiler(newSelectionModel);
              }}
              loading={loading}
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

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/borclar")}
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
              {loading ? "İşleniyor..." : "Borçları Oluştur"}
            </Button>
          </Box>
        </Paper>

        {/* Atlanılan Borçlar Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Atlanılan Borç Kayıtları
            <Typography variant="subtitle2" color="text.secondary">
              Bu dönemler için zaten borç kaydı mevcut olduğundan tekrar
              oluşturulmadı.
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            {atlanilacakBorclar.length > 0 ? (
              <List>
                {atlanilacakBorclar.map((borc, index) => (
                  <ListItem key={index} divider>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={6}>
                        <Typography variant="body1">{borc.kisi}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Chip
                          label={`${borc.ayAdi} ${borc.yil}`}
                          color="warning"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>Hiçbir borç kaydı atlanmadı.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} variant="contained">
              Borçlar Listesine Dön
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionRequired>
  );
};

export default BulkBorcForm;
