import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import {
  getRandevuTanimlari,
  deleteRandevuTanimi,
  getActiveRandevuTanimlari,
} from "../../redux/randevuTanimi/randevuTanimiSlice";
import LoadingBox from "../../components/LoadingBox";
import { hasPermission } from "../../utils/rbacUtils";
import DeleteDialog from "../../components/common/DeleteDialog";
import Logger from "../../utils/logger";

const RandevuTanimlarList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Güvenli bir şekilde state'e erişim - varsayılan değerler atıyoruz
  const randevuTanimiState = useSelector((state) => state.randevuTanimi) || {};
  const {
    randevuTanimlari = [],
    activeRandevuTanimlari = [],
    loading = false,
  } = randevuTanimiState;
  const { user } = useSelector((state) => state.auth);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tanimToDelete, setTanimToDelete] = useState(null);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [localTanimlar, setLocalTanimlar] = useState([]);

  // Ref ile tekrar deneme sayısını takip et
  const retryAttempt = useRef(false);
  const maxRetries = useRef(3);
  const currentRetry = useRef(0);

  const loadData = async () => {
    try {
      Logger.info("Randevu tanımları listesi manuel yükleniyor...");

      // Hem normal hem de aktif tanımları yükle
      const [normalResult, activeResult] = await Promise.all([
        dispatch(getRandevuTanimlari({ forceRefetch: true })).unwrap(),
        dispatch(getActiveRandevuTanimlari()).unwrap(),
      ]);

      // Elle state'i güncellemek için local state kullanıyoruz
      if (
        normalResult &&
        Array.isArray(normalResult) &&
        normalResult.length > 0
      ) {
        Logger.info(`${normalResult.length} randevu tanımı yüklendi`);
        setLocalTanimlar(normalResult);
      } else if (
        activeResult &&
        Array.isArray(activeResult) &&
        activeResult.length > 0
      ) {
        Logger.info(`${activeResult.length} aktif randevu tanımı yüklendi`);
        setLocalTanimlar(activeResult);
      }

      setContentLoaded(true);
    } catch (error) {
      Logger.error("Randevu tanımları yüklenirken hata:", error);
    }
  };

  // Bileşen yüklendiğinde çalışacak
  useEffect(() => {
    Logger.info("Randevu tanımları listesi yükleniyor...");
    loadData();
  }, []);

  // Redux state değiştiğinde kontrol et
  useEffect(() => {
    // Redux store'da veri varsa local state'e aktar
    if (randevuTanimlari && randevuTanimlari.length > 0) {
      Logger.info(`Redux'tan ${randevuTanimlari.length} randevu tanımı alındı`);
      setLocalTanimlar(randevuTanimlari);
      setContentLoaded(true);
      return;
    }

    // Aktif tanımlarda veri varsa local state'e aktar
    if (activeRandevuTanimlari && activeRandevuTanimlari.length > 0) {
      Logger.info(
        `Redux'tan ${activeRandevuTanimlari.length} aktif randevu tanımı alındı`
      );
      setLocalTanimlar(activeRandevuTanimlari);
      setContentLoaded(true);
      return;
    }

    // Veri yoksa ve yükleme tamamlandıysa otomatik tekrar deneme mekanizması
    if (
      !loading &&
      currentRetry.current < maxRetries.current &&
      !retryAttempt.current
    ) {
      Logger.warn(
        `Veriler yüklendi ancak Redux store boş, ${
          currentRetry.current + 1
        }. deneme yapılıyor`
      );
      retryAttempt.current = true;
      currentRetry.current += 1;

      // Kısa bir beklemeden sonra tekrar yükle
      setTimeout(() => {
        loadData();
        retryAttempt.current = false;
      }, 800);
    }
  }, [loading, randevuTanimlari, activeRandevuTanimlari]);

  const handleDeleteClick = (tanim) => {
    setTanimToDelete(tanim);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!hasPermission(user, "randevular_silme")) {
      toast.error("Bu işlem için yetkiniz bulunmamaktadır.");
      setDeleteDialogOpen(false);
      setTanimToDelete(null);
      return;
    }

    try {
      await dispatch(deleteRandevuTanimi(tanimToDelete._id)).unwrap();
      toast.success("Randevu tanımı başarıyla silindi");
    } catch (error) {
      toast.error(error?.msg || "Randevu tanımı silinirken bir hata oluştu");
    }

    setDeleteDialogOpen(false);
    setTanimToDelete(null);
  };

  const handleRefresh = () => {
    retryAttempt.current = false;
    currentRetry.current = 0;
    loadData();
  };

  if (loading && !contentLoaded) {
    return <LoadingBox />;
  }

  // Gösterilecek tanımları belirle - Redux'tan gelen veya local state
  const displayTanimlar =
    randevuTanimlari.length > 0
      ? randevuTanimlari
      : activeRandevuTanimlari.length > 0
      ? activeRandevuTanimlari
      : localTanimlar;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h1">
          Randevu Tanımları{" "}
          {displayTanimlar.length > 0 && `(${displayTanimlar.length})`}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/randevu/tanim/ekle")}
          >
            Yeni Tanım
          </Button>
          <Tooltip title="Listeyi Yenile">
            <IconButton color="primary" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Fade in={contentLoaded} timeout={500}>
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tanım Adı</TableCell>
                  <TableCell>Günler</TableCell>
                  <TableCell>Saatler</TableCell>
                  <TableCell>Slot Süresi</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayTanimlar.length > 0 ? (
                  displayTanimlar.map((tanim) => (
                    <TableRow key={tanim._id}>
                      <TableCell>{tanim.ad}</TableCell>
                      <TableCell>
                        {tanim.gunler &&
                          tanim.gunler.map((gun) => {
                            const gunler = [
                              "Pazar",
                              "Pazartesi",
                              "Salı",
                              "Çarşamba",
                              "Perşembe",
                              "Cuma",
                              "Cumartesi",
                            ];
                            return gun !== tanim.gunler[tanim.gunler.length - 1]
                              ? `${gunler[gun]}, `
                              : gunler[gun];
                          })}
                      </TableCell>
                      <TableCell>
                        {tanim.baslangicSaati} - {tanim.bitisSaati}
                      </TableCell>
                      <TableCell>{tanim.slotSuresiDk} dakika</TableCell>
                      <TableCell>
                        {tanim.isActive ? "Aktif" : "Pasif"}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex" }}>
                          <Tooltip title="Düzenle">
                            <IconButton
                              color="primary"
                              onClick={() =>
                                navigate(`/randevu/tanim/duzenle/${tanim._id}`)
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(tanim)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Randevu tanımı bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Fade>

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Randevu Tanımını Sil"
        content={
          tanimToDelete &&
          `"${tanimToDelete.ad}" tanımını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
        }
      />
    </Box>
  );
};

export default RandevuTanimlarList;
