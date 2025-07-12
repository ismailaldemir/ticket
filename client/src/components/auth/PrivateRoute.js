import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress, Box, Typography } from "@mui/material";
import { hasPermission } from "../../utils/rbacUtils";
import { addPermissionDenied } from "../../redux/notification/notificationSlice";
import { Logger } from "../../utils/logger";

/**
 * Yetki gerektiren özel rotaları koruyan bileşen
 * @param {Object} props - Bileşen özellikleri
 * @returns {JSX.Element} - Yönlendirme veya içerik
 */
const PrivateRoute = ({
  children,
  requiredPermission = null,
  componentName = "Bu Sayfa",
}) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Sayfa yüklenirken yetki kontrolü yap
  useEffect(() => {
    // Kullanıcı giriş yapmış ve belirli bir yetki gerekiyorsa kontrolü hemen yap
    if (isAuthenticated && requiredPermission && !loading) {
      if (!hasPermission(user, requiredPermission)) {
        Logger.warn(
          `Yetkisiz erişim engellendi: ${location.pathname}, ${requiredPermission}`
        );

        // Yetki reddi bildirimi ekle
        dispatch(
          addPermissionDenied({
            path: location.pathname,
            requiredPermission,
            component: componentName,
            description: `"${componentName}" sayfasına erişim için "${requiredPermission}" yetkisine sahip olmanız gerekiyor.`,
            timestamp: Date.now(),
          })
        );

        // Yetkisizse ana sayfaya yönlendir
        navigate("/dashboard");
      }
    }
  }, [
    isAuthenticated,
    requiredPermission,
    loading,
    user,
    dispatch,
    location,
    componentName,
  ]);

  // Kimlik doğrulama bekleniyorsa yükleme göster
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Oturum kontrol ediliyor...
        </Typography>
      </Box>
    );
  }

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Eğer belirli bir yetki gerekiyorsa ve kullanıcıda bu yetki yoksa
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    // Yetkisiz erişim sayfasına state ile yönlendir
    return <Navigate to="/access-denied" state={{ from: location }} />;
  }

  // Yetki kontrolü geçildi, içeriği göster
  return children;
};

export default PrivateRoute;
