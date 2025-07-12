import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import { getEmails } from "../../redux/email/emailSlice";
import EmailListesiComponent from "../../components/common/EmailListesi";

const EmailListesiPage = () => {
  const dispatch = useDispatch();
  const { emails, loading } = useSelector((state) => state.email);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    dispatch(getEmails());
  }, [dispatch]);

  const handleTabChange = (e, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        E-posta Listesi Yönetimi
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label="Tüm E-postalar" />
                <Tab label="Kişiler" />
                <Tab label="Organizasyonlar" />
              </Tabs>

              <Box sx={{ mt: 3 }}>
                <EmailListesiComponent
                  emails={emails}
                  loading={false}
                  referansTur={
                    tabValue === 1
                      ? "Kisi"
                      : tabValue === 2
                      ? "Organizasyon"
                      : ""
                  }
                />
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default EmailListesiPage;
