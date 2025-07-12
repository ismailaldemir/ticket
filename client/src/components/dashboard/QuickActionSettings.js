import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  PersonAdd,
  GroupAdd,
  Home,
  Person,
  Group,
  AccountBalance,
  Receipt,
  Payment,
  Assessment,
  AttachMoney,
  MonetizationOn,
  Business,
  Apartment,
  People,
  Event,
  Description,
  Money,
  Payments,
  PostAdd,
  Assignment,
} from "@mui/icons-material";
import * as MuiIcons from "@mui/icons-material";
import {
  updateQuickActions,
  updateQuickActions as resetToDefault,
} from "../../redux/quickAction/quickActionSlice";
import { hasPermission } from "../../utils/rbacUtils";

const getSafeIcon = (iconName) => {
  if (!iconName) return HelpIcon;

  const directIcons = {
    PersonAdd,
    GroupAdd,
    Home,
    Person,
    Group,
    AccountBalance,
    Receipt,
    Payment,
    Assessment,
    AttachMoney,
    MonetizationOn,
    Business,
    Apartment,
    People,
    Event,
    Description,
    Money,
    Payments,
    PostAdd,
    Assignment,
    HelpIcon,
    SettingsIcon,
  };

  if (directIcons[iconName]) {
    return directIcons[iconName];
  }

  return MuiIcons[iconName] || HelpIcon;
};

const allAvailableActions = [
  {
    id: "add-kisi",
    title: "Yeni Kişi Ekle",
    icon: "PersonAdd",
    path: "/kisiler/ekle",
    permission: "kisiler_ekleme",
    color: "primary",
    description: "Yeni kişi kaydı oluştur",
  },
  {
    id: "add-grup",
    title: "Yeni Grup Ekle",
    icon: "GroupAdd",
    path: "/gruplar/ekle",
    permission: "gruplar_ekleme",
    color: "secondary",
    description: "Yeni grup kaydı oluştur",
  },
  {
    id: "add-abone",
    title: "Yeni Abone Ekle",
    icon: "PersonAdd",
    path: "/aboneler/ekle",
    permission: "aboneler_ekleme",
    color: "warning",
    description: "Yeni abone kaydı oluştur",
  },
  {
    id: "add-borc",
    title: "Borç Ekle",
    icon: "MonetizationOn",
    path: "/borclar/ekle",
    permission: "borclar_ekleme",
    color: "error",
    description: "Yeni borç kaydı oluştur",
  },
  {
    id: "add-odeme",
    title: "Ödeme Al",
    icon: "Payment",
    path: "/odemeler/ekle",
    permission: "odemeler_ekleme",
    color: "success",
    description: "Yeni ödeme kaydı oluştur",
  },
  {
    id: "add-gelir",
    title: "Gelir Ekle",
    icon: "AttachMoney",
    path: "/gelirler/ekle",
    permission: "gelirler_ekleme",
    color: "success",
    description: "Yeni gelir kaydı oluştur",
  },
  {
    id: "add-gider",
    title: "Gider Ekle",
    icon: "Money",
    path: "/giderler/ekle",
    permission: "giderler_ekleme",
    color: "warning",
    description: "Yeni gider kaydı oluştur",
  },
  {
    id: "add-kasa",
    title: "Kasa Ekle",
    icon: "AccountBalance",
    path: "/kasalar/ekle",
    permission: "kasalar_ekleme",
    color: "info",
    description: "Yeni kasa kaydı oluştur",
  },
  {
    id: "aylik-borc-raporu",
    title: "Aylık Borç Raporu",
    icon: "Assessment",
    path: "/raporlar/aylik-borc",
    permission: "raporlar_goruntuleme",
    color: "info",
    description: "Aylık borç raporunu görüntüle",
  },
  {
    id: "toplu-borc",
    title: "Toplu Borç Ekle",
    icon: "PostAdd",
    path: "/borclar/toplu-ekle",
    permission: "borclar_ekleme",
    color: "error",
    description: "Toplu borç kaydı oluştur",
  },
  {
    id: "toplu-odeme",
    title: "Toplu Ödeme Al",
    icon: "Payments",
    path: "/odemeler/toplu-ekle",
    permission: "odemeler_ekleme",
    color: "success",
    description: "Toplu ödeme kaydı oluştur",
  },
  {
    id: "add-proje",
    title: "Proje Ekle",
    icon: "Assignment",
    path: "/projeler/ekle",
    permission: "projeler_ekleme",
    color: "primary",
    description: "Yeni proje kaydı oluştur",
  },
  {
    id: "add-toplanti",
    title: "Toplantı Ekle",
    icon: "Event",
    path: "/toplantilar/ekle",
    permission: "toplantilar_ekleme",
    color: "secondary",
    description: "Yeni toplantı kaydı oluştur",
  },
  {
    id: "add-evrak",
    title: "Evrak Ekle",
    icon: "Description",
    path: "/evraklar/ekle",
    permission: "evraklar_ekleme",
    color: "info",
    description: "Yeni evrak kaydı oluştur",
  },
];

