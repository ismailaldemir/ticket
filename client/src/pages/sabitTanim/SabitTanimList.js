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
  Tooltip,
  Chip,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Fade,
  Grow,
  Skeleton,
  Checkbox,
  Toolbar
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  ClearAll as ClearAllIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { 
  getSabitTanimlar, 
  deleteSabitTanim,
  deleteManyTanimlar
} from '../../redux/sabitTanim/sabitTanimSlice';
import { toast } from 'react-toastify';
import useAnimatedList from '../../hooks/useAnimatedList';
import { ListSkeleton, calculateAnimationDelay } from '../../utils/animationUtils';

const SabitTanimList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sabitTanimlar, loading } = useSelector((state) => state.sabitTanim);
  
  // Çoklu seçim için state
  const [selected, setSelected] = useState([]);
  // Silme işlemi için state
  const [sabitTanimToDelete, setSabitTanimToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multipleDeleteDialogOpen, setMultipleDeleteDialogOpen] = useState(false);
  
  // Filtreleme için state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tip: '',
    aciklama: '',
    aktifMi: 'tumu'
  });

  // Filtreleme fonksiyonu
  const filterFunction = (data, filters) => {
    if (!data) return [];
    
    let results = [...data];
    
    if (filters.tip) {
      results = results.filter(item => 
        item.tip.toLowerCase().includes(filters.tip.toLowerCase())
      );
    }
    
    if (filters.aciklama) {
      results = results.filter(item => 
        item.aciklama.toLowerCase().includes(filters.aciklama.toLowerCase())
      );
    }
    
    if (filters.aktifMi !== 'tumu') {
      const isActive = filters.aktifMi === 'aktif';
      results = results.filter(item => item.isActive === isActive);
    }
    
    return results;
  };

  // useAnimatedList hook'unu kullan
  const {
    contentLoaded,
    filteredData: filteredSabitTanimlar,
    visibleData: visibleSabitTanimlar,
    page,
    pageSize: rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount
  } = useAnimatedList({
    data: sabitTanimlar || [],
    loading,
    filters,
    filterFunction,
    initialPage: 0,
    rowsPerPage: 10
  });

  useEffect(() => {
    dispatch(getSabitTanimlar());
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
      tip: '',
      aciklama: '',
      aktifMi: 'tumu'
    });
  };

  // Silme işlemleri
  const handleDeleteClick = (sabitTanim) => {
    setSabitTanimToDelete(sabitTanim);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (sabitTanimToDelete) {
      try {
        await dispatch(deleteSabitTanim(sabitTanimToDelete._id)).unwrap();
        toast.success(`"${sabitTanimToDelete.aciklama}" tanımı silindi`);
      } catch (error) {
        toast.error(error.msg || 'Sabit tanım silinirken bir hata oluştu');
      }
    }
    setDeleteDialogOpen(false);
    setSabitTanimToDelete(null);
  };

  // Çoklu silme işlemleri
  const handleMultipleDeleteClick = () => {
    if (selected.length > 0) {
      setMultipleDeleteDialogOpen(true);
    } else {
      toast.warning('Lütfen silinecek tanımları seçin');
    }
  };

  const handleMultipleDeleteConfirm = async () => {
    try {
      await dispatch(deleteManyTanimlar(selected)).unwrap();
      toast.success(`${selected.length} adet tanım başarıyla silindi`);
      setSelected([]);
    } catch (error) {
      toast.error(error.msg || 'Tanımlar silinirken bir hata oluştu');
    }
    setMultipleDeleteDialogOpen(false);
  };

  // Çoklu seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredSabitTanimlar.map(item => item._id);
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
    // Checkbox tıklanınca satırın kliklenmesini engelle, sadece checkbox'ın durumunu değiştir
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

  // Sabit tanım listesini yenileme işlemi
  const handleRefresh = () => {
    dispatch(getSabitTanimlar());
    refresh(); // useAnimatedList'in refresh fonksiyonunu çağır
  };

  // Loading durumunda skeleton bileşenini göster
  if (loading && !contentLoaded) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Sabit Tanımlar
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
            <Skeleton variant="circular" width={36} height={36} />
          </Box>
        </Box>
        
        <ListSkeleton 
          rowCount={5} 
          columnCount={5} 
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
          Sabit Tanımlar
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/sabit-tanimlar/ekle')}
          >
            Yeni Tanım
          </Button>
        </Box>
      </Box>

      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filtreleme Seçenekleri
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tip"
                name="tip"
                value={filters.tip}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Açıklama"
                name="aciklama"
                value={filters.aciklama}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
          Toplam {totalCount} sabit tanım bulundu
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
            {selected.length} tanım seçildi
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
                      indeterminate={selected.length > 0 && selected.length < filteredSabitTanimlar.length}
                      checked={filteredSabitTanimlar.length > 0 && selected.length === filteredSabitTanimlar.length}
                      onChange={handleSelectAllClick}
                      inputProps={{ 'aria-label': 'tüm tanımları seç' }}
                    />
                  </TableCell>
                  <TableCell>Tip</TableCell>
                  <TableCell>Kod</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Değer</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleSabitTanimlar.length > 0 ? (
                  visibleSabitTanimlar.map((sabitTanim, index) => {
                    // Animasyon gecikmesini hesapla
                    const delay = calculateAnimationDelay(index, visibleSabitTanimlar.length);
                    const isItemSelected = isSelected(sabitTanim._id);
                    
                    return (
                      <Grow
                        in={contentLoaded}
                        key={sabitTanim._id}
                        timeout={{ enter: 300 + delay }}
                        style={{ transformOrigin: '0 0 0' }}
                      >
                        <TableRow 
                          hover
                          onClick={(event) => handleClick(event, sabitTanim._id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          sx={{ '&:hover': { backgroundColor: theme => alpha(theme.palette.primary.main, 0.08) } }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{ 'aria-labelledby': `sabitTanim-${sabitTanim._id}` }}
                              onClick={(e) => handleCheckboxClick(e, sabitTanim._id)}
                            />
                          </TableCell>
                          <TableCell>{sabitTanim.tip}</TableCell>
                          <TableCell>{sabitTanim.kod}</TableCell>
                          <TableCell>{sabitTanim.aciklama}</TableCell>
                          <TableCell>
                            {typeof sabitTanim.deger === 'object' 
                              ? JSON.stringify(sabitTanim.deger) 
                              : String(sabitTanim.deger)}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={sabitTanim.isActive ? 'Aktif' : 'Pasif'} 
                              color={sabitTanim.isActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Düzenle">
                                <IconButton
                                  color="primary"
                                  component={Link}
                                  to={`/sabit-tanimlar/duzenle/${sabitTanim._id}`}
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
                                    handleDeleteClick(sabitTanim);
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
                    <TableCell colSpan={6} align="center">
                      Hiç sabit tanım bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredSabitTanimlar.length}
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
        <DialogTitle>Sabit Tanımı Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {sabitTanimToDelete && `"${sabitTanimToDelete.aciklama}" tanımını silmek istediğinize emin misiniz?`}
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
            {`Seçtiğiniz ${selected.length} adet tanımı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
    </Box>
  );
};

export default SabitTanimList;
