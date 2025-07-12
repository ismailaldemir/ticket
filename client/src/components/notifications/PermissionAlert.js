import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AlertTitle,
  Snackbar,
  Button,
  Typography,
  Box,
} from "@mui/material";
import {
  NavigateNext as NavigateNextIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import {
  dismissAlert,
  markNotificationAsRead,
} from "../../redux/notification/notificationSlice";
import { formatElapsedTime } from "../../utils/dateUtils";

const PermissionAlert = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showPermissionDeniedAlert, currentNotification } = useSelector(
    (state) => state.notification
  );

  if (!showPermissionDeniedAlert || !currentNotification) {
    return null;
  }

  const handleClose = () => {
    dispatch(dismissAlert());
    if (currentNotification?.id) {
      dispatch(markNotificationAsRead(currentNotification.id));
    }
  };

  const handleNavigate = (destination) => () => {
    dispatch(dismissAlert());
    if (currentNotification?.id) {
      dispatch(markNotificationAsRead(currentNotification.id));
    }
    navigate(destination);
  };

  // Zamanı formatla
  const timeAgo = formatElapsedTime(
    currentNotification.timestamp || Date.now()
  );

  return (
    <Snackbar
      open={showPermissionDeniedAlert}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        severity="warning"
        variant="filled"
        onClose={handleClose}
        sx={{
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <AlertTitle>Erişim Engellendi</AlertTitle>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {typeof currentNotification.description === "string"
            ? currentNotification.description
            : currentNotification?.description?.msg ||
              currentNotification?.description?.message ||
              JSON.stringify(currentNotification.description) ||
              `"${currentNotification.component || "Bu sayfa"}"
                için gerekli yetkiye sahip değilsiniz.`}
        </Typography>
        <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
          {timeAgo}
        </Typography>
        <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}>
          <Button
            size="small"
            color="inherit"
            startIcon={<DashboardIcon />}
            onClick={handleNavigate("/dashboard")}
            sx={{ textTransform: "none" }}
          >
            Ana Sayfa
          </Button>

          <Button
            size="small"
            color="inherit"
            startIcon={<NotificationsIcon />}
            onClick={handleNavigate("/notifications")}
            sx={{ textTransform: "none" }}
          >
            Bildirimler
          </Button>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default PermissionAlert;
