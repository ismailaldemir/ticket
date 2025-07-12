import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TablePagination,
  alpha,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Fade,
  Grow,
  Skeleton,
  Tooltip,
  Checkbox,
  Toolbar
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { getCariler, deleteCari, deleteManyCariler } from '../../redux/cari/cariSlice';
import { toast } from 'react-toastify';
import useAnimatedList from '../../hooks/useAnimatedList';
import { ListSkeleton, calculateAnimationDelay } from '../../utils/animationUtils';
import ExportModal from '../../components/common/ExportModal';
import { formatDate } from '../../utils/exportService';

const CariList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cariler, loading } = useSelector((state) => state.cari);
  
  // Silme işlemi için state
  const [cariToDelete, setCariToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] = useState(false);
  
  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cariAd: '',
    cariTur: '',
    il: '',
    aktifMi: 'tumu'
  });
  
  // Dışa aktarma için state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return []; // Veri yoksa boş dizi döndür
    
    let results = [...data];
    
    if (filters.cariAd) {
      results = results.filter(cari => 
        cari.cariAd.toLowerCase().includes(filters.cariAd.toLowerCase())
      );
    }
    
    if (filters.cariTur && filters.cariTur !== 'tumu') {
      results = results.filter(cari => cari.cariTur === filters.cariTur);
    }
    
    if (filters.il) {
      results = results.filter(cari => 
        cari.il && cari.il.toLowerCase().includes(filters.il.toLowerCase())
      );
    }
    
    if (filters.aktifMi !== 'tumu') {
      const isActive = filters.aktifMi === 'aktif';
      results = results.filter(cari => cari.isActive === isActive);
    }
    
    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredCariler,
    visibleData: visibleCariler,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount
  } = useAnimatedList({
    data: cariler || [], // null/undefined kontrolü ekle
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10
  });

  useEffect(() => {
    dispatch(getCariler());
  }, [dispatch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      cariAd: '',
      cariTur: '',
      il: '',
      aktifMi: 'tumu'
    });
  };

  // Silme işlemleri
  const handleDeleteClick = (cari) => {
    setCariToDelete(cari);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (cariToDelete) {
      try {
        await dispatch(deleteCari(cariToDelete._id)).unwrap();
        toast.success(`${cariToDelete.cariAd} carisi silindi`);
      } catch (error) {
        toast.error(error.msg || 'Cari silinirken bir hata oluştu');
      }
    }
    setDeleteDialogOpen(false);
    setCariToDelete(null);
  };

  // Çoklu silme işlemleri
  const handleMultipleDeleteClick = () => {
    if (selected.length > 0) {
      setMultipleDeleteDialogOpen(true);
    } else {
      toast.warning('Lütfen silinecek carileri seçin');
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManyCariler(selected)).unwrap();
      toast.success(`${selected.length} adet cari başarıyla silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || 'Cariler silinirken bir hata oluştu');
    }
    setMultipleDeleteDialogOpen(false);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredCariler.map(cari => cari._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    // Eğer tıklanan öğe checkbox ise, event propagation'ı durdur
    if (event.target.type === 'checkbox') {
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

  const handleCheckboxClick = (event, id) => {
    // Checkbox tıklanınca satırın kliklenmesini engelle
    event.stopPropagation();
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter(item => item !== id);
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Cari listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getCariler());
    refresh(); // useAnimatedList'in refresh fonksiyonunu çağır
  };

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Cariler
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
          </Box>
        </Box>
        
        <ListSkeleton 
          rowCount={5} 
          columnCount={6} 
          hasCheckbox={true} 
          hasActions={true}
        />
      </Box>
    );
  }

  // Dışa aktarma için sütun tanımları
  const exportColumns = [
    {
      id: 'cariAd',
      header: 'Cari Adı',
      accessor: (item) => item.cariAd || ''
    },
    {
      id: 'cariTur',
      header: 'Cari Türü',
      accessor: (item) => item.cariTur || ''
    },
    {
      id: 'telefon',
      header: 'Telefon',
      accessor: (item) => item.telefon || ''
    },
    {
      id: 'epostaAdresi',
      header: 'E-posta',
      accessor: (item) => item.epostaAdresi || ''
    },
    {
      id: 'webSitesi',
      header: 'Web Sitesi',
      accessor: (item) => item.webSitesi || ''
    },
    {
      id: 'faxNumarasi',
      header: 'Fax Numarası',
      accessor: (item) => item.faxNumarasi || ''
    },
    {
      id: 'adres',
      header: 'Adres',
      accessor: (item) => item.adres || ''
    },
    {
      id: 'il',
      header: 'İl',
      accessor: (item) => item.il || ''
    },
    {
      id: 'ilce',
      header: 'İlçe',
      accessor: (item) => item.ilce || ''
    },
    {
      id: 'vergiDairesi',
      header: 'Vergi Dairesi',
      accessor: (item) => item.vergiDairesi || ''
    },
    {
      id: 'vergiNo',
      header: 'Vergi No',
      accessor: (item) => item.vergiNo || ''
    },
    {
      id: 'aciklama',
      header: 'Açıklama',
      accessor: (item) => item.aciklama || ''
    },
    {
      id: 'kayitTarihi',
      header: 'Kayıt Tarihi',
      accessor: (item) => formatDate(item.kayitTarihi)
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Cariler
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/cariler/ekle')}
          >
            Yeni Cari
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
            <IconButton 
              color="primary"
              onClick={handleRefresh}
            >
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
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Cari Adı"
                name="cariAd"
                value={filters.cariAd}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Cari Türü</InputLabel>
                <Select
                  name="cariTur"
                  value={filters.cariTur}
                  onChange={handleFilterChange}
                  label="Cari Türü"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Resmi Kurum">Resmi Kurum</MenuItem>
                  <MenuItem value="Bağışçı">Bağışçı</MenuItem>
                  <MenuItem value="Tedarikçi">Tedarikçi</MenuItem>
                  <MenuItem value="Müşteri">Müşteri</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="İl"
                name="il"
                value={filters.il}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  name="aktifMi"
                  value={filters.aktifMi}
                  onChange={handleFilterChange}
                  label="Durum"
                >
                  <MenuItem value="tumu">Tümü</MenuItem>
                  <MenuItem value="aktif">Aktif</MenuItem>
                  <MenuItem value="pasif">Pasif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
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
          Toplam {totalCount} cari bulundu
        </Typography>
      </Box>

      {selected.length > 0 && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
            marginBottom: 2,
            borderRadius: 1
          }}
        >
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {selected.length} cari seçildi
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
                      indeterminate={selected.length > 0 && selected.length < filteredCariler.length}
                      checked={filteredCariler.length > 0 && selected.length === filteredCariler.length}
                      onChange={handleSelectAllClick}
                      inputProps={{ 'aria-label': 'tüm carileri seç' }}
                    />
                  </TableCell>
                  <TableCell>Cari Adı</TableCell>
                  <TableCell>Cari Türü</TableCell>
                  <TableCell>Telefon</TableCell>
                  <TableCell>İl/İlçe</TableCell>
                  <TableCell>Vergi Dairesi/No</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleCariler.length > 0 ? (
                  visibleCariler.map((cari, index) => {
                    // Animasyon gecikmesini hesapla
                    const delay = calculateAnimationDelay(index, visibleCariler.length);
                    const isItemSelected = isSelected(cari._id);
                    
                    return (
                      <Grow
                        in={contentLoaded}
                        key={cari._id}
                        timeout={{ enter: 300 + delay }}
                        style={{ transformOrigin: '0 0 0' }}
                      >
                        <TableRow 
                          hover
                          onClick={(event) => handleClick(event, cari._id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          sx={{ '&:hover': { backgroundColor: theme => alpha(theme.palette.primary.main, 0.08) } }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{ 'aria-labelledby': `cari-${cari._id}` }}
                              onClick={(e) => handleCheckboxClick(e, cari._id)}
                            />
                          </TableCell>
                          <TableCell>{cari.cariAd}</TableCell>
                          <TableCell>{cari.cariTur}</TableCell>
                          <TableCell>{cari.telefon || '-'}</TableCell>
                          <TableCell>{`${cari.il || '-'}/${cari.ilce || '-'}`}</TableCell>
                          <TableCell>
                            {cari.vergiDairesi ? `${cari.vergiDairesi}/${cari.vergiNo || '-'}` : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={cari.isActive ? 'Aktif' : 'Pasif'} 
                              color={cari.isActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Düzenle">
                                <IconButton
                                  color="primary"
                                  component={Link}
                                  to={`/cariler/duzenle/${cari._id}`}
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
                                    handleDeleteClick(cari);
                                  }}
                                  size="small"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Grow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Hiç cari bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredCariler.length}
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

      {/* Silme onay diyaloğu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Cariyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {cariToDelete && `${cariToDelete.cariAd} carisini silmek istediğinize emin misiniz?`}
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
        <DialogTitle>Toplu Silme</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Seçtiğiniz ${selected.length} adet cariyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMultipleDeleteDialogOpen(false)} color="primary">
            İptal
          </Button>
          <Button onClick={handleMultipleDeleteConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dışa aktarma modal'i */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={filteredCariler}
        availableColumns={exportColumns}
        entityName="Cariler"
      />
    </Box>
  );
};

export default CariList;
