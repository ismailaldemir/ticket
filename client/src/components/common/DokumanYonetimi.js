import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
  Button,
  Tooltip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const DokumanYonetimi = ({ onUpload, dokumanlar, onDelete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedDokumanlar, setSelectedDokumanlar] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dokumanToDelete, setDokumanToDelete] = useState(null);
  const [dokumanlarState, setDokumanlar] = useState(dokumanlar);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      progress: 0,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*,application/pdf",
    maxFiles: 10,
  });

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      selectedFiles.forEach((fileObj) => {
        formData.append("dokumanlar", fileObj.file);
      });

      const response = await onUpload(formData);
      toast.success("Dosyalar başarıyla yüklendi");
      setSelectedFiles([]);
      setDokumanlar(response.data); // Listeyi güncelle
    } catch (error) {
      toast.error("Yükleme sırasında bir hata oluştu");
    }
  };

  const handleDeleteClick = (dokuman) => {
    setDokumanToDelete(dokuman);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (dokumanToDelete) {
      onDelete(dokumanToDelete.id || dokumanToDelete._id);
      setDokumanToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handlePreview = (dokuman) => {
    if (
      dokuman.dosyaYolu &&
      (dokuman.dosyaYolu.startsWith("http") ||
        dokuman.dosyaYolu.startsWith("/"))
    ) {
      const url = dokuman.dosyaYolu.startsWith("/")
        ? `${window.location.origin}${dokuman.dosyaYolu}`
        : dokuman.dosyaYolu;
      window.open(url, "_blank");
    } else {
      toast.error("Önizleme için geçerli bir URL bulunamadı.");
    }
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 2,
          border: "2px dashed",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6">
          Dosya Yüklemek İçin Tıklayın veya Sürükleyin
        </Typography>
      </Paper>

      {selectedFiles.length > 0 && (
        <Box>
          <List>
            {selectedFiles.map((fileObj, index) => (
              <ListItem key={index}>
                <ListItemText primary={fileObj.file.name} />
                <LinearProgress variant="determinate" value={0} />
              </ListItem>
            ))}
          </List>
          <Button variant="contained" onClick={handleUpload}>
            Yükle
          </Button>
        </Box>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Checkbox
                onChange={(e) =>
                  setSelectedDokumanlar(
                    e.target.checked ? dokumanlarState.map((d) => d.id) : []
                  )
                }
              />
            </TableCell>
            <TableCell>Ad</TableCell>
            <TableCell>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dokumanlarState.map((dokuman) => (
            <TableRow key={dokuman.id || dokuman._id}>
              <TableCell>
                <Checkbox
                  checked={selectedDokumanlar.includes(dokuman.id)}
                  onChange={(e) =>
                    setSelectedDokumanlar((prev) =>
                      e.target.checked
                        ? [...prev, dokuman.id]
                        : prev.filter((id) => id !== dokuman.id)
                    )
                  }
                />
              </TableCell>
              <TableCell>
                {dokuman.ad || dokuman.orijinalDosyaAdi || "Bilinmeyen Doküman"}
              </TableCell>
              <TableCell>
                <Tooltip title="Önizle">
                  <IconButton onClick={() => handlePreview(dokuman)}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sil">
                  <IconButton onClick={() => handleDeleteClick(dokuman)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Doküman Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dokumanToDelete
              ? `"${dokumanToDelete.orijinalDosyaAdi}" dokümanını silmek istediğinize emin misiniz?`
              : "Bu dokümanı silmek istediğinize emin misiniz?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            İptal
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DokumanYonetimi;
