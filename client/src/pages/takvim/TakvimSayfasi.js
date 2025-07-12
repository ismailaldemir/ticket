import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import tr from "date-fns/locale/tr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { toast } from "react-toastify";
import Logger from "../../utils/logger"; // Logger yerine logger (küçük l harfi ile) dosyasını import ediyoruz

// Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import EventIcon from "@mui/icons-material/Event";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Redux actions
import { getEtkinlikler } from "../../redux/etkinlik/etkinlikSlice";
import { getToplantilar } from "../../redux/toplanti/toplantiSlice";
import { getProjeler } from "../../redux/proje/projeSlice";

const TakvimSayfasi = () => {
  // Redux state hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state seçicileri
  const { etkinlikler, loading: etkinliklerLoading } = useSelector(
    (state) => state.etkinlik
  );
  const { toplantilar, loading: toplantilarLoading } = useSelector(
    (state) => state.toplanti
  );
  const { projeler, loading: projelerLoading } = useSelector(
    (state) => state.proje
  );

  // Tüm loading durumlarını birleştir
  const [loadingStates, setLoadingStates] = useState({
    etkinlikler: true,
    toplantilar: true,
    projeler: true,
  });
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRY = 3;

  // Genel loading durumu
  const loading = etkinliklerLoading || toplantilarLoading || projelerLoading;

  // Yerel state tanımlamaları
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [newEventForm, setNewEventForm] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
    allDay: false,
    description: "",
    type: "etkinlik", // varsayılan olarak etkinlik tipi
  });

  // Etkinlik türü filtreleme için state
  const [eventFilter, setEventFilter] = useState([
    "etkinlik",
    "toplanti",
    "proje",
  ]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Takvim lokalizasyonu
  const locales = {
    tr: tr,
  };

  // Takvim bileşeni için localizer oluşturma
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  // Projelerin tarih aralığından event'ler oluştur
  const projeEvents = useMemo(() => {
    if (!projeler) return [];

    return projeler
      .filter((p) => p.isActive) // Sadece aktif projeleri göster
      .map((proje) => ({
        id: proje._id,
        title: proje.projeAdi,
        start: new Date(proje.baslamaTarihi),
        end: proje.bitisTarihi ? new Date(proje.bitisTarihi) : null,
        allDay: true,
        type: "proje",
        data: proje,
      }));
  }, [projeler]);

  // Etkinlikleri, toplantıları ve projeleri takvim formatına dönüştürme
  const events = useMemo(() => {
    const allEvents = [
      ...etkinlikler.map((e) => ({
        id: e._id,
        title: e.etkinlikAdi,
        start: new Date(e.baslamaTarihi),
        end: e.bitisTarihi ? new Date(e.bitisTarihi) : null,
        allDay: !e.baslamaSaati,
        type: "etkinlik",
        data: e,
      })),
      ...toplantilar.map((t) => ({
        id: t._id,
        title: t.aciklama || t.toplantiTuru,
        start: new Date(t.tarih),
        end: t.bitisSaati
          ? new Date(`${t.tarih.split("T")[0]}T${t.bitisSaati}`)
          : null,
        allDay: !t.baslamaSaati,
        type: "toplanti",
        data: t,
      })),
      ...projeEvents,
    ];

    // Etkinlik filtrelerine göre sonuçları filtrele
    return allEvents.filter((event) => eventFilter.includes(event.type));
  }, [etkinlikler, toplantilar, projeEvents, eventFilter]);

  // Verileri getir
  const fetchData = useCallback(async () => {
    try {
      // Üç isteği paralel yürüt
      const [etkinliklerResult, toplantilarResult, projelerResult] =
        await Promise.allSettled([
          dispatch(getEtkinlikler()).unwrap(),
          dispatch(getToplantilar()).unwrap(),
          dispatch(getProjeler()).unwrap(),
        ]);

      // Hata durumlarını kontrol et
      if (etkinliklerResult.status === "rejected") {
        Logger.warn("Etkinlikler yüklenemedi:", etkinliklerResult.reason);
        toast.warn("Etkinlikler yüklenirken bir sorun oluştu");
      }

      if (toplantilarResult.status === "rejected") {
        Logger.warn("Toplantılar yüklenemedi:", toplantilarResult.reason);
        toast.warn("Toplantılar yüklenirken bir sorun oluştu");
      }

      if (projelerResult.status === "rejected") {
        Logger.warn("Projeler yüklenemedi:", projelerResult.reason);
        toast.warn("Projeler yüklenirken bir sorun oluştu");
      }

      setLoadingStates((prev) => ({
        ...prev,
        etkinlikler: false,
        toplantilar: false,
        projeler: false,
      }));
    } catch (error) {
      setLoadingStates((prev) => ({
        ...prev,
        etkinlikler: false,
        toplantilar: false,
        projeler: false,
      }));
      Logger.error("Takvim verileri yüklenirken genel hata:", error);
    }
  }, [dispatch, retryCount]);

  // İlk yükleme sırasında verileri getir
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Etkinlik filtrelerini değiştir
  const handleFilterChange = (event, newFilters) => {
    // En az bir filtre seçili olmalı
    if (newFilters && newFilters.length > 0) {
      setEventFilter(newFilters);
    }
  };

  // Detay görüntüleme ve etkinlik oluşturma fonksiyonları
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };

  const handleDateClick = ({ start }) => {
    setSelectedDate(start);
    setNewEventForm((prev) => ({
      ...prev,
      start,
      end: start,
    }));
    setNewEventOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedEvent(null);
  };

  const handleCloseNewEvent = () => {
    setNewEventOpen(false);
    setSelectedDate(null);
  };

  const handleCreateEvent = () => {
    const { type, title, start, end, description } = newEventForm;

    // Etkinlik tipine göre farklı sayfaya yönlendir
    if (type === "etkinlik") {
      navigate("/etkinlikler/ekle", {
        state: {
          etkinlikAdi: title,
          baslamaTarihi: start.toISOString(),
          bitisTarihi: end.toISOString(),
          aciklama: description,
        },
      });
    } else if (type === "toplanti") {
      navigate("/toplantilar/ekle", {
        state: {
          konu: title,
          tarih: start.toISOString().split("T")[0],
          aciklama: description,
        },
      });
    } else if (type === "proje") {
      navigate("/projeler/ekle", {
        state: {
          projeAdi: title,
          baslamaTarihi: start.toISOString(),
          bitisTarihi: end.toISOString(),
          aciklama: description,
        },
      });
    }

    handleCloseNewEvent();
  };

  // Event tipine göre yönlendirme
  const navigateToDetail = () => {
    if (!selectedEvent) return;

    const { type, id } = selectedEvent;
    if (type === "etkinlik") {
      navigate(`/etkinlikler/detay/${id}`);
    } else if (type === "toplanti") {
      navigate(`/toplantilar/detay/${id}`);
    } else if (type === "proje") {
      navigate(`/projeler/detay/${id}`);
    }

    handleCloseDetails();
  };

  // Event tiplerine göre renk ve stil ayarları
  const eventStyleGetter = (event) => {
    let style = {
      borderRadius: "4px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
      fontWeight: 500,
    };

    // Etkinlik tipine göre renk belirle
    switch (event.type) {
      case "etkinlik":
        style.backgroundColor = "#1976d2"; // Mavi
        break;
      case "toplanti":
        style.backgroundColor = "#e91e63"; // Pembe/Kırmızı
        break;
      case "proje":
        style.backgroundColor = "#2e7d32"; // Yeşil
        break;
      default:
        style.backgroundColor = "#673ab7"; // Mor
    }

    return { style };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Takvim
        </Typography>

        {/* Etkinlik filtresi butonu */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <ToggleButtonGroup
            value={eventFilter}
            onChange={handleFilterChange}
            aria-label="etkinlik filtreleri"
            size="small"
            color="primary"
          >
            <ToggleButton value="etkinlik" aria-label="etkinlik filtresi">
              <Tooltip title="Etkinlikler">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <EventIcon fontSize="small" />
                  <Typography
                    variant="body2"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    Etkinlikler
                  </Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="toplanti" aria-label="toplantı filtresi">
              <Tooltip title="Toplantılar">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <MeetingRoomIcon fontSize="small" />
                  <Typography
                    variant="body2"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    Toplantılar
                  </Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="proje" aria-label="proje filtresi">
              <Tooltip title="Projeler">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AssignmentIcon fontSize="small" />
                  <Typography
                    variant="body2"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    Projeler
                  </Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Button variant="contained" onClick={() => setNewEventOpen(true)}>
            Yeni Ekle
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            views={["month", "week", "day", "agenda"]}
            messages={{
              today: "Bugün",
              previous: "Önceki",
              next: "Sonraki",
              month: "Ay",
              week: "Hafta",
              day: "Gün",
              agenda: "Ajanda",
              date: "Tarih",
              time: "Saat",
              event: "Etkinlik",
              allDay: "Tüm Gün",
              noEventsInRange: "Bu aralıkta etkinlik yok",
              showMore: (total) => `+${total} daha`,
            }}
            culture="tr"
            onSelectEvent={handleEventClick}
            onSelectSlot={handleDateClick}
            selectable={true}
            popup={true}
            formats={{
              monthHeaderFormat: (date) =>
                format(date, "MMMM yyyy", { locale: tr }),
              dayHeaderFormat: (date) =>
                format(date, "EEEE dd MMMM", { locale: tr }),
              dayRangeHeaderFormat: ({ start, end }) =>
                `${format(start, "dd MMMM", { locale: tr })} - ${format(
                  end,
                  "dd MMMM yyyy",
                  { locale: tr }
                )}`,
            }}
            eventPropGetter={eventStyleGetter}
            components={{
              event: (props) => {
                const { event } = props;

                // Etkinlik türüne göre ikon seç
                let icon = <EventIcon fontSize="small" />;
                if (event.type === "toplanti") {
                  icon = <MeetingRoomIcon fontSize="small" />;
                } else if (event.type === "proje") {
                  icon = <AssignmentIcon fontSize="small" />;
                }

                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      overflow: "hidden",
                      width: "100%",
                    }}
                  >
                    {icon}
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {event.title}
                    </span>
                  </div>
                );
              },
            }}
          />
        )}
      </Paper>

      {/* Etkinlik detay diyaloğu */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails}>
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {selectedEvent.type === "etkinlik" && (
                  <EventIcon color="primary" />
                )}
                {selectedEvent.type === "toplanti" && (
                  <MeetingRoomIcon color="error" />
                )}
                {selectedEvent.type === "proje" && (
                  <AssignmentIcon color="success" />
                )}
                {selectedEvent.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="body1" gutterBottom>
                  <strong>Başlangıç:</strong>{" "}
                  {format(selectedEvent.start, "dd MMMM yyyy HH:mm", {
                    locale: tr,
                  })}
                </Typography>
                {selectedEvent.end && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Bitiş:</strong>{" "}
                    {format(selectedEvent.end, "dd MMMM yyyy HH:mm", {
                      locale: tr,
                    })}
                  </Typography>
                )}
                {selectedEvent.data.aciklama && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Açıklama:</strong> {selectedEvent.data.aciklama}
                  </Typography>
                )}

                {/* Etkinlik tipine göre özel bilgiler */}
                {selectedEvent.type === "proje" && (
                  <>
                    <Typography variant="body1" gutterBottom>
                      <strong>Durum:</strong> {selectedEvent.data.durumu}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Tamamlanma:</strong> %
                      {selectedEvent.data.tamamlanmaDurumu || 0}
                    </Typography>
                  </>
                )}

                {selectedEvent.type === "toplanti" && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Toplantı Yeri:</strong>{" "}
                    {selectedEvent.data.toplantiYeri || "Belirtilmemiş"}
                  </Typography>
                )}

                <Chip
                  label={
                    selectedEvent.type === "etkinlik"
                      ? "Etkinlik"
                      : selectedEvent.type === "toplanti"
                      ? "Toplantı"
                      : "Proje"
                  }
                  color={
                    selectedEvent.type === "etkinlik"
                      ? "primary"
                      : selectedEvent.type === "toplanti"
                      ? "error"
                      : "success"
                  }
                  size="small"
                  sx={{ mt: 1 }}
                />
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Kapat</Button>
              <Button
                onClick={navigateToDetail}
                color="primary"
                startIcon={<VisibilityIcon />}
              >
                Detayları Görüntüle
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Yeni etkinlik oluşturma diyaloğu */}
      <Dialog
        open={newEventOpen}
        onClose={handleCloseNewEvent}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Yeni Oluştur</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tür</InputLabel>
            <Select
              value={newEventForm.type}
              onChange={(e) =>
                setNewEventForm({ ...newEventForm, type: e.target.value })
              }
            >
              <MenuItem
                value="etkinlik"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <EventIcon color="primary" />
                <span>Etkinlik</span>
              </MenuItem>
              <MenuItem
                value="toplanti"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <MeetingRoomIcon color="error" />
                <span>Toplantı</span>
              </MenuItem>
              <MenuItem
                value="proje"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <AssignmentIcon color="success" />
                <span>Proje</span>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Başlık"
            value={newEventForm.title}
            onChange={(e) =>
              setNewEventForm({ ...newEventForm, title: e.target.value })
            }
          />

          <TextField
            fullWidth
            margin="normal"
            label="Açıklama"
            multiline
            rows={4}
            value={newEventForm.description}
            onChange={(e) =>
              setNewEventForm({ ...newEventForm, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewEvent}>İptal</Button>
          <Button
            onClick={handleCreateEvent}
            color="primary"
            disabled={!newEventForm.title}
            variant="contained"
          >
            İlerle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TakvimSayfasi;
