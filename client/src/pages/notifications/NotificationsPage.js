import React, { useState, useEffect, useRef } from "react";
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
  Tabs,
  Tab,
  Chip,
  IconButton,
  Badge,
  Tooltip,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Checkbox,
} from "@mui/material";
import {
  NotificationsActive as NotificationsActiveIcon,
  Delete as DeleteIcon,
  ReadMore as ReadMoreIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  FileDownload as FileDownloadIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  AccessTime as AccessTimeIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import { formatElapsedTime } from "../../utils/dateUtils";
import {
  markNotificationAsRead,
  clearAllNotifications,
} from "../../redux/notification/notificationSlice";
import {
  getAuditLogs,
  getAuditLogActions,
  getAuditLogResources,
} from "../../redux/auditlog/auditLogSlice";
import { formatDate } from "../../utils/formatUtils";
import { useNavigate } from "react-router-dom";
import Logger from "../../utils/logger";
import ExportModal from "../../components/common/ExportModal";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Notification state
  const { permissionDeniedNotifications } = useSelector(
    (state) => state.notification
  );

  // Audit log state
  const { auditLogs, pagination, actions, resources, loading } = useSelector(
    (state) => state.auditLog
  );
  const { user } = useSelector((state) => state.auth);

  // UI States
  const [tabValue, setTabValue] = useState(0);
  const [isPageMounted, setIsPageMounted] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [listRendered, setListRendered] = useState(false);
  const listRef = useRef(null);

  // Modal States
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Selection States for Export
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Audit log filter states
  const [filters, setFilters] = useState({
    action: "",
    resource: "",
    userId: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setIsPageMounted(true);

    return () => {
      setIsPageMounted(false);
      setShouldAnimate(false);
      setListRendered(false);
    };
  }, []);

  useEffect(() => {
    if (isPageMounted) {
      const timer = setTimeout(() => {
        setListRendered(true);

        const animationTimer = setTimeout(() => {
          setShouldAnimate(true);
        }, 100);

        return () => clearTimeout(animationTimer);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isPageMounted]);

  // Audit log verileri getirme
  useEffect(() => {
    if (tabValue === 1) {
      fetchAuditLogs();
      dispatch(getAuditLogActions());
      dispatch(getAuditLogResources());
    }
  }, [tabValue, dispatch, page, rowsPerPage]);

  const fetchAuditLogs = () => {
    const params = {
      ...filters,
      page: page + 1, // API 1-tabanlı sayfalama kullanıyor
      limit: rowsPerPage,
    };
    dispatch(getAuditLogs(params));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelected([]); // Tab değiştiğinde seçimleri sıfırla

    // Tab değiştiğinde sayfa numarasını sıfırla
    if (newValue === 1 && !auditLogs.length) {
      setPage(0);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification.id));
    }

    if (notification.returnUrl) {
      navigate(notification.returnUrl);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Tüm bildirimleri silmek istediğinize emin misiniz?")) {
      dispatch(clearAllNotifications());
    }
  };

  const handleRefreshAuditLogs = () => {
    fetchAuditLogs();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleApplyFilters = () => {
    setPage(0);
    fetchAuditLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      action: "",
      resource: "",
      userId: "",
      startDate: "",
      endDate: "",
      search: "",
    });
    setPage(0);
    fetchAuditLogs();
  };

  // Detay modalı için işlevler
  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);

    // Eğer bildirimse ve okunmamışsa işaretle
    if (tabValue === 0 && item && !item.read) {
      dispatch(markNotificationAsRead(item.id));
    }
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedItem(null);
  };

  // Seçim işlevleri
  const handleSelectItem = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((itemId) => itemId !== id);
    }

    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const currentItems =
        tabValue === 0
          ? permissionDeniedNotifications.map((n) => n.id)
          : auditLogs.map((log) => log._id);
      setSelected(currentItems);
      setSelectAll(true);
      return;
    }
    setSelected([]);
    setSelectAll(false);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Export işlevleri
  const handleExport = () => {
    setExportModalOpen(true);
  };

  const getExportData = () => {
    if (tabValue === 0) {
      // Bildirimler için
      const items = permissionDeniedNotifications.filter(
        (notification) =>
          selected.length === 0 || selected.includes(notification.id)
      );

      return {
        data: items,
        availableColumns: [
          { id: "component", header: "Bileşen" },
          { id: "requiredPermission", header: "Gerekli İzin" },
          { id: "description", header: "Açıklama" },
          {
            id: "timestamp",
            header: "Tarih",
            accessor: (item) => formatDate(item.timestamp),
          },
          {
            id: "read",
            header: "Okundu",
            accessor: (item) => (item.read ? "Evet" : "Hayır"),
          },
        ],
        fileName: "bildirimler",
      };
    } else {
      // Audit loglar için
      const items = auditLogs.filter(
        (log) => selected.length === 0 || selected.includes(log._id)
      );

      return {
        data: items,
        availableColumns: [
          {
            id: "timestamp",
            header: "Tarih",
            accessor: (item) => formatDate(item.timestamp),
          },
          {
            id: "user",
            header: "Kullanıcı",
            accessor: (item) => (item.user ? item.user.name : "Sistem"),
          },
          { id: "action", header: "İşlem" },
          { id: "resource", header: "Kaynak" },
          {
            id: "details.path",
            header: "Yol",
            accessor: (item) => item.details?.path || "-",
          },
          {
            id: "details.method",
            header: "Metod",
            accessor: (item) => item.details?.method || "-",
          },
          {
            id: "details.statusCode",
            header: "Durum Kodu",
            accessor: (item) => item.details?.statusCode || "-",
          },
        ],
        fileName: "islem_gunlukleri",
      };
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.type === "error") return <ErrorIcon color="error" />;
    if (notification.type === "warning" || notification.requiredPermission)
      return <WarningIcon color="warning" />;
    if (notification.type === "success") return <CheckIcon color="success" />;
    return <InfoIcon color="info" />;
  };

  const getActionChipColor = (action) => {
    switch (action) {
      case "create":
        return "success";
      case "update":
        return "primary";
      case "delete":
        return "error";
      case "read":
        return "info";
      case "login":
        return "secondary";
      case "logout":
        return "default";
      case "permission_denied":
        return "warning";
      default:
        return "default";
    }
  };

  const renderNotificationList = (notifications) => {
    if (!listRendered) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 4,
            minHeight: 200,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      );
    }

    if (notifications.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Henüz bildirim bulunmuyor
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < notifications.length
                    }
                    checked={
                      notifications.length > 0 &&
                      selected.length === notifications.length
                    }
                    onChange={handleSelectAllClick}
                    inputProps={{ "aria-label": "tüm bildirimleri seç" }}
                  />
                </TableCell>
                <TableCell>Bileşen</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notification) => {
                const isItemSelected = isSelected(notification.id);

                return (
                  <TableRow
                    key={notification.id}
                    hover
                    selected={isItemSelected}
                    sx={{
                      cursor: "pointer",
                      bgcolor: notification.read ? "inherit" : "action.hover",
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(notification.id);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {getNotificationIcon(notification)}
                        <Typography variant="body2">
                          {notification.component || "Sistem"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                        {notification.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatElapsedTime(notification.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.read ? "Okundu" : "Yeni"}
                        color={notification.read ? "default" : "primary"}
                        size="small"
                        variant={notification.read ? "outlined" : "filled"}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Detayları Göster">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(notification);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  const renderAuditLogFilters = () => {
    return (
      <Box sx={{ mb: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Filtreleme Seçenekleri
        </Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>İşlem Türü</InputLabel>
              <Select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                label="İşlem Türü"
              >
                <MenuItem value="">Tümü</MenuItem>
                {actions.map((action) => (
                  <MenuItem key={action} value={action}>
                    {action}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Kaynak Türü</InputLabel>
              <Select
                name="resource"
                value={filters.resource}
                onChange={handleFilterChange}
                label="Kaynak Türü"
              >
                <MenuItem value="">Tümü</MenuItem>
                {resources.map((resource) => (
                  <MenuItem key={resource} value={resource}>
                    {resource}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Başlangıç Tarihi"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Bitiş Tarihi"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Arama"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                endAdornment: <SearchIcon fontSize="small" color="action" />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              startIcon={<FilterListIcon />}
              size="medium"
              fullWidth
            >
              Filtrele
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              startIcon={<ClearAllIcon />}
              size="medium"
            >
              Temizle
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderAuditLogTable = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 4,
            minHeight: 200,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      );
    }

    if (auditLogs.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Kayıtlı işlem günlüğü bulunamadı
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selected.length > 0 && selected.length < auditLogs.length
                    }
                    checked={
                      auditLogs.length > 0 &&
                      selected.length === auditLogs.length
                    }
                    onChange={handleSelectAllClick}
                    inputProps={{ "aria-label": "tüm logları seç" }}
                  />
                </TableCell>
                <TableCell width="15%">Tarih</TableCell>
                <TableCell width="15%">Kullanıcı</TableCell>
                <TableCell width="15%">İşlem</TableCell>
                <TableCell width="15%">Kaynak</TableCell>
                <TableCell width="20%">Detaylar</TableCell>
                <TableCell width="5%">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.map((log) => {
                const isItemSelected = isSelected(log._id);

                return (
                  <TableRow key={log._id} hover selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(log._id);
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(log.timestamp)}</TableCell>
                    <TableCell>{log.user ? log.user.name : "Sistem"}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        color={getActionChipColor(log.action)}
                      />
                    </TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell>
                      {log.details && log.details.path && (
                        <Typography variant="body2" noWrap>
                          {log.details.path}
                        </Typography>
                      )}
                      {log.details && log.details.method && (
                        <Chip
                          label={log.details.method}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5, mr: 0.5 }}
                        />
                      )}
                      {log.details && log.details.statusCode && (
                        <Chip
                          label={`${log.details.statusCode}`}
                          size="small"
                          color={
                            log.details.statusCode >= 400 ? "error" : "success"
                          }
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(log)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={pagination.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına kayıt"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `${to} üzeri`}`
          }
        />
      </>
    );
  };

  // JSON veriyi formatlayan yardımcı fonksiyon
  const formatJSON = (json) => {
    if (!json) return "Detay bulunamadı";

    try {
      if (typeof json === "string") {
        json = JSON.parse(json);
      }

      // JSON verisini formatlı bir şekilde döndür
      return JSON.stringify(json, null, 2);
    } catch (error) {
      return String(json);
    }
  };

  // Detay modalı içeriği
  const renderDetailsModalContent = () => {
    if (!selectedItem) return null;

    if (tabValue === 0) {
      // Bildirim detayı
      return (
        <>
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {getNotificationIcon(selectedItem)}
              <Typography variant="h6">
                {selectedItem.component || "Sistem Bildirimi"}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader
                    title="Bildirim Detayları"
                    avatar={<DescriptionIcon color="primary" />}
                  />
                  <CardContent>
                    <Typography variant="body1" gutterBottom>
                      {selectedItem.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Gerekli Yetki
                        </Typography>
                        <Chip
                          label={
                            selectedItem.requiredPermission || "Tanımlanmamış"
                          }
                          color="warning"
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Tarih
                        </Typography>
                        <Typography>
                          {formatDate(selectedItem.timestamp)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Durum
                        </Typography>
                        <Chip
                          label={selectedItem.read ? "Okundu" : "Okunmadı"}
                          color={selectedItem.read ? "default" : "primary"}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Erişilen Yol
                        </Typography>
                        <Typography>{selectedItem.path || "-"}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
        </>
      );
    } else {
      // Audit log detayı
      return (
        <>
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <HistoryIcon color={getActionChipColor(selectedItem.action)} />
              <Typography variant="h6">
                {selectedItem.action.toUpperCase()} - {selectedItem.resource}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader
                    title="İşlem Bilgileri"
                    avatar={<CategoryIcon color="primary" />}
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          İşlem Türü
                        </Typography>
                        <Chip
                          label={selectedItem.action}
                          color={getActionChipColor(selectedItem.action)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Kaynak
                        </Typography>
                        <Typography>{selectedItem.resource}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Tarih
                        </Typography>
                        <Typography>
                          {formatDate(selectedItem.timestamp)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          IP Adresi
                        </Typography>
                        <Typography>{selectedItem.ip || "-"}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Kaynak ID
                        </Typography>
                        <Typography>
                          {selectedItem.resourceId || "-"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader
                    title="Kullanıcı Bilgileri"
                    avatar={<PersonIcon color="primary" />}
                  />
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Kullanıcı
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {selectedItem.user
                          ? selectedItem.user.name.charAt(0)
                          : "S"}
                      </Avatar>
                      <Typography>
                        {selectedItem.user ? selectedItem.user.name : "Sistem"}
                      </Typography>
                    </Box>

                    {selectedItem.user && (
                      <>
                        <Typography variant="subtitle2" color="text.secondary">
                          E-posta
                        </Typography>
                        <Typography>
                          {selectedItem.user.email || "-"}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader
                    title="İşlem Detayları"
                    avatar={<CodeIcon color="primary" />}
                  />
                  <CardContent>
                    {selectedItem.details ? (
                      <Box
                        sx={{
                          overflow: "auto",
                          maxHeight: "300px",
                          fontFamily: "monospace",
                          bgcolor: "background.paper",
                          p: 2,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          whiteSpace: "pre-wrap",
                          fontSize: "0.875rem",
                        }}
                      >
                        {formatJSON(selectedItem.details)}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">
                        Detay bulunamadı
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
        </>
      );
    }
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
        <Typography
          variant="h5"
          component="h1"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          {tabValue === 0 ? (
            <>
              <NotificationsActiveIcon color="primary" />
              Bildirimler
              <Badge
                badgeContent={
                  permissionDeniedNotifications.filter((n) => !n.read).length
                }
                color="error"
                sx={{ ml: 1 }}
              />
            </>
          ) : (
            <>
              <HistoryIcon color="primary" />
              İşlem Günlükleri
            </>
          )}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Dışa Aktarma Butonu */}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            disabled={
              tabValue === 0
                ? permissionDeniedNotifications.length === 0
                : auditLogs.length === 0
            }
          >
            Dışa Aktar
          </Button>

          {tabValue === 0 ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClearAll}
              disabled={permissionDeniedNotifications.length === 0}
            >
              Tümünü Temizle
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshAuditLogs}
            >
              Yenile
            </Button>
          )}
        </Box>
      </Box>

      <Paper elevation={1} sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WarningIcon fontSize="small" />
                <span>Yetkisiz Erişim</span>
                <Badge
                  badgeContent={
                    permissionDeniedNotifications.filter((n) => !n.read).length
                  }
                  color="error"
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <HistoryIcon fontSize="small" />
                <span>İşlem Günlükleri</span>
              </Box>
            }
          />
        </Tabs>

        <Box sx={{ p: 0 }}>
          {tabValue === 0 &&
            renderNotificationList(permissionDeniedNotifications)}
          {tabValue === 1 && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<FilterListIcon />}
                >
                  {showFilters ? "Filtreleri Gizle" : "Filtrele"}
                </Button>
              </Box>

              {showFilters && renderAuditLogFilters()}

              {renderAuditLogTable()}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Detay Modali */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {renderDetailsModalContent()}
        <DialogActions>
          <Button onClick={handleCloseDetails} color="primary">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dışa Aktarma Modalı */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title={
          tabValue === 0
            ? "Bildirimleri Dışa Aktar"
            : "İşlem Günlüklerini Dışa Aktar"
        }
        {...getExportData()}
      />
    </Box>
  );
};

export default NotificationsPage;
