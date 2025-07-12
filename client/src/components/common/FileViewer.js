import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const FileViewer = ({ open, onClose, file }) => {
  if (!file) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {file.orijinalDosyaAdi}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {file.mimeTur.startsWith("image/") ? (
          <img
            src={`/${file.dosyaYolu}`}
            alt={file.orijinalDosyaAdi}
            style={{ width: "100%", height: "auto" }}
          />
        ) : (
          <iframe
            src={`/${file.dosyaYolu}`}
            width="100%"
            height="600px"
            title={file.orijinalDosyaAdi}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileViewer;
