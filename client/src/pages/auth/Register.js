import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box, 
  Container, 
  Grid, 
  Avatar, 
  Alert,
  InputAdornment, 
  IconButton
} from '@mui/material';
import { PersonAdd, Visibility, VisibilityOff } from '@mui/icons-material';
import { register, clearError } from '../../redux/auth/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isAuthenticated, loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const { name, email, password, password2 } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleTogglePassword2 = () => {
    setShowPassword2(!showPassword2);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    if (password !== password2) {
      setFormError('Şifreler eşleşmiyor');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    dispatch(register({ name, email, password }));
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
          <PersonAdd fontSize="large" />
        </Avatar>
        
        <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
          Hesap Oluştur
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error.msg || "Kayıt işlemi sırasında bir hata oluştu"}
          </Alert>
        )}
        
        {formError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {formError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="İsim Soyisim"
            name="name"
            value={name}
            onChange={onChange}
            autoComplete="name"
            autoFocus
            variant="outlined"
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-posta Adresi"
            name="email"
            value={email}
            onChange={onChange}
            autoComplete="email"
            type="email"
            variant="outlined"
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Şifre"
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={onChange}
            autoComplete="new-password"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="şifre görünürlüğünü değiştir"
                    onClick={handleTogglePassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Şifreyi Doğrula"
            type={showPassword2 ? 'text' : 'password'}
            id="password2"
            value={password2}
            onChange={onChange}
            autoComplete="new-password"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="şifre görünürlüğünü değiştir"
                    onClick={handleTogglePassword2}
                    edge="end"
                  >
                    {showPassword2 ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </Button>
          
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link to="/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
                <Typography variant="body2" color="primary">
                  Zaten hesabınız var mı? Giriş yapın
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;