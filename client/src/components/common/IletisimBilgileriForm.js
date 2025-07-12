import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Box, Typography, Tabs, Tab, Paper } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PublicIcon from "@mui/icons-material/Public";

import TelefonListesi from "../organizasyon/TelefonListesi";
import AdresListesi from "../organizasyon/AdresListesi";
import SosyalMedyaListesi from "../organizasyon/SosyalMedyaListesi";

// Tab Panel bileşeni
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`iletisim-tabpanel-${index}`}
      aria-labelledby={`iletisim-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const IletisimBilgileriForm = ({ referansId, referansTur }) => {
  const [tabValue, setTabValue] = useState(0);

  // Tab değiştirme işlevi
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!referansId) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          İletişim bilgileri ekleyebilmek için önce kayıt oluşturulmalıdır.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Telefon" icon={<PhoneIcon />} iconPosition="start" />
            <Tab label="Adres" icon={<LocationOnIcon />} iconPosition="start" />
            <Tab
              label="Web & Sosyal Medya"
              icon={<PublicIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TelefonListesi referansId={referansId} referansTur={referansTur} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AdresListesi referansId={referansId} referansTur={referansTur} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <SosyalMedyaListesi
            referansId={referansId}
            referansTur={referansTur}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default IletisimBilgileriForm;
