import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Tooltip,
  Collapse,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PaymentIcon from "@mui/icons-material/Payment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BadgeIcon from "@mui/icons-material/Badge";
import SettingsIcon from "@mui/icons-material/Settings";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EventNoteIcon from "@mui/icons-material/EventNote";
import DateRangeIcon from "@mui/icons-material/DateRange";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import SecurityIcon from "@mui/icons-material/Security";
import EmailIcon from "@mui/icons-material/Email";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebarCollapse } from "../../redux/layout/layoutSlice";

const drawerWidth = 240;

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const isNavbarOnly = useSelector((state) => state.ui.isNavbarOnly);
  const isSidebarCollapsed = useSelector((state) => state.ui.isSidebarCollapsed);

  const [organizasyonOpen, setOrganizasyonOpen] = useState(false);
  const [finansOpen, setFinansOpen] = useState(false);
  const [raporlarOpen, setRaporlarOpen] = useState(false);
  const [sistemOpen, setSistemOpen] = useState(false);

  const handleOrganizasyonClick = () => {
    setOrganizasyonOpen(!organizasyonOpen);
  };

  const handleFinansClick = () => {
    setFinansOpen(!finansOpen);
  };

  const handleRaporlarClick = () => {
    setRaporlarOpen(!raporlarOpen);
  };

  const handleSistemClick = () => {
    setSistemOpen(!sistemOpen);
  };

  const getSelectedStyle = (isSelected) => ({
    backgroundColor: isSelected
      ? theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.main, 0.15)
        : alpha(theme.palette.primary.main, 0.08)
      : "transparent",
    color: isSelected ? "primary.main" : "inherit",
    "&:hover": {
      backgroundColor: isSelected
        ? theme.palette.mode === "dark"
          ? alpha(theme.palette.primary.main, 0.25)
          : alpha(theme.palette.primary.main, 0.12)
        : theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "action.hover",
    },
    borderLeft: isSelected
      ? `4px solid ${theme.palette.primary.main}`
      : "4px solid transparent",
    paddingLeft: isSelected ? 1.5 : 2,
    transition: theme.transitions.create(
      ["background-color", "color", "border-left", "padding-left"],
      {
        duration: theme.transitions.duration.shorter,
      }
    ),
  });

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const menuItems = [
    {
      id: "dashboard",
      title: "Ana Sayfa",
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
    { text: "Doküman Yönetimi", icon: <DescriptionIcon />, path: "/evraklar" },
    { text: "Toplantı Yönetimi", icon: <EventIcon />, path: "/toplantilar" },
    { text: "Proje Yönetimi", icon: <AssignmentIcon />, path: "/projeler" },
    {
      text: "Etkinlik Yönetimi",
      icon: <EventNoteIcon />,
      path: "/etkinlikler",
    },
    { text: "Takvim", icon: <DateRangeIcon />, path: "/takvim" },
    {
      text: "Randevu Yönetimi",
      icon: <CalendarIcon />,
      path: "/randevu",
      yetkiKodu: "randevular_goruntuleme",
    },
  ];

  const organizasyonMenuItems = [
    {
      text: "Organizasyon Tanımları",
      icon: <BusinessIcon />,
      path: "/organizasyonlar",
    },
    { text: "Şube Tanımları", icon: <ApartmentIcon />, path: "/subeler" },
    { text: "Grup Tanımları", icon: <GroupIcon />, path: "/gruplar" },
    { text: "Kişi Tanımları", icon: <PersonIcon />, path: "/kisiler" },
    { text: "Üye Tanımları", icon: <PeopleIcon />, path: "/uyeler" },
    { text: "Üye Rol Tanımları", icon: <BadgeIcon />, path: "/uye-roller" },
    { text: "Abone Tanımları", icon: <WaterDropIcon />, path: "/aboneler" },
    { text: "Cari Tanımları", icon: <PeopleIcon />, path: "/cariler" },
    { text: "Kasa Tanımları", icon: <AccountBalanceIcon />, path: "/kasalar" },
  ];

  const finansMenuItems = [
    { text: "Gelir Kayıtları", icon: <AttachMoneyIcon />, path: "/gelirler" },
    { text: "Gider Kayıtları", icon: <PaymentIcon />, path: "/giderler" },
    { text: "Borç Kayıtları", icon: <MonetizationOnIcon />, path: "/borclar" },
    { text: "Tahsilat Kayıtları", icon: <PaymentIcon />, path: "/odemeler" },
  ];

  const raporMenuItems = [
    {
      text: "Aylık Borç Raporu",
      icon: <AssessmentIcon />,
      path: "/raporlar/aylik-borc",
    },
    {
      text: "Tahsilat Raporu",
      icon: <AssessmentIcon />,
      path: "/raporlar/tahsilat",
    },
  ];

  const sistemMenuItems = [
    { text: "Sabit Tanımlar", icon: <SettingsIcon />, path: "/sabit-tanimlar" },
    { text: "Tarife Tanımları", icon: <DescriptionIcon />, path: "/tarifeler" },
    { text: "Kullanıcılar", icon: <AccountCircleIcon />, path: "/users" },
    { text: "Roller", icon: <SupervisorAccountIcon />, path: "/roller" },
    { text: "Yetkiler", icon: <SecurityIcon />, path: "/yetkiler" },
    { text: "E-posta Listesi", icon: <EmailIcon />, path: "/email-listesi" },
    {
      text: "Kullanıcı-Rol Yönetimi",
      icon: <GroupIcon />,
      path: "/kullanici-rol-yonetimi",
      yetkiKodu: "users_duzenleme",
    },
    {
      text: "Bildirimler",
      icon: <NotificationsIcon />,
      path: "/notifications",
      yetkiKodu: "auditlogs_goruntuleme",
    },
  ];

  useEffect(() => {
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

  const sidebarWidth = isSidebarCollapsed ? 64 : drawerWidth;

  const renderCollapseButton = () =>
    !isNavbarOnly && (
      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          justifyContent: isSidebarCollapsed ? "center" : "flex-end",
          px: 1,
          py: 1,
          minHeight: 48,
        }}
      >
        <Tooltip title={isSidebarCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => dispatch(toggleSidebarCollapse())}
            sx={{
              borderRadius: 1,
              bgcolor: "background.paper",
              boxShadow: 1,
              transition: (theme) =>
                theme.transitions.create(["background-color", "transform"], {
                  duration: theme.transitions.duration.shortest,
                }),
              "&:hover": {
                bgcolor: "primary.light",
                color: "primary.contrastText",
              },
            }}
          >
            {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Box>
    );

  const drawer = (
    <div>
      {renderCollapseButton()}
      <Divider />
      <List>
        {menuItems.map((item) => {
          const isSelected = isActive(item.path);
          return (
            <ListItem key={item.text || item.id} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isSelected}
                sx={{
                  ...getSelectedStyle(isSelected),
                  justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                  px: isSidebarCollapsed ? 1.5 : 2,
                }}
              >
                {isSidebarCollapsed ? (
                  <Tooltip title={item.text || item.title} placement="right">
                    <ListItemIcon
                      sx={{
                        color: isSelected ? "primary.main" : "inherit",
                        minWidth: "auto",
                        justifyContent: 'center',
                        transition: theme.transitions.create("color", {
                          duration: theme.transitions.duration.shorter,
                        }),
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  </Tooltip>
                ) : (
                  <ListItemIcon
                    sx={{
                      color: isSelected ? "primary.main" : "inherit",
                      minWidth: "40px",
                      transition: theme.transitions.create("color", {
                        duration: theme.transitions.duration.shorter,
                      }),
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={item.text || item.title}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: isSelected ? 500 : 400,
                      transition: theme.transitions.create("font-weight", {
                        duration: theme.transitions.duration.shorter,
                      }),
                      variant: "body2",
                    },
                  }}
                  sx={{ display: isSidebarCollapsed ? "none" : "block", opacity: isSidebarCollapsed ? 0 : 1, ml: isSidebarCollapsed ? 0 : 1 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}

        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={handleOrganizasyonClick}
            sx={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              px: isSidebarCollapsed ? 1.5 : 2,
            }}
          >
            {isSidebarCollapsed ? (
              <Tooltip title="Organizasyon Yönetimi" placement="right">
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    justifyContent: 'center',
                    color:
                      location.pathname.includes("/organizasyon") ||
                      location.pathname.includes("/subeler") ||
                      location.pathname.includes("/uye-roller")
                        ? "primary.main"
                        : "inherit",
                  }}
                >
                  <BusinessIcon />
                </ListItemIcon>
              </Tooltip>
            ) : (
              <ListItemIcon
                sx={{
                  minWidth: "40px",
                  color:
                    location.pathname.includes("/organizasyon") ||
                    location.pathname.includes("/subeler") ||
                    location.pathname.includes("/uye-roller")
                      ? "primary.main"
                      : "inherit",
                }}
              >
                <BusinessIcon />
              </ListItemIcon>
            )}
            <ListItemText
              primary="Organizasyon Yönetimi"
              primaryTypographyProps={{ variant: "body2" }}
              sx={{ display: isSidebarCollapsed ? "none" : "block", opacity: isSidebarCollapsed ? 0 : 1, ml: isSidebarCollapsed ? 0 : 1 }}
            />
            {!isSidebarCollapsed && (organizasyonOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        <Collapse in={organizasyonOpen && !isSidebarCollapsed} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {organizasyonMenuItems.map((item) => {
              const isItemActive = isActive(item.path);
              return (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isItemActive}
                    sx={{
                      pl: 4,
                      ...getSelectedStyle(isItemActive),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: "40px",
                        color: isItemActive ? "primary.main" : "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: isItemActive ? 500 : 400,
                          variant: "body2",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Collapse>

        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={handleFinansClick}
            sx={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              px: isSidebarCollapsed ? 1.5 : 2,
            }}
          >
            {isSidebarCollapsed ? (
              <Tooltip title="Finans Yönetimi" placement="right">
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    justifyContent: 'center',
                    color:
                      location.pathname.includes("/kasa") ||
                      location.pathname.includes("/gelir") ||
                      location.pathname.includes("/gider") ||
                      location.pathname.includes("/cari") ||
                      location.pathname.includes("/borc") ||
                      location.pathname.includes("/odeme")
                        ? "primary.main"
                        : "inherit",
                  }}
                >
                  <AccountBalanceIcon />
                </ListItemIcon>
              </Tooltip>
            ) : (
              <ListItemIcon
                sx={{
                  minWidth: "40px",
                  color:
                    location.pathname.includes("/kasa") ||
                    location.pathname.includes("/gelir") ||
                    location.pathname.includes("/gider") ||
                    location.pathname.includes("/cari") ||
                    location.pathname.includes("/borc") ||
                    location.pathname.includes("/odeme")
                      ? "primary.main"
                      : "inherit",
                }}
              >
                <AccountBalanceIcon />
              </ListItemIcon>
            )}
            <ListItemText
              primary="Finans Yönetimi"
              primaryTypographyProps={{ variant: "body2" }}
              sx={{ display: isSidebarCollapsed ? "none" : "block", opacity: isSidebarCollapsed ? 0 : 1, ml: isSidebarCollapsed ? 0 : 1 }}
            />
            {!isSidebarCollapsed && (finansOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        <Collapse in={finansOpen && !isSidebarCollapsed} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {finansMenuItems.map((item) => {
              const isItemActive = isActive(item.path);
              return (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isItemActive}
                    sx={{
                      pl: 4,
                      ...getSelectedStyle(isItemActive),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: "40px",
                        color: isItemActive ? "primary.main" : "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: isItemActive ? 500 : 400,
                          variant: "body2",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Collapse>

        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={handleRaporlarClick}
            sx={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              px: isSidebarCollapsed ? 1.5 : 2,
            }}
          >
            {isSidebarCollapsed ? (
              <Tooltip title="Raporlar" placement="right">
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    justifyContent: 'center',
                    color: location.pathname.includes("/rapor")
                      ? "primary.main"
                      : "inherit",
                  }}
                >
                  <AssessmentIcon />
                </ListItemIcon>
              </Tooltip>
            ) : (
              <ListItemIcon
                sx={{
                  minWidth: "40px",
                  color: location.pathname.includes("/rapor")
                    ? "primary.main"
                    : "inherit",
                }}
              >
                <AssessmentIcon />
              </ListItemIcon>
            )}
            <ListItemText
              primary="Raporlar"
              primaryTypographyProps={{ variant: "body2" }}
              sx={{ display: isSidebarCollapsed ? "none" : "block", opacity: isSidebarCollapsed ? 0 : 1, ml: isSidebarCollapsed ? 0 : 1 }}
            />
            {!isSidebarCollapsed && (raporlarOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        <Collapse in={raporlarOpen && !isSidebarCollapsed} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {raporMenuItems.map((item) => {
              const isItemActive = isActive(item.path);
              return (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isItemActive}
                    sx={{
                      pl: 4,
                      ...getSelectedStyle(isItemActive),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: "40px",
                        color: isItemActive ? "primary.main" : "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: isItemActive ? 500 : 400,
                          variant: "body2",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Collapse>

        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={handleSistemClick}
            sx={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              px: isSidebarCollapsed ? 1.5 : 2,
            }}
          >
            {isSidebarCollapsed ? (
              <Tooltip title="Sistem Tanımları" placement="right">
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    justifyContent: 'center',
                    color:
                      location.pathname.includes("/sabit-tanim") ||
                      location.pathname.includes("/ucret") ||
                      location.pathname.includes("/tarife") ||
                      location.pathname.includes("/users") ||
                      location.pathname.includes("/roller") ||
                      location.pathname.includes("/yetkiler") ||
                      location.pathname.includes("/email-listesi")
                        ? "primary.main"
                        : "inherit",
                  }}
                >
                  <SettingsIcon />
                </ListItemIcon>
              </Tooltip>
            ) : (
              <ListItemIcon
                sx={{
                  minWidth: "40px",
                  color:
                    location.pathname.includes("/sabit-tanim") ||
                    location.pathname.includes("/ucret") ||
                    location.pathname.includes("/tarife") ||
                    location.pathname.includes("/users") ||
                    location.pathname.includes("/roller") ||
                    location.pathname.includes("/yetkiler") ||
                    location.pathname.includes("/email-listesi")
                      ? "primary.main"
                      : "inherit",
                }}
              >
                <SettingsIcon />
              </ListItemIcon>
            )}
            <ListItemText
              primary="Sistem Tanımları"
              primaryTypographyProps={{ variant: "body2" }}
              sx={{ display: isSidebarCollapsed ? "none" : "block", opacity: isSidebarCollapsed ? 0 : 1, ml: isSidebarCollapsed ? 0 : 1 }}
            />
            {!isSidebarCollapsed && (sistemOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        <Collapse in={sistemOpen && !isSidebarCollapsed} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {sistemMenuItems.map((item) => {
              const isItemActive = isActive(item.path);
              return (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isItemActive}
                    sx={{
                      pl: 4,
                      ...getSelectedStyle(isItemActive),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: "40px",
                        color: isItemActive ? "primary.main" : "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: isItemActive ? 500 : 400,
                          variant: "body2",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: sidebarWidth },
        flexShrink: { sm: 0 },
      }}
      aria-label="menü öğeleri"
    >
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            boxShadow: 3,
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "background.paper"
                : "background.default",
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: sidebarWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "background.default"
                : "background.paper",
            color: "text.primary",
            marginTop: "64px",
            transition: theme.transitions.create(
              ["background-color", "color", "width"],
              {
                duration: theme.transitions.duration.standard,
              }
            ),
            height: "calc(100% - 64px)",
            overflowX: "hidden",
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
