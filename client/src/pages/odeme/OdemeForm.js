import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  OutlinedInput,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  addOdeme,
  getOdemeById,
  updateOdeme,
  clearCurrentOdeme,
} from "../../redux/odeme/odemeSlice";
import {
  getBorclar,
  getOdenmemisBorclarByKisi,
  getOdenmemisBorclarByCokluKisi,
  getBorcById,
} from "../../redux/borc/borcSlice";
import { getKisiler } from "../../redux/kisi/kisiSlice";
import { getActiveKasalar } from "../../redux/kasa/kasaSlice";
import { toast } from "react-toastify";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
export const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const OdemeForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { odeme, loading: odemeLoading } = useSelector((state) => state.odeme);
  const { borclar, loading: borcLoading } = useSelector((state) => state.borc);
  const { kisiler, loading: kisiLoading } = useSelector((state) => state.kisi);
  const { kasalar, loading: kasaLoading } = useSelector((state) => state.kasa);

  const [selectedKisiler, setSelectedKisiler] = useState([]);
  const [selectedBorclar, setSelectedBorclar] = useState([]);
  const [odemeBilgileri, setOdemeBilgileri] = useState({
    odemeTarihi: new Date().toISOString().split("T")[0],
    odemeYontemi: "Nakit",
    aciklama: "",
    makbuzNo: "",
    kasa_id: "",
  });
  const [kismiOdemeler, setKismiOdemeler] = useState({});
  const [uyariDialog, setUyariDialog] = useState(false);
  const [uyariMesaji, setUyariMesaji] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dekontSil, setDekontSil] = useState(false);
  const fileInputRef = React.useRef(null);

  const loading = odemeLoading || borcLoading || kisiLoading || kasaLoading;

  const isDuzenlemeMode = !!id;

  useEffect(() => {
    if (!isDuzenlemeMode) {
      dispatch(getKisiler());
    }

    dispatch(getActiveKasalar());

    if (id) {
      dispatch(getOdemeById(id));
    } else {
      dispatch(clearCurrentOdeme());
    }

    return () => {
      dispatch(clearCurrentOdeme());
    };
  }, [dispatch, id, isDuzenlemeMode]);

  useEffect(() => {
    if (odeme && id) {
      setOdemeBilgileri({
        odemeTarihi: odeme.odemeTarihi
          ? new Date(odeme.odemeTarihi).toISOString().split("T")[0]
          : "",
        odemeYontemi: odeme.odemeYontemi || "Nakit",
        aciklama: odeme.aciklama || "",
        makbuzNo: odeme.makbuzNo || "",
        kasa_id: odeme.kasa_id?._id || "",
      });

      if (odeme.kisi_id) {
        setSelectedKisiler([odeme.kisi_id._id || odeme.kisi_id]);
        dispatch(getOdenmemisBorclarByKisi(odeme.kisi_id._id || odeme.kisi_id));
      }

      if (odeme.borc_id) {
        dispatch(getBorcById(odeme.borc_id._id || odeme.borc_id));
        setSelectedBorclar([odeme.borc_id._id || odeme.borc_id]);
        setKismiOdemeler({
          [odeme.borc_id._id || odeme.borc_id]: odeme.odemeTutari,
        });
      }
    }
  }, [odeme, id, dispatch]);

  useEffect(() => {
    if (borclar.length > 0 && !id) {
      const odenmemisBorclar = borclar.filter((borc) => !borc.odendi);
      const yeniKismiOdemeler = { ...kismiOdemeler };
      odenmemisBorclar.forEach((borc) => {
        if (!yeniKismiOdemeler[borc._id]) {
          const tutarYuvarlanmis =
            Math.round((borc.kalan || borc.borcTutari) * 100) / 100;
          yeniKismiOdemeler[borc._id] = tutarYuvarlanmis;
        }
      });

      setKismiOdemeler(yeniKismiOdemeler);
    } else if (borclar.length > 0 && id && odeme) {
      const yeniKismiOdemeler = { ...kismiOdemeler };
      selectedBorclar.forEach((borcId) => {
        const borc = borclar.find((b) => b._id === borcId);
        if (borc && !yeniKismiOdemeler[borcId]) {
          const tutarYuvarlanmis =
            Math.round((borc.kalan || borc.borcTutari) * 100) / 100;
          yeniKismiOdemeler[borcId] = tutarYuvarlanmis;
        } else {
          yeniKismiOdemeler[borcId] = kismiOdemeler[borcId];
        }
      });

      setKismiOdemeler(yeniKismiOdemeler);
    }
  }, [borclar, id, odeme, kismiOdemeler, selectedBorclar]);

  const handleKisiChange = (event) => {
    if (isDuzenlemeMode) {
      return;
    }

    const selected = event.target.value;
    setSelectedKisiler(selected);
    setSelectedBorclar([]);
    setKismiOdemeler({});

    if (selected.length === 1) {
      dispatch(getOdenmemisBorclarByKisi(selected[0]));
    } else if (selected.length > 1) {
      dispatch(getOdenmemisBorclarByCokluKisi(selected));
    } else {
      dispatch(getBorclar());
    }
  };

  const handleKismiOdemeChange = (borcId, value) => {
    const normalizedValue = value.toString().replace(",", ".");
    const numericValue =
      normalizedValue === "" ? "" : parseFloat(normalizedValue);
    const borc = borclar.find((b) => b._id === borcId);

    const kalanTutarYuvarlanmis =
      Math.round((borc.kalan || borc.borcTutari) * 100) / 100;

    if (numericValue > kalanTutarYuvarlanmis) {
      toast.warning(
        `Ödeme tutarı borç tutarından fazla olamaz! (Maksimum: ${kalanTutarYuvarlanmis})`
      );
      setKismiOdemeler({
        ...kismiOdemeler,
        [borcId]: kalanTutarYuvarlanmis,
      });
    } else {
      setKismiOdemeler({
        ...kismiOdemeler,
        [borcId]: numericValue,
      });
    }
  };

  const checkBorcKalan = () => {
    if (isDuzenlemeMode) {
      const borcId = selectedBorclar[0];
      const borc = borclar.find((b) => b._id === borcId);

      if (!borc) {
        return false;
      }

      const yeniOdemeTutari = parseFloat(kismiOdemeler[borcId] || 0);

      if (isNaN(yeniOdemeTutari) || yeniOdemeTutari <= 0) {
        setUyariMesaji("Ödeme tutarı 0 veya negatif olamaz!");
        setUyariDialog(true);
        return false;
      }

      if (odeme) {
        const mevcutOdemeTutari = odeme.odemeTutari || 0;
        const borcKalanDuzeltilmis = (borc.kalan || 0) + mevcutOdemeTutari;

        if (yeniOdemeTutari > borcKalanDuzeltilmis) {
          const kisiAdi = `${borc.kisi_id?.ad || ""} ${
            borc.kisi_id?.soyad || ""
          }`;
          const donemBilgisi =
            borc.ay && borc.yil ? `${borc.ay}. ay ${borc.yil}` : "";

          setUyariMesaji(
            `${kisiAdi} kişisinin ${donemBilgisi} dönemine ait borç tutarından fazla ödeme yapmaya çalışıyorsunuz! Maksimum ödeme tutarı: ${borcKalanDuzeltilmis.toFixed(
              2
            )}`
          );
          setUyariDialog(true);
          return false;
        }
      }

      return true;
    } else {
      const odenmeBilgileri = selectedBorclar.map((borcId) => {
        const borc = borclar.find((b) => b._id === borcId);
        const odemeTutari = parseFloat(kismiOdemeler[borcId] || 0);
        const kalanTutarYuvarlanmis =
          Math.round((borc.kalan || borc.borcTutari) * 100) / 100;

        if (borc.odendi) {
          return {
            borcId,
            kisiAdi: `${borc.kisi_id?.ad} ${borc.kisi_id?.soyad}`,
            donem: borc.ay && borc.yil ? `${borc.ay}. ay ${borc.yil}` : "",
            tamOdendi: true,
            fazlaOdeme: false,
          };
        } else if (odemeTutari > kalanTutarYuvarlanmis) {
          return {
            borcId,
            kisiAdi: `${borc.kisi_id?.ad} ${borc.kisi_id?.soyad}`,
            donem: borc.ay && borc.yil ? `${borc.ay}. ay ${borc.yil}` : "",
            tamOdendi: false,
            fazlaOdeme: true,
          };
        }

        return { borcId, tamOdendi: false, fazlaOdeme: false };
      });

      const odenmisBorc = odenmeBilgileri.find((info) => info.tamOdendi);
      const fazlaOdeme = odenmeBilgileri.find((info) => info.fazlaOdeme);

      if (odenmisBorc) {
        setUyariMesaji(
          `${odenmisBorc.kisiAdi} kişisinin ${odenmisBorc.donem} dönemine ait borcu zaten tamamen ödenmiş!`
        );
        setUyariDialog(true);
        return false;
      }

      if (fazlaOdeme) {
        setUyariMesaji(
          `${fazlaOdeme.kisiAdi} kişisinin ${fazlaOdeme.donem} dönemine ait borç tutarından fazla ödeme yapmaya çalışıyorsunuz!`
        );
        setUyariDialog(true);
        return false;
      }

      return true;
    }
  };

  const isFormValid = () => {
    const kisilerValid =
      Array.isArray(selectedKisiler) && selectedKisiler.length > 0;
    const borclarValid =
      Array.isArray(selectedBorclar) && selectedBorclar.length > 0;
    const tarihValid =
      odemeBilgileri &&
      odemeBilgileri.odemeTarihi &&
      odemeBilgileri.odemeTarihi.trim() !== "";
    const kasaValid =
      odemeBilgileri &&
      odemeBilgileri.kasa_id &&
      odemeBilgileri.kasa_id.trim() !== "";

    return kisilerValid && borclarValid && tarihValid && kasaValid;
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setDekontSil(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteDekont = () => {
    setDekontSil(true);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadDekont = async () => {
    if (!id || !odeme || !odeme.dekontDosyaAdi) return;

    try {
      const response = await fetch(`/api/odemeler/dekont/${id}`, {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
      });

      if (!response.ok) {
        throw new Error("Dekont indirilemedi");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = odeme.dekontOrijinalAd || "dekont";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Dekont indirme hatası:", error);
      toast.error("Dekont indirilemedi: " + error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formGecerli = isFormValid();
    console.log("Form geçerli mi:", formGecerli);

    if (!formGecerli) {
      toast.error(
        "Lütfen kişi seçin, en az bir borç seçin, ödeme tarihi belirleyin ve kasa seçin!"
      );
      return;
    }

    if (!checkBorcKalan()) {
      return;
    }

    try {
      for (const borcId of selectedBorclar) {
        const borc = borclar.find((b) => b._id === borcId);
        if (!borc) {
          console.log("Borc bulunamadı:", borcId);
          continue;
        }

        const odemeTutari = parseFloat(kismiOdemeler[borcId] || 0);

        if (odemeTutari <= 0) {
          toast.warning(
            `${borc.kisi_id?.ad || ""} ${borc.kisi_id?.soyad || ""} kişisinin ${
              borc.ay || ""
            }.${borc.ay ? " ay" : ""} ${
              borc.yil || ""
            } döneminin ödeme tutarı 0 veya negatif olamaz!`
          );
          continue;
        }

        const formData = new FormData();
        formData.append("borc_id", borcId);
        formData.append(
          "kisi_id",
          borc.kisi_id?._id ||
            (typeof borc.kisi_id === "string"
              ? borc.kisi_id
              : selectedKisiler[0])
        );
        formData.append("kasa_id", odemeBilgileri.kasa_id);
        formData.append("odemeTarihi", odemeBilgileri.odemeTarihi);
        formData.append("odemeTutari", odemeTutari);
        formData.append("odemeYontemi", odemeBilgileri.odemeYontemi);
        formData.append("aciklama", odemeBilgileri.aciklama || "");
        formData.append("makbuzNo", odemeBilgileri.makbuzNo || "");

        if (selectedFile && odemeBilgileri.odemeYontemi === "Havale/EFT") {
          formData.append("dekont", selectedFile);
        }

        if (id && dekontSil) {
          formData.append("dekontSil", "true");
        }

        console.log("Kaydedilecek ödeme verisi:", {
          borc_id: borcId,
          kisi_id: borc.kisi_id?._id,
          kasa_id: odemeBilgileri.kasa_id,
          odemeTarihi: odemeBilgileri.odemeTarihi,
          odemeTutari,
          odemeYontemi: odemeBilgileri.odemeYontemi,
          aciklama: odemeBilgileri.aciklama,
          makbuzNo: odemeBilgileri.makbuzNo,
          dekont: selectedFile ? selectedFile.name : null,
          dekontSil,
        });

        if (id) {
          await dispatch(updateOdeme({ id, odemeData: formData })).unwrap();
        } else {
          await dispatch(addOdeme(formData)).unwrap();
          toast.success("Ödeme başarıyla kaydedildi");
        }
      }

      navigate("/odemeler");
    } catch (error) {
      console.error("Ödeme kaydı sırasında hata:", error);
      toast.error(
        "Ödeme kaydedilirken bir hata oluştu: " +
          (error.message || "Bilinmeyen hata")
      );
    }
  };

  const columns = [
    { field: "kisiAdi", headerName: "Kişi", flex: 1.5 },
    { field: "donem", headerName: "Dönem", flex: 1 },
    {
      field: "ucretAdi",
      headerName: "Ücret Türü",
      flex: 1.5,
      valueGetter: (params) => {
        const borc = params.row;
        if (borc.ucret_id) {
          if (borc.ucret_id.tarife_id) {
            return `${borc.ucret_id.tarife_id.ad || ""} - ${
              borc.ucret_id.ad || ""
            }`;
          }
          return borc.ucret_id.ad || "";
        }
        return "";
      },
    },
    {
      field: "borcTutari",
      headerName: "Borç Tutarı",
      flex: 0.8,
      type: "number",
      valueFormatter: (params) => {
        return `₺${params.value.toFixed(2)}`;
      },
    },
    {
      field: "kalanTutar",
      headerName: "Kalan",
      flex: 0.8,
      type: "number",
      valueFormatter: (params) => {
        return `₺${params.value.toFixed(2)}`;
      },
    },
    {
      field: "odendiDurumu",
      headerName: "Durum",
      flex: 0.7,
      renderCell: (params) => (
        <span
          style={{
            color: params.row.odendi ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {params.row.odendi ? "Ödendi" : "Ödenmedi"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Ödeme Tutarı",
      width: 180,
      renderCell: (params) => {
        const isEditable =
          !isDuzenlemeMode ||
          (isDuzenlemeMode &&
            odeme &&
            odeme.borc_id &&
            (odeme.borc_id._id || odeme.borc_id) === params.row.id);

        return (
          <TextField
            fullWidth
            size="small"
            type="text"
            value={kismiOdemeler[params.row.id] || ""}
            onChange={(e) =>
              handleKismiOdemeChange(params.row.id, e.target.value)
            }
            disabled={!isEditable}
            InputProps={{
              startAdornment: <div style={{ marginRight: 5 }}>₺</div>,
            }}
            sx={{ "& .MuiOutlinedInput-root": { paddingLeft: 0 } }}
          />
        );
      },
    },
  ];

  const rows = borclar
    .filter(
      (borc) =>
        !borc.odendi ||
        (isDuzenlemeMode &&
          odeme &&
          odeme.borc_id &&
          (odeme.borc_id._id || odeme.borc_id) === borc._id)
    )
    .map((borc) => ({
      id: borc._id,
      kisiAdi:
        borc.kisi_id && typeof borc.kisi_id === "object"
          ? `${borc.kisi_id.ad || ""} ${borc.kisi_id.soyad || ""}`
          : selectedKisiler.length === 1
          ? kisiler.find((k) => k._id === selectedKisiler[0])?.ad +
            " " +
            kisiler.find((k) => k._id === selectedKisiler[0])?.soyad
          : "",
      donem: borc.ay && borc.yil ? `${borc.ay}. ay ${borc.yil}` : "",
      ucretAdi: borc.ucret_id?.ad || "",
      borcTutari: borc.borcTutari || 0,
      kalanTutar: Math.round((borc.kalan || borc.borcTutari) * 100) / 100,
      odendi: borc.odendi || false,
      ucret_id: borc.ucret_id,
    }));

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {id ? "Ödeme Düzenle" : "Yeni Ödeme Ekle"}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <FormControl
                fullWidth
                required
                disabled={loading || isDuzenlemeMode}
              >
                <InputLabel>Kişi Seçimi</InputLabel>
                <Select
                  multiple
                  value={selectedKisiler}
                  onChange={handleKisiChange}
                  input={<OutlinedInput label="Kişi Seçimi" />}
                  renderValue={(selected) => {
                    return selected
                      .map((s) => {
                        const kisi =
                          kisiler.find((k) => k._id === s) ||
                          (odeme &&
                            odeme.kisi_id && {
                              ad: odeme.kisi_id.ad || "",
                              soyad: odeme.kisi_id.soyad || "",
                            });
                        return kisi ? `${kisi.ad} ${kisi.soyad}` : "";
                      })
                      .join(", ");
                  }}
                  disabled={isDuzenlemeMode}
                >
                  {kisiler.map((kisi) => (
                    <MenuItem key={kisi._id} value={kisi._id}>
                      {kisi.ad} {kisi.soyad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <TextField
                  label="Ödeme Tarihi"
                  type="date"
                  value={odemeBilgileri.odemeTarihi}
                  onChange={(e) =>
                    setOdemeBilgileri({
                      ...odemeBilgileri,
                      odemeTarihi: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Kasa</InputLabel>
                <Select
                  value={odemeBilgileri.kasa_id}
                  label="Kasa"
                  onChange={(e) =>
                    setOdemeBilgileri({
                      ...odemeBilgileri,
                      kasa_id: e.target.value,
                    })
                  }
                >
                  {kasalar.map((kasa) => (
                    <MenuItem key={kasa._id} value={kasa._id}>
                      {kasa.kasaAdi}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Ödeme Yöntemi</InputLabel>
                <Select
                  value={odemeBilgileri.odemeYontemi}
                  label="Ödeme Yöntemi"
                  onChange={(e) =>
                    setOdemeBilgileri({
                      ...odemeBilgileri,
                      odemeYontemi: e.target.value,
                    })
                  }
                >
                  <MenuItem value="Nakit">Nakit</MenuItem>
                  <MenuItem value="Havale/EFT">Havale/EFT</MenuItem>
                  <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Makbuz No"
                value={odemeBilgileri.makbuzNo}
                onChange={(e) =>
                  setOdemeBilgileri({
                    ...odemeBilgileri,
                    makbuzNo: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                multiline
                rows={2}
                value={odemeBilgileri.aciklama}
                onChange={(e) =>
                  setOdemeBilgileri({
                    ...odemeBilgileri,
                    aciklama: e.target.value,
                  })
                }
              />
            </Grid>

            {odemeBilgileri.odemeYontemi === "Havale/EFT" && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    mt: 1,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Dekont Yükleme
                  </Typography>

                  {id && odeme && odeme.dekontDosyaAdi && !dekontSil ? (
                    <Box sx={{ mb: 2 }}>
                      <Alert
                        severity="info"
                        action={
                          <Box sx={{ display: "flex" }}>
                            <Button
                              color="primary"
                              size="small"
                              onClick={handleDownloadDekont}
                            >
                              İndir
                            </Button>
                            <Button
                              color="error"
                              size="small"
                              onClick={handleDeleteDekont}
                            >
                              Sil
                            </Button>
                          </Box>
                        }
                      >
                        Mevcut Dekont: {odeme.dekontOrijinalAd} (
                        {formatFileSize(odeme.dekontBoyut)})
                      </Alert>
                    </Box>
                  ) : (
                    <Box sx={{ mb: 2 }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="dekont-file"
                      />
                      <label htmlFor="dekont-file">
                        <Button
                          variant="outlined"
                          component="span"
                          fullWidth={!selectedFile}
                        >
                          Dekont Seç
                        </Button>
                      </label>

                      {selectedFile && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mt: 1,
                            gap: 1,
                          }}
                        >
                          <Alert
                            severity="info"
                            sx={{ flex: 1 }}
                            action={
                              <Button
                                color="error"
                                size="small"
                                onClick={handleClearFile}
                              >
                                Temizle
                              </Button>
                            }
                          >
                            {selectedFile.name} (
                            {formatFileSize(selectedFile.size)})
                          </Alert>
                        </Box>
                      )}
                    </Box>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    JPG, PNG veya PDF formatında, maksimum 5MB boyutunda dekont
                    dosyası yükleyebilirsiniz. Havale/EFT ödemelerinde dekont
                    yüklenmesi tavsiye edilir.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 3, mb: 1 }}>
            <Divider>
              <Typography variant="subtitle2">Borç Seçimi</Typography>
            </Divider>
          </Box>

          {selectedKisiler.length > 0 ? (
            <>
              <Box sx={{ height: 400, width: "100%", mb: 2 }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 25]}
                  checkboxSelection
                  disableSelectionOnClick
                  loading={borcLoading}
                  onRowSelectionModelChange={(newSelectionModel) => {
                    if (isDuzenlemeMode) {
                      return;
                    }

                    const selectedIds = Array.from(newSelectionModel);
                    console.log("Seçilen borçlar (DataGrid):", selectedIds);
                    setSelectedBorclar(selectedIds);

                    const yeniKismiOdemeler = { ...kismiOdemeler };
                    selectedIds.forEach((borcId) => {
                      const borc = borclar.find((b) => b._id === borcId);
                      if (borc && !yeniKismiOdemeler[borcId]) {
                        yeniKismiOdemeler[borcId] =
                          borc.kalan || borc.borcTutari;
                      }
                    });
                    setKismiOdemeler(yeniKismiOdemeler);
                  }}
                  rowSelectionModel={selectedBorclar}
                  selectionModel={selectedBorclar}
                  onSelectionModelChange={(newSelectionModel) => {
                    if (isDuzenlemeMode) {
                      return;
                    }

                    const selectedIds = Array.from(newSelectionModel);
                    console.log("Seçilen borçlar (eski prop):", selectedIds);
                    setSelectedBorclar(selectedIds);

                    const yeniKismiOdemeler = { ...kismiOdemeler };
                    selectedIds.forEach((borcId) => {
                      const borc = borclar.find((b) => b._id === borcId);
                      if (borc && !yeniKismiOdemeler[borcId]) {
                        yeniKismiOdemeler[borcId] =
                          borc.kalan || borc.borcTutari;
                      }
                    });
                    setKismiOdemeler(yeniKismiOdemeler);
                  }}
                  isRowSelectable={(params) =>
                    !isDuzenlemeMode && !params.row.odendi
                  }
                />
              </Box>

              {selectedBorclar.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Alert severity="info">
                    Toplam ödeme tutarı: ₺
                    {Object.entries(kismiOdemeler)
                      .filter(([borcId]) => selectedBorclar.includes(borcId))
                      .reduce(
                        (total, [_, amount]) => total + parseFloat(amount || 0),
                        0
                      )
                      .toFixed(2)}
                  </Alert>
                </Box>
              )}
            </>
          ) : (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Lütfen borç seçimi yapmak için önce kişi seçiniz.
            </Alert>
          )}

          <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/odemeler")}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                loading ||
                !(
                  selectedKisiler.length > 0 &&
                  selectedBorclar.length > 0 &&
                  odemeBilgileri.odemeTarihi &&
                  odemeBilgileri.kasa_id
                )
              }
              startIcon={
                loading && <CircularProgress size={20} color="inherit" />
              }
            >
              {loading ? "İşleniyor..." : id ? "Güncelle" : "Kaydet"}
            </Button>
          </Box>
        </form>
      </Paper>

      <Dialog open={uyariDialog} onClose={() => setUyariDialog(false)}>
        <DialogTitle>Uyarı</DialogTitle>
        <DialogContent>
          <DialogContentText>{uyariMesaji}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUyariDialog(false)} color="primary">
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OdemeForm;
