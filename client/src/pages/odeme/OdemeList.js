import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Button,
  Typography,
  IconButton,
  Checkbox,
  Toolbar,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TablePagination,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  InputAdornment,
  Fade,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LibraryAdd as LibraryAddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import {
  getOdemeler,
  deleteOdeme,
  deleteManyOdemeler,
} from "../../redux/odeme/odemeSlice";
import { getKisiler } from "../../redux/kisi/kisiSlice";
import { toast } from "react-toastify";
import ExportModal from "../../components/common/ExportModal";
import useAnimatedList from "../../hooks/useAnimatedList";
import { ListSkeleton } from "../../utils/animationUtils";

const OdemeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { odemeler, loading } = useSelector((state) => state.odeme);
  const { kisiler } = useSelector((state) => state.kisi);
  const { kasalar } = useSelector((state) => state.kasa);

  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);
  // Silme işlemi için state
  const [odemeToDelete, setOdemeToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] =
    useState(false);

  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    kisiId: "",
    odemeYontemi: "",
    baslangicTarihi: "",
    bitisTarihi: "",
    minTutar: "",
    maxTutar: "",
    kasa_id: "",
  });

  // Dışa aktarma modalı state'i
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Borç dönem bilgisini formatlamak için yardımcı fonksiyon
  const formatDonem = (borc) => {
    if (!borc) return "-";
    if (borc.ay && borc.yil) {
      return `${borc.ay}. ay ${borc.yil}`;
    }
    if (borc.borclandirmaTarihi) {
      return new Date(borc.borclandirmaTarihi).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
      });
    }
    return "-";
  };

  // Tarife adını ve ücret adını almak için yardımcı fonksiyon
  const getTarifeUcretAdi = (borc) => {
    if (!borc || !borc.ucret_id) return "-";

    if (borc.ucret_id.tarife_id) {
      return `${borc.ucret_id.tarife_id.ad}`;
    }

    return borc.ucret_id.ad || "-";
  };

  // Filtreleme fonksiyonu
  const filterFunction = useCallback((data, filters) => {
    let sonuclar = [...data];

    if (filters.kisiId) {
      sonuclar = sonuclar.filter(
        (odeme) => odeme.kisi_id?._id === filters.kisiId
      );
    }

    if (filters.odemeYontemi) {
      sonuclar = sonuclar.filter(
        (odeme) => odeme.odemeYontemi === filters.odemeYontemi
      );
    }

    if (filters.kasa_id) {
      sonuclar = sonuclar.filter(
        (odeme) => odeme.kasa_id?._id === filters.kasa_id
      );
    }

    if (filters.baslangicTarihi) {
      const baslangic = new Date(filters.baslangicTarihi);
      baslangic.setHours(0, 0, 0, 0); // Günün başlangıcı
      sonuclar = sonuclar.filter(
        (odeme) => new Date(odeme.odemeTarihi) >= baslangic
      );
    }

    if (filters.bitisTarihi) {
      const bitis = new Date(filters.bitisTarihi);
      bitis.setHours(23, 59, 59, 999); // Günün sonu
      sonuclar = sonuclar.filter(
        (odeme) => new Date(odeme.odemeTarihi) <= bitis
      );
    }

    if (filters.minTutar) {
      sonuclar = sonuclar.filter(
        (odeme) => odeme.odemeTutari >= parseFloat(filters.minTutar)
      );
    }

    if (filters.maxTutar) {
      sonuclar = sonuclar.filter(
        (odeme) => odeme.odemeTutari <= parseFloat(filters.maxTutar)
      );
    }

    return sonuclar;
  }, []);

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredOdemeler,
    visibleData: visibleOdemeler,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount,
  } = useAnimatedList({
    data: odemeler,
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10,
  });

  useEffect(() => {
    dispatch(getOdemeler());
    dispatch(getKisiler());
  }, [dispatch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      kisiId: "",
      odemeYontemi: "",
      baslangicTarihi: "",
      bitisTarihi: "",
      minTutar: "",
      maxTutar: "",
      kasa_id: "",
    });
  };

  // Ödeme listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getOdemeler());
    dispatch(getKisiler());
    refresh(); // useAnimatedList'in refresh fonksiyonunu çağır
  };

  // Tekli silme işlemleri
  const handleDeleteClick = (odeme) => {
    setOdemeToDelete(odeme);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (odemeToDelete) {
      try {
        await dispatch(deleteOdeme(odemeToDelete._id)).unwrap();
        toast.success("Ödeme başarıyla silindi");
      } catch (error) {
        toast.error(error.msg || "Ödeme silinirken bir hata oluştu");
      }
    }
    setDeleteDialogOpen(false);
    setOdemeToDelete(null);
  };

  // Çoklu silme işlemleri
  const handleMultipleDeleteClick = () => {
    setMultipleDeleteDialogOpen(true);
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManyOdemeler(selected)).unwrap();
      toast.success(`${selected.length} ödeme başarıyla silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || "Ödemeler silinirken bir hata oluştu");
    }
    setMultipleDeleteDialogOpen(false);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredOdemeler.map((odeme) => odeme._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    // Eğer tıklanan öğe checkbox ise, event propagation'ı durdur
    if (event.target.type === "checkbox") {
      return;
    }

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

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Dışa aktarma için gerekli olan sütunları hazırla
  const exportColumns = [
    {
      id: "kisiAdi",
      header: "Kişi Adı",
      accessor: (item) =>
        `${item.kisi_id?.ad || ""} ${item.kisi_id?.soyad || ""}`,
    },
    {
      id: "donem",
      header: "Dönem",
      accessor: (item) => formatDonem(item.borc_id),
    },
    {
      id: "ucretTuru",
      header: "Ücret Türü",
      accessor: (item) => getTarifeUcretAdi(item.borc_id),
    },
    {
      id: "borcTutari",
      header: "Borç Tutarı",
      accessor: (item) =>
        item.borc_id?.borcTutari
          ? `₺${item.borc_id.borcTutari.toFixed(2)}`
          : "-",
    },
    {
      id: "odemeTutari",
      header: "Ödeme Tutarı",
      accessor: (item) => `₺${item.odemeTutari.toFixed(2)}`,
    },
    {
      id: "odemeTarihi",
      header: "Ödeme Tarihi",
      accessor: (item) =>
        new Date(item.odemeTarihi).toLocaleDateString("tr-TR"),
    },
    {
      id: "kasaAdi",
      header: "Kasa",
      accessor: (item) => item.kasa_id?.kasaAdi || "-",
    },
    {
      id: "odemeYontemi",
      header: "Ödeme Yöntemi",
      accessor: (item) => item.odemeYontemi,
    },
    {
      id: "makbuzNo",
      header: "Makbuz No",
      accessor: (item) => item.makbuzNo || "-",
    },
    {
      id: "aciklama",
      header: "Açıklama",
      accessor: (item) => item.aciklama || "-",
    },
    {
      id: "kayitTarihi",
      header: "Kayıt Tarihi",
      accessor: (item) =>
        new Date(item.kayitTarihi).toLocaleDateString("tr-TR"),
    },
  ];

  const renderOdemeRows = () => {
    return visibleOdemeler.map((odeme) => (
      <TableRow
        key={odeme._id}
        hover
        onClick={(event) => handleClick(event, odeme._id)}
        role="checkbox"
        aria-checked={isSelected(odeme._id)}
        selected={isSelected(odeme._id)}
      >
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={isSelected(odeme._id)}
            inputProps={{
              "aria-labelledby": `enhanced-table-checkbox-${odeme._id}`,
            }}
          />
        </TableCell>
        <TableCell>
          {odeme.kisi_id?.ad} {odeme.kisi_id?.soyad}
        </TableCell>
        <TableCell>{formatDonem(odeme.borc_id)}</TableCell>
        <TableCell>{getTarifeUcretAdi(odeme.borc_id)}</TableCell>
        <TableCell>₺{odeme.odemeTutari.toFixed(2)}</TableCell>
        <TableCell>
          {new Date(odeme.odemeTarihi).toLocaleDateString("tr-TR")}
        </TableCell>
        <TableCell>{odeme.kasa_id?.kasaAdi || "-"}</TableCell>
        <TableCell>{odeme.odemeYontemi || "-"}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Düzenle">
              <IconButton
                color="primary"
                component={Link}
                to={`/odemeler/duzenle/${odeme._id}`}
                size="small"
                onClick={(e) => e.stopPropagation()}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sil">
              <IconButton
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(odeme);
                }}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
    ));
  };

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" component="h1">
            Ödemeler
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
          </Box>
        </Box>

        <ListSkeleton
          rowCount={5}
          columnCount={7}
          hasCheckbox={true}
          hasActions={true}
        />
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
          Ödemeler
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/odemeler/ekle")}
          >
            Yeni Ödeme
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LibraryAddIcon />}
            onClick={() => navigate("/odemeler/toplu-ekle")}
          >
            Toplu Ödeme
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={() => setExportModalOpen(true)}
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
            Filtreleme Seçenekleri
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
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
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Ödeme Yöntemi</InputLabel>
                <Select
                  name="odemeYontemi"
                  value={filters.odemeYontemi}
                  onChange={handleFilterChange}
                  label="Ödeme Yöntemi"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Nakit">Nakit</MenuItem>
                  <MenuItem value="Havale/EFT">Havale/EFT</MenuItem>
                  <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Kasa</InputLabel>
                <Select
                  name="kasa_id"
                  value={filters.kasa_id}
                  onChange={handleFilterChange}
                  label="Kasa"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {kasalar.map((kasa) => (
                    <MenuItem key={kasa._id} value={kasa._id}>
                      {kasa.kasaAdi}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Başlangıç Tarihi"
                name="baslangicTarihi"
                type="date"
                value={filters.baslangicTarihi}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Bitiş Tarihi"
                name="bitisTarihi"
                type="date"
                value={filters.bitisTarihi}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Min. Tutar"
                name="minTutar"
                type="number"
                value={filters.minTutar}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₺</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Max. Tutar"
                name="maxTutar"
                type="number"
                value={filters.maxTutar}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₺</InputAdornment>
                  ),
                }}
              />
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
                onClick={clearFilters}
              >
                Filtreleri Temizle
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={applyFilters}
              >
                Filtrele
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam {totalCount} ödeme bulundu
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
            {selected.length} ödeme seçildi
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
                        selected.length < filteredOdemeler.length
                      }
                      checked={
                        filteredOdemeler.length > 0 &&
                        selected.length === filteredOdemeler.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "tüm ödemeleri seç" }}
                    />
                  </TableCell>
                  <TableCell>Kişi</TableCell>
                  <TableCell>Dönem</TableCell>
                  <TableCell>Ücret Türü</TableCell>
                  <TableCell>Ödeme Tutarı</TableCell>
                  <TableCell>Ödeme Tarihi</TableCell>
                  <TableCell>Kasa</TableCell>
                  <TableCell>Ödeme Yöntemi</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderOdemeRows()}</TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredOdemeler.length}
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
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Ödemeyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {odemeToDelete &&
              `Bu ödeme kaydını silmek istediğinize emin misiniz?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            İptal
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Çoklu silme onay diyaloğu */}
      <Dialog
        open={multipleDeleteDialogOpen}
        onClose={() => setMultipleDeleteDialogOpen(false)}
      >
        <DialogTitle>Seçili Ödemeleri Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selected.length} ödeme kaydını silmek istediğinize emin misiniz? Bu
            işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setMultipleDeleteDialogOpen(false)}
            color="primary"
          >
            İptal
          </Button>
          <Button onClick={handleMultipleDeleteConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dışa aktarma modal'ı */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={filteredOdemeler}
        availableColumns={exportColumns}
        entityName="Ödeme Kayıtları"
      />
    </Box>
  );
};

export default OdemeList;
