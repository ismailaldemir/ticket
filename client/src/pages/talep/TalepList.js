import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Button,
  Typography,
  IconButton,
  TablePagination,
  alpha,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Fade,
  Grow,
  Skeleton,
  Tooltip,
  Checkbox,
  Toolbar,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import notificationService from "../../services/notificationService";
// Redux slice ve diğer yardımcılar ileride eklenecek

const TalepList = () => {
  const dispatch = useDispatch();
  // const { talepler, loading } = useSelector((state) => state.talep);
  // const { user } = useSelector((state) => state.auth);

  // Sıralama, filtreleme, toplu işlem, dışa aktar için state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState({
    kaynak: "all",
    proje: "all",
    sube: "all",
    oncelik: "all",
    durum: "all",
    arama: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    // dispatch(getTalepler());
  }, [dispatch]);

  // Filtrelenmiş talepler
  // const filteredTalepler = talepler.filter(...);

  // ...List ve tablo render kodu, Roller ile aynı yapıda olacak...

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="h1">Talep Yönetimi</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            component={Link}
            to="/talepler/yeni"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Yeni Talep
          </Button>
          <Button variant="outlined" color="primary" startIcon={<FileDownloadIcon />} onClick={() => setExportModalOpen(true)}>
            Dışa Aktar
          </Button>
          <Tooltip title="Filtreler">
            <IconButton color="primary" onClick={() => setShowFilters(!showFilters)}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Listeyi Yenile">
            <IconButton color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {/* Filtreler, tablo, toplu işlem, dışa aktar, pagination vs. Roller ile aynı yapıda olacak */}
      <Typography variant="body2" color="text.secondary">Toplam X talep bulundu</Typography>
    </Box>
  );
};

export default TalepList;
