import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  IconButton,
  Divider,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Grid,
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
} from "@mui/icons-material";
import { exportToExcel, exportToPdf } from "../../utils/exportService";

const ExportModal = ({ open, onClose, data, availableColumns, entityName }) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState("excel");
  const [fileName, setFileName] = useState(
    `${entityName}_${new Date().toISOString().split("T")[0]}`
  );

  useEffect(() => {
    // Varsayılan olarak tüm sütunları seç
    setSelectedColumns([...availableColumns]);
  }, [availableColumns]);

  const handleSelectAllColumns = () => {
    setSelectedColumns([...availableColumns]);
  };

  const handleUnselectAllColumns = () => {
    setSelectedColumns([]);
  };

  const handleColumnToggle = (column) => {
    const columnExists = selectedColumns.some((col) => col.id === column.id);

    if (columnExists) {
      setSelectedColumns(selectedColumns.filter((col) => col.id !== column.id));
    } else {
      setSelectedColumns([...selectedColumns, column]);
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newColumns = [...selectedColumns];
    [newColumns[index - 1], newColumns[index]] = [
      newColumns[index],
      newColumns[index - 1],
    ];
    setSelectedColumns(newColumns);
  };

  const handleMoveDown = (index) => {
    if (index === selectedColumns.length - 1) return;
    const newColumns = [...selectedColumns];
    [newColumns[index], newColumns[index + 1]] = [
      newColumns[index + 1],
      newColumns[index],
    ];
    setSelectedColumns(newColumns);
  };

  const handleExport = () => {
    if (selectedColumns.length === 0) {
      alert("Lütfen en az bir sütun seçin!");
      return;
    }

    try {
      if (selectedFormat === "excel") {
        exportToExcel(data, selectedColumns, fileName);
      } else {
        exportToPdf(data, selectedColumns, fileName, `${entityName} Listesi`);
      }
      onClose();
    } catch (error) {
      console.error("Dışa aktarma hatası:", error);
      alert("Dışa aktarma sırasında bir hata oluştu!");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          padding: 1,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FileDownloadIcon color="primary" />
          <Typography variant="h6">
            {entityName} Listesini Dışa Aktar
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Dışa Aktarma Seçenekleri
              </Typography>
              <Divider sx={{ my: 1 }} />

              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Dosya Formatı
                </Typography>
                <RadioGroup
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                >
                  <FormControlLabel
                    value="excel"
                    control={<Radio size="small" />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <ExcelIcon fontSize="small" color="success" />
                        <Typography variant="body2">Excel (.xlsx)</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="pdf"
                    control={<Radio size="small" />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PdfIcon fontSize="small" color="error" />
                        <Typography variant="body2">PDF (.pdf)</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                fullWidth
                label="Dosya Adı"
                variant="outlined"
                size="small"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                margin="normal"
              />

              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  onClick={handleSelectAllColumns}
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Tüm Sütunları Seç
                </Button>
                <Button
                  size="small"
                  onClick={handleUnselectAllColumns}
                  variant="outlined"
                  color="secondary"
                  fullWidth
                >
                  Seçimleri Temizle
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Paper sx={{ p: 2, height: "400px", overflow: "auto" }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Sütun Düzenleme
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Ok tuşlarını kullanarak sütunların sırasını değiştirebilirsiniz.
              </Typography>
              <Divider sx={{ my: 1 }} />

              <Box sx={{ mt: 2 }}>
                {selectedColumns.map((column, index) => (
                  <Paper
                    key={column.id}
                    elevation={1}
                    sx={{
                      mb: 1,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "background.paper",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={true}
                            onChange={() => handleColumnToggle(column)}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2">
                            {column.header}
                          </Typography>
                        }
                      />
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === selectedColumns.length - 1}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleColumnToggle(column)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}

                {availableColumns
                  .filter(
                    (col) =>
                      !selectedColumns.some(
                        (selected) => selected.id === col.id
                      )
                  )
                  .map((column) => (
                    <Paper
                      key={`unselected-${column.id}`}
                      elevation={1}
                      sx={{
                        mb: 1,
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "background.default",
                        opacity: 0.6,
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={false}
                            onChange={() => handleColumnToggle(column)}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2" color="text.secondary">
                            {column.header}
                          </Typography>
                        }
                      />
                    </Paper>
                  ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button onClick={onClose} variant="outlined" color="secondary">
          İptal
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          color="primary"
          startIcon={selectedFormat === "excel" ? <ExcelIcon /> : <PdfIcon />}
        >
          {selectedFormat === "excel" ? "Excel'e Aktar" : "PDF'e Aktar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportModal;
