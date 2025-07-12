import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  Box,
  Typography,
  IconButton,
  alpha,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";

const DeleteDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Sil",
  content = "Bu kaydı silmek istediğinize emin misiniz?",
  loading = false,
  confirmButtonText = "Sil",
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          overflow: "hidden",
        },
      }}
    >
      <Box>
        <DialogTitle
          id="delete-dialog-title"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pt: 2.5,
            pb: 2.5,
            backgroundColor: alpha(theme.palette.error.main, 0.05),
            borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <WarningIcon
              sx={{
                color: theme.palette.error.main,
                fontSize: 24,
              }}
            />
            <Typography variant="h6" component="span" fontWeight={500}>
              {title}
            </Typography>
          </Box>
          {!loading && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: "text.secondary",
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <DialogContentText>{content}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              borderRadius: theme.shape.borderRadius,
              fontWeight: 500,
              boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12)",
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onConfirm}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
            sx={{
              borderRadius: theme.shape.borderRadius,
              fontWeight: 500,
              boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12)",
            }}
          >
            {loading ? "Siliniyor..." : confirmButtonText}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default DeleteDialog;
