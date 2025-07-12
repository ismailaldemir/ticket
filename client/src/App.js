import React, { useEffect, useState, Suspense } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, CircularProgress, Box, Toolbar } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import trLocale from "date-fns/locale/tr";
import store from "./redux/store";
import {
  loadUser as initializeUser,
  checkTokenValidity,
  setAuthModalOpen,
} from "./redux/auth/authSlice";
import { updateAuthToken, injectNavigate } from "./utils/api"; // Yeni import
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logger from "./utils/logger"; // Burada Logger içe aktarılıyor
import { jwtDecode } from "jwt-decode"; // Doğru import

import { useDispatch, useSelector } from "react-redux";
import { createAppTheme } from "./theme";
import { toast } from "react-toastify";
import { SecurityIcon } from "@mui/icons-material";
import useConfirm from "./hooks/useConfirm";
import format from "./utils/format";
import alertSlice from "./redux/alert/alertSlice";
import AuthRefreshModal from "./components/auth/AuthRefreshModal";
import PermissionAlert from "./components/notifications/PermissionAlert"; // Yeni eklenen import

// Bileşenler
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";
import PrivateRoute from "./components/routing/PrivateRoute";

// Sayfalar
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import KisiList from "./pages/kisi/KisiList";
import KisiForm from "./pages/kisi/KisiForm";
import GrupList from "./pages/grup/GrupList";
import GrupForm from "./pages/grup/GrupForm";
import BorcList from "./pages/borc/BorcList";
import BorcForm from "./pages/borc/BorcForm";
import OdemeList from "./pages/odeme/OdemeList";
import OdemeForm from "./pages/odeme/OdemeForm";
import UcretList from "./pages/ucret/UcretList";
import UcretForm from "./pages/ucret/UcretForm";
import NotFound from "./pages/NotFound";
import UserList from "./pages/user/UserList";
import UserForm from "./pages/user/UserForm";
import BulkBorcForm from "./pages/borc/BulkBorcForm";
import ProfilePage from "./pages/profile/ProfilePage";
import AylikBorcRaporu from "./pages/rapor/AylikBorcRaporu";
import BulkOdemeForm from "./pages/odeme/BulkOdemeForm";

// Yeni eklenen sayfalar
import OrganizasyonList from "./pages/organizasyon/OrganizasyonList";
import OrganizasyonForm from "./pages/organizasyon/OrganizasyonForm";
import SubeList from "./pages/sube/SubeList";
import SubeForm from "./pages/sube/SubeForm";
import UyeRolList from "./pages/uyeRol/UyeRolList";
import UyeRolForm from "./pages/uyeRol/UyeRolForm";
import SabitTanimList from "./pages/sabitTanim/SabitTanimList";
import SabitTanimForm from "./pages/sabitTanim/SabitTanimForm";
import KasaList from "./pages/kasa/KasaList";
import KasaForm from "./pages/kasa/KasaForm";
import CariList from "./pages/cari/CariList";
import CariForm from "./pages/cari/CariForm";
import GelirList from "./pages/gelir/GelirList";
import GelirForm from "./pages/gelir/GelirForm";
import GelirDetay from "./pages/gelir/GelirDetay";
import GiderList from "./pages/gider/GiderList";
import GiderForm from "./pages/gider/GiderForm";
import GiderDetay from "./pages/gider/GiderDetay";
import ToplantiList from "./pages/toplanti/ToplantiList";
import ToplantiForm from "./pages/toplanti/ToplantiForm";
import ToplantiDetay from "./pages/toplanti/ToplantiDetay";
import EvrakList from "./pages/evrak/EvrakList";
import EvrakForm from "./pages/evrak/EvrakForm";
import EvrakDetay from "./pages/evrak/EvrakDetay";
import EvrakEklerYonetim from "./pages/evrak/EvrakEklerYonetim";

import ProjeList from "./pages/proje/ProjeList";
import ProjeForm from "./pages/proje/ProjeForm";
import ProjeDetay from "./pages/proje/ProjeDetay";

