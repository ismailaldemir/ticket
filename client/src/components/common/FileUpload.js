import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Card,
  CardMedia,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const FileUpload = ({ onUpload, maxFiles = 10, allowedTypes }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Bileşen unmount olduğunda önizleme URL'lerini temizle
  React.useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, [previews]);

  const handleFileSelect = useCallback(
    (event) => {
      const files = Array.from(event.target.files);

      // Dosya limiti kontrolü
      if (files.length > maxFiles) {
        toast.error(`En fazla ${maxFiles} dosya seçebilirsiniz`);
        return;
      }

      // Dosya türü kontrolü
      const validFiles = files.filter((file) => {
        if (!allowedTypes || allowedTypes.length === 0) return true;

        const isValid = allowedTypes.includes(file.type);
        if (!isValid) {
          toast.error(`Geçersiz dosya tipi: ${file.name}`);
        }
        return isValid;
      });

      setSelectedFiles(validFiles);
      setDescriptions(new Array(validFiles.length).fill(""));
      setError(null);

      // Önizlemeleri oluştur
      const newPreviews = validFiles.map((file) => {
        if (file.type.startsWith("image/")) {
          return URL.createObjectURL(file);
        }
        return null;
      });

      // Önceki önizleme URL'lerini temizle
      previews.forEach((preview) => {
        if (preview) URL.revokeObjectURL(preview);
      });

      setPreviews(newPreviews);
    },
    [allowedTypes, maxFiles, previews]
  );

  const handleDescriptionChange = (index, value) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = value;
    setDescriptions(newDescriptions);
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    const newDescriptions = [...descriptions];

    // Önizleme URL'sini temizle
    if (newPreviews[index]) {
      URL.revokeObjectURL(newPreviews[index]);
    }

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    newDescriptions.splice(index, 1);

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    setDescriptions(newDescriptions);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Lütfen dosya seçin");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await onUpload(selectedFiles, descriptions);
      // Başarılı yükleme sonrası temizlik
      setSelectedFiles([]);
      setPreviews([]);
      setDescriptions([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Dosya yükleme hatası:", err);
      setError(err.msg || "Dosya yükleme sırasında bir hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  // Dosya boyutunu formatlama yardımcı fonksiyonu
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  return (
    <Box>
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        accept={allowedTypes?.join(",")}
        style={{ display: "none" }}
        ref={fileInputRef}
      />

      <Button
        variant="contained"
        startIcon={<UploadIcon />}
        onClick={() => fileInputRef.current.click()}
        sx={{ mb: 2 }}
        disabled={uploading}
      >
        Dosya Seç
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {selectedFiles.length > 0 && (
        <Grid container spacing={2}>
          {selectedFiles.map((file, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ p: 2, position: "relative" }}>
                {previews[index] ? (
                  <CardMedia
                    component="img"
                    image={previews[index]}
                    alt={file.name}
                    sx={{ height: 140, objectFit: "contain" }}
                  />
                ) : (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="body2">{file.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatFileSize(file.size)}
                    </Typography>
                  </Box>
                )}

                <TextField
                  fullWidth
                  size="small"
                  label="Açıklama"
                  value={descriptions[index]}
                  onChange={(e) =>
                    handleDescriptionChange(index, e.target.value)
                  }
                  sx={{ mt: 1 }}
                />

                <IconButton
                  size="small"
                  onClick={() => handleRemoveFile(index)}
                  sx={{ position: "absolute", top: 8, right: 8 }}
                  disabled={uploading}
                >
                  <CloseIcon />
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedFiles.length > 0 && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          sx={{ mt: 2 }}
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : null}
        >
          {uploading
            ? "Yükleniyor..."
            : `Dosyaları Yükle (${selectedFiles.length})`}
        </Button>
      )}
    </Box>
  );
};

export default FileUpload;
