import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
  Fade,
  useTheme,
  alpha,
  IconButton,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const DeleteDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Kaydı Sil",
  content,
  loading = false,
  confirmButtonText = "Sil",
  cancelButtonText = "İptal",
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={250}
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 1.5,
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
                transition: "color 0.2s",
                "&:hover": {
                  color: "error.main",
                },
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2.5 }}>
          <DialogContentText
            id="delete-dialog-description"
            sx={{ color: "text.primary", my: 0 }}
          >
            {content}
          </DialogContentText>
        </DialogContent>

        <DialogActions
          sx={{ px: 3, pb: 3, pt: 1, justifyContent: "flex-end", gap: 1 }}
        >
          <Button
            onClick={onClose}
            color="inherit"
            disabled={loading}
            variant="outlined"
            sx={{
              borderRadius: theme.shape.borderRadius,
              fontWeight: 500,
            }}
          >
            {cancelButtonText}
          </Button>
          <Button
            onClick={onConfirm}
            color="error"
            disabled={loading}
            variant="contained"
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
