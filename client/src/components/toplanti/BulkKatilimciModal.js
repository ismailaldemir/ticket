import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Grid,
  Typography,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { getActiveKisiler } from "../../redux/kisi/kisiSlice";
import { addBulkToplantiKatilimci } from "../../redux/toplanti/toplantiSlice";

const BulkKatilimciModal = ({ open, onClose, toplanti_id }) => {
  const dispatch = useDispatch();
  const { kisiler, loading: kisiLoading } = useSelector((state) => state.kisi);
  const { loading: toplantiLoading } = useSelector((state) => state.toplanti);

  // Katılımcılar için state
  const [selected, setSelected] = useState([]);
  const [filteredKisiler, setFilteredKisiler] = useState([]);

  // Filtre için state
  const [searchTerm, setSearchTerm] = useState("");
  const [organizasyonFilter, setOrganizasyonFilter] = useState("");
  const [subeFilter, setSubeFilter] = useState("");
  const [rolFilter, setRolFilter] = useState("");

  // Varsayılan değerler için state
  const [defaultKatilimDurumu, setDefaultKatilimDurumu] = useState("Katıldı");
  const [defaultGorev, setDefaultGorev] = useState("Üye");

  // Bireysel değişiklikler için state
  const [individualSettings, setIndividualSettings] = useState({});

  // Sadece aktif kişileri göster
  const [onlyActive, setOnlyActive] = useState(true);

  // Kişileri yükle
  useEffect(() => {
    dispatch(getActiveKisiler());
  }, [dispatch]);

  // Filtreleme işlemi
  useEffect(() => {
    if (!kisiler || kisiler.length === 0) {
      setFilteredKisiler([]);
      return;
    }

    let filtered = [...kisiler];

    // Sadece aktif kişileri göster
    if (onlyActive) {
      filtered = filtered.filter((kisi) => kisi.isActive);
    }

    // Arama terimine göre filtrele
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (kisi) =>
          (kisi.ad + " " + kisi.soyad).toLowerCase().includes(searchLower) ||
          (kisi.email && kisi.email.toLowerCase().includes(searchLower))
      );
    }

    // Organizasyon filtresine göre filtrele
    if (organizasyonFilter) {
      filtered = filtered.filter(
        (kisi) =>
          kisi.organizasyon_id &&
          kisi.organizasyon_id._id === organizasyonFilter
      );
    }

    // Şube filtresine göre filtrele
    if (subeFilter) {
      filtered = filtered.filter(
        (kisi) => kisi.sube_id && kisi.sube_id._id === subeFilter
      );
    }

    // Rol filtresine göre filtrele
    if (rolFilter) {
      filtered = filtered.filter(
        (kisi) => kisi.uyeRol_id && kisi.uyeRol_id._id === rolFilter
      );
    }

    setFilteredKisiler(filtered);
  }, [
    kisiler,
    searchTerm,
    organizasyonFilter,
    subeFilter,
    rolFilter,
    onlyActive,
  ]);

  // Tüm katılımcıları seç/kaldır
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(filteredKisiler.map((kisi) => kisi._id));
    } else {
      setSelected([]);
    }
  };

  // Bir katılımcıyı seç/kaldır
  const handleSelect = (event, kisi_id) => {
    const selectedIndex = selected.indexOf(kisi_id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, kisi_id];
    } else {
      newSelected = selected.filter((id) => id !== kisi_id);
    }

    setSelected(newSelected);
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setSearchTerm("");
    setOrganizasyonFilter("");
    setSubeFilter("");
    setRolFilter("");
  };

  // Bireysel katılım durumu değiştirme
  const handleKatilimDurumuChange = (kisi_id, value) => {
    setIndividualSettings((prev) => ({
      ...prev,
      [kisi_id]: {
        ...prev[kisi_id],
        katilimDurumu: value,
      },
    }));
  };

  // Bireysel görev değiştirme
  const handleGorevChange = (kisi_id, value) => {
    setIndividualSettings((prev) => ({
      ...prev,
      [kisi_id]: {
        ...prev[kisi_id],
        gorev: value,
      },
    }));
  };

  // Katılımcıları ekleme
  const handleAddKatilimcilar = async () => {
    if (selected.length === 0) {
      return;
    }

    const katilimciData = selected.map((kisi_id) => {
      // Kişiye özel ayarlar varsa onları kullan, yoksa varsayılanları kullan
      const kisiAyarlar = individualSettings[kisi_id] || {};

      return {
        kisi_id,
        katilimDurumu: kisiAyarlar.katilimDurumu || defaultKatilimDurumu,
        gorev: kisiAyarlar.gorev || defaultGorev,
      };
    });

    try {
      await dispatch(
        addBulkToplantiKatilimci({
          toplanti_id,
          katilimcilar: katilimciData,
        })
      ).unwrap();

      // Başarılı işlem sonrası modalı kapat
      onClose();
    } catch (error) {
      console.error("Katılımcılar eklenirken hata:", error);
    }
  };

  // Benzersiz organizasyon, şube ve rol listelerini oluştur
  const organizasyonlar = [
    ...new Set(
      kisiler
        .filter((kisi) => kisi.organizasyon_id)
        .map((kisi) =>
          JSON.stringify({
            id: kisi.organizasyon_id._id,
            ad: kisi.organizasyon_id.ad,
          })
        )
    ),
  ].map((str) => JSON.parse(str));

  const subeler = [
    ...new Set(
      kisiler
        .filter((kisi) => kisi.sube_id)
        .map((kisi) =>
          JSON.stringify({
            id: kisi.sube_id._id,
            ad: kisi.sube_id.ad,
          })
        )
    ),
  ].map((str) => JSON.parse(str));

  const roller = [
    ...new Set(
      kisiler
        .filter((kisi) => kisi.uyeRol_id)
        .map((kisi) =>
          JSON.stringify({
            id: kisi.uyeRol_id._id,
            ad: kisi.uyeRol_id.ad,
          })
        )
    ),
  ].map((str) => JSON.parse(str));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: "90vh", display: "flex", flexDirection: "column" },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Toplu Katılımcı Ekle</Typography>
          <Chip
            icon={<GroupAddIcon />}
            label={`${selected.length} kişi seçildi`}
            color="primary"
            variant={selected.length > 0 ? "filled" : "outlined"}
          />
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        {/* Filtreler ve Arama */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Arama */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Ara"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: <SearchIcon fontSize="small" color="action" />,
                }}
                placeholder="Ad, soyad veya email ile ara..."
              />
            </Grid>

            {/* Organizasyon Filtresi */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Organizasyon</InputLabel>
                <Select
                  value={organizasyonFilter}
                  onChange={(e) => setOrganizasyonFilter(e.target.value)}
                  label="Organizasyon"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {organizasyonlar.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.ad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Şube Filtresi */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Şube</InputLabel>
                <Select
                  value={subeFilter}
                  onChange={(e) => setSubeFilter(e.target.value)}
                  label="Şube"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {subeler.map((sube) => (
                    <MenuItem key={sube.id} value={sube.id}>
                      {sube.ad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Rol Filtresi */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Üye Rolü</InputLabel>
                <Select
                  value={rolFilter}
                  onChange={(e) => setRolFilter(e.target.value)}
                  label="Üye Rolü"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {roller.map((rol) => (
                    <MenuItem key={rol.id} value={rol.id}>
                      {rol.ad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Filtre Temizleme */}
            <Grid item xs={12} sm={6} md={2}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ClearAllIcon />}
                  onClick={clearFilters}
                  size="small"
                  fullWidth
                >
                  Temizle
                </Button>
              </Box>
            </Grid>

            {/* Sadece Aktif Kişiler */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={onlyActive}
                    onChange={(e) => setOnlyActive(e.target.checked)}
                    color="primary"
                  />
                }
                label="Sadece aktif kişileri göster"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Varsayılan Ayarlar */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Varsayılan Ayarlar
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Katılım Durumu</InputLabel>
                <Select
                  value={defaultKatilimDurumu}
                  onChange={(e) => setDefaultKatilimDurumu(e.target.value)}
                  label="Katılım Durumu"
                >
                  <MenuItem value="Katıldı">Katıldı</MenuItem>
                  <MenuItem value="Katılmadı">Katılmadı</MenuItem>
                  <MenuItem value="Mazeretli">Mazeretli</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Görev</InputLabel>
                <Select
                  value={defaultGorev}
                  onChange={(e) => setDefaultGorev(e.target.value)}
                  label="Görev"
                >
                  <MenuItem value="Başkan">Başkan</MenuItem>
                  <MenuItem value="Sekreter">Sekreter</MenuItem>
                  <MenuItem value="Üye">Üye</MenuItem>
                  <MenuItem value="Gözlemci">Gözlemci</MenuItem>
                  <MenuItem value="Davetli">Davetli</MenuItem>
                  <MenuItem value="Diğer">Diğer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Kişi Listesi */}
        <Paper sx={{ flexGrow: 1, overflow: "auto" }}>
          {kisiLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : filteredKisiler.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Alert severity="info">
                Arama kriterlerine uygun kişi bulunamadı.
              </Alert>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: "100%" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={
                          selected.length > 0 &&
                          selected.length < filteredKisiler.length
                        }
                        checked={
                          filteredKisiler.length > 0 &&
                          selected.length === filteredKisiler.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Ad Soyad</TableCell>
                    <TableCell>Organizasyon</TableCell>
                    <TableCell>Şube</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Katılım Durumu</TableCell>
                    <TableCell>Görev</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredKisiler.map((kisi) => {
                    const isSelected = selected.includes(kisi._id);
                    const kisiAyarlar = individualSettings[kisi._id] || {};

                    return (
                      <TableRow
                        hover
                        key={kisi._id}
                        selected={isSelected}
                        onClick={(event) => handleSelect(event, kisi._id)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={(event) => handleSelect(event, kisi._id)}
                          />
                        </TableCell>
                        <TableCell>
                          {kisi.ad} {kisi.soyad}
                          {!kisi.isActive && (
                            <Chip
                              label="Pasif"
                              color="error"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>{kisi.organizasyon_id?.ad || "-"}</TableCell>
                        <TableCell>{kisi.sube_id?.ad || "-"}</TableCell>
                        <TableCell>{kisi.uyeRol_id?.ad || "-"}</TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={
                                kisiAyarlar.katilimDurumu ||
                                defaultKatilimDurumu
                              }
                              onChange={(e) => {
                                handleKatilimDurumuChange(
                                  kisi._id,
                                  e.target.value
                                );
                                e.stopPropagation();
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MenuItem value="Katıldı">Katıldı</MenuItem>
                              <MenuItem value="Katılmadı">Katılmadı</MenuItem>
                              <MenuItem value="Mazeretli">Mazeretli</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={kisiAyarlar.gorev || defaultGorev}
                              onChange={(e) => {
                                handleGorevChange(kisi._id, e.target.value);
                                e.stopPropagation();
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MenuItem value="Başkan">Başkan</MenuItem>
                              <MenuItem value="Sekreter">Sekreter</MenuItem>
                              <MenuItem value="Üye">Üye</MenuItem>
                              <MenuItem value="Gözlemci">Gözlemci</MenuItem>
                              <MenuItem value="Davetli">Davetli</MenuItem>
                              <MenuItem value="Diğer">Diğer</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Toplam {filteredKisiler.length} kişi listeleniyor, {selected.length}{" "}
            kişi seçildi
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button onClick={onClose} color="inherit">
            İptal
          </Button>
          <Button
            onClick={handleAddKatilimcilar}
            color="primary"
            variant="contained"
            disabled={selected.length === 0 || toplantiLoading}
            startIcon={
              toplantiLoading ? (
                <CircularProgress size={24} />
              ) : (
                <PersonAddIcon />
              )
            }
          >
            {toplantiLoading
              ? "Ekleniyor..."
              : `${selected.length} Kişiyi Ekle`}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default BulkKatilimciModal;
