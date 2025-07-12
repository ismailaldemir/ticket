import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Typography,
  Button,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  useMediaQuery,
  Grid,
  Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  Logout,
  AccountBalance,
  ViewSidebar,
  KeyboardArrowDown,
  ViewHeadline,
  ExpandLess,
  ExpandMore,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  EventNote as EventNoteIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  DateRange as DateRangeIcon,
  Group as GroupIcon,
  MonetizationOn as MonetizationOnIcon,
  Payment as PaymentIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Apartment as ApartmentIcon,
  Badge as BadgeIcon,
  WaterDrop as WaterDropIcon,
  AccountCircle as AccountCircleIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  AccountCircle,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import { logout } from "../../redux/auth/authSlice";
import { toggleNavbar, toggleNavbarOnly } from "../../redux/layout/layoutSlice";
import ThemeSelector from "../theme/ThemeSelector";
import UserAvatar from "../../components/user/UserAvatar";
import config from "../../config";

const menuItems = [
  {
    id: "dashboard",
    title: "Ana Sayfa",
    icon: DashboardIcon,
    path: "/dashboard",
  },
  { text: "Doküman Yönetimi", icon: DescriptionIcon, path: "/evraklar" },
  { text: "Toplantı Yönetimi", icon: EventIcon, path: "/toplantilar" },
  { text: "Proje Yönetimi", icon: AssignmentIcon, path: "/projeler" },
  { text: "Etkinlik Yönetimi", icon: EventNoteIcon, path: "/etkinlikler" },
  { text: "Takvim", icon: DateRangeIcon, path: "/takvim" },
  { text: "Randevu Yönetimi", icon: CalendarTodayIcon, path: "/randevu" },
];

const organizasyonMenuItems = [
  {
    text: "Organizasyon Tanımları",
    icon: BusinessIcon,
    path: "/organizasyonlar",
  },
  { text: "Şube Tanımları", icon: ApartmentIcon, path: "/subeler" },
  { text: "Grup Tanımları", icon: GroupIcon, path: "/gruplar" },
  { text: "Kişi Tanımları", icon: PersonIcon, path: "/kisiler" },
  { text: "Üye Tanımları", icon: PeopleIcon, path: "/uyeler" },
  { text: "Üye Rol Tanımları", icon: BadgeIcon, path: "/uye-roller" },
  { text: "Abone Tanımları", icon: WaterDropIcon, path: "/aboneler" },
  { text: "Cari Tanımları", icon: PeopleIcon, path: "/cariler" },
  { text: "Kasa Tanımları", icon: AccountBalanceIcon, path: "/kasalar" },
];

const finansMenuItems = [
  { text: "Gelir Kayıtları", icon: AttachMoneyIcon, path: "/gelirler" },
  { text: "Gider Kayıtları", icon: PaymentIcon, path: "/giderler" },
  { text: "Borç Kayıtları", icon: MonetizationOnIcon, path: "/borclar" },
  { text: "Tahsilat Kayıtları", icon: PaymentIcon, path: "/odemeler" },
];

const raporMenuItems = [
  {
    text: "Aylık Borç Raporu",
    icon: AssessmentIcon,
    path: "/raporlar/aylik-borc",
  },
  {
    text: "Tahsilat Raporu",
    icon: AssessmentIcon,
    path: "/raporlar/tahsilat",
  },
];

