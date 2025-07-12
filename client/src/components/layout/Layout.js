import React from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useSelector } from 'react-redux';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector(state => state.ui);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {isAuthenticated && <Navbar />}
      {isAuthenticated && <Sidebar />}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isAuthenticated ? { xs: 1.5, sm: 2 }, // Padding değerini azalttık
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
          ml: { sm: sidebarOpen ? `${drawerWidth}px` : 0 },
          display: 'flex',
          flexDirection: 'column',
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: isAuthenticated ? '64px' : 0, // Navbar yüksekliği
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            flexGrow: 1,
            display: 'flex', 
            flexDirection: 'column',
            py: 2 // Y-ekseni padding değerini azalttık
          }}
        >
          {children}
        </Container>
        {isAuthenticated && <Footer />}
      </Box>
    </Box>
  );
};

export default Layout;
