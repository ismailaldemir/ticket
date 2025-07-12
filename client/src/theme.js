import { createTheme } from '@mui/material/styles';

// Tema renk paletlerini oluşturalım
const lightPalette = {
  mode: 'light',
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#fff',
  },
  secondary: {
    main: '#26a69a',
    light: '#4db6ac',
    dark: '#00897b',
    contrastText: '#fff',
  },
  error: {
    main: '#d32f2f',
  },
  warning: {
    main: '#ff9800',
  },
  info: {
    main: '#2196f3',
  },
  success: {
    main: '#4caf50',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
    navbar: '#1976d2', // Footer ile aynı zemin rengi
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    navbar: '#fff', // Footer ile aynı yazı rengi
  },
};

const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#90caf9', // Soft mavi
    light: '#e3f2fd',
    dark: '#42a5f5',
    contrastText: '#000',
  },
  secondary: {
    main: '#81d4fa', // Soft light blue
    light: '#b6ffff',
    dark: '#4ba3c7',
    contrastText: '#000',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
    navbar: '#90caf9', // Footer ile aynı zemin rengi
  },
  text: {
    primary: '#fff',
    secondary: '#b0bec5',
    navbar: '#000', // Footer ile aynı yazı rengi (contrastText)
  },
};

const highContrastPalette = {
  mode: 'dark',
  primary: {
    main: '#ffffff',
    light: '#ffffff',
    dark: '#f0f0f0',
    contrastText: '#000000',
  },
  secondary: {
    main: '#82b1ff', // Soft blue accent
    light: '#b6e3ff',
    dark: '#4d82cb',
    contrastText: '#000000',
  },
  background: {
    default: '#000000',
    paper: '#0a0a0a',
    navbar: '#ffffff', // Footer ile aynı zemin rengi
  },
  text: {
    primary: '#ffffff',
    secondary: '#eeeeee',
    navbar: '#000000', // Footer ile aynı yazı rengi
  },
};

const bluePalette = {
  mode: 'light',
  primary: {
    main: '#2196f3', // Blue 500
    light: '#64b5f6', // Blue 300
    dark: '#1976d2', // Blue 700
    contrastText: '#fff',
  },
  secondary: {
    main: '#03a9f4', // Light Blue 500
    light: '#4fc3f7', // Light Blue 300
    dark: '#0288d1', // Light Blue 700
    contrastText: '#fff',
  },
  background: {
    default: '#f5f8fa',
    paper: '#ffffff',
    navbar: '#2196f3', // Footer ile aynı zemin rengi
  },
  text: {
    primary: '#0d47a1',
    secondary: '#1976d2',
    navbar: '#fff', // Footer ile aynı yazı rengi
  },
};

const sepiaPalette = {
  mode: 'light',
  primary: {
    main: '#5d4037',
    light: '#8b6b61',
    dark: '#321911',
    contrastText: '#fff',
  },
  secondary: {
    main: '#795548',
    light: '#a98274',
    dark: '#4b2c20',
    contrastText: '#fff',
  },
  background: {
    default: '#f8f0e3',
    paper: '#eeded1',
    navbar: '#5d4037', // Footer ile aynı zemin rengi
  },
  text: {
    primary: '#3e2723',
    secondary: '#4e342e',
    navbar: '#fff', // Footer ile aynı yazı rengi
  },
};

const solarizedDarkPalette = {
  mode: 'dark',
  primary: {
    main: '#4fc3f7',
    light: '#8bf6ff',
    dark: '#0093c4',
    contrastText: '#002b36',
  },
  secondary: {
    main: '#0288d1',
    light: '#5eb8ff',
    dark: '#005b9f',
    contrastText: '#fdf6e3',
  },
  background: {
    default: '#002b36',
    paper: '#073642',
    navbar: '#4fc3f7', // Footer ile aynı zemin rengi
  },
  text: {
    primary: '#fdf6e3',
    secondary: '#93a1a1',
    navbar: '#002b36', // Footer ile aynı yazı rengi (contrastText)
  },
};

const solarizedLightPalette = {
  mode: 'light',
  primary: {
    main: '#0288d1',
    light: '#5eb8ff',
    dark: '#005b9f',
    contrastText: '#fff',
  },
  secondary: {
    main: '#039be5',
    light: '#63ccff',
    dark: '#006db3',
    contrastText: '#fff',
  },
  background: {
    default: '#fdf6e3',
    paper: '#eee8d5',
    navbar: '#0288d1', // Footer ile aynı zemin rengi
  },
  text: {
    primary: '#073642',
    secondary: '#586e75',
    navbar: '#fff', // Footer ile aynı yazı rengi
  },
};

// Vintage Teması - nostaljik, eskitilmiş görünüm için
const vintagePalette = {
  mode: 'light',
  primary: {
    main: '#8d6e63', // Vintage brown - Brown 400
    light: '#be9c91',
    dark: '#5f4339',
    contrastText: '#fff',
  },
  secondary: {
    main: '#a1887f', // Lighter brown - Brown 300
    light: '#d3b8ae',
    dark: '#725b53',
    contrastText: '#fff',
  },
  background: {
    default: '#f5f1e6', // Cream background
    paper: '#efe5d5', // Light parchment
    navbar: '#8d6e63', // Footer ile aynı zemin rengi
  },
  text: {
    primary: '#4e342e', // Dark brown text - Brown 800
    secondary: '#6d4c41', // Medium brown text - Brown 600
    navbar: '#fff', // Footer ile aynı yazı rengi
  },
};

// Material Teması - klasik Google Material Design 2.0
const materialPalette = {
  mode: 'light',
  primary: {
    main: '#6200ee', // Material Design 2.0 primary color
    light: '#9c4dff',
    dark: '#3700b3',
    contrastText: '#fff',
  },
  secondary: {
    main: '#03dac6', // Material Design 2.0 secondary color
    light: '#66fff8',
    dark: '#00a896',
    contrastText: '#000',
  },
  background: {
    default: '#ffffff',
    paper: '#ffffff',
    navbar: '#6200ee', // Footer ile aynı zemin rengi
  },
  text: {
    primary: '#3c4043', // Material Design text
    secondary: '#5f6368', // Material Design secondary text
    navbar: '#fff', // Footer ile aynı yazı rengi
  },
};

// Midnight Teması - koyu mavi ve turkuaz tonları
const midnightPalette = {
  mode: 'dark',
  primary: {
    main: '#42a5f5', // Bright blue
    light: '#80d6ff',
    dark: '#0077c2',
    contrastText: '#fff',
  },
  secondary: {
    main: '#00b0ff', // Light blue
    light: '#69e2ff',
    dark: '#0081cb',
    contrastText: '#fff',
  },
  background: {
    default: '#0a1929',
    paper: '#132f4c',
    navbar: '#42a5f5', // Footer ile aynı zemin rengi
  },
  text: {
    primary: '#e3f2fd',
    secondary: '#90caf9',
    navbar: '#fff', // Footer ile aynı yazı rengi
  },
};

// Tema seçenekleri nesnesi
export const themeOptions = {
  light: lightPalette,
  dark: darkPalette,
  highContrast: highContrastPalette,
  blue: bluePalette,
  sepia: sepiaPalette,
  solarizedDark: solarizedDarkPalette,
  solarizedLight: solarizedLightPalette,
  vintage: vintagePalette,
  material: materialPalette,
  midnight: midnightPalette
};

// Tema oluşturma fonksiyonu
export const createAppTheme = (themeMode = 'light') => {
  // Seçilen tema paletini al, yoksa light temasını kullan
  const palette = themeOptions[themeMode] || themeOptions.light;

  return createTheme({
    palette,
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      subtitle1: {
        fontSize: '0.875rem',
      },
      subtitle2: {
        fontSize: '0.75rem',
      },
    },
    // Animasyonlar için geçiş ayarlarını belirleme
    transitions: {
      // Global geçiş ayarlarını özelleştir
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        // Varsayılan süre (geçişlerin çoğunluğu için) - 300ms
        standard: 300,
        // Complex animasyonlar için
        complex: 375,
        // Sayfa geçişleri için
        enteringScreen: 225,
        leavingScreen: 195,
        // Liste öğeleri için özel süreler
        listItem: 180,
        listEnter: 220,
        listExit: 150,
        // Skeleton yükleme animasyonları için
        skeletonFade: 800,
        // Modal ve dialog geçişleri için
        modalEnter: 250,
        modalExit: 200,
      },
      easing: {
        // Hızlıca başlar ve yavaş biter
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        // Hızlı başlar
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        // Yavaş başlar
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        // Doğal hareket gibi (zıplama tarzı)
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        // Elastik hareket
        elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        // Yumuşak geçiş
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.background.default 
              : theme.palette.background.navbar,
            color: theme.palette.mode === 'dark' 
              ? theme.palette.text.primary 
              : theme.palette.text.navbar,
            boxShadow: `0px 2px 4px -1px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`
          })
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            textTransform: 'none',
          },
          contained: {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
      // Fade bileşeni için özelleştirmeler
      MuiFade: {
        defaultProps: {
          timeout: {
            enter: 220,
            exit: 180,
          },
        },
      },
      // Grow bileşeni için özelleştirmeler
      MuiGrow: {
        defaultProps: {
          timeout: {
            enter: 220,
            exit: 180,
          },
        },
      },
      // Liste öğeleri için geçiş ayarları
      MuiListItem: {
        styleOverrides: {
          root: {
            transition: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
      // Tablo satırları için geçiş ayarları
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
      // Skeleton yükleme animasyonları için özelleştirmeler
      MuiSkeleton: {
        styleOverrides: {
          root: {
            animation: 'pulse 1.5s ease-in-out 0.5s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 0.6 },
              '50%': { opacity: 0.8 },
              '100%': { opacity: 0.6 },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
          elevation1: {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            textDecoration: 'none',
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
  });
};

// Varsayılan tema - "material" teması ile başlatalım (Google'a en yakın tema)
export default createAppTheme('material');