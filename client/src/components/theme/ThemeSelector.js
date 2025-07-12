import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Palette as PaletteIcon,
  BrightnessAuto as LightIcon, 
  Brightness4 as DarkIcon,
  Contrast as HighContrastIcon,
  BlurOn as BlueIcon,
  FilterVintage as SepiaIcon,
  Brightness6 as SolarizedDarkIcon,
  Brightness5 as SolarizedLightIcon,
  // Yeni temalar için ikonlar
  Wallpaper as VintageIcon,
  Dashboard as MaterialIcon,
  NightsStay as MidnightIcon
} from '@mui/icons-material';
import { setTheme } from '../../redux/theme/themeSlice';

const ThemeSelector = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const theme = useTheme();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleThemeChange = (theme) => {
    dispatch(setTheme(theme));
    handleCloseMenu();
  };

  // Tema seçenekleri
  const themeOptions = [
    { id: 'light', name: 'Açık Tema', icon: <LightIcon /> },
    { id: 'dark', name: 'Koyu Tema', icon: <DarkIcon /> },
    { id: 'highContrast', name: 'Yüksek Kontrast', icon: <HighContrastIcon /> },
    { id: 'blue', name: 'Mavi Tema', icon: <BlueIcon /> },
    { id: 'sepia', name: 'Sepia Tema', icon: <SepiaIcon /> },
    { id: 'solarizedDark', name: 'Solarized Koyu', icon: <SolarizedDarkIcon /> },
    { id: 'solarizedLight', name: 'Solarized Açık', icon: <SolarizedLightIcon /> },
    // Yeni temalar
    { id: 'vintage', name: 'Vintage Tema', icon: <VintageIcon /> },
    { id: 'material', name: 'Material Tema', icon: <MaterialIcon /> },
    { id: 'midnight', name: 'Midnight Tema', icon: <MidnightIcon /> }
  ];

  return (
    <>
      <Tooltip title="Tema Değiştir">
        <IconButton
          color="inherit"
          onClick={handleOpenMenu}
          aria-label="tema değiştir"
          size="large"
          sx={{ 
            transition: theme.transitions.create('color', {
              duration: theme.transitions.duration.standard,
            }),
          }}
        >
          <PaletteIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            minWidth: 180,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
          }
        }}
      >
        {themeOptions.map((option) => (
          <MenuItem
            key={option.id}
            onClick={() => handleThemeChange(option.id)}
            selected={currentTheme === option.id}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.12)',
                },
              },
            }}
          >
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText>{option.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ThemeSelector;
