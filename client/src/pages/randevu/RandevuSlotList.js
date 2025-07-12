import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Chip,
  Fade,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Checkbox,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { tr } from "date-fns/locale";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  EventBusy as EventBusyIcon,
  FileDownload as FileDownloadIcon,
  Event as EventIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventUnavailableIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

import {
  getRandevuSlotlari,
  deleteRandevuSlot,
  deleteManyRandevuSlotlari,
  updateRandevuSlotDurum,
} from "../../redux/randevuSlot/randevuSlotSlice";
import { getActiveRandevuTanimlari } from "../../redux/randevuTanimi/randevuTanimiSlice";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import { getActiveCariler } from "../../redux/cari/cariSlice";
import LoadingBox from "../../components/LoadingBox";
import useAnimatedList from "../../hooks/useAnimatedList";
import DeleteDialog from "../../components/DeleteDialog";
import ExportModal from "../../components/ExportModal";
import { hasPermission } from "../../utils/rbacUtils";
import RandevuRezervasyonForm from "../../components/randevu/RandevuRezervasyonForm";
import Logger from "../../utils/logger";

const RandevuSlotList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Güvenli selector kullanımı - undefined kontrolü ve varsayılan değerler eklendi
  const randevuSlotState = useSelector((state) => state.randevuSlot) || {};
  const { randevuSlotlari = [], loading = false } = randevuSlotState;

  const { randevuTanimlari = [] } =
    useSelector((state) => state.randevuTanimi) || {};
  const { kisiler = [] } = useSelector((state) => state.kisi) || {};
  const { cariler = [] } = useSelector((state) => state.cari) || {};
  const { user } = useSelector((state) => state.auth) || {};

  // Seçim için state
  const [selected, setSelected] = useState([]);

  // Silme işlemi için state
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    randevuTanimi_id: "",
    durum: "Tümü",
    baslangicTarihi: null,
    bitisTarihi: null,
    kisi_id: "",
    cari_id: "",
  });

  // Rezervasyon formu için state
  const [rezervasyonDialogOpen, setRezervasyonDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Dışa aktarma için state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    Logger.debug("Filtreleme öncesi slot verisi:", data);
    Logger.debug("Uygulanan filtreler:", filters);

    if (!data) return [];

    let results = [...data];

    if (filters.randevuTanimi_id) {
      results = results.filter(
        (slot) =>
          slot.randevuTanimi_id &&
          ((typeof slot.randevuTanimi_id === "object" &&
            slot.randevuTanimi_id._id === filters.randevuTanimi_id) ||
            slot.randevuTanimi_id === filters.randevuTanimi_id)
      );
    }

    if (filters.durum && filters.durum !== "Tümü") {
      results = results.filter((slot) => slot.durum === filters.durum);
    }

    if (filters.baslangicTarihi) {
      const startDate = new Date(filters.baslangicTarihi);
      startDate.setHours(0, 0, 0, 0);
      results = results.filter((slot) => new Date(slot.tarih) >= startDate);
    }

    if (filters.bitisTarihi) {
      const endDate = new Date(filters.bitisTarihi);
      endDate.setHours(23, 59, 59, 999);
      results = results.filter((slot) => new Date(slot.tarih) <= endDate);
    }

    if (filters.kisi_id) {
      results = results.filter(
        (slot) =>
          slot.kisi_id &&
          ((typeof slot.kisi_id === "object" &&
            slot.kisi_id._id === filters.kisi_id) ||
            slot.kisi_id === filters.kisi_id)
      );
    }

    if (filters.cari_id) {
      results = results.filter(
        (slot) =>
          slot.cari_id &&
          ((typeof slot.cari_id === "object" &&
            slot.cari_id._id === filters.cari_id) ||
            slot.cari_id === filters.cari_id)
      );
    }

    Logger.debug("Filtreleme sonrası slotlar:", results);
    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredSlots,
    visibleData: visibleSlots,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: randevuSlotlari || [],
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  // useAnimatedList hook'unun hemen üstüne ekle:
  Logger.info("Redux'tan gelen randevuSlotlari:", randevuSlotlari);
  Logger.info("filteredSlots:", filteredSlots);
  Logger.info("visibleSlots:", visibleSlots);

  useEffect(() => {
    // Her zaman parametresiz çağır, filtreleme sadece frontend'de yapılacak
    dispatch(getRandevuSlotlari());
    dispatch(getActiveRandevuTanimlari());
    dispatch(getActiveKisiler());
    dispatch(getActiveCariler());
  }, []);

  // Filtreleme işlemleri
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleDateChange = (name, date) => {
    setFilters({
      ...filters,
      [name]: date,
    });
  };

  const clearFilters = () => {
    setFilters({
      randevuTanimi_id: "",
      durum: "Tümü",
      baslangicTarihi: null,
      bitisTarihi: null,
      kisi_id: "",
      cari_id: "",
    });
  };

  // Silme işlemleri
  const handleDeleteClick = (slot) => {
    setSlotToDelete(slot);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (slotToDelete) {
      if (!hasPermission(user, "randevular_silme")) {
        toast.error("Bu işlemi yapmak için yetkiniz yok.");
        setDeleteDialogOpen(false);
        return;
      }

      try {
        await dispatch(deleteRandevuSlot(slotToDelete._id)).unwrap();
      } catch (error) {
        if (!error?.msg) {
          toast.error("Randevu slotu silinirken bir hata oluştu");
        }
      }
    }
    setDeleteDialogOpen(false);
    setSlotToDelete(null);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredSlots.map((slot) => slot._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else if (selectedIndex === 0) {
      newSelected = [...selected.slice(1)];
    } else if (selectedIndex === selected.length - 1) {
      newSelected = [...selected.slice(0, -1)];
    } else if (selectedIndex > 0) {
      newSelected = [
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1),
      ];
    }

    setSelected(newSelected);
  };

  const handleCheckboxClick = (event, id) => {
    event.stopPropagation();
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((item) => item !== id);
    }

    setSelected(newSelected);
  };

  const handleMultipleDeleteClick = () => {
    if (selected.length > 0) {
      setMultipleDeleteDialogOpen(true);
    } else {
      toast.warning("Lütfen silinecek randevu slotlarını seçin");
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    if (!hasPermission(user, "randevular_silme")) {
      toast.error("Toplu silme işlemi için yetkiniz yok.");
      setMultipleDeleteDialogOpen(false);
      return;
    }

    try {
      await dispatch(deleteManyRandevuSlotlari(selected)).unwrap();
      setSelected([]);
    } catch (error) {
      if (!error?.msg) {
        toast.error("Randevu slotları silinirken bir hata oluştu");
      }
    }
    setMultipleDeleteDialogOpen(false);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Randevu listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getRandevuSlotlari());
    refresh(); // useAnimatedList'in refresh fonksiyonunu çağır
  };

  // Rezervasyon işlemleri
  const handleRezervasyonClick = (slot) => {
    setSelectedSlot(slot);
    setRezervasyonDialogOpen(true);
  };

  const handleRezervasyonClose = (updated = false) => {
    setRezervasyonDialogOpen(false);
    setSelectedSlot(null);
    if (updated) {
      handleRefresh();
    }
  };

  // Durum işlemleri
  const handleStatusUpdate = async (slotId, newStatus) => {
    if (!hasPermission(user, "randevular_duzenleme")) {
      toast.error("Bu işlemi yapmak için yetkiniz yok.");
      return;
    }

    try {
      await dispatch(
        updateRandevuSlotDurum({
          id: slotId,
          durum: newStatus,
        })
      ).unwrap();
    } catch (error) {
      toast.error("Durum güncellenirken bir hata oluştu");
    }
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

  // Tarih ve saat formatlarını düzenle
  const formatDate = (date) => {
    if (!date) return "";
    return format(new Date(date), "dd.MM.yyyy");
  };

  const formatTime = (date) => {
    if (!date) return "";
    return format(new Date(date), "HH:mm");
  };

  // Dışa aktarma sütunları
  const exportColumns = [
    {
      id: "tarih",
      header: "Tarih",
      accessor: (item) => formatDate(item.tarih),
    },
    {
      id: "baslangicZamani",
      header: "Başlama Saati",
      accessor: (item) => formatTime(item.baslangicZamani),
    },
    {
      id: "bitisZamani",
      header: "Bitiş Saati",
      accessor: (item) => formatTime(item.bitisZamani),
    },
    {
      id: "randevuTanimi",
      header: "Tanım",
      accessor: (item) => item.randevuTanimi_id?.ad || "",
    },
    {
      id: "durum",
      header: "Durum",
      accessor: (item) => item.durum || "",
    },
    {
      id: "kisi",
      header: "İlgili Kişi",
      accessor: (item) =>
        item.kisi_id ? `${item.kisi_id.ad} ${item.kisi_id.soyad || ""}` : "",
    },
    {
      id: "cari",
      header: "İlgili Cari",
      accessor: (item) => item.cari_id?.cariAd || "",
    },
    {
      id: "notlar",
      header: "Notlar",
      accessor: (item) => item.notlar || "",
    },
  ];

  // Filtreleme panelinde randevu tanımlarını local veya redux'tan al
  const displayRandevuTanimlari =
    randevuTanimlari.length > 0 ? randevuTanimlari : [];

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return <LoadingBox />;
  }

  // Tablo renderı öncesi log
  Logger.info("Tabloda gösterilecek slot sayısı:", visibleSlots.length);
  if (visibleSlots.length > 0) {
    Logger.debug("Tabloda ilk slot:", visibleSlots[0]);
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h1">
          Randevu Slotları
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/randevu/slot/yeni")}
            color="primary"
          >
            Yeni Slot
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/randevu/toplu-olustur")}
            color="secondary"
          >
            Toplu Oluştur
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Yenile
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Filtreleri Gizle" : "Filtrele"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => setExportModalOpen(true)}
          >
            Dışa Aktar
          </Button>
        </Box>
      </Box>

      {/* Filtreleme paneli */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Randevu Tanımı</InputLabel>
                <Select
                  name="randevuTanimi_id"
                  value={filters.randevuTanimi_id}
                  onChange={handleFilterChange}
                  label="Randevu Tanımı"
                >
                  <MenuItem value="">
                    <em>Tümü</em>
                  </MenuItem>
                  {displayRandevuTanimlari.map((tanim) => (
                    <MenuItem key={tanim._id} value={tanim._id}>
                      {tanim.ad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Durum</InputLabel>
                <Select
                  name="durum"
                  value={filters.durum}
                  onChange={handleFilterChange}
                  label="Durum"
                >
                  <MenuItem value="Tümü">Tümü</MenuItem>
                  <MenuItem value="Açık">Açık</MenuItem>
                  <MenuItem value="Kapalı">Kapalı</MenuItem>
                  <MenuItem value="Rezerve">Rezerve</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={tr}
              >
                <DatePicker
                  label="Başlangıç Tarihi"
                  value={filters.baslangicTarihi}
                  onChange={(date) => handleDateChange("baslangicTarihi", date)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={tr}
              >
                <DatePicker
                  label="Bitiş Tarihi"
                  value={filters.bitisTarihi}
                  onChange={(date) => handleDateChange("bitisTarihi", date)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth margin="normal">
                <InputLabel>İlgili Kişi</InputLabel>
                <Select
                  name="kisi_id"
                  value={filters.kisi_id}
                  onChange={handleFilterChange}
                  label="İlgili Kişi"
                >
                  <MenuItem value="">
                    <em>Tümü</em>
                  </MenuItem>
                  {kisiler?.map((kisi) => (
                    <MenuItem key={kisi._id} value={kisi._id}>
                      {kisi.ad} {kisi.soyad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth margin="normal">
                <InputLabel>İlgili Cari</InputLabel>
                <Select
                  name="cari_id"
                  value={filters.cari_id}
                  onChange={handleFilterChange}
                  label="İlgili Cari"
                >
                  <MenuItem value="">
                    <em>Tümü</em>
                  </MenuItem>
                  {cariler?.map((cari) => (
                    <MenuItem key={cari._id} value={cari._id}>
                      {cari.cariAd}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => applyFilters()}
                >
                  Filtrele
                </Button>
                <Button variant="outlined" onClick={clearFilters}>
                  Temizle
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam {totalCount} randevu slotu bulundu
        </Typography>
      </Box>

      {selected.length > 0 && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.activatedOpacity
              ),
            marginBottom: 2,
            borderRadius: 1,
          }}
        >
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {selected.length} randevu slotu seçildi
          </Typography>

          <Tooltip title="Seçilenleri Sil">
            <IconButton onClick={handleMultipleDeleteClick}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      )}

      <Fade in={contentLoaded} timeout={300}>
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selected.length > 0 &&
                        selected.length < filteredSlots.length
                      }
                      checked={
                        filteredSlots.length > 0 &&
                        selected.length === filteredSlots.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm slotları seç" }}
                    />
                  </TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Saat</TableCell>
                  <TableCell>Randevu Tanımı</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İlgili Kişi/Cari</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleSlots.length > 0 ? (
                  visibleSlots.map((slot, index) => {
                    if (!slot) {
                      Logger.warn(`Slot null/undefined: index=${index}`);
                      return null;
                    }
                    Logger.debug(`Render edilen slot[${index}]:`, slot);
                    const isItemSelected = isSelected(slot._id);

                    // Tarih ve saat alanlarının tipini logla
                    Logger.debug(
                      `Slot[${index}] tarih tipi:`,
                      typeof slot.tarih,
                      "değer:",
                      slot.tarih
                    );
                    Logger.debug(
                      `Slot[${index}] baslangicZamani tipi:`,
                      typeof slot.baslangicZamani,
                      "değer:",
                      slot.baslangicZamani
                    );
                    Logger.debug(
                      `Slot[${index}] bitisZamani tipi:`,
                      typeof slot.bitisZamani,
                      "değer:",
                      slot.bitisZamani
                    );

                    const tarih = slot.tarih ? new Date(slot.tarih) : null;
                    const baslangicZamani = slot.baslangicZamani
                      ? new Date(slot.baslangicZamani)
                      : null;
                    const bitisZamani = slot.bitisZamani
                      ? new Date(slot.bitisZamani)
                      : null;

                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, slot._id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={slot._id}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onClick={(event) =>
                              handleCheckboxClick(event, slot._id)
                            }
                          />
                        </TableCell>
                        <TableCell>{tarih ? formatDate(tarih) : "-"}</TableCell>
                        <TableCell>
                          {baslangicZamani ? formatTime(baslangicZamani) : "-"}{" "}
                          - {bitisZamani ? formatTime(bitisZamani) : "-"}
                        </TableCell>
                        <TableCell>
                          {slot.randevuTanimi_id?.ad || "-"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={slot.durum}
                            color={getStatusColor(slot.durum)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {slot.kisi_id ? (
                            <Typography variant="body2">
                              {slot.kisi_id.ad} {slot.kisi_id.soyad}
                            </Typography>
                          ) : slot.cari_id ? (
                            <Typography variant="body2">
                              {slot.cari_id.cariAd}
                            </Typography>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Düzenle">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/randevu/slot/duzenle/${slot._id}`);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(slot);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Randevu slotu bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredSlots.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Sayfa başına satır:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} / ${count !== -1 ? count : `${to} üzeri`}`
              }
            />
          </TableContainer>
        </Box>
      </Fade>

      {/* Tekli silme onay diyaloğu */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Randevu Slotunu Sil"
        content={
          slotToDelete &&
          `Bu randevu slotunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
        }
      />

      {/* Çoklu silme onay diyaloğu */}
      <DeleteDialog
        open={multipleDeleteDialogOpen}
        onClose={() => setMultipleDeleteDialogOpen(false)}
        onConfirm={handleMultipleDeleteConfirm}
        title="Randevu Slotlarını Sil"
        content={`Seçilen ${selected.length} randevu slotunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
      />

      {/* Dışa aktarma modal'i */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={filteredSlots}
        availableColumns={exportColumns}
        entityName="Randevu Slotları"
      />

      {/* Rezervasyon formu */}
      <RandevuRezervasyonForm
        open={rezervasyonDialogOpen}
        onClose={handleRezervasyonClose}
        slot={selectedSlot}
      />
    </Box>
  );
};

export default RandevuSlotList;
