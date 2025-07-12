import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  Chip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  MarkEmailRead as MarkEmailReadIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  clearAllNotifications,
  markNotificationAsRead,
} from "../../redux/notification/notificationSlice";
import { formatDate } from "../../utils/dateUtils";
import { hasPermission } from "../../utils/rbacUtils";

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { permissionDeniedNotifications } = useSelector(
    (state) => state.notification
  );
  const { user } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  const handleBack = () => {
    navigate(-1);
  };

  const unreadCount = permissionDeniedNotifications.filter(
    (notification) => !notification.read
  ).length;

  const resolveAccess = (requiredPermission) => {
    return hasPermission(user, requiredPermission);
  };

  const getPermissionStatusText = (requiredPermission) => {
    const hasAccess = resolveAccess(requiredPermission);
    return hasAccess ? "Erişim Açıldı" : "Erişim Kapalı";
  };

  const getPermissionStatusColor = (requiredPermission) => {
    const hasAccess = resolveAccess(requiredPermission);
    return hasAccess ? "success" : "error";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton color="primary" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Bildirim Merkezi
          </Typography>
        </Box>
        {permissionDeniedNotifications.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearAll}
          >
            Tümünü Temizle
          </Button>
        )}
      </Box>

      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            icon={
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            }
            label="Tüm Bildirimler"
          />
          <Tab icon={<BlockIcon />} label="Erişim Reddedildi" />
        </Tabs>
      </Paper>

      <Paper elevation={3} sx={{ p: 0 }}>
        {permissionDeniedNotifications.length === 0 ? (
          <Box
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NotificationsIcon
              sx={{
                fontSize: 60,
                color: "text.secondary",
                opacity: 0.3,
                mb: 2,
              }}
            />
            <Typography variant="h6" color="text.secondary">
              Henüz bildirim bulunmuyor
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: "100%" }}>
            {permissionDeniedNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notification.read ? "inherit" : "action.hover",
                    transition: "background-color 0.3s",
                  }}
                  secondaryAction={
                    !notification.read && (
                      <Tooltip title="Okundu olarak işaretle">
                        <IconButton
                          edge="end"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <MarkEmailReadIcon />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <ListItemIcon>
                    <BlockIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="subtitle1"
                          component="span"
                          fontWeight={notification.read ? "normal" : "bold"}
                        >
                          Erişim Engellendi: {notification.component}
                        </Typography>
                        <Chip
                          label={getPermissionStatusText(
                            notification.requiredPermission
                          )}
                          color={getPermissionStatusColor(
                            notification.requiredPermission
                          )}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          component="span"
                        >
                          {notification.description ||
                            `"${notification.requiredPermission}" yetkisi gerekli`}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="div"
                          sx={{ mt: 0.5 }}
                        >
                          {formatDate(notification.timestamp)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < permissionDeniedNotifications.length - 1 && (
                  <Divider />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default NotificationCenter;
