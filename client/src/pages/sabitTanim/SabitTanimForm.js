import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Switch,
  TextField,
  Typography,
  FormControlLabel
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { addSabitTanim, updateSabitTanim, getSabitTanimlar } from '../../redux/sabitTanim/sabitTanimSlice';
import { toast } from 'react-toastify';

const SabitTanimForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { sabitTanimlar, loading } = useSelector((state) => state.sabitTanim);
  
  const [formData, setFormData] = useState({
    tip: '',
    kod: '',
    aciklama: '',
    deger: '',
    isActive: true
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Düzenleme modu için veriyi yükle
  useEffect(() => {
    if (id && sabitTanimlar) {
      const sabitTanim = sabitTanimlar.find(item => item._id === id);
      if (sabitTanim) {
        // Değer bir obje veya array ise JSON stringine çevir
        const degerValue = typeof sabitTanim.deger === 'object' 
          ? JSON.stringify(sabitTanim.deger) 
          : String(sabitTanim.deger);
          
        setFormData({
          tip: sabitTanim.tip || '',
          kod: sabitTanim.kod || '',
          aciklama: sabitTanim.aciklama || '',
          deger: degerValue,
          isActive: sabitTanim.isActive !== undefined ? sabitTanim.isActive : true
        });
      } else {
        // ID varsa ama veri yoksa yükle
        dispatch(getSabitTanimlar());
      }
    }
  }, [id, sabitTanimlar, dispatch]);
  
  // Form doğrulama
  const validateForm = () => {
    const errors = {};
    if (!formData.tip) errors.tip = 'Tip alanı zorunludur';
    if (!formData.kod) errors.kod = 'Kod alanı zorunludur';
    if (!formData.aciklama) errors.aciklama = 'Açıklama alanı zorunludur';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    // Switch için checked değerini, diğerleri için value değerini kullan
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
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
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    
    let degerValue = formData.deger;
    
    // Eğer deger bir JSON string ise, objeye çevirmeyi dene
    try {
      if (formData.deger.startsWith('{') || formData.deger.startsWith('[')) {
        degerValue = JSON.parse(formData.deger);
      }
    } catch (error) {
      // JSON parse hatalıysa, string olarak devam et
      console.error('JSON parse hatası:', error);
    }
    
    const sabitTanimData = {
      ...formData,
      deger: degerValue
    };
    
    try {
      if (id) {
        // Güncelleme işlemi
        await dispatch(updateSabitTanim({ id, sabitTanimData })).unwrap();
        toast.success('Sabit tanım başarıyla güncellendi');
      } else {
        // Ekleme işlemi
        await dispatch(addSabitTanim(sabitTanimData)).unwrap();
        toast.success('Sabit tanım başarıyla eklendi');
      }
      navigate('/sabit-tanimlar');
    } catch (error) {
      toast.error(error.msg || 'Bir hata oluştu');
    }
  };
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1">
            {id ? 'Sabit Tanım Düzenle' : 'Yeni Sabit Tanım Ekle'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/sabit-tanimlar')}
          >
            Geri Dön
          </Button>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tip"
                name="tip"
                value={formData.tip}
                onChange={handleChange}
                error={!!formErrors.tip}
                helperText={formErrors.tip}
                disabled={loading}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kod"
                name="kod"
                value={formData.kod}
                onChange={handleChange}
                error={!!formErrors.kod}
                helperText={formErrors.kod}
                disabled={loading}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                name="aciklama"
                value={formData.aciklama}
                onChange={handleChange}
                error={!!formErrors.aciklama}
                helperText={formErrors.aciklama}
                disabled={loading}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Değer"
                name="deger"
                value={formData.deger}
                onChange={handleChange}
                disabled={loading}
                multiline
                rows={4}
                helperText='JSON formatında değer girebilirsiniz, örn: {"key": "value"}'
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                    disabled={loading}
                  />
                }
                label="Aktif"
              />
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={loading}
                fullWidth
              >
                {id ? 'Güncelle' : 'Kaydet'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default SabitTanimForm;
