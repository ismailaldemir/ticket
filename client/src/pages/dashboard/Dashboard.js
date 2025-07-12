import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableContainer,
  Chip,
  Alert,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Badge,
  Subscriptions,
  MonetizationOn,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Payment,
  EventNote,
  AttachMoney,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getKisiler, clearCurrentKisi } from "../../redux/kisi/kisiSlice";
import { getGruplar } from "../../redux/grup/grupSlice";
import { getBorclar } from "../../redux/borc/borcSlice";
import { getOdemeler } from "../../redux/odeme/odemeSlice";
import { getGelirler } from "../../redux/gelir/gelirSlice";
import { getGiderler } from "../../redux/gider/giderSlice";
import { getUyeler } from "../../redux/uye/uyeSlice";
import { getAboneler } from "../../redux/abone/aboneSlice";
import { PermissionRequired, hasPermission } from "../../utils/rbacUtils";
import { toast } from "react-toastify";
import config from "../../config";

// Sürüklenebilir Dashboard sistemi için gereken bileşenler
import { DashboardProvider } from "../../contexts/DashboardContext";
import DraggableDashboard from "../../components/dashboard/DraggableDashboard";

// Hızlı işlemler bileşenleri
import QuickActions from "../../components/dashboard/QuickActions";
import QuickActionSettings from "../../components/dashboard/QuickActionSettings";

