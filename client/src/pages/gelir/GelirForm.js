import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { 
  getGelirById, 
  addGelir, 
  updateGelir, 
  clearCurrentGelir 
} from '../../redux/gelir/gelirSlice';
import { getActiveKasalar } from '../../redux/kasa/kasaSlice';
import { toast } from 'react-toastify';

const GelirForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { gelir, loading, error } = useSelector((state) => state.gelir);
  const { kasalar } = useSelector((state) => state.kasa);
  
  const [formData, setFormData] = useState({
    gelirTuru: 'Aidat',
    aciklama: '',
    kasa_id: '',
    tarih: new Date().toISOString().split('T')[0], // Bugünün tarihi
    makbuzNo: '',
    gelirYeri: 'Gerçek Kişi',
    tahsilatTuru: 'Nakit',
    isActive: true
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Gerekli verileri yükle
  useEffect(() => {
    dispatch(getActiveKasalar());
    
    // Düzenleme modu için gelir verisini getir
    if (id) {
      dispatch(getGelirById(id));
    } else {
      dispatch(clearCurrentGelir());
    }
    
    // Component unmount olduğunda gelir verisini temizle
    return () => {
      dispatch(clearCurrentGelir());
    };
  }, [id, dispatch]);

  // Eğer düzenleme modundaysak ve gelir verisi yüklendiyse formu doldur
  useEffect(() => {
    if (id && gelir) {
      setFormData({
        gelirTuru: gelir.gelirTuru || 'Aidat',
        aciklama: gelir.aciklama || '',
        kasa_id: gelir.kasa_id?._id || '',
        tarih: gelir.tarih ? new Date(gelir.tarih).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        makbuzNo: gelir.makbuzNo || '',
        gelirYeri: gelir.gelirYeri || 'Gerçek Kişi',
        tahsilatTuru: gelir.tahsilatTuru || 'Nakit',
        isActive: gelir.isActive !== undefined ? gelir.isActive : true
      });
    }
  }, [id, gelir]);

  // Form doğrulama
  const validateForm = () => {
    const errors = {};
    
    if (!formData.kasa_id) {
      errors.kasa_id = 'Kasa seçimi zorunludur';
    }
    
    if (!formData.tarih) {
      errors.tarih = 'Tarih gereklidir';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Hata varsa temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Lütfen gerekli alanları doldurunuz.');
      return;
    }
    
    try {
      if (id) {
        // Güncelleme
        await dispatch(updateGelir({ id, gelirData: formData })).unwrap();
        navigate(`/gelirler/detay/${id}`);
      } else {
        // Yeni ekle
        const yeniGelir = await dispatch(addGelir(formData)).unwrap();
        navigate(`/gelirler/detay/${yeniGelir._id}`);
      }
    } catch (error) {
      console.error('Gelir kayıt hatası:', error);
      // Spesifik hata mesajları göster
      if (error.msg) {
        toast.error(error.msg);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          {id ? 'Gelir Kaydını Düzenle' : 'Yeni Gelir Kaydı'}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/gelirler')}
        >
          Geri Dön
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.msg || 'Bir hata oluştu'}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth error={!!formErrors.kasa_id}>
                <InputLabel>Kasa*</InputLabel>
                <Select
                  name="kasa_id"
                  value={formData.kasa_id}
                  onChange={handleChange}
                  label="Kasa*"
                  required
                >
                  {kasalar.map(kasa => (
                    <MenuItem key={kasa._id} value={kasa._id}>
                      {kasa.kasaAdi}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.kasa_id && (
                  <Typography color="error" variant="caption">
                    {formErrors.kasa_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Gelir Türü</InputLabel>
                <Select
                  name="gelirTuru"
                  value={formData.gelirTuru}
                  onChange={handleChange}
                  label="Gelir Türü"
                >
                  <MenuItem value="Aidat">Aidat</MenuItem>
                  <MenuItem value="Bağış">Bağış</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Tarih*"
                name="tarih"
                type="date"
                value={formData.tarih}
                onChange={handleChange}
                required
                error={!!formErrors.tarih}
                helperText={formErrors.tarih}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end">
                        <CalendarIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Makbuz No"
                name="makbuzNo"
                value={formData.makbuzNo}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Gelir Yeri</InputLabel>
                <Select
                  name="gelirYeri"
                  value={formData.gelirYeri}
                  onChange={handleChange}
                  label="Gelir Yeri"
                >
                  <MenuItem value="Gerçek Kişi">Gerçek Kişi</MenuItem>
                  <MenuItem value="Tüzel Kişi">Tüzel Kişi</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Tahsilat Türü</InputLabel>
                <Select
                  name="tahsilatTuru"
                  value={formData.tahsilatTuru}
                  onChange={handleChange}
                  label="Tahsilat Türü"
                >
                  <MenuItem value="Nakit">Nakit</MenuItem>
                  <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                  <MenuItem value="Havale/EFT">Havale/EFT</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                name="aciklama"
                value={formData.aciklama}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Aktif"
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {id && (
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            * Gelir detaylarını eklemek veya düzenlemek için öncelikle temel bilgileri kaydedin.
            Daha sonra gelir detayları sayfasında düzenlemelerinizi yapabilirsiniz.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default GelirForm;
