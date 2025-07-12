import React, { useContext } from "react";
import { Grid, Box, IconButton, Tooltip, Paper } from "@mui/material";
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { DashboardContext } from "../../contexts/DashboardContext";
import Widget from "./Widget";
import DashboardSettings from "./DashboardSettings";

const DraggableDashboard = ({ children }) => {
  const {
    widgets,
    isEditMode,
    setIsEditMode,
    isSettingsOpen,
    setIsSettingsOpen,
    reorderWidgets,
    showAllWidgets,
  } = useContext(DashboardContext);

  // dnd-kit için yeni handleDragEnd
  const [activeId, setActiveId] = useState(null);
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over?.id);
      reorderWidgets(oldIndex, newIndex);
    }
    setActiveId(null);
  };

  // Dashboard içindeki widget'ları React öğeleri olarak işle
  const mapChildrenToWidgets = () => {
    const childrenArray = React.Children.toArray(children);
    // Sıralanmış widget listesini oluştur
    return [...widgets]
      .sort((a, b) => a.order - b.order)
      .map((widget, index) => {
        // Widget ID'sine göre çocuk elementi bul
        const childWidget = childrenArray.find(
          (child) =>
            child.props.id === widget.id ||
            child.props["data-widget-id"] === widget.id
        );
        if (childWidget) {
          return (
            <Grid
              item
              xs={12}
              sm={widget.size <= 4 ? 6 : 12}
              md={widget.size}
              key={widget.id}
              data-id={widget.id}
            >
              <Widget
                id={widget.id}
                title={widget.title}
                visible={widget.visible}
                order={widget.order}
                size={widget.size}
                index={index}
                isEditMode={isEditMode}
              >
                {childWidget}
              </Widget>
            </Grid>
          );
        }
        return null;
      })
      .filter(Boolean);
  };

  return (
    <>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Tüm Widget'ları Göster">
          <IconButton color="primary" onClick={showAllWidgets} sx={{ mr: 1 }}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Dashboard Ayarları">
          <IconButton
            color="primary"
            onClick={() => setIsSettingsOpen(true)}
            sx={{ mr: 1 }}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={isEditMode ? "Düzenlemeyi Bitir" : "Düzenleme Modu"}>
          <IconButton
            color={isEditMode ? "success" : "primary"}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? <CheckIcon /> : <EditIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      {isEditMode && (
        <Paper
          elevation={0}
          sx={{
            bgcolor: "warning.light",
            color: "warning.contrastText",
            p: 2,
            mb: 3,
            borderRadius: 1,
          }}
        >
          Düzenleme modundasınız. Widget'ları sürükleyin, boyutlandırın veya gizleyin.
        </Paper>
      )}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={({ active }) => setActiveId(active.id)}
      >
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <Grid container spacing={3}>{mapChildrenToWidgets()}</Grid>
        </SortableContext>
      </DndContext>
      <DashboardSettings />
    </>
  );
};

export default DraggableDashboard;
