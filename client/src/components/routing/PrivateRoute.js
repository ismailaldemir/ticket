import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);

  useEffect(() => {
    // 1.5 saniye sonra yükleme devam ediyorsa timeout'a geç
    const timer = setTimeout(() => {
      if (loading) {
        setTimeoutOccurred(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [loading]);

  // Eğer timeout olmamışsa ve yükleme devam ediyorsa, yükleme göster
  if (loading && !timeoutOccurred) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Timeout olduysa veya kimlik doğrulama başarısızsa, login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;