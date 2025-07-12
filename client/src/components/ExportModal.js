import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  FormControlLabel,
  Checkbox,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Paper,
  Divider,
  Radio,
  RadioGroup,
} from "@mui/material";
import {
  GetApp as GetAppIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";

// Excel oluşturma için
import * as XLSX from "xlsx";
// CSV oluşturma için
import { saveAs } from "file-saver";
import Papa from "papaparse";

const ExportModal = ({
  open,
  onClose,
  data = [],
  availableColumns = [],
  entityName = "Kayıtlar",
}) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [fileFormat, setFileFormat] = useState("excel");

  useEffect(() => {
    // Pencere açıldığında varsayılan olarak tüm sütunları seç
    if (open && availableColumns.length > 0) {
      setSelectedColumns(availableColumns);
    }
  }, [open, availableColumns]);

  const handleColumnToggle = (column) => {
    // Seçili sütunlarda zaten varsa kaldır, yoksa ekle
    const columnIndex = selectedColumns.findIndex((c) => c.id === column.id);
    const newSelectedColumns = [...selectedColumns];

    if (columnIndex === -1) {
      // Ekleme durumu
      newSelectedColumns.push(column);
    } else {
      // Çıkarma durumu
      newSelectedColumns.splice(columnIndex, 1);
    }

    setSelectedColumns(newSelectedColumns);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newColumns = [...selectedColumns];
      const temp = newColumns[index];
      newColumns[index] = newColumns[index - 1];
      newColumns[index - 1] = temp;
      setSelectedColumns(newColumns);
    }
  };

  const handleMoveDown = (index) => {
    if (index < selectedColumns.length - 1) {
      const newColumns = [...selectedColumns];
      const temp = newColumns[index];
      newColumns[index] = newColumns[index + 1];
      newColumns[index + 1] = temp;
      setSelectedColumns(newColumns);
    }
  };

  const handleExport = () => {
    if (data.length === 0 || selectedColumns.length === 0) {
      alert("Dışa aktarılacak veri veya seçili sütun bulunamadı.");
      return;
    }

    // Seçili sütunlara göre veriyi hazırla
    const exportData = data.map((item) => {
      const row = {};
      selectedColumns.forEach((column) => {
        row[column.header] = column.accessor(item);
      });
      return row;
    });

    if (fileFormat === "excel") {
      exportToExcel(exportData);
    } else if (fileFormat === "csv") {
      exportToCSV(exportData);
    }

    onClose();
  };

  const exportToExcel = (exportData) => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Veri");

    // Exceli tarayıcıda indir
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    const fileName = `${entityName.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    saveAs(data, fileName);
  };

  const exportToCSV = (exportData) => {
    const csvContent = Papa.unparse(exportData);
    const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = `${entityName.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    saveAs(csvBlob, fileName);
  };

  const isColumnSelected = (columnId) => {
    return selectedColumns.some((col) => col.id === columnId);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Dışa Aktar: {entityName}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Sütunları Seç" />
          <Tab label="Dosya Formatı" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Dışa aktarmak istediğiniz sütunları seçin ve sıralayın.
            </Typography>
            <Typography variant="caption" color="text.secondary" paragraph>
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
                        <Typography variant="body2">{column.header}</Typography>
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
                    !selectedColumns.some((selected) => selected.id === col.id)
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
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", flex: 1 }}
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
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleColumnToggle(column)}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
            </Box>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Dosya formatını seçin
            </Typography>

            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <RadioGroup
                value={fileFormat}
                onChange={(e) => setFileFormat(e.target.value)}
              >
                <FormControlLabel
                  value="excel"
                  control={<Radio />}
                  label="Excel (.xlsx)"
                />
                <FormControlLabel
                  value="csv"
                  control={<Radio />}
                  label="CSV (.csv)"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          İptal
        </Button>
        <Button
          onClick={handleExport}
          color="primary"
          variant="contained"
          startIcon={<GetAppIcon />}
          disabled={selectedColumns.length === 0}
        >
          Dışa Aktar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportModal;
