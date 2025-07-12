import React from "react";
import { useSelector } from "react-redux";
import { Button, Tooltip } from "@mui/material";
import { hasPermission } from "../../utils/rbacUtils";

/**
 * Yetkiye bağlı olarak gösterilen veya gizlenen buton bileşeni
 * @param {Object} props - Buton özellikleri
 * @returns {JSX.Element|null} - Yetkiye bağlı olarak buton veya null
 */
const PermissionButton = ({
  yetkiKodu,
  children,
  disabled = false,
  tooltip = "Bu işlem için yetkiniz bulunmuyor",
  showDisabled = false,
  ...buttonProps
}) => {
  const { user } = useSelector((state) => state.auth);

  // Hatalı kullanımda butonu gösterme veya hata ver
  if (!yetkiKodu) {
    return null;
  }

  // Kullanıcının yetkisi var mı kontrol et
  const hasPerms = hasPermission(user, yetkiKodu);

  // Yetkisi yoksa ve gösterilmemesi gerekiyorsa null döndür
  if (!hasPerms && !showDisabled) {
    return null;
  }

  // Yetkisi yoksa ama gösterilmesi gerekiyorsa devre dışı olarak göster
  if (!hasPerms && showDisabled) {
    return (
      <Tooltip title={tooltip}>
        <span>
          <Button {...buttonProps} disabled={true}>
            {children}
          </Button>
        </span>
      </Tooltip>
    );
  }

  // Yetkisi varsa normal buton göster
  return (
    <Button {...buttonProps} disabled={disabled}>
      {children}
    </Button>
  );
};

export default PermissionButton;
