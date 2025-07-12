import React, { useCallback, useState, useRef } from "react";
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
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const DokumanYonetimi = ({ onUpload, progress = 0, uploading = false }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    // Dosya boyutu kontrolü
    const oversizedFiles = acceptedFiles.filter(
      (file) => file.size > 5 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      toast.error("5MB'dan büyük dosyalar yüklenemez");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const handleRemoveFile = (index) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    multiple: true,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.warning("Lütfen dosya seçin");
      return;
    }

    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]); // Başarılı yüklemeden sonra listeyi temizle
    } catch (error) {
      toast.error("Dosya yükleme sırasında bir hata oluştu");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 2,
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "grey.300",
          backgroundColor: isDragActive ? "action.hover" : "background.paper",
          cursor: "pointer",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "action.hover",
          },
        }}
      >
        <input {...getInputProps()} />
        <Box sx={{ textAlign: "center" }}>
          <CloudUploadIcon
            sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
          />
          <Typography variant="h6" gutterBottom>
            {isDragActive
              ? "Dosyaları Buraya Bırakın"
              : "Dosya Yüklemek İçin Tıklayın veya Sürükleyin"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Desteklenen Formatlar: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max:
            5MB)
          </Typography>
        </Box>
      </Paper>

      {selectedFiles.length > 0 && (
        <>
          <List>
            {selectedFiles.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <DescriptionIcon sx={{ mr: 2 }} />
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                />
              </ListItem>
            ))}
          </List>

          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={uploading}
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2 }}
          >
            {uploading ? "Yükleniyor..." : "Seçilen Dosyaları Yükle"}
          </Button>
        </>
      )}

      {uploading && (
        <Box sx={{ width: "100%", mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
            {progress}% Yüklendi
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DokumanYonetimi;
