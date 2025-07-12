import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
  ListItemButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ExpandLess,
  ExpandMore,
  Business as BusinessIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  menuItems,
  organizasyonMenuItems,
  sistemMenuItems,
} from "../../constants/menuItems";

const drawerWidth = 240;

const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...theme.mixins.openedMixin,
    "& .MuiDrawer-paper": theme.mixins.openedMixin,
  }),
  ...(!open && {
    ...theme.mixins.closedMixin,
    "& .MuiDrawer-paper": theme.mixins.closedMixin,
  }),
}));

const Drawer = ({ open }) => {
  const location = useLocation();
  const [organizasyonOpen, setOrganizasyonOpen] = React.useState(false);
  const [sistemOpen, setSistemOpen] = React.useState(false);

  // URL'den aktif menü öğesini belirleme
  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  // Alt menüyü açık tutmak için kontrol
  React.useEffect(() => {
    // Organizasyon yönetimi altındaki bir sayfadaysak alt menüyü açık tut
    if (organizasyonMenuItems.some((item) => isActive(item.path))) {
      setOrganizasyonOpen(true);
    }

    // Sistem yönetimi altındaki bir sayfadaysak alt menüyü açık tut
    if (sistemMenuItems.some((item) => isActive(item.path))) {
      setSistemOpen(true);
    }
  }, [location.pathname]);

  const handleOrganizasyonClick = () => {
    setOrganizasyonOpen(!organizasyonOpen);
  };

  const handleSistemClick = () => {
    setSistemOpen(!sistemOpen);
  };

  return (
    <StyledDrawer variant="permanent" open={open}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 2,
        }}
      >
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: "bold" }}
        >
          {open ? "Organizasyon Yönetim : "OY"}
        </Typography>
      </Box>

      <Divider />

      {/* Ana Menü */}
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            component={Link}
            to={item.path}
            selected={isActive(item.path)}
            sx={{
              minHeight: 48,
              px: 2.5,
              ...(isActive(item.path) && {
                backgroundColor: "action.selected",
              }),
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : "auto",
                justifyContent: "center",
                color: isActive(item.path) ? "primary.main" : "inherit",
              }}
            >
              <item.icon />
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                opacity: open ? 1 : 0,
                color: isActive(item.path) ? "primary.main" : "inherit",
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Organizasyon Yönetimi Menüsü */}
      <List>
        <ListItemButton onClick={handleOrganizasyonClick}>
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 2 : "auto",
              justifyContent: "center",
            }}
          >
            <BusinessIcon />
          </ListItemIcon>
          <ListItemText primary="Organizasyon" sx={{ opacity: open ? 1 : 0 }} />
          {open && (organizasyonOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
        
        <Collapse in={open && organizasyonOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {organizasyonMenuItems.map((item) => (
              <ListItem
                key={item.text}
                button
                component={Link}
                to={item.path}
                selected={isActive(item.path)}
                sx={{
                  minHeight: 48,
                  pl: 4,
                  ...(isActive(item.path) && {
                    backgroundColor: "action.selected",
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 2,
                    justifyContent: "center",
                    color: isActive(item.path) ? "primary.main" : "inherit",
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    color: isActive(item.path) ? "primary.main" : "inherit",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>

      {/* Sistem Yönetimi Menüsü */}
      <List>
        <ListItemButton onClick={handleSistemClick}>
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 2 : "auto",
              justifyContent: "center",
            }}
          >
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Sistem" sx={{ opacity: open ? 1 : 0 }} />
          {open && (sistemOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>

        <Collapse in={open && sistemOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {sistemMenuItems.map((item) => (
              <ListItem
                key={item.text}
                button
                component={Link}
                to={item.path}
                selected={isActive(item.path)}
                sx={{
                  minHeight: 48,
                  pl: 4,
                  ...(isActive(item.path) && {
                    backgroundColor: "action.selected",
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 2,
                    justifyContent: "center",
                    color: isActive(item.path) ? "primary.main" : "inherit",
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    color: isActive(item.path) ? "primary.main" : "inherit",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </StyledDrawer>
  );
};

export default Drawer;
