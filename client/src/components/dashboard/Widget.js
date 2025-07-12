import React, { useContext } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Box,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AspectRatio as AspectRatioIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DashboardContext } from "../../contexts/DashboardContext";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Widget = ({ id, title, visible, order, size, index, isEditMode, children }) => {
  const { toggleWidgetVisibility, resizeWidget } = useContext(DashboardContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleVisibility = () => {
    toggleWidgetVisibility(id);
    handleMenuClose();
  };

  const handleResize = (newSize) => {
    resizeWidget(id, newSize);
    handleMenuClose();
  };

  if (!visible && !isEditMode) {
    return null;
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: !visible && isEditMode ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Card
        sx={{
          mb: 3,
          position: "relative",
          boxShadow: isDragging ? 8 : 1,
        }}
      >
        <CardHeader
          title={title}
          action={
            isEditMode && (
              <IconButton onClick={handleMenuOpen} size="small">
                <MoreVertIcon />
              </IconButton>
            )
          }
          sx={{
            cursor: isEditMode ? "grab" : "default",
            backgroundColor: (theme) =>
              isEditMode ? theme.palette.action.hover : "inherit",
          }}
          {...(isEditMode ? { ...attributes, ...listeners } : {})}
        />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleToggleVisibility}>
            {visible ? (
              <VisibilityOffIcon fontSize="small" sx={{ mr: 1 }} />
            ) : (
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            )}
            {visible ? "Gizle" : "Göster"}
          </MenuItem>
          <MenuItem onClick={() => handleResize(3)}>
            <AspectRatioIcon fontSize="small" sx={{ mr: 1 }} />
            Dar
          </MenuItem>
          <MenuItem onClick={() => handleResize(6)}>
            <AspectRatioIcon fontSize="small" sx={{ mr: 1 }} />
            Orta
          </MenuItem>
          <MenuItem onClick={() => handleResize(12)}>
            <AspectRatioIcon fontSize="small" sx={{ mr: 1 }} />
            Geniş
          </MenuItem>
        </Menu>
        <CardContent>{children}</CardContent>
      </Card>
    </Box>
  );
};

export default Widget;
