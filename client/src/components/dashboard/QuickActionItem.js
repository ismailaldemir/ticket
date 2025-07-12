import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasPermission } from "../../utils/rbacUtils";
import { toast } from "react-toastify";

// Dinamik olarak ikon import etme
import * as MuiIcons from "@mui/icons-material";

const QuickActionItem = ({ action }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // İkonu dinamik olarak yükleme
  const IconComponent =
    action.icon && MuiIcons[action.icon]
      ? MuiIcons[action.icon]
      : MuiIcons.Help;

  const handleActionClick = () => {
    // Yetki kontrolü
    if (action.permission && !hasPermission(user, action.permission)) {
      toast.warning(
        `Bu işlem için '${action.permission}' yetkisine sahip olmanız gerekiyor`
      );
      return;
    }

    // Yönlendirme
    navigate(action.path);
  };

  return (
    <Tooltip title={action.description || action.title} arrow>
      <Card
        sx={{
          height: "100%",
          minHeight: 120,
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            boxShadow: 6,
            transform: "translateY(-2px)",
            transition: "all 0.2s",
          },
        }}
        elevation={2}
      >
        <CardActionArea
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
          onClick={handleActionClick}
        >
          <CardContent
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 2,
              flex: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: `${action.color || "primary"}.light`,
                borderRadius: "50%",
                p: 1.5,
                mb: 1.5,
              }}
            >
              <IconComponent
                color={action.color || "primary"}
                fontSize="large"
              />
            </Box>

            <Typography
              variant="body1"
              align="center"
              fontWeight="medium"
              sx={{ mt: 1 }}
            >
              {action.title}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Tooltip>
  );
};

export default QuickActionItem;
