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
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { 
  getSubeById, 
  addSube, 
  updateSube, 
  clearCurrentSube 
} from '../../redux/sube/subeSlice';
import { getActiveOrganizasyonlar } from '../../redux/organizasyon/organizasyonSlice';

const SubeForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { sube, loading, error } = useSelector((state) => state.sube);
  const { organizasyonlar, loading: organizasyonLoading } = useSelector((state) => state.organizasyon);
  
  const [formData, setFormData] = useState({
    ad: '',
    organizasyon_id: '',
    aciklama: '',
    iletisimBilgileri: {
      adres: '',
      telefon: '',
      email: ''
    },
    isActive: true
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Düzenleme işlemi için veri yükle
  useEffect(() => {
    dispatch(getActiveOrganizasyonlar());
    
    if (id) {
      dispatch(getSubeById(id));
    } else {
      dispatch(clearCurrentSube());
    }
    
    // Bileşen temizlendiğinde sube verisini temizle
    return () => {
      dispatch(clearCurrentSube());
    };
  }, [dispatch, id]);
  
  // Redux'tan gelen sube verisi ile formu doldur
  useEffect(() => {
    if (sube && id) {
      setFormData({
        ad: sube.ad || '',
        organizasyon_id: sube.organizasyon_id?._id || '',
        aciklama: sube.aciklama || '',
        iletisimBilgileri: {
          adres: sube.iletisimBilgileri?.adres || '',
          telefon: sube.iletisimBilgileri?.telefon || '',
          email: sube.iletisimBilgileri?.email || ''
        },
        isActive: sube.isActive !== undefined ? sube.isActive : true
      });
    }
  }, [sube, id]);
  
  const validateForm = () => {
    const errors = {};
    if (!formData.ad) errors.ad = 'Şube adı gereklidir';
    if (!formData.organizasyon_id) errors.organizasyon_id = 'Organizasyon seçimi gereklidir';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Nested bir alan için (iletisimBilgileri içindeki alanlar)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      // Üst seviye alanlar için
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Hata varsa temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handleSwitchChange = (e) => {
    setFormData({
      ...formData,
      isActive: e.target.checked
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (id) {
        // Güncelleme işlemi
        await dispatch(updateSube({ id, subeData: formData })).unwrap();
        navigate('/subeler');
      } else {
        // Yeni ekleme işlemi
        await dispatch(addSube(formData)).unwrap();
        navigate('/subeler');
      }
    } catch (err) {
      // Hata durumu Redux slice'ta işleniyor
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/subeler')}
          sx={{ mr: 2 }}
        >
          Geri
        </Button>
        <Typography variant="h5" component="h1">
          {id ? 'Şube Düzenle' : 'Yeni Şube Ekle'}
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.msg || 'Bir hata oluştu'}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        {loading || organizasyonLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Şube Adı"
                  name="ad"
                  value={formData.ad}
                  onChange={handleChange}
                  required
                  error={!!formErrors.ad}
                  helperText={formErrors.ad}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.organizasyon_id}>
                  <InputLabel>Organizasyon</InputLabel>
                  <Select
                    name="organizasyon_id"
                    value={formData.organizasyon_id}
                    onChange={handleChange}
                    label="Organizasyon"
                    required
                  >
                    <MenuItem value="">
                      <em>Seçiniz</em>
                    </MenuItem>
                    {organizasyonlar.map((organizasyon) => (
                      <MenuItem key={organizasyon.id} value={organizasyon.id}>
                        {organizasyon.ad}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.organizasyon_id && (
                    <FormHelperText>{formErrors.organizasyon_id}</FormHelperText>
                  )}
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
                <Divider sx={{ mb: 2 }}>İletişim Bilgileri</Divider>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adres"
                      name="iletisimBilgileri.adres"
                      value={formData.iletisimBilgileri.adres}
                      onChange={handleChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Telefon"
                      name="iletisimBilgileri.telefon"
                      value={formData.iletisimBilgileri.telefon}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="E-posta"
                      name="iletisimBilgileri.email"
                      type="email"
                      value={formData.iletisimBilgileri.email}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleSwitchChange}
                      color="primary"
                    />
                  }
                  label="Aktif"
                />
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {id ? 'Güncelle' : 'Kaydet'}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default SubeForm;
