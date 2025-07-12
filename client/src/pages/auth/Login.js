import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
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
  IconButton,
} from "@mui/material";
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { login } from "../../redux/auth/authSlice";
import { clearError } from "../../redux/auth/authSlice";
import { toast } from "react-toastify";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isAuthenticated, loading } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }

    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Auth state:", { isAuthenticated, loading, error });
    }
  }, [isAuthenticated, loading, error]);

  const { email, password } = formData;

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Lütfen e-posta ve şifre giriniz");
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(login({ email, password })).unwrap();
    } catch (err) {
      console.error("Giriş hatası:", err);
      toast.error(err?.msg || "Giriş yapılırken bir hata oluştu");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (loading === false && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [loading, isSubmitting]);

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 2,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
          <LoginIcon fontSize="large" />
        </Avatar>

        <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
          Giriş Yap
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {typeof error === "string"
              ? error
              : error?.msg || error?.message || JSON.stringify(error) || "Giriş yapılırken bir hata oluştu"}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={onSubmit}
          noValidate
          sx={{ mt: 1, width: "100%" }}
        >
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
            autoFocus
            variant="outlined"
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Şifre"
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={onChange}
            autoComplete="current-password"
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
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </Button>

          <Grid container>
            <Grid item xs>
              <Link
                to="#"
                style={{ textDecoration: "none", color: "primary.main" }}
              >
                <Typography variant="body2" color="primary">
                  Şifremi Unuttum
                </Typography>
              </Link>
            </Grid>
            <Grid item>
              <Link
                to="/register"
                style={{ textDecoration: "none", color: "primary.main" }}
              >
                <Typography variant="body2" color="primary">
                  Hesabınız yok mu? Kayıt Olun
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