const colorOptions = [
  { value: "primary", label: "Mavi" },
  { value: "secondary", label: "Mor" },
  { value: "success", label: "Yeşil" },
  { value: "error", label: "Kırmızı" },
  { value: "warning", label: "Turuncu" },
  { value: "info", label: "Açık Mavi" },
];

const STATIC_ICON_LIST = [
  { id: "HomeIcon", label: "Anasayfa" },
  { id: "PersonIcon", label: "Kişiler" },
  { id: "GroupIcon", label: "Gruplar" },
  { id: "AccountBalanceIcon", label: "Finansal" },
  { id: "ReceiptIcon", label: "Faturalar" },
  { id: "PaymentIcon", label: "Ödemeler" },
  { id: "AssessmentIcon", label: "Raporlar" },
  { id: "AttachMoneyIcon", label: "Gelirler" },
  { id: "MonetizationOnIcon", label: "Giderler" },
  { id: "BusinessIcon", label: "Organizasyonlar" },
  { id: "ApartmentIcon", label: "Şubeler" },
  { id: "PeopleIcon", label: "Üyeler" },
  { id: "EventIcon", label: "Etkinlikler" },
];

const QuickActionSettings = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { userActions, loading } = useSelector((state) => state.quickAction);
  const { user } = useSelector((state) => state.auth);

  const [actions, setActions] = useState([]);
  const [addActionDialogOpen, setAddActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [customAction, setCustomAction] = useState({
    id: "",
    title: "",
    icon: "",
    path: "",
    color: "primary",
    description: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const iconOptions = useMemo(() => {
    return STATIC_ICON_LIST.map((icon) => ({
      value: icon.id,
      label: icon.label,
      icon: icon.id,
    }));
  }, []);

  useEffect(() => {
    setActions([...userActions]);
  }, [userActions]);

  const canDeleteAction = (actionId) => {
    return true;
  };

  const handleDelete = (actionId) => {
    setActions(actions.filter((action) => action.id !== actionId));
  };

  // dnd-kit drag end handler
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = actions.findIndex((a) => a.id === active.id);
    const newIndex = actions.findIndex((a) => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newActions = [...actions];
    const [moved] = newActions.splice(oldIndex, 1);
    newActions.splice(newIndex, 0, moved);
    setActions(newActions);
  };

  const getAvailableActionsToAdd = () => {
    const userPermittedActions = allAvailableActions.filter(
      (action) => !action.permission || hasPermission(user, action.permission)
    );

    return userPermittedActions.filter(
      (action) => !actions.some((userAction) => userAction.id === action.id)
    );
  };

  const handleAddCustomAction = () => {
    if (!customAction.title || !customAction.path) {
      return;
    }

    const newId = `custom-${Date.now()}`;

    const newAction = {
      ...customAction,
      id: newId,
    };

    setActions([...actions, newAction]);
    setCustomAction({
      id: "",
      title: "",
      icon: "",
      path: "",
      color: "primary",
      description: "",
    });
    setAddActionDialogOpen(false);
  };

  const handleAddExistingAction = () => {
    if (!selectedAction) return;

    const actionToAdd = allAvailableActions.find(
      (action) => action.id === selectedAction
    );
    if (actionToAdd) {
      setActions([...actions, actionToAdd]);
      setSelectedAction(null);
      setAddActionDialogOpen(false);
    }
  };

  const handleSave = async () => {
    try {
      await dispatch(updateQuickActions(actions)).unwrap();
      onClose();
    } catch (error) {
      // Error handling logic
    }
  };

  const handleResetToDefault = () => {
    dispatch(updateQuickActions([]));
    onClose();
  };

  const availableActionsToAdd = getAvailableActionsToAdd();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <SettingsIcon sx={{ mr: 1 }} />
        Hızlı İşlemler Ayarları
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>
          İşlemleri düzenlemek için sürükleyip bırakın veya yeni işlemler
          ekleyin
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditMode(false);
                  setAddActionDialogOpen(true);
                }}
                disabled={availableActionsToAdd.length === 0}
              >
                Hızlı İşlem Ekle
              </Button>
            </Box>

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragStart={({ active }) => setActiveId(active.id)}
            >
              <SortableContext
                items={actions.map((a) => a.id)}
                strategy={verticalListSortingStrategy}
              >
                <List sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
                  {actions.length === 0 ? (
                    <Alert severity="info" sx={{ my: 2 }}>
                      Henüz hızlı işlem eklenmemiş. "Hızlı İşlem Ekle"
                      butonunu kullanarak işlemler ekleyebilirsiniz.
                    </Alert>
                  ) : (
                    actions.map((action, index) => {
                      const IconComponent = getSafeIcon(action.icon);
                      return (
                        <SortableQuickActionItem
                          key={action.id}
                          action={action}
                          IconComponent={IconComponent}
                          onDelete={handleDelete}
                          canDelete={canDeleteAction(action.id)}
                        />
                      );
                    })
                  )}
                </List>
              </SortableContext>
            </DndContext>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
        <Button
          color="secondary"
          startIcon={<RefreshIcon />}
          onClick={handleResetToDefault}
        >
          Varsayılana Döndür
        </Button>

        <Box>
          <Button onClick={onClose} color="inherit" sx={{ mr: 1 }}>
            İptal
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            startIcon={<CheckIcon />}
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </Box>
      </DialogActions>

      <Dialog
        open={addActionDialogOpen}
        onClose={() => setAddActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Hızlı İşlemi Düzenle" : "Hızlı İşlem Ekle"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Hazır işlemlerden ekleyin:
            </Typography>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="action-select-label">Hazır İşlemler</InputLabel>
              <Select
                labelId="action-select-label"
                value={selectedAction || ""}
                onChange={(e) => setSelectedAction(e.target.value)}
                label="Hazır İşlemler"
              >
                <MenuItem value="">
                  <em>Seçiniz</em>
                </MenuItem>
                {availableActionsToAdd.map((action) => (
                  <MenuItem key={action.id} value={action.id}>
                    {action.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddExistingAction}
              disabled={!selectedAction}
              fullWidth
              sx={{ mt: 2 }}
            >
              Hazır İşlemi Ekle
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Chip label="VEYA" />
          </Divider>

          <Typography variant="subtitle2" gutterBottom>
            Özel işlem oluşturun:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Başlık"
                value={customAction.title}
                onChange={(e) =>
                  setCustomAction({ ...customAction, title: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Yönlendirme Yolu"
                value={customAction.path}
                onChange={(e) =>
                  setCustomAction({ ...customAction, path: e.target.value })
                }
                helperText="Örn: /kisiler/ekle"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="icon-select-label">İkon</InputLabel>
                <Select
                  labelId="icon-select-label"
                  value={customAction.icon}
                  onChange={(e) =>
                    setCustomAction({ ...customAction, icon: e.target.value })
                  }
                  label="İkon"
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {iconOptions.map((icon) => (
                    <MenuItem key={icon.value} value={icon.value}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {React.createElement(getSafeIcon(icon.value.replace("Icon", "")), {
                          style: { marginRight: 8 },
                        })}
                        {icon.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="color-select-label">Renk</InputLabel>
                <Select
                  labelId="color-select-label"
                  value={customAction.color}
                  onChange={(e) =>
                    setCustomAction({ ...customAction, color: e.target.value })
                  }
                  label="Renk"
                >
                  {colorOptions.map((color) => (
                    <MenuItem key={color.value} value={color.value}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            bgcolor: `${color.value}.main`,
                            mr: 1,
                          }}
                        />
                        {color.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                value={customAction.description}
                onChange={(e) =>
                  setCustomAction({
                    ...customAction,
                    description: e.target.value,
                  })
                }
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddActionDialogOpen(false)} color="inherit">
            İptal
          </Button>
          <Button
            onClick={handleAddCustomAction}
            color="primary"
            variant="contained"
            disabled={!customAction.title || !customAction.path}
          >
            {editMode ? "Güncelle" : "Ekle"}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};


// dnd-kit ile uyumlu sortable hızlı işlem bileşeni
function SortableQuickActionItem({ action, IconComponent, onDelete, canDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    background: isDragging ? '#f0f0f0' : undefined,
  };
  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 1,
        bgcolor: "background.paper",
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      <ListItemIcon sx={{ cursor: 'grab' }}>
        <DragIcon />
      </ListItemIcon>
      <ListItemIcon
        sx={{
          bgcolor: `${action.color || "primary"}.light`,
          borderRadius: "50%",
          padding: "8px",
          mr: 1,
        }}
      >
        {React.createElement(IconComponent, {
          color: action.color || "primary",
        })}
      </ListItemIcon>
      <ListItemText
        primary={action.title}
        secondary={
          <React.Fragment>
            <Typography component="span" variant="body2" color="text.primary">
              {action.path}
            </Typography>
            {action.description && ` — ${action.description}`}
            {action.permission && (
              <Chip
                label={`Yetki: ${action.permission}`}
                size="small"
                sx={{ ml: 1 }}
                color="default"
                variant="outlined"
              />
            )}
          </React.Fragment>
        }
      />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          onClick={() => onDelete(action.id)}
          disabled={!canDelete}
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}

export default QuickActionSettings;
