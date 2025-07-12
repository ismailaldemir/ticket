import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  useTheme,
  Fade,
  Zoom,
  Grow,
} from "@mui/material";
import {
  SentimentVeryDissatisfied as SadIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          textAlign: "center",
          py: 4,
        }}
      >
        <Fade in={true} timeout={800}>
          <Paper
            elevation={3}
            sx={{
              p: 5,
              borderRadius: 2,
              width: "100%",
              backgroundColor: theme.palette.background.paper,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "8px",
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            />

            <Zoom in={true} timeout={500} style={{ transitionDelay: "300ms" }}>
              <Box>
                <SadIcon
                  sx={{
                    fontSize: 80,
                    color: theme.palette.text.secondary,
                    mb: 2,
                  }}
                />
              </Box>
            </Zoom>

            <Grow in={true} timeout={800} style={{ transitionDelay: "500ms" }}>
              <Typography
                variant="h2"
                color="primary"
                gutterBottom
                fontWeight="bold"
              >
                404
              </Typography>
            </Grow>

            <Grow in={true} timeout={800} style={{ transitionDelay: "700ms" }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Sayfa Bulunamadı
              </Typography>
            </Grow>

            <Fade in={true} timeout={1000} style={{ transitionDelay: "900ms" }}>
              <Typography
                variant="body1"
                color="textSecondary"
                paragraph
                sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
              >
                Aradığınız sayfa taşınmış, kaldırılmış veya hiç var olmamış
                olabilir. Lütfen URL'i kontrol edin veya aşağıdaki seçeneklerden
                birini kullanın.
              </Typography>
            </Fade>

            <Fade
              in={true}
              timeout={1000}
              style={{ transitionDelay: "1100ms" }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  component={Link}
                  to="/dashboard"
                  startIcon={<HomeIcon />}
                  sx={{ px: 3 }}
                >
                  Ana Sayfaya Dön
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  onClick={handleGoBack}
                  startIcon={<ArrowBackIcon />}
                  sx={{ px: 3 }}
                >
                  Geri Git
                </Button>
              </Box>
            </Fade>
          </Paper>
        </Fade>
      </Box>
    </Container>
  );
};

export default NotFound;