const sistemMenuItems = [
  { text: "Sabit Tanımlar", icon: SettingsIcon, path: "/sabit-tanimlar" },
  { text: "Tarife Tanımları", icon: DescriptionIcon, path: "/tarifeler" },
  { text: "Kullanıcılar", icon: AccountCircleIcon, path: "/users" },
  { text: "Roller", icon: SupervisorAccountIcon, path: "/roller" },
  { text: "Yetkiler", icon: SecurityIcon, path: "/yetkiler" },
  { text: "E-posta Listesi", icon: EmailIcon, path: "/email-listesi" },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const isNavbarOnly = useSelector((state) => state.ui.isNavbarOnly);
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { sidebarOpen } = useSelector((state) => state.ui);

  const [navMenuAnchorEl, setNavMenuAnchorEl] = useState(null);
  const [accountMenuAnchorEl, setAccountMenuAnchorEl] = useState(null);
  const [organizasyonOpen, setOrganizasyonOpen] = useState(false);
  const [sistemOpen, setSistemOpen] = useState(false);
  const [finansOpen, setFinansOpen] = useState(false);
  const [raporlarOpen, setRaporlarOpen] = useState(false);

  const navMenuOpen = Boolean(navMenuAnchorEl);
  const accountMenuOpen = Boolean(accountMenuAnchorEl);
  const logoExists = false;

  useEffect(() => {
    if (
      location.pathname.includes("/organizasyon") ||
      location.pathname.includes("/subeler") ||
      location.pathname.includes("/gruplar") ||
      location.pathname.includes("/kisiler") ||
      location.pathname.includes("/uyeler") ||
      location.pathname.includes("/uye-roller") ||
      location.pathname.includes("/aboneler") ||
      location.pathname.includes("/cariler") ||
      location.pathname.includes("/kasalar")
    ) {
      setOrganizasyonOpen(true);
    }

    if (
      location.pathname.includes("/gelir") ||
      location.pathname.includes("/gider") ||
      location.pathname.includes("/borc") ||
      location.pathname.includes("/odeme")
    ) {
      setFinansOpen(true);
    }

    if (location.pathname.includes("/rapor")) {
      setRaporlarOpen(true);
    }

    if (
      location.pathname.includes("/sabit-tanim") ||
      location.pathname.includes("/tarife") ||
      location.pathname.includes("/users") ||
      location.pathname.includes("/roller") ||
      location.pathname.includes("/yetkiler") ||
      location.pathname.includes("/email-listesi")
    ) {
      setSistemOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.info("Kullanıcı bilgileri güncellendi: ", user.name);
    }
  }, [isAuthenticated, user]);

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleNavMenuOpen = (event) => {
    setNavMenuAnchorEl(event.currentTarget);
  };

  const handleAccountMenuOpen = (event) => {
    setAccountMenuAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchorEl(null);
  };

  const handleNavMenuClose = () => {
    setNavMenuAnchorEl(null);
  };

  const handleLogout = () => {
    handleAccountMenuClose();
    dispatch(logout());
    navigate("/login");
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleNavMenuClose();
  };

  const handleOrganizasyonToggle = () => {
    setOrganizasyonOpen(!organizasyonOpen);
  };

  const handleSistemToggle = () => {
    setSistemOpen(!sistemOpen);
  };

  const handleFinansToggle = () => {
    setFinansOpen(!finansOpen);
  };

  const handleRaporlarToggle = () => {
    setRaporlarOpen(!raporlarOpen);
  };

  const handleMenuButtonClick = () => {
    if (isMobile) {
      dispatch(toggleNavbar()); // Mobil görünümde drawer'ı aç/kapa
    } else {
      dispatch(toggleNavbarOnly());
    }
  };

  const handleDrawerToggle = () => {
    dispatch(toggleNavbar());
  };

  // Mega Menü render fonksiyonu
  const renderMegaMenu = () => {
    if (!isAuthenticated || (!isNavbarOnly && !isMobile)) return null;

    // Menü gruplarını ve başlıklarını tanımla
    const menuGroups = [
      {
        title: "Organizasyon",
        items: organizasyonMenuItems,
      },
      {
        title: "Finans",
        items: finansMenuItems,
      },
      {
        title: "Sistem",
        items: sistemMenuItems,
      },
      {
        title: "Raporlar",
        items: raporMenuItems,
      },
      {
        title: "Genel",
        items: menuItems,
      },
    ];

    return (
      <Box sx={{ mr: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="text"
          color="inherit"
          onClick={handleNavMenuOpen}
          endIcon={<KeyboardArrowDown />}
          sx={{
            fontSize: "1rem",
            fontWeight: 500,
            textTransform: "none",
          }}
        >
          Menü
        </Button>
        <Menu
          anchorEl={navMenuAnchorEl}
          open={navMenuOpen}
          onClose={handleNavMenuClose}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1,
              minWidth: 700,
              maxWidth: "90vw",
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: 3,
              p: 3,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? theme.palette.background.paper
                  : "#fff",
              boxShadow: 8,
            },
          }}
          MenuListProps={{
            sx: { p: 0 },
          }}
        >
          <Grid container spacing={3} sx={{ minWidth: 650 }}>
            {menuGroups.map((group, idx) => (
              <Grid item xs={12} sm={6} md={2.4} key={group.title}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    color: "primary.main",
                    letterSpacing: 0.5,
                  }}
                >
                  {group.title}
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: "transparent",
                    boxShadow: "none",
                  }}
                >
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <MenuItem
                        key={item.text || item.title}
                        onClick={() => handleMenuItemClick(item.path)}
                        selected={isActive(item.path)}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          pl: 1,
                          pr: 1.5,
                          minHeight: 38,
                          bgcolor: isActive(item.path)
                            ? (theme) =>
                                theme.palette.mode === "dark"
                                  ? "primary.dark"
                                  : "primary.light"
                            : "transparent",
                          color: isActive(item.path)
                            ? "primary.contrastText"
                            : "text.primary",
                          "&:hover": {
                            bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "primary.main"
                                : "primary.light",
                            color: "primary.contrastText",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Icon
                            fontSize="small"
                            color={isActive(item.path) ? "primary" : "inherit"}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text || item.title}
                          primaryTypographyProps={{
                            fontWeight: isActive(item.path) ? 600 : 400,
                            variant: "body2",
                          }}
                        />
                      </MenuItem>
                    );
                  })}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Menu>
      </Box>
    );
  };

  const renderUserMenu = () => (
    <Menu
      anchorEl={accountMenuAnchorEl}
      open={accountMenuOpen}
      onClose={handleAccountMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
          mt: 1.5,
          minWidth: 200,
          "& .MuiAvatar-root": {
            width: config.avatar.sizes.small,
            height: config.avatar.sizes.small,
            ml: -0.5,
            mr: 1,
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      {user && (
        <MenuItem
          sx={{ flexDirection: "column", alignItems: "flex-start", py: 1 }}
        >
          <Typography variant="subtitle2">{user.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </MenuItem>
      )}
      <Divider />
      <MenuItem onClick={() => navigate("/profile")}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Profil" />
      </MenuItem>
      <MenuItem onClick={() => navigate("/settings")}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Ayarlar" />
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Çıkış Yap" />
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxShadow: 1,
        bgcolor:
          theme.palette.background.navbar, // Navbar zemin rengi temadan alınır
        color: theme.palette.text.navbar,  // Navbar yazı rengi temadan alınır
        backgroundImage: "none",
        transition: theme.transitions.create(["background-color"], {
          duration: theme.transitions.duration.standard,
        }),
      }}
    >
      <Toolbar>
        {/* Menü tuşunu tamamen kaldırıyoruz, mobilde de logonun solunda gösterilmeyecek */}
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 0 }}>
          {logoExists ? (
            <Box
              component="img"
              src="/logo192.png"
              alt="Logo"
              sx={{ height: 40, mr: 1 }}
            />
          ) : (
            <AccountBalance color="inherit" sx={{ mr: 1, fontSize: 28 }} />
          )}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to={isAuthenticated ? "/dashboard" : "/"}
            sx={{
              mr: 2,
              fontWeight: 700,
              color: "inherit",
              textDecoration: "none",
              display: { xs: "none", sm: "block" },
            }}
          >
            Organizasyon Yönetim Sistemi
          </Typography>
        </Box>

        {/* Mega Menü */}
        {renderMegaMenu()}

        <Box sx={{ flexGrow: 1 }} />

        {isAuthenticated && !isMobile && (
          <Tooltip
            title={
              isNavbarOnly ? "Kenar Çubuğunu Göster" : "Kenar Çubuğunu Gizle"
            }
          >
            <IconButton
              color="inherit"
              onClick={() => dispatch(toggleNavbarOnly())}
              sx={{
                mr: 1,
                transition: theme.transitions.create("transform", {
                  duration: theme.transitions.duration.standard,
                }),
                transform: isNavbarOnly ? "rotate(0deg)" : "rotate(180deg)",
              }}
            >
              {isNavbarOnly ? <ViewSidebar /> : <ViewHeadline />}
            </IconButton>
          </Tooltip>
        )}

        <ThemeSelector />

        {isAuthenticated ? (
          <Box sx={{ ml: 1 }}>
            <Tooltip title="Hesap ayarları">
              <IconButton
                onClick={handleAccountMenuOpen}
                size="small"
                sx={{
                  ml: 1,
                  bgcolor: accountMenuOpen
                    ? alpha(theme.palette.primary.main, 0.1)
                    : "transparent",
                  transition: theme.transitions.create("background-color", {
                    duration: theme.transitions.duration.shortest,
                  }),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  },
                }}
                aria-controls={accountMenuOpen ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={accountMenuOpen ? "true" : undefined}
              >
                {user ? (
                  <>
                    <UserAvatar user={user} size={32} />
                    <Typography
                      variant="body2"
                      sx={{ ml: 1, display: { xs: "none", sm: "block" } }}
                    >
                      {user.name}
                    </Typography>
                  </>
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Tooltip>
            {renderUserMenu()}
          </Box>
        ) : (
          // Sadece login veya register ekranında sağ üstteki giriş/kayıt butonlarını gösterme
          (location.pathname !== "/login" && location.pathname !== "/register") && (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                sx={{ ml: 1 }}
              >
                Giriş Yap
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                component={RouterLink}
                to="/register"
                sx={{ ml: 1 }}
              >
                Kayıt Ol
              </Button>
            </>
          )
        )}
      </Toolbar>
    </AppBar>
  );
};

 
export default Navbar;
