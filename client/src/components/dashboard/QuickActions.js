import React from "react";
import {
  Grid,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { Settings as SettingsIcon } from "@mui/icons-material";
import QuickActionItem from "./QuickActionItem";
import { getUserQuickActions } from "../../redux/quickAction/quickActionSlice";
import { hasPermission } from "../../utils/rbacUtils"; // hasPermission fonksiyonunu import ediyoruz

const QuickActions = ({ onOpenSettings }) => {
  const dispatch = useDispatch();
  const { userActions, loading, error } = useSelector(
    (state) => state.quickAction
  );
  const { user } = useSelector((state) => state.auth);

  // Component mount olduğunda hızlı işlemleri yükle
  React.useEffect(() => {
    dispatch(getUserQuickActions());
  }, [dispatch]);

  if (loading && userActions.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && userActions.length === 0) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Hızlı İşlemler</Typography>
        <Button
          startIcon={<SettingsIcon />}
          size="small"
          onClick={onOpenSettings}
          variant="outlined"
        >
          Düzenle
        </Button>
      </Box>

      <Grid container spacing={3}>
        {userActions.map((action) =>
          // İlgili izne sahip değilse bileşeni gösterme
          action.permission &&
          !hasPermission(user, action.permission) ? null : (
            <Grid item xs={6} sm={4} md={3} lg={2} key={action.id}>
              <QuickActionItem action={action} />
            </Grid>
          )
        )}

        {userActions.filter(
          (action) =>
            !action.permission || hasPermission(user, action.permission)
        ).length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              Görüntülenecek hızlı işlem bulunamadı. Düzenle butonunu kullanarak
              yeni işlemler ekleyebilirsiniz.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default QuickActions;
