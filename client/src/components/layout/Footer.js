import React from "react";
import { Box, Container, Typography, useTheme } from "@mui/material";

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.navbar", // Footer zemin rengi temadan alınır
        color: "text.navbar",         // Footer yazı rengi temadan alınır
        py: 1.5,
        mt: "auto",
        transition: theme.transitions.create(["background-color", "color"], {
          duration: theme.transitions.duration.standard,
        }),
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} Organizasyon Yönetim Sistemi. Tüm
            hakları saklıdır.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
