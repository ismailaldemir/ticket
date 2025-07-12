import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  setAuthModalOpen,
  logout,
  loadUser,
} from "../../redux/auth/authSlice";
import { updateAuthToken } from "../../utils/api"; // Yeni eklenen import
import Logger from "../../utils/logger"; // Logger ekleyelim

const AuthRefreshModal = () => {
  const dispatch = useDispatch();
  const { isAuthModalOpen, loading, error, user } = useSelector(
    (state) => state.auth
  );
  const [password, setPassword] = useState("");
  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal açıldığında formu sıfırla
  useEffect(() => {
    if (isAuthModalOpen) {
      setPassword("");
      setModalError(null);
      setIsSubmitting(false);
    }
  }, [isAuthModalOpen]);

  const handleClose = () => {
    dispatch(logout());
    dispatch(setAuthModalOpen(false));
  };

  const handleSubmit = async () => {
    if (!password) {
      setModalError("Lütfen şifrenizi girin");
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);

      // Kullanıcı bilgilerini almak için farklı kaynaklardan dene
      let userEmail = null;

      // 1. Redux store'dan kullanıcı bilgilerini kontrol et
      if (user && user.email) {
        userEmail = user.email;
      } else {
        // 2. localStorage'dan almaya çalış
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            if (userData && userData.email) {
              userEmail = userData.email;
            }
          } catch (e) {
            console.error("Kullanıcı verisi ayrıştırma hatası:", e);
          }
        }

        // 3. Son çare: localStorage'da email doğrudan var mı?
        if (!userEmail) {
          userEmail = localStorage.getItem("email");
        }

        // 4. Token'dan email çıkarmayı dene
        if (!userEmail) {
          const token = localStorage.getItem("token");
          if (token) {
            try {
              const tokenParts = token.split(".");
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                if (payload && payload.email) {
                  userEmail = payload.email;
                }
              }
            } catch (e) {
              console.error("Token ayrıştırma hatası:", e);
            }
          }
        }
      }

      if (!userEmail) {
        setModalError(
          "Oturum bilgileri bulunamadı. Lütfen tekrar giriş yapın."
        );
        return;
      }

      // Login işlemi ve token alımı
      const loginResponse = await dispatch(
        login({
          email: userEmail,
          password,
          skipUserLoad: true, // Kullanıcı bilgilerini hemen yükleme ayarı
        })
      ).unwrap();

      // Login başarılı olduysa ve token varsa devam et
      if (loginResponse && loginResponse.token) {
        // Yeni token'ı tüm sistemde güncelle
        const tokenUpdated = updateAuthToken(loginResponse.token);

        if (!tokenUpdated) {
          throw new Error("Token güncellenemedi");
        }

        Logger.info(
          "Token başarıyla güncellendi, kullanıcı bilgileri yükleniyor"
        );

        // Kısa bir bekleme ile token'ın yerleşmesini sağla
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Token doğru şekilde kaydedildikten sonra kullanıcı bilgilerini yükle
        await dispatch(loadUser()).unwrap();

        // İşlem başarılı olduğunda modalı kapat
        dispatch(setAuthModalOpen(false));
        setPassword("");
        setModalError(null);

        // Sayfa yenileme işlemini tamamen kaldırıyoruz!
        // loadUser() zaten kullanıcı bilgilerini güncelliyor, yenileme gerekmiyor
      } else {
        throw new Error("Token alınamadı");
      }
    } catch (err) {
      console.error("Token yenileme hatası:", err);
      setModalError(
        err.msg || "Oturum yenilenemedi. Lütfen tekrar giriş yapın."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onClose={handleClose}>
      <DialogTitle>Oturum Süresi Doldu</DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          Güvenlik nedeniyle oturum süreniz doldu. Devam etmek için lütfen
          şifrenizi tekrar girin.
        </Typography>

        {(error || modalError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {modalError || (error && error.msg) || "Kimlik doğrulama hatası"}
          </Alert>
        )}

        <TextField
          autoFocus
          margin="dense"
          label="Şifre"
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Çıkış Yap
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? (
            <CircularProgress size={24} />
          ) : (
            "Oturum Yenile"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthRefreshModal;
