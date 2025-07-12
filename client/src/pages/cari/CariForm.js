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
  Alert
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { 
  getCariById, 
  addCari, 
  updateCari, 
  clearCurrentCari 
} from '../../redux/cari/cariSlice';
import { getSabitTanimlarByTip } from '../../redux/sabitTanim/sabitTanimSlice';

const CariForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { cari, loading, error } = useSelector((state) => state.cari);
  const { sabitTanimlar } = useSelector((state) => state.sabitTanim);
  
  const [formData, setFormData] = useState({
    cariAd: '',
    aciklama: '',
    adres: '',
    telefon: '',
    webSitesi: '',
    faxNumarasi: '',
    epostaAdresi: '',
    il: '',
    ilce: '',
    vergiDairesi: '',
    vergiNo: '',
    cariTur: 'Diğer',
    cariTur_id: '',
    isActive: true
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Sabit tanımlar içinden cari türlerini yükle
  useEffect(() => {
    dispatch(getSabitTanimlarByTip('CARI_TUR'));
  }, [dispatch]);

  // Düzenleme modu için cari verisini getir
  useEffect(() => {
    if (id) {
      dispatch(getCariById(id));
    } else {
      dispatch(clearCurrentCari());
    }
  }, [id, dispatch]);

  // Eğer düzenleme modundaysak ve cari verisi yüklendiyse formu doldur
  useEffect(() => {
    if (id && cari) {
      setFormData({
        cariAd: cari.cariAd || '',
        aciklama: cari.aciklama || '',
        adres: cari.adres || '',
        telefon: cari.telefon || '',
        webSitesi: cari.webSitesi || '',
        faxNumarasi: cari.faxNumarasi || '',
        epostaAdresi: cari.epostaAdresi || '',
        il: cari.il || '',
        ilce: cari.ilce || '',
        vergiDairesi: cari.vergiDairesi || '',
        vergiNo: cari.vergiNo || '',
        cariTur: cari.cariTur || 'Diğer',
        cariTur_id: cari.cariTur_id || '',
        isActive: cari.isActive !== undefined ? cari.isActive : true
      });
    }
  }, [id, cari]);

  // Form doğrulama
  const validateForm = () => {
    const errors = {};
    
    if (!formData.cariAd.trim()) {
      errors.cariAd = 'Cari adı gereklidir';
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
      return;
    }
    
    // FormData'yı kopyala ve boş cariTur_id'yi null'a çevir
    const submittingData = {
      ...formData,
      cariTur_id: formData.cariTur_id && formData.cariTur_id.trim() !== '' ? formData.cariTur_id : null
    };
    
    try {
      if (id) {
        // Güncelleme
        await dispatch(updateCari({ id, cariData: submittingData })).unwrap();
        navigate('/cariler');
      } else {
        // Yeni ekle
        await dispatch(addCari(submittingData)).unwrap();
        navigate('/cariler');
      }
    } catch (error) {
      // Form hatası olarak gösterilecek
      if (error.msg) {
        if (error.msg.includes('Bu isimde bir cari zaten')) {
          setFormErrors({ cariAd: error.msg });
        }
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          {id ? 'Cari Düzenle' : 'Yeni Cari Ekle'}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/cariler')}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cari Adı"
                name="cariAd"
                value={formData.cariAd}
                onChange={handleChange}
                required
                error={!!formErrors.cariAd}
                helperText={formErrors.cariAd}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Cari Türü</InputLabel>
                <Select
                  name="cariTur"
                  value={formData.cariTur}
                  onChange={handleChange}
                  label="Cari Türü"
                >
                  <MenuItem value="Resmi Kurum">Resmi Kurum</MenuItem>
                  <MenuItem value="Bağışçı">Bağışçı</MenuItem>
                  <MenuItem value="Tedarikçi">Tedarikçi</MenuItem>
                  <MenuItem value="Müşteri">Müşteri</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                  
                  {/* Sabit tanımlardan gelen cari türleri */}
                  {sabitTanimlar.length > 0 && (
                    <>
                      <Divider />
                      {sabitTanimlar.map(tanim => (
                        <MenuItem 
                          key={tanim._id} 
                          value={tanim.aciklama}
                          onClick={() => setFormData({...formData, cariTur_id: tanim._id})}
                        >
                          {tanim.aciklama}
                        </MenuItem>
                      ))}
                    </>
                  )}
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
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                İletişim Bilgileri
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Telefon"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="E-posta Adresi"
                name="epostaAdresi"
                value={formData.epostaAdresi}
                onChange={handleChange}
                type="email"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Web Sitesi"
                name="webSitesi"
                value={formData.webSitesi}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Fax Numarası"
                name="faxNumarasi"
                value={formData.faxNumarasi}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adres"
                name="adres"
                value={formData.adres}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="İl"
                name="il"
                value={formData.il}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="İlçe"
                name="ilce"
                value={formData.ilce}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Vergi Bilgileri
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vergi Dairesi"
                name="vergiDairesi"
                value={formData.vergiDairesi}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vergi Numarası"
                name="vergiNo"
                value={formData.vergiNo}
                onChange={handleChange}
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
                startIcon={<SaveIcon />}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Kaydet'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CariForm;
