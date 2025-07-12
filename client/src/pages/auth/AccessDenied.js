import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import HomeIcon from "@mui/icons-material/Home";

const AccessDenied = () => {
  const navigate = useNavigate();
  // Redux veya context'ten son yetki reddi bilgisini al
  const lastPermissionDenied = useSelector(
    (state) => state.auth?.lastPermissionDenied
  );

  const handleGoHome = () => navigate("/");
  const handleGoNotifications = () => navigate("/notifications");

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={4}
        sx={{ p: 5, maxWidth: 500, textAlign: "center", borderRadius: 3 }}
      >
        <BlockIcon color="error" sx={{ fontSize: 80, mb: 2, opacity: 0.8 }} />
        <Typography variant="h4" color="error" gutterBottom>
          Erişim Engellendi (403)
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {lastPermissionDenied?.description ||
            "Bu sayfaya veya işleme erişmek için gerekli yetkilere sahip değilsiniz."}
        </Typography>
        {lastPermissionDenied?.requiredPermissions && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Gerekli Yetki(ler):
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              sx={{ mt: 1 }}
            >
              {lastPermissionDenied.requiredPermissions.map((perm) => (
                <Chip
                  key={perm}
                  label={perm}
                  color="warning"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
          >
            Anasayfa
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<NotificationsActiveIcon />}
            onClick={handleGoNotifications}
          >
            Bildirimler
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AccessDenied;
