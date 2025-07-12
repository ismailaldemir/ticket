import React, { useContext, useState } from "react";
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
  Switch,
  Typography,
  IconButton,
  Divider,
  Box,
} from "@mui/material";
import {
  DragHandle as DragHandleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DashboardContext } from "../../contexts/DashboardContext";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DashboardSettings = () => {
  const {
    widgets,
    isSettingsOpen,
    setIsSettingsOpen,
    toggleWidgetVisibility,
    reorderWidgets,
    showAllWidgets,
    resetWidgets,
  } = useContext(DashboardContext);

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over.id) {
      const oldIndex = widgets.findIndex((widget) => widget.id === active.id);
      const newIndex = widgets.findIndex((widget) => widget.id === over.id);
      reorderWidgets(oldIndex, newIndex);
    }
  };

  return (
    <Dialog
      open={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <SettingsIcon sx={{ mr: 1 }} />
        Dashboard Ayarları
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>
          Widgetları sıralamak için sürükleyin veya görünürlüğü değiştirin
        </Typography>

        <DndContext
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <SortableContext
            items={widgets.map((w) => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <List sx={{ width: "100%" }}>
              {[...widgets]
                .sort((a, b) => a.order - b.order)
                .map((widget) => (
                  <SortableListItem key={widget.id} widget={widget}>
                    <ListItemIcon>
                      <DragHandleIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={widget.title}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {widget.size === 3
                            ? "Dar"
                            : widget.size === 6
                            ? "Orta"
                            : "Geniş"}{" "}
                          genişlik
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => toggleWidgetVisibility(widget.id)}
                        color={widget.visible ? "primary" : "default"}
                      >
                        {widget.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </SortableListItem>
                ))}
            </List>
          </SortableContext>
        </DndContext>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
        <Button
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={resetWidgets}
        >
          Varsayılana Döndür
        </Button>

        <Box>
          <Button onClick={() => setIsSettingsOpen(false)} color="inherit">
            İptal
          </Button>
          <Button
            onClick={() => setIsSettingsOpen(false)}
            color="primary"
            variant="contained"
          >
            Tamam
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

const SortableListItem = ({ widget, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
  };
  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 1,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    >
      {children}
    </ListItem>
  );
};

export default DashboardSettings;
