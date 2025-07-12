import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Tooltip,
  Chip,
  Button,
} from "@mui/material";

import {
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  ViewList as ViewListIcon,
  Schedule as ScheduleIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Event as EventIcon,
  Dashboard as DashboardIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

import { getRandevuSlotlari } from "../../redux/randevuSlot/randevuSlotSlice";
import { getActiveRandevuTanimlari } from "../../redux/randevuTanimi/randevuTanimiSlice";
import LoadingBox from "../../components/LoadingBox";
import { format, isToday, isTomorrow, isThisWeek, compareAsc } from "date-fns";
import { tr } from "date-fns/locale";

const RandevuAnaSayfa = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux store'dan veri çekme işlemini daha güvenli hale getirelim
  const randevuSlotState = useSelector((state) => state.randevuSlot) || {};
  const { randevuSlotlari = [], loading: slotsLoading = false } =
    randevuSlotState;

  const randevuTanimiState = useSelector((state) => state.randevuTanimi) || {};
  const {
    randevuTanimlari = [],
    activeRandevuTanimlari = [],
    loading: tanimlarLoading = false,
    error: tanimlarError = null,
  } = randevuTanimiState;

  // Görüntülenecek tanımları belirle: Önce activeRandevuTanimlari'ni dene, yoksa randevuTanimlari'nı kullan
  const [localRandevuTanimlari, setLocalRandevuTanimlari] = useState([]);

  const [bugunRandevular, setBugunRandevular] = useState([]);
  const [yaklasanRandevular, setYaklasanRandevular] = useState([]);
  const [istatistikler, setIstatistikler] = useState({
    toplamRandevu: 0,
    rezerveRandevu: 0,
    acikRandevu: 0,
    kapaliRandevu: 0,
    bugunRandevu: 0,
    yaklasanRandevu: 0,
  });

  // Verileri yükle
  useEffect(() => {
    console.log("Randevu tanımları yükleniyor...");
    dispatch(getRandevuSlotlari());

    // activeRandevuTanimlari'nı getir ve Redux store'u doldur
    dispatch(getActiveRandevuTanimlari())
      .then((result) => {
        console.log("Aktif randevu tanımları sonucu:", result);
        if (result.payload && result.payload.length > 0) {
          console.log(
            "Randevu tanımları başarıyla yüklendi:",
            result.payload.length
          );

          // State'e manuel olarak ekleyelim
          setLocalRandevuTanimlari(result.payload);

          // Başarılı yükleme sonrası state'i manuel olarak güncelle (yedek önlem)
          if (
            randevuTanimiState &&
            !randevuTanimiState.activeRandevuTanimlari?.length
          ) {
            console.log("Manuel yedek state güncelleme mekanizması çalıştı");
          }
        } else {
          console.log("Randevu tanımları bulunamadı veya boş döndü");
        }
      })
      .catch((err) => {
        console.error("Randevu tanımları yüklenirken hata:", err);
      });
  }, [dispatch]);

  // Redux'tan gelen randevu tanımlarını izleyelim ve local state'i güncelleyelim
  useEffect(() => {
    if (activeRandevuTanimlari && activeRandevuTanimlari.length > 0) {
      setLocalRandevuTanimlari(activeRandevuTanimlari);
      console.log(
        "Redux'tan gelen aktif randevu tanımları local state'e yüklendi:",
        activeRandevuTanimlari.length
      );
    } else if (randevuTanimlari && randevuTanimlari.length > 0) {
      setLocalRandevuTanimlari(randevuTanimlari);
      console.log(
        "Redux'tan gelen randevu tanımları local state'e yüklendi:",
        randevuTanimlari.length
      );
    }
  }, [activeRandevuTanimlari, randevuTanimlari]);

  // Sonsuz döngüye neden olan useEffect hook'unu düzenliyoruz
  useEffect(() => {
    // localRandevuTanimlari dependency'sini kaldırıyoruz
    // Sadece geliştirici bilgisi için logları tutuyoruz, herhangi bir state değişikliği yapmıyoruz
    console.log(
      "RandevuAnaSayfa - randevuTanimlari state değişti:",
      randevuTanimlari
    );
    console.log("activeRandevuTanimlari:", activeRandevuTanimlari);
    console.log("Görüntülenecek Tanımlar:", localRandevuTanimlari);

    // Bu koşul kontrolünü localRandevuTanimlari'nı dependency olarak kullanmadan yapıyoruz
  }, [randevuTanimlari, activeRandevuTanimlari]); // localRandevuTanimlari'nı kaldırdık

  // İstatistikler için ayrı bir useEffect kullanıyoruz
  useEffect(() => {
    // Force render için dummy state güncellemesi ihtiyaç olduğunda
    if (localRandevuTanimlari.length > 0 && !istatistikler.toplamRandevu) {
      setIstatistikler((prev) => ({
        ...prev,
        // Herhangi bir değişiklik yapmadan dummy bir property ekleyebiliriz
        // Bu sayede referans değişir ancak sonsuz döngü oluşmaz
        _lastUpdated: Date.now(),
      }));
    }
  }, [localRandevuTanimlari.length, istatistikler.toplamRandevu]);

  // İstatistikleri ve randevu listelerini hazırla
  useEffect(() => {
    if (randevuSlotlari && randevuSlotlari.length > 0) {
      const simdi = new Date();

      // Bugünkü randevuları filtrele
      const bugunkiRandevular = randevuSlotlari
        .filter(
          (slot) =>
            isToday(new Date(slot.tarih)) &&
            compareAsc(new Date(slot.baslangicZamani), simdi) !== -1
        )
        .sort((a, b) =>
          compareAsc(new Date(a.baslangicZamani), new Date(b.baslangicZamani))
        )
        .slice(0, 10); // En fazla 10 randevu göster

      // Yaklaşan randevuları filtrele (bugün hariç sonraki 7 gün)
      const yaklasanRandevularList = randevuSlotlari
        .filter(
          (slot) =>
            !isToday(new Date(slot.tarih)) &&
            (isTomorrow(new Date(slot.tarih)) ||
              isThisWeek(new Date(slot.tarih))) &&
            slot.durum === "Rezerve"
        )
        .sort(
          (a, b) =>
            compareAsc(new Date(a.tarih), new Date(b.tarih)) ||
            compareAsc(new Date(a.baslangicZamani), new Date(b.baslangicZamani))
        )
        .slice(0, 10);

      // İstatistikleri hesapla
      const stats = {
        toplamRandevu: randevuSlotlari.length,
        rezerveRandevu: randevuSlotlari.filter(
          (slot) => slot.durum === "Rezerve"
        ).length,
        acikRandevu: randevuSlotlari.filter((slot) => slot.durum === "Açık")
          .length,
        kapaliRandevu: randevuSlotlari.filter((slot) => slot.durum === "Kapalı")
          .length,
        bugunRandevu: bugunkiRandevular.length,
        yaklasanRandevu: yaklasanRandevularList.length,
      };

      setBugunRandevular(bugunkiRandevular);
      setYaklasanRandevular(yaklasanRandevularList);
      setIstatistikler(stats);
    }
  }, [randevuSlotlari]); // Sadece randevuSlotlari değiştiğinde çalışsın

  // Tarih formatla
  const formatDate = (date) => {
    return format(new Date(date), "d MMMM yyyy", { locale: tr });
  };

  // Saat formatla
  const formatTime = (date) => {
    return format(new Date(date), "HH:mm", { locale: tr });
  };

  // Durum renklerini belirle
  const getStatusColor = (status) => {
    switch (status) {
      case "Açık":
        return "success";
      case "Kapalı":
        return "error";
      case "Rezerve":
        return "primary";
      default:
        return "default";
    }
  };

  // Hata durumunu kontrol et ve kullanıcıya bildir
  if (tanimlarError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            Randevu tanımları yüklenirken bir hata oluştu
          </Typography>
          <Typography variant="body1">
            Lütfen sistem yöneticinizle iletişime geçin ve sunucu günlüklerini
            kontrol edin.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => dispatch(getActiveRandevuTanimlari())}
          >
            Yeniden Dene
          </Button>
        </Paper>
      </Container>
    );
  }

  if (slotsLoading || tanimlarLoading) {
    return <LoadingBox />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        <CalendarIcon
          fontSize="large"
          sx={{ mr: 1, verticalAlign: "middle" }}
        />
        Randevu Yönetimi
      </Typography>

      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card raised>
            <CardContent sx={{ textAlign: "center" }}>
              <ScheduleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">
                {istatistikler.toplamRandevu}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Toplam Randevu Slotu
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card raised>
            <CardContent sx={{ textAlign: "center" }}>
              <EventAvailableIcon
                color="success"
                sx={{ fontSize: 40, mb: 1 }}
              />
              <Typography variant="h4">{istatistikler.acikRandevu}</Typography>
              <Typography variant="body2" color="textSecondary">
                Açık Randevular
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card raised>
            <CardContent sx={{ textAlign: "center" }}>
              <EventIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">
                {istatistikler.rezerveRandevu}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Rezerve Edilen Randevular
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card raised>
            <CardContent sx={{ textAlign: "center" }}>
              <EventBusyIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">
                {istatistikler.kapaliRandevu}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Kapalı Randevular
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hızlı Erişim Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <DashboardIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                Hızlı Erişim
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{ height: "100%" }}
                  onClick={() => navigate("/randevu/slotlar")}
                  className="hover-card"
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <ViewListIcon
                          color="primary"
                          sx={{ fontSize: 32, mb: 1 }}
                        />
                        <Typography variant="h6" component="div">
                          Randevu Slotları
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Tüm randevu slotlarını görüntüle ve yönet
                        </Typography>
                      </Box>
                      <ArrowForwardIcon color="action" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{ height: "100%" }}
                  onClick={() => navigate("/randevu/tanimlar")}
                  className="hover-card"
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <SettingsIcon
                          color="primary"
                          sx={{ fontSize: 32, mb: 1 }}
                        />
                        <Typography variant="h6" component="div">
                          Randevu Tanımları
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Randevu türlerini ve ayarlarını yönet
                        </Typography>
                      </Box>
                      <ArrowForwardIcon color="action" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{ height: "100%" }}
                  onClick={() => navigate("/randevu/slot/yeni")}
                  className="hover-card"
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <AddIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h6" component="div">
                          Yeni Randevu Ekle
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Tekil randevu slotu oluştur
                        </Typography>
                      </Box>
                      <ArrowForwardIcon color="action" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{ height: "100%" }}
                  onClick={() => navigate("/randevu/toplu-olustur")}
                  className="hover-card"
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <EventIcon
                          color="primary"
                          sx={{ fontSize: 32, mb: 1 }}
                        />
                        <Typography variant="h6" component="div">
                          Toplu Randevu
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Birden fazla randevu slotu oluştur
                        </Typography>
                      </Box>
                      <ArrowForwardIcon color="action" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Bugünkü Randevular
                </Typography>
              </Box>

              <Tooltip title="Tüm randevuları görüntüle">
                <IconButton
                  size="small"
                  onClick={() => navigate("/randevu/slotlar")}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {bugunRandevular.length > 0 ? (
              <List
                sx={{
                  width: "100%",
                  bgcolor: "background.paper",
                  overflow: "auto",
                  maxHeight: 300,
                }}
              >
                {bugunRandevular.map((randevu) => (
                  <ListItem key={randevu._id} disablePadding divider>
                    <ListItemButton
                      onClick={() => navigate(`/randevu/slot/${randevu._id}`)}
                    >
                      <ListItemIcon>
                        {randevu.durum === "Açık" && (
                          <EventAvailableIcon color="success" />
                        )}
                        {randevu.durum === "Rezerve" && (
                          <EventIcon color="primary" />
                        )}
                        {randevu.durum === "Kapalı" && (
                          <EventBusyIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              variant="body1"
                              component="span"
                              sx={{ fontWeight: 500 }}
                            >
                              {randevu.randevuTanimi_id?.ad || "Randevu"}
                            </Typography>
                            <Chip
                              label={randevu.durum}
                              color={getStatusColor(randevu.durum)}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              component="span"
                              color="text.primary"
                            >
                              {formatTime(randevu.baslangicZamani)} -{" "}
                              {formatTime(randevu.bitisZamani)}
                            </Typography>
                            <Typography
                              variant="body2"
                              component="span"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              {randevu.kisi_id
                                ? `${randevu.kisi_id.ad} ${randevu.kisi_id.soyad}`
                                : randevu.cari_id
                                ? `${randevu.cari_id.cariAd}`
                                : ""}
                            </Typography>
                          </>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Bugün için randevu bulunmamaktadır.
                </Typography>
              </Box>
            )}

            {bugunRandevular.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Bugün için toplam {bugunRandevular.length} randevu
                  bulunmaktadır.
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 2,
                pt: 2,
                borderTop: "1px dashed #ddd",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Yaklaşan Randevular
                </Typography>
              </Box>
            </Box>

            {yaklasanRandevular.length > 0 ? (
              <List
                sx={{
                  width: "100%",
                  bgcolor: "background.paper",
                  overflow: "auto",
                  maxHeight: 200,
                  mt: 1,
                }}
              >
                {yaklasanRandevular.map((randevu) => (
                  <ListItem key={randevu._id} disablePadding divider>
                    <ListItemButton
                      onClick={() => navigate(`/randevu/slot/${randevu._id}`)}
                    >
                      <ListItemIcon>
                        <EventIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <Typography
                              variant="body1"
                              component="span"
                              sx={{ fontWeight: 500 }}
                            >
                              {formatDate(randevu.tarih)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              component="span"
                              color="text.primary"
                            >
                              {formatTime(randevu.baslangicZamani)} -{" "}
                              {randevu.randevuTanimi_id?.ad || "Randevu"}
                            </Typography>
                            <Typography
                              variant="body2"
                              component="span"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              {randevu.kisi_id
                                ? `${randevu.kisi_id.ad} ${randevu.kisi_id.soyad}`
                                : randevu.cari_id
                                ? `${randevu.cari_id.cariAd}`
                                : ""}
                            </Typography>
                          </>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Yaklaşan rezerve randevu bulunmamaktadır.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Randevu Tanımları Listesi */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SettingsIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h2">
              Randevu Tanımları
            </Typography>
          </Box>

          <Tooltip title="Tanımları yönet">
            <IconButton
              size="small"
              onClick={() => navigate("/randevu/tanimlar")}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {localRandevuTanimlari.length > 0 ? (
          <Grid container spacing={2}>
            {localRandevuTanimlari.map((tanim) => (
              <Grid item xs={12} sm={6} md={4} key={tanim._id}>
                <Card>
                  <CardHeader
                    title={tanim.ad}
                    subheader={`${tanim.baslangicSaati} - ${tanim.bitisSaati} (${tanim.slotSuresiDk} dakika)`}
                    action={
                      <Chip
                        label={tanim.isActive ? "Aktif" : "Pasif"}
                        color={tanim.isActive ? "success" : "default"}
                        size="small"
                      />
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {tanim.aciklama || "Açıklama bulunmuyor"}
                    </Typography>
                    <Box
                      sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}
                    >
                      {tanim.gunler.map((gun) => {
                        const gunler = [
                          "Pazar",
                          "Pazartesi",
                          "Salı",
                          "Çarşamba",
                          "Perşembe",
                          "Cuma",
                          "Cumartesi",
                        ];
                        return (
                          <Chip
                            key={gun}
                            label={gunler[gun]}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Kayıtlı randevu tanımı bulunmamaktadır.
            </Typography>
          </Box>
        )}
      </Paper>

      <style>
        {`
        .hover-card {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        }
        `}
      </style>
    </Container>
  );
};

export default RandevuAnaSayfa;