// Mevcut StatCard bileşeni ve hazır olması durumunda kullan
const StatCard = ({ title, value, icon, color, onClick }) => (
  <Card
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      cursor: onClick ? "pointer" : "default",
    }}
    onClick={onClick}
  >
    <CardContent>
      <Typography
        variant="h6"
        component="div"
        color="text.secondary"
        gutterBottom
      >
        {title}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Box
          sx={{
            marginRight: 2,
            backgroundColor: `${color}.light`,
            borderRadius: "50%",
            p: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// Son İşlemler Tablosu - Mevcut kod
const RecentTransactionsTable = ({ title, data, columns, onRowClick }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom component="div">
      {title}
    </Typography>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id}>{column.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.slice(0, 5).map((row) => (
            <TableRow
              key={row._id}
              hover
              onClick={() => onRowClick(row)}
              sx={{ cursor: "pointer" }}
            >
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {column.format
                    ? column.format(row[column.id], row)
                    : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state'lerini al
  const { kisiler } = useSelector((state) => state.kisi);
  const { gruplar } = useSelector((state) => state.grup);
  const { borclar } = useSelector((state) => state.borc);
  const { odemeler } = useSelector((state) => state.odeme);
  const { gelirler } = useSelector((state) => state.gelir);
  const { giderler } = useSelector((state) => state.gider);
  const { uyeler } = useSelector((state) => state.uye);
  const { aboneler } = useSelector((state) => state.abone);
  const { user } = useSelector((state) => state.auth);

  // Hızlı işlemler ayarlar modalı için state
  const [quickActionSettingsOpen, setQuickActionSettingsOpen] = useState(false);

  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    if (hasPermission(user, "kisiler_goruntuleme")) dispatch(getKisiler());
    if (hasPermission(user, "gruplar_goruntuleme")) dispatch(getGruplar());
    if (hasPermission(user, "uyeler_goruntuleme")) dispatch(getUyeler());
    if (hasPermission(user, "aboneler_goruntuleme")) dispatch(getAboneler());
    if (hasPermission(user, "borclar_goruntuleme")) dispatch(getBorclar());
    if (hasPermission(user, "odemeler_goruntuleme")) dispatch(getOdemeler());
    if (hasPermission(user, "gelirler_goruntuleme")) dispatch(getGelirler());
    if (hasPermission(user, "giderler_goruntuleme")) dispatch(getGiderler());
  }, [dispatch, user]);

  // Toplam değerler hesapla
  const toplamOdeme =
    odemeler?.reduce((acc, odeme) => acc + (odeme.odemeTutari || 0), 0) || 0;
  const toplamBorc =
    borclar?.reduce((acc, borc) => acc + (borc.borcTutari || 0), 0) || 0;
  const toplamGelir =
    gelirler?.reduce((acc, gelir) => acc + (gelir.toplamTutar || 0), 0) || 0;
  const toplamGider =
    giderler?.reduce((acc, gider) => acc + (gider.toplamTutar || 0), 0) || 0;

  const odemeColumns = [
    {
      id: "kisi",
      label: "Kişi",
      format: (_, row) => `${row.kisi_id?.ad} ${row.kisi_id?.soyad}`,
    },
    {
      id: "odemeTutari",
      label: "Tutar",
      format: (value) => `₺${value?.toLocaleString("tr-TR")}`,
    },
    {
      id: "odemeTarihi",
      label: "Tarih",
      format: (value) => new Date(value).toLocaleDateString("tr-TR"),
    },
    { id: "odemeYontemi", label: "Ödeme Yöntemi" },
  ];

  const borcColumns = [
    {
      id: "kisi",
      label: "Kişi",
      format: (_, row) => `${row.kisi_id?.ad} ${row.kisi_id?.soyad}`,
    },
    {
      id: "borcTutari",
      label: "Tutar",
      format: (value) => `₺${value?.toLocaleString("tr-TR")}`,
    },
    {
      id: "donem",
      label: "Dönem",
      format: (_, row) =>
        row.ay && row.yil ? `${row.ay}. ay ${row.yil}` : "-",
    },
    {
      id: "odendi",
      label: "Durum",
      format: (value) => (
        <Chip
          label={value ? "Ödendi" : "Ödenmedi"}
          color={value ? "success" : "error"}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
  ];

  const navigateWithPermissionCheck = (path, yetkiKodu) => {
    if (hasPermission(user, yetkiKodu)) {
      navigate(path);
    } else {
      toast.warning(
        `Bu sayfayı görüntülemek için '${yetkiKodu}' yetkisine sahip olmanız gerekiyor.`
      );
    }
  };

  // console.log("Aktif kullanıcı:", user);

  return (
    <Box>
      <DashboardProvider>
        <DraggableDashboard>

          {/* Kişiler */}
          <Box id="kisiler" data-widget-id="kisiler">
            <PermissionRequired
              user={user}
              yetkiKodu="kisiler_goruntuleme"
              fallback={
                user && (
                  user.role === "admin" ||
                  (user.roller && user.roller.some((r) => r.isAdmin)) ||
                  (config?.app?.adminEmail && user.email === config.app.adminEmail)
                )
                  ? null
                  : (
                    <Alert severity="info" sx={{ height: "100%" }}>
                      Kişi istatistiklerini görmek için yetki gerekiyor
                    </Alert>
                  )
              }
            >
              <StatCard
                title="Toplam Kişi"
                value={kisiler?.length || 0}
                icon={<PersonIcon color="primary" />}
                color="primary"
                onClick={() => navigate("/kisiler")}
              />
            </PermissionRequired>
          </Box>


          {/* Gruplar */}
          <Box id="gruplar" data-widget-id="gruplar">
            <PermissionRequired
              user={user}
              yetkiKodu="gruplar_goruntuleme"
              fallback={
                user && (
                  user.role === "admin" ||
                  (user.roller && user.roller.some((r) => r.isAdmin)) ||
                  (config?.app?.adminEmail && user.email === config.app.adminEmail)
                )
                  ? null
                  : (
                    <Alert severity="info" sx={{ height: "100%" }}>
                      Grup istatistiklerini görmek için yetki gerekiyor
                    </Alert>
                  )
              }
            >
              <StatCard
                title="Toplam Grup"
                value={gruplar?.length || 0}
                icon={<GroupIcon color="secondary" />}
                color="secondary"
                onClick={() => navigate("/gruplar")}
              />
            </PermissionRequired>
          </Box>


          {/* Üyeler */}
          <Box id="uyeler" data-widget-id="uyeler">
            <PermissionRequired
              user={user}
              yetkiKodu="uyeler_goruntuleme"
              fallback={
                user && (
                  user.role === "admin" ||
                  (user.roller && user.roller.some((r) => r.isAdmin)) ||
                  (config?.app?.adminEmail && user.email === config.app.adminEmail)
                )
                  ? null
                  : (
                    <Alert severity="info" sx={{ height: "100%" }}>
                      Üye istatistiklerini görmek için yetki gerekiyor
                    </Alert>
                  )
              }
            >
              <StatCard
                title="Toplam Üye"
                value={uyeler?.length || 0}
                icon={<Badge color="info" />}
                color="info"
                onClick={() => navigate("/uyeler")}
              />
            </PermissionRequired>
          </Box>


          {/* Aboneler */}
          <Box id="aboneler" data-widget-id="aboneler">
            <PermissionRequired
              user={user}
              yetkiKodu="aboneler_goruntuleme"
              fallback={
                user && (
                  user.role === "admin" ||
                  (user.roller && user.roller.some((r) => r.isAdmin)) ||
                  (config?.app?.adminEmail && user.email === config.app.adminEmail)
                )
                  ? null
                  : (
                    <Alert severity="info" sx={{ height: "100%" }}>
                      Abone istatistiklerini görmek için yetki gerekiyor
                    </Alert>
                  )
              }
            >
              <StatCard
                title="Toplam Abone"
                value={aboneler?.length || 0}
                icon={<Subscriptions color="warning" />}
                color="warning"
                onClick={() => navigate("/aboneler")}
              />
            </PermissionRequired>
          </Box>


          {/* Borçlar */}
          <Box id="borclar" data-widget-id="borclar">
            <PermissionRequired
              user={user}
              yetkiKodu="borclar_goruntuleme"
              fallback={
                user && (
                  user.role === "admin" ||
                  (user.roller && user.roller.some((r) => r.isAdmin)) ||
                  (config?.app?.adminEmail && user.email === config.app.adminEmail)
                )
                  ? null
                  : (
                    <Alert severity="info" sx={{ height: "100%" }}>
                      Borç istatistiklerini görmek için yetki gerekiyor
                    </Alert>
                  )
              }
            >
              <StatCard
                title="Toplam Borç"
                value={`₺${toplamBorc.toLocaleString()}`}
                icon={<MonetizationOn color="error" />}
                color="error"
                onClick={() =>
                  navigateWithPermissionCheck("/borclar", "borclar_goruntuleme")
                }
              />
            </PermissionRequired>
          </Box>


          {/* Ödemeler */}
          <Box id="odeme" data-widget-id="odeme">
            <PermissionRequired
              user={user}
              yetkiKodu="odemeler_goruntuleme"
              fallback={
                user && (
                  user.role === "admin" ||
                  (user.roller && user.roller.some((r) => r.isAdmin)) ||
                  (config?.app?.adminEmail && user.email === config.app.adminEmail)
                )
                  ? null
                  : (
                    <Alert severity="info" sx={{ height: "100%" }}>
                      Ödeme istatistiklerini görmek için yetki gerekiyor
                    </Alert>
                  )
              }
            >
              <StatCard
                title="Toplam Ödeme"
                value={`₺${toplamOdeme.toLocaleString()}`}
                icon={<Payment color="success" />}
                color="success"
                onClick={() =>
                  navigateWithPermissionCheck(
                    "/odemeler",
                    "odemeler_goruntuleme"
                  )
                }
              />
            </PermissionRequired>
          </Box>


          {/* Gelirler */}
          <Box id="gelir" data-widget-id="gelir">
            <PermissionRequired
              user={user}
              yetkiKodu="gelirler_goruntuleme"
              fallback={
                user && (
                  user.role === "admin" ||
                  (user.roller && user.roller.some((r) => r.isAdmin)) ||
                  (config?.app?.adminEmail && user.email === config.app.adminEmail)
                )
                  ? null
                  : (
                    <Alert severity="info" sx={{ height: "100%" }}>
                      Gelir istatistiklerini görmek için yetki gerekiyor
                    </Alert>
                  )
              }
            >
              <StatCard
                title="Toplam Gelir"
                value={`₺${toplamGelir.toLocaleString()}`}
                icon={<TrendingUpIcon color="success" />}
                color="success"
                onClick={() =>
                  navigateWithPermissionCheck(
                    "/gelirler",
                    "gelirler_goruntuleme"
                  )
                }
              />
            </PermissionRequired>
          </Box>


          {/* Giderler */}
          <Box id="gider" data-widget-id="gider">
            <PermissionRequired
              user={user}
              yetkiKodu="giderler_goruntuleme"
              fallback={
                user && (
                  user.role === "admin" ||
                  (user.roller && user.roller.some((r) => r.isAdmin)) ||
                  (config?.app?.adminEmail && user.email === config.app.adminEmail)
                )
                  ? null
                  : (
                    <Alert severity="info" sx={{ height: "100%" }}>
                      Gider istatistiklerini görmek için yetki gerekiyor
                    </Alert>
                  )
              }
            >
              <StatCard
                title="Toplam Gider"
                value={`₺${toplamGider.toLocaleString()}`}
                icon={<TrendingDownIcon color="error" />}
                color="error"
                onClick={() =>
                  navigateWithPermissionCheck(
                    "/giderler",
                    "giderler_goruntuleme"
                  )
                }
              />
            </PermissionRequired>
          </Box>

          {/* Hızlı İşlemler Widget */}
          <Box id="hizliGenel" data-widget-id="hizliGenel">
            <QuickActions
              onOpenSettings={() => setQuickActionSettingsOpen(true)}
            />
          </Box>

          {/* Son Ödemeler */}
          <Box id="sonOdemeler" data-widget-id="sonOdemeler">
            <PermissionRequired
              user={user}
              yetkiKodu="odemeler_goruntuleme"
              fallback={
                <Alert severity="info">
                  Ödemeleri görüntülemek için yetki gerekiyor
                </Alert>
              }
            >
              <RecentTransactionsTable
                title="Son Ödemeler"
                data={odemeler || []}
                columns={odemeColumns}
                onRowClick={(row) => navigate(`/odemeler/duzenle/${row._id}`)}
              />
            </PermissionRequired>
          </Box>

          {/* Son Borçlar */}
          <Box id="sonBorclar" data-widget-id="sonBorclar">
            <PermissionRequired
              user={user}
              yetkiKodu="borclar_goruntuleme"
              fallback={
                <Alert severity="info">
                  Borçları görüntülemek için yetki gerekiyor
                </Alert>
              }
            >
              <RecentTransactionsTable
                title="Son Borçlar"
                data={borclar || []}
                columns={borcColumns}
                onRowClick={(row) => navigate(`/borclar/duzenle/${row._id}`)}
              />
            </PermissionRequired>
          </Box>
        </DraggableDashboard>
      </DashboardProvider>

      {/* Hızlı İşlemler Ayarlar Modalı */}
      <QuickActionSettings
        open={quickActionSettingsOpen}
        onClose={() => setQuickActionSettingsOpen(false)}
      />
    </Box>
  );
};

export default Dashboard;