import AboneList from "./pages/abone/AboneList";
import AboneForm from "./pages/abone/AboneForm";
import AboneDetay from "./pages/abone/AboneDetay";
import BulkAboneDetayForm from "./pages/abone/BulkAboneDetayForm"; // Yeni import

import EtkinlikList from "./pages/etkinlik/EtkinlikList";
import EtkinlikForm from "./pages/etkinlik/EtkinlikForm";
import EtkinlikDetay from "./pages/etkinlik/EtkinlikDetay";

import TakvimSayfasi from "./pages/takvim/TakvimSayfasi";

// Üye sayfaları için import'lar
import UyeList from "./pages/uye/UyeList";
import UyeForm from "./pages/uye/UyeForm";
import UyeDetay from "./pages/uye/UyeDetay";

// Tarifeler sayfaları için import'lar
import TarifeList from "./pages/tarife/TarifeList";
import TarifeForm from "./pages/tarife/TarifeForm";
import TarifeDetay from "./pages/tarife/TarifeDetay";

// Ücret sayfaları için import'lar
import UcretTarifeForm from "./pages/ucret/UcretTarifeForm";

// Roller ve Yetkiler için sayfaları içe aktarıyoruz
import RolList from "./pages/rol/RolList";
import RolForm from "./pages/rol/RolForm";
import YetkiList from "./pages/yetki/YetkiList";
import YetkiForm from "./pages/yetki/YetkiForm";

// Notifications sayfasını ekleyin
import NotificationsPage from "./pages/notifications/NotificationsPage";

// Email Yönetim Sayfası
import EmailYonetim from "./pages/ayarlar/EmailYonetim";

// EmailListesi import ekleme
import EmailListesiPage from "./pages/emaillistesi/EmailListesi";

import AccessDenied from "./pages/auth/AccessDenied";

// Yeni sayfayı import et
import KullaniciRolYonetim from "./pages/kullaniciRol/KullaniciRolYonetim";

// Randevu yönetimi sayfalarını ekleyelim
import RandevuAnaSayfa from "./pages/randevu/RandevuAnaSayfa";
import RandevuSlotList from "./pages/randevu/RandevuSlotList";
import TopluRandevuOlusturForm from "./pages/randevu/TopluRandevuOlusturForm";
import RandevuTanimlarList from "./pages/randevu/RandevuTanimlarList"; // Yeni import
import RandevuTanimForm from "./pages/randevu/RandevuTanimForm"; // Yeni import
import RandevuSlotForm from "./pages/randevu/RandevuSlotForm"; // Yeni slot formu bileşeni

// Sabit genişlikler
const drawerWidth = 240;

