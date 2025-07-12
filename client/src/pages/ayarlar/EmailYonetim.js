import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Email as EmailIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import { getActiveOrganizasyonlar } from "../../redux/organizasyon/organizasyonSlice";
import { getActiveSubeler } from "../../redux/sube/subeSlice";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import {
  getEmails,
  getEmailsByKisi,
  getEmailsByOrganizasyon,
  getEmailsBySube,
} from "../../redux/email/emailSlice";
import EmailListesi from "../../components/common/EmailListesi";
import { PermissionRequired, hasPermission } from "../../utils/rbacUtils";

// Tab Panel Bileşeni
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`email-tabpanel-${index}`}
      aria-labelledby={`email-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EmailYonetim = () => {
  const dispatch = useDispatch();
  const { organizasyonlar, loading: orgLoading } = useSelector(
    (state) => state.organizasyon
  );
  const { subeler, loading: subeLoading } = useSelector((state) => state.sube);
  const { kisiler, loading: kisiLoading } = useSelector((state) => state.kisi);
  const { emails, loading: emailLoading } = useSelector((state) => state.email);
  const { user } = useSelector((state) => state.auth);

  // State değişkenleri
  const [tabValue, setTabValue] = useState(0);
  const [selectedOrganizasyon, setSelectedOrganizasyon] = useState("");
  const [selectedSube, setSelectedSube] = useState("");
  const [selectedKisi, setSelectedKisi] = useState("");

  // Verileri yükle
  useEffect(() => {
    dispatch(getActiveOrganizasyonlar());
    dispatch(getActiveSubeler());
    dispatch(getActiveKisiler());
    dispatch(getEmails());
  }, [dispatch]);

  // Tab değişiklik işleyicisi
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedOrganizasyon("");
    setSelectedSube("");
    setSelectedKisi("");
  };

  // Filtre değişiklik işleyicileri
  const handleOrganizasyonChange = (e) => {
    const orgId = e.target.value;
    setSelectedOrganizasyon(orgId);
    if (orgId) {
      dispatch(getEmailsByOrganizasyon(orgId));
    } else {
      dispatch(getEmails());
    }
  };

  const handleSubeChange = (e) => {
    const subeId = e.target.value;
    setSelectedSube(subeId);
    if (subeId) {
      dispatch(getEmailsBySube(subeId));
    } else {
      dispatch(getEmails());
    }
  };

  const handleKisiChange = (e) => {
    const kisiId = e.target.value;
    setSelectedKisi(kisiId);
    if (kisiId) {
      dispatch(getEmailsByKisi(kisiId));
    } else {
      dispatch(getEmails());
    }
  };

  // Yenileme işleyicisi
  const handleRefresh = () => {
    if (tabValue === 0 && selectedOrganizasyon) {
      dispatch(getEmailsByOrganizasyon(selectedOrganizasyon));
    } else if (tabValue === 1 && selectedSube) {
      dispatch(getEmailsBySube(selectedSube));
    } else if (tabValue === 2 && selectedKisi) {
      dispatch(getEmailsByKisi(selectedKisi));
    } else {
      dispatch(getEmails());
    }
  };

  // Örnek: E-posta ekleme/silme işlemlerinde yetki kontrolü
  const handleEmailAdd = (emailData) => {
    if (!hasPermission(user, "ayarlar_guncelleme")) {
      toast.error("E-posta eklemek için yetkiniz yok.");
      return;
    }
    // ...ekleme işlemi...
  };

  const handleEmailDelete = (emailId) => {
    if (!hasPermission(user, "ayarlar_guncelleme")) {
      toast.error("E-posta silmek için yetkiniz yok.");
      return;
    }
    // ...silme işlemi...
  };

  // Filtre ve E-posta listesi rendering işlevi
  const renderFilterAndEmails = () => {
    // Organizasyon sekmesi içeriği
    if (tabValue === 0) {
      return (
        <>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel>Organizasyon Seçin</InputLabel>
            <Select
              value={selectedOrganizasyon}
              onChange={handleOrganizasyonChange}
              label="Organizasyon Seçin"
            >
              <MenuItem value="">
                <em>Tümünü Göster</em>
              </MenuItem>
              {organizasyonlar.map((org) => (
                <MenuItem key={org._id} value={org._id}>
                  {org.ad}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedOrganizasyon ? (
            <EmailListesi
              referansTur="Organizasyon"
              referansId={selectedOrganizasyon}
              emails={emails}
              loading={emailLoading}
            />
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              E-posta adreslerini görüntülemek için bir organizasyon seçin.
            </Alert>
          )}
        </>
      );
    }

    // Şube sekmesi içeriği
    else if (tabValue === 1) {
      return (
        <>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel>Şube Seçin</InputLabel>
            <Select
              value={selectedSube}
              onChange={handleSubeChange}
              label="Şube Seçin"
            >
              <MenuItem value="">
                <em>Tümünü Göster</em>
              </MenuItem>
              {subeler.map((sube) => (
                <MenuItem key={sube._id} value={sube._id}>
                  {sube.ad} ({sube.organizasyon_id?.ad || "Organizasyon Yok"})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedSube ? (
            <EmailListesi
              referansTur="Sube"
              referansId={selectedSube}
              emails={emails}
              loading={emailLoading}
            />
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              E-posta adreslerini görüntülemek için bir şube seçin.
            </Alert>
          )}
        </>
      );
    }

    // Kişi sekmesi içeriği
    else if (tabValue === 2) {
      return (
        <>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel>Kişi Seçin</InputLabel>
            <Select
              value={selectedKisi}
              onChange={handleKisiChange}
              label="Kişi Seçin"
            >
              <MenuItem value="">
                <em>Tümünü Göster</em>
              </MenuItem>
              {kisiler.map((kisi) => (
                <MenuItem key={kisi._id} value={kisi._id}>
                  {kisi.ad} {kisi.soyad}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedKisi ? (
            <EmailListesi
              referansTur="Kisi"
              referansId={selectedKisi}
              emails={emails}
              loading={emailLoading}
            />
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              E-posta adreslerini görüntülemek için bir kişi seçin.
            </Alert>
          )}
        </>
      );
    }
  };

  // Yükleniyor durumu kontrolü
  const isLoading = orgLoading || subeLoading || kisiLoading;

  return (
    <PermissionRequired
      yetkiKodu="ayarlar_goruntuleme"
      fallback={
        <Alert severity="error">
          Bu sayfayı görüntülemek için yetkiniz yok.
        </Alert>
      }
    >
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h5"
                component="h1"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <EmailIcon sx={{ mr: 1 }} />
                E-posta Yönetimi
              </Typography>
              <PermissionRequired yetkiKodu="ayarlar_guncelleme">
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  Yenile
                </Button>
              </PermissionRequired>
            </Box>
            <Divider sx={{ mb: 3 }} />
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ width: "100%" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab icon={<BusinessIcon />} label="Organizasyonlar" />
                <Tab icon={<AccountBalanceIcon />} label="Şubeler" />
                <Tab icon={<PersonIcon />} label="Kişiler" />
              </Tabs>

              {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TabPanel value={tabValue} index={tabValue}>
                  {renderFilterAndEmails()}
                </TabPanel>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </PermissionRequired>
  );
};

export default EmailYonetim;
