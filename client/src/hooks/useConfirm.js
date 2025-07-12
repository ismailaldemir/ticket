import { useState, useCallback } from "react";

/**
 * Onay diyaloğu hook'u
 * @returns {Object} - Onay diyaloğu durumu ve fonksiyonları
 */
export const useConfirm = () => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmAction: null,
    cancelAction: null,
  });

  const openConfirmDialog = useCallback(
    ({ title, message, confirmAction, cancelAction }) => {
      setDialogState({
        isOpen: true,
        title: title || "Onaylama",
        message:
          message || "Bu işlemi gerçekleştirmek istediğinize emin misiniz?",
        confirmAction: confirmAction || (() => {}),
        cancelAction: cancelAction || (() => {}),
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (dialogState.confirmAction) {
      dialogState.confirmAction();
    }
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, [dialogState]);

  const handleCancel = useCallback(() => {
    if (dialogState.cancelAction) {
      dialogState.cancelAction();
    }
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, [dialogState]);

  const closeConfirmDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    confirmDialog: dialogState,
    openConfirmDialog,
    closeConfirmDialog,
    handleConfirm,
    handleCancel,
  };
};

export default useConfirm;
