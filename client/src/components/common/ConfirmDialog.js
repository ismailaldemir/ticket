import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import {
  HelpOutline as HelpIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

/**
 * Genel kullanım için onay diyaloğu bileşeni
 *
 * @param {Object} props
 * @param {boolean} props.open - Diyaloğun açık olup olmadığı
 * @param {Function} props.onClose - Diyaloğu kapatma fonksiyonu
 * @param {Function} props.onConfirm - Onaylama fonksiyonu
 * @param {string} props.title - Diyalog başlığı
 * @param {string} props.content - Diyalog içeriği
 * @param {string} props.confirmButtonText - Onay butonu metni
 * @param {string} props.cancelButtonText - İptal butonu metni
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "İşlem Onayı",
  content = "Bu işlemi gerçekleştirmek istediğinize emin misiniz?",
  confirmButtonText = "Onayla",
  cancelButtonText = "İptal",
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="confirm-dialog-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <HelpIcon color="primary" />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <IconButton aria-label="close" onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          {cancelButtonText}
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
