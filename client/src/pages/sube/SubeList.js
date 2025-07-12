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
  Tooltip,
  Fade,
  Grow,
  Skeleton,
  Checkbox,
  Toolbar,
  TextField
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
import { getSubeler, deleteSube, deleteManySubeler } from '../../redux/sube/subeSlice';
import { getOrganizasyonlar } from '../../redux/organizasyon/organizasyonSlice';
import { toast } from 'react-toastify';
import useAnimatedList from '../../hooks/useAnimatedList';
import { ListSkeleton, calculateAnimationDelay } from '../../utils/animationUtils';
import ExportModal from '../../components/common/ExportModal';
import { formatBoolean } from '../../utils/exportService';

const SubeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subeler, loading } = useSelector((state) => state.sube);
  const { organizasyonlar } = useSelector((state) => state.organizasyon);

  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);
  // Silme işlemi için state
  const [subeToDelete, setSubeToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] = useState(false);
  
  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ad: '',
    email: '',
    organizasyon_id: '',
    aktifMi: 'tumu'
  });

  // Dışa aktarma için state ekleyelim
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return []; // Veri yoksa boş dizi döndür
    
    let results = [...data];
    
    if (filters.ad) {
      results = results.filter(sube => 
        sube.ad.toLowerCase().includes(filters.ad.toLowerCase())
      );
    }
    
    if (filters.email) {
      results = results.filter(sube => 
        sube.iletisimBilgileri?.email && 
        sube.iletisimBilgileri.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    
    if (filters.organizasyon_id) {
      results = results.filter(sube => 
        sube.organizasyon_id?._id === filters.organizasyon_id
      );
    }
    
    if (filters.aktifMi !== 'tumu') {
      const isActive = filters.aktifMi === 'aktif';
      results = results.filter(sube => sube.isActive === isActive);
    }
    
    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredSubeler,
    visibleData: visibleSubeler,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount
  } = useAnimatedList({
    data: subeler || [], // null/undefined kontrolü ekle
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10
  });

  useEffect(() => {
    dispatch(getSubeler());
    dispatch(getOrganizasyonlar());
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
      ad: '',
      email: '',
      organizasyon_id: '',
      aktifMi: 'tumu'
    });
  };

  // Silme işlemleri
  const handleDeleteClick = (sube) => {
    setSubeToDelete(sube);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (subeToDelete) {
      try {
        await dispatch(deleteSube(subeToDelete._id)).unwrap();
        toast.success(`${subeToDelete.ad} şubesi silindi`);
      } catch (error) {
        toast.error(error.msg || 'Şube silinirken bir hata oluştu');
      }
    }
    setDeleteDialogOpen(false);
    setSubeToDelete(null);
  };

  // Çoklu silme işlemleri
  const handleMultipleDeleteClick = () => {
    if (selected.length > 0) {
      setMultipleDeleteDialogOpen(true);
    } else {
      toast.warning('Lütfen silinecek şubeleri seçin');
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManySubeler(selected)).unwrap();
      toast.success(`${selected.length} adet şube başarıyla silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || 'Şubeler silinirken bir hata oluştu');
    }
    setMultipleDeleteDialogOpen(false);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredSubeler.map(sube => sube._id);
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

  // Şube listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getSubeler());
    refresh(); // useAnimatedList'in refresh fonksiyonunu çağır
  };

  // Dışa aktarma için sütun tanımları
  const exportColumns = [
    {
      id: 'ad',
      header: 'Şube Adı',
      accessor: (item) => item.ad || ''
    },
    {
      id: 'organizasyon',
      header: 'Organizasyon',
      accessor: (item) => item.organizasyon_id?.ad || ''
    },
    {
      id: 'adres',
      header: 'Adres',
      accessor: (item) => item.iletisimBilgileri?.adres || ''
    },
    {
      id: 'telefon',
      header: 'Telefon',
      accessor: (item) => item.iletisimBilgileri?.telefon || ''
    },
    {
      id: 'email',
      header: 'E-posta',
      accessor: (item) => item.iletisimBilgileri?.email || ''
    },
    {
      id: 'aciklama',
      header: 'Açıklama',
      accessor: (item) => item.aciklama || ''
    },
    {
      id: 'isActive',
      header: 'Aktif',
      accessor: (item) => formatBoolean(item.isActive)
    }
  ];

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Şubeler
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
          </Box>
        </Box>
        
        <ListSkeleton 
          rowCount={5} 
          columnCount={4} 
          hasCheckbox={false} 
          hasActions={true}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Şubeler
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/subeler/ekle')}
          >
            Yeni Şube
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Şube Adı"
                name="ad"
                value={filters.ad}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="E-posta"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Organizasyon</InputLabel>
                <Select
                  name="organizasyon_id"
                  value={filters.organizasyon_id}
                  onChange={handleFilterChange}
                  label="Organizasyon"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {organizasyonlar.map(org => (
                    <MenuItem key={org._id} value={org._id}>
                      {org.ad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
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
          Toplam {totalCount} şube bulundu
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
            {selected.length} şube seçildi
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
                      indeterminate={selected.length > 0 && selected.length < filteredSubeler.length}
                      checked={filteredSubeler.length > 0 && selected.length === filteredSubeler.length}
                      onChange={handleSelectAllClick}
                      inputProps={{ 'aria-label': 'tüm şubeleri seç' }}
                    />
                  </TableCell>
                  <TableCell>Şube Adı</TableCell>
                  <TableCell>Organizasyon</TableCell>
                  <TableCell>İletişim</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleSubeler.length > 0 ? (
                  visibleSubeler.map((sube, index) => {
                    // Animasyon gecikmesini hesapla
                    const delay = calculateAnimationDelay(index, visibleSubeler.length);
                    const isItemSelected = isSelected(sube._id);
                    
                    return (
                      <Grow
                        in={contentLoaded}
                        key={sube._id}
                        timeout={{ enter: 300 + delay }}
                        style={{ transformOrigin: '0 0 0' }}
                      >
                        <TableRow 
                          hover
                          onClick={(event) => handleClick(event, sube._id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          sx={{ '&:hover': { backgroundColor: theme => alpha(theme.palette.primary.main, 0.08) } }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{ 'aria-labelledby': `sube-${sube._id}` }}
                              onClick={(e) => handleCheckboxClick(e, sube._id)}
                            />
                          </TableCell>
                          <TableCell>{sube.ad}</TableCell>
                          <TableCell>{sube.organizasyon_id?.ad || '-'}</TableCell>
                          <TableCell>{sube.iletisimBilgileri?.email || '-'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={sube.isActive ? 'Aktif' : 'Pasif'} 
                              color={sube.isActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Düzenle">
                                <IconButton
                                  color="primary"
                                  component={Link}
                                  to={`/subeler/duzenle/${sube._id}`}
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
                                    handleDeleteClick(sube);
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
                    <TableCell colSpan={5} align="center">
                      Hiç şube bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredSubeler.length}
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
        <DialogTitle>Şubeyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {subeToDelete && `${subeToDelete.ad} şubesini silmek istediğinize emin misiniz?`}
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
            {`Seçtiğiniz ${selected.length} adet şubeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
        data={filteredSubeler}
        availableColumns={exportColumns}
        entityName="Şubeler"
      />
    </Box>
  );
};

export default SubeList;