//import TakvimSayfasi from "./pages/takvim/TakvimSayfasi";

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const { currentTheme } = useSelector((state) => state.theme);

  // layout slice eklenmediği için null check ile koruyoruz
  const layout = useSelector((state) => state.layout);
  const isNavbarOnly = layout ? layout.isNavbarOnly : false;

  const [initialized, setInitialized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hareketsizlik için timeout süresi (milisaniye cinsinden)
  // Token süresini JWT'den dinamik olarak al
  const getIdleTimeout = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token); // Burada jwtDecode kullanılmalı
        if (decoded.exp) {
          const expireMs = decoded.exp * 1000 - Date.now();
          // Token süresinin %90'ı kadar bir süre belirle (en az 10 dakika)
          return Math.max(10 * 60 * 1000, Math.floor(expireMs * 0.9));
        }
      } catch (e) {
        // decode hatası olursa default değeri kullan
      }
    }
    // Default: 10 dakika
    return 10 * 60 * 1000;
  };

  // Seçilen temaya göre tema nesnesini oluştur
  const theme = createAppTheme(currentTheme);

  // İşte burada useMediaQuery'yi theme oluşturulduktan sonra kullanıyoruz
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();

  useEffect(() => {
    injectNavigate(navigate); // navigate fonksiyonunu api.js'e aktar
  }, [navigate]);

  useEffect(() => {
    // Token varsa kullanıcıyı yükle
    const token = localStorage.getItem("token");
    if (token) {
      updateAuthToken(token); // setAuthToken(token) yerine
      dispatch(initializeUser());
    }

    // Uygulama başlatılırken bir timeout ekleyin
    // Bu, sunucu yanıt vermese bile uygulamanın başlamasını sağlar
    const timer = setTimeout(() => {
      setInitialized(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  useEffect(() => {
    // LocalStorage'dan token varsa kullanıcıyı yükle
    if (localStorage.token) {
      updateAuthToken(localStorage.token); // setAuthToken(localStorage.token) yerine
      dispatch(initializeUser())
        .unwrap()
        .catch((err) => {
          console.error("Kullanıcı yüklenirken hata:", err);
          // Hata durumunda kullanıcıya bilgi ver
          toast.error(
            err?.msg ||
              "Sunucu bağlantısı kurulamadı, lütfen daha sonra tekrar deneyiniz."
          );
        });
    }
  }, [dispatch]);

  useEffect(() => {
    // Uygulama yüklendiğinde token geçerliliğini kontrol et
    dispatch(checkTokenValidity())
      .unwrap()
      .then((result) => {
        Logger.info(
          "Token geçerlilik kontrolü tamamlandı:",
          result.isAuthenticated
        );
      })
      .catch((error) => {
        Logger.error("Token geçerlilik kontrolünde hata:", error);
      });
  }, [dispatch]);

  useEffect(() => {
    // Hareketsizlik olduğunda modal aç
    const handleIdle = () => {
      dispatch(setAuthModalOpen(true));
    };

    // Sayaç sıfırlama fonksiyonu
    let idleTimer = null;
    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(handleIdle, getIdleTimeout());
    };

    // Kullanıcı etkileşimlerini dinle
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    // İlk başlatma
    resetIdleTimer();

    // Temizlik
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
    };
  }, [dispatch]);

  const handleDrawerToggle = () => {
    console.log("Drawer toggle çağrıldı, önceki durum:", mobileOpen);
    setMobileOpen(!mobileOpen);
  };

  // Loading durumunda gösterilecek bileşen
  if (!initialized) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <AuthRefreshModal />
      <PermissionAlert />
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Navbar handleDrawerToggle={handleDrawerToggle} />
        {/* Sidebar görünürlüğünü düzenleme */}
        {isAuthenticated && !isNavbarOnly && (
          <Sidebar
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
          />
        )}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: {
              sm: `calc(100% - ${
                isAuthenticated && !isNavbarOnly ? drawerWidth : 0
              }px)`,
            },
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            transition: theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Toolbar /> {/* Bu, içeriğin navbar altından başlamasını sağlar */}
          <Box sx={{ flex: 1, py: 2 }}>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />
                }
              />
              <Route
                path="/register"
                element={
                  !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
                }
              />
              {/* Private Routes */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              {/* Kişi Rotaları */}
              <Route
                path="/kisiler"
                element={
                  <PrivateRoute>
                    <KisiList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kisiler/ekle"
                element={
                  <PrivateRoute>
                    <KisiForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kisiler/duzenle/:id"
                element={
                  <PrivateRoute>
                    <KisiForm />
                  </PrivateRoute>
                }
              />
              {/* Grup Rotaları */}
              <Route
                path="/gruplar"
                element={
                  <PrivateRoute>
                    <GrupList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/gruplar/ekle"
                element={
                  <PrivateRoute>
                    <GrupForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/gruplar/duzenle/:id"
                element={
                  <PrivateRoute>
                    <GrupForm />
                  </PrivateRoute>
                }
              />
              {/* Borç Rotaları */}
              <Route
                path="/borclar"
                element={
                  <PrivateRoute>
                    <BorcList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/borclar/ekle"
                element={
                  <PrivateRoute>
                    <BorcForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/borclar/duzenle/:id"
                element={
                  <PrivateRoute>
                    <BorcForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/borclar/toplu-ekle"
                element={
                  <PrivateRoute>
                    <BulkBorcForm />
                  </PrivateRoute>
                }
              />
              {/* Ödeme Rotaları */}
              <Route
                path="/odemeler"
                element={
                  <PrivateRoute>
                    <OdemeList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/odemeler/ekle"
                element={
                  <PrivateRoute>
                    <OdemeForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/odemeler/duzenle/:id"
                element={
                  <PrivateRoute>
                    <OdemeForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/odemeler/toplu-ekle"
                element={
                  isAuthenticated ? <BulkOdemeForm /> : <Navigate to="/login" />
                }
              />
              {/* Ücret Rotaları */}
              <Route
                path="/ucretler"
                element={
                  <PrivateRoute>
                    <UcretList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ucretler/ekle"
                element={
                  <PrivateRoute>
                    <UcretForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ucretler/duzenle/:id"
                element={
                  <PrivateRoute>
                    <UcretForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ucretler/tarife/:tarifeId/ekle"
                element={
                  <PrivateRoute>
                    <UcretTarifeForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ucretler/tarife/:tarifeId/duzenle/:ucretId"
                element={
                  <PrivateRoute>
                    <UcretTarifeForm />
                  </PrivateRoute>
                }
              />
              {/* Kullanıcı Yönetimi Rotaları */}
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <UserList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users/add"
                element={
                  <PrivateRoute>
                    <UserForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users/edit/:id"
                element={
                  <PrivateRoute>
                    <UserForm />
                  </PrivateRoute>
                }
              />
              {/* Raporlar Rotaları */}
              <Route
                path="/raporlar/aylik-borc"
                element={
                  <PrivateRoute>
                    <AylikBorcRaporu />
                  </PrivateRoute>
                }
              />
              <Route
                path="/raporlar"
                element={
                  <PrivateRoute>
                    <Navigate to="/raporlar/aylik-borc" replace />
                  </PrivateRoute>
                }
              />
              {/* Organizasyon Rotaları */}
              <Route
                path="/organizasyonlar"
                element={
                  <PrivateRoute>
                    <OrganizasyonList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/organizasyonlar/ekle"
                element={
                  <PrivateRoute>
                    <OrganizasyonForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/organizasyonlar/duzenle/:id"
                element={
                  <PrivateRoute>
                    <OrganizasyonForm />
                  </PrivateRoute>
                }
              />
              {/* Şube Rotaları */}
              <Route
                path="/subeler"
                element={
                  <PrivateRoute>
                    <SubeList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/subeler/ekle"
                element={
                  <PrivateRoute>
                    <SubeForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/subeler/duzenle/:id"
                element={
                  <PrivateRoute>
                    <SubeForm />
                  </PrivateRoute>
                }
              />
              {/* Üye Rol Rotaları */}
              <Route
                path="/uye-roller"
                element={
                  <PrivateRoute>
                    <UyeRolList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/uye-roller/ekle"
                element={
                  <PrivateRoute>
                    <UyeRolForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/uye-roller/duzenle/:id"
                element={
                  <PrivateRoute>
                    <UyeRolForm />
                  </PrivateRoute>
                }
              />
              {/* Sabit Tanımlar Rotaları */}
              <Route
                path="/sabit-tanimlar"
                element={
                  <PrivateRoute>
                    <SabitTanimList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sabit-tanimlar/ekle"
                element={
                  <PrivateRoute>
                    <SabitTanimForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sabit-tanimlar/duzenle/:id"
                element={
                  <PrivateRoute>
                    <SabitTanimForm />
                  </PrivateRoute>
                }
              />
              {/* Kasa Rotaları */}
              <Route
                path="/kasalar"
                element={
                  <PrivateRoute>
                    <KasaList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kasalar/ekle"
                element={
                  <PrivateRoute>
                    <KasaForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kasalar/duzenle/:id"
                element={
                  <PrivateRoute>
                    <KasaForm />
                  </PrivateRoute>
                }
              />
              {/* Cari Rotaları */}
              <Route
                path="/cariler"
                element={
                  <PrivateRoute>
                    <CariList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cariler/ekle"
                element={
                  <PrivateRoute>
                    <CariForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cariler/duzenle/:id"
                element={
                  <PrivateRoute>
                    <CariForm />
                  </PrivateRoute>
                }
              />
              {/* Gelirler sayfaları */}
              <Route
                path="/gelirler"
                element={
                  <PrivateRoute>
                    <GelirList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/gelirler/ekle"
                element={
                  <PrivateRoute>
                    <GelirForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/gelirler/duzenle/:id"
                element={
                  <PrivateRoute>
                    <GelirForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/gelirler/detay/:id"
                element={
                  <PrivateRoute>
                    <GelirDetay />
                  </PrivateRoute>
                }
              />
              {/* Gider sayfaları için route'lar */}
              <Route
                path="/giderler"
                element={
                  <PrivateRoute>
                    <GiderList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/giderler/ekle"
                element={
                  <PrivateRoute>
                    <GiderForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/giderler/duzenle/:id"
                element={
                  <PrivateRoute>
                    <GiderForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/giderler/detay/:id"
                element={
                  <PrivateRoute>
                    <GiderDetay />
                  </PrivateRoute>
                }
              />
              {/* Toplantı Rotaları */}
              <Route
                path="/toplantilar"
                element={
                  <PrivateRoute>
                    <ToplantiList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/toplantilar/ekle"
                element={
                  <PrivateRoute>
                    <ToplantiForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/toplantilar/duzenle/:id"
                element={
                  <PrivateRoute>
                    <ToplantiForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/toplantilar/detay/:id"
                element={
                  <PrivateRoute>
                    <ToplantiDetay />
                  </PrivateRoute>
                }
              />
              {/* Evrak Yönetimi */}
              <Route
                path="/evraklar"
                element={
                  <PrivateRoute>
                    <EvrakList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/evraklar/ekle"
                element={
                  <PrivateRoute>
                    <EvrakForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/evraklar/duzenle/:id"
                element={
                  <PrivateRoute>
                    <EvrakForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/evraklar/detay/:id"
                element={
                  <PrivateRoute>
                    <EvrakDetay />
                  </PrivateRoute>
                }
              />
              <Route
                path="/evraklar/ekler/:id"
                element={
                  <PrivateRoute>
                    <EvrakEklerYonetim />
                  </PrivateRoute>
                }
              />
              {/* Proje Rotaları */}
              <Route
                path="/projeler"
                element={
                  <PrivateRoute>
                    <ProjeList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projeler/ekle"
                element={
                  <PrivateRoute>
                    <ProjeForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projeler/duzenle/:id"
                element={
                  <PrivateRoute>
                    <ProjeForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projeler/detay/:id"
                element={
                  <PrivateRoute>
                    <ProjeDetay />
                  </PrivateRoute>
                }
              />
              {/* Abone Rotaları */}
              <Route
                path="/aboneler"
                element={
                  <PrivateRoute>
                    <AboneList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/aboneler/ekle"
                element={
                  <PrivateRoute>
                    <AboneForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/aboneler/duzenle/:id"
                element={
                  <PrivateRoute>
                    <AboneForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/aboneler/detay/:id"
                element={
                  <PrivateRoute>
                    <AboneDetay />
                  </PrivateRoute>
                }
              />
              <Route
                path="/aboneler/toplu-kayit"
                element={
                  <PrivateRoute>
                    <BulkAboneDetayForm />
                  </PrivateRoute>
                }
              />
              {/* Etkinlik Sayfaları */}
              <Route
                path="/etkinlikler"
                element={
                  <PrivateRoute>
                    <EtkinlikList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/etkinlikler/ekle"
                element={
                  <PrivateRoute>
                    <EtkinlikForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/etkinlikler/duzenle/:id"
                element={
                  <PrivateRoute>
                    <EtkinlikForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/etkinlikler/detay/:id"
                element={
                  <PrivateRoute>
                    <EtkinlikDetay />
                  </PrivateRoute>
                }
              />
              {/* Etkinlik Detay Sayfası */}
              <Route
                path="/etkinlikler/detay/:id"
                element={
                  <PrivateRoute>
                    <EtkinlikDetay />
                  </PrivateRoute>
                }
              />
              {/* Takvim rotası */}
              <Route
                path="/takvim"
                element={
                  <PrivateRoute>
                    <TakvimSayfasi />
                  </PrivateRoute>
                }
              />
              {/* Üyeler Rotaları */}
              <Route
                path="/uyeler"
                element={
                  <PrivateRoute>
                    <UyeList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/uyeler/ekle"
                element={
                  <PrivateRoute>
                    <UyeForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/uyeler/duzenle/:id"
                element={
                  <PrivateRoute>
                    <UyeForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/uyeler/detay/:id"
                element={
                  <PrivateRoute>
                    <UyeDetay />
                  </PrivateRoute>
                }
              />
              {/* Tarifeler Rotaları */}
              <Route
                path="/tarifeler"
                element={
                  <PrivateRoute>
                    <TarifeList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tarifeler/ekle"
                element={
                  <PrivateRoute>
                    <TarifeForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tarifeler/duzenle/:id"
                element={
                  <PrivateRoute>
                    <TarifeForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tarifeler/detay/:id"
                element={
                  <PrivateRoute>
                    <TarifeDetay />
                  </PrivateRoute>
                }
              />
              {/* Rol Yönetimi Rotaları */}
              <Route
                path="/roller"
                element={
                  <PrivateRoute>
                    <RolList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/roller/ekle"
                element={
                  <PrivateRoute>
                    <RolForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/roller/duzenle/:id"
                element={
                  <PrivateRoute>
                    <RolForm />
                  </PrivateRoute>
                }
              />
              {/* Yetki Yönetimi Rotaları */}
              <Route
                path="/yetkiler"
                element={
                  <PrivateRoute>
                    <YetkiList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/yetkiler/ekle"
                element={
                  <PrivateRoute>
                    <YetkiForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/yetkiler/duzenle/:id"
                element={
                  <PrivateRoute>
                    <YetkiForm />
                  </PrivateRoute>
                }
              />
              {/* Bildirimler Sayfası */}
              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <NotificationsPage />
                  </PrivateRoute>
                }
              />
              {/* Email Yönetim Sayfası */}
              <Route
                path="/ayarlar/email-yonetim"
                element={
                  <PrivateRoute>
                    <EmailYonetim />
                  </PrivateRoute>
                }
              />
              {/* Email Listesi Sayfası */}
              <Route
                path="/email-listesi"
                element={
                  <PrivateRoute>
                    <EmailListesiPage />
                  </PrivateRoute>
                }
              />
              {/* Kullanıcı Rol Yönetimi */}
              <Route
                path="/kullanici-rol-yonetimi"
                element={
                  <PrivateRoute>
                    <KullaniciRolYonetim />
                  </PrivateRoute>
                }
              />
              {/* Randevu Yönetimi Route'ları */}
              <Route
                path="/randevu"
                element={
                  <PrivateRoute>
                    <RandevuAnaSayfa />
                  </PrivateRoute>
                }
              />
              <Route
                path="/randevu/slotlar"
                element={
                  <PrivateRoute>
                    <RandevuSlotList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/randevu/toplu-olustur"
                element={
                  <PrivateRoute>
                    <TopluRandevuOlusturForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/randevu/tanimlar"
                element={
                  <PrivateRoute>
                    <RandevuTanimlarList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/randevu/tanim/ekle"
                element={
                  <PrivateRoute>
                    <RandevuTanimForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/randevu/tanim/duzenle/:id"
                element={
                  <PrivateRoute>
                    <RandevuTanimForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/randevu/slot/ekle"
                element={
                  <PrivateRoute>
                    <RandevuSlotForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/randevu/slot/yeni"
                element={
                  <PrivateRoute>
                    <RandevuSlotForm />
                  </PrivateRoute>
                }
              />
              <Route path="/403" element={<AccessDenied />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
