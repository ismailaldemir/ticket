import React, { useState, useEffect } from "react";
import { Avatar, Tooltip } from "@mui/material";
import { stringToColor } from "../../utils/colorUtils";
import config from "../../config";

const UserAvatar = ({ user, size = 40, showTooltip = false, ...props }) => {
  const [imgError, setImgError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Eğer config.avatar tanımlı değilse varsayılan değerleri kullan
  const avatarConfig = config.avatar || {
    defaultSize: 40,
    defaultBorderColor: "rgba(0, 0, 0, 0.05)",
    sizes: {
      small: 32,
      medium: 40,
      large: 120,
    },
  };

  useEffect(() => {
    if (user && user.avatar) {
      // Avatar URL'sini doğru şekilde oluştur
      if (user.avatar.startsWith("http") || user.avatar.startsWith("data:")) {
        // Tam URL veya data URL ise doğrudan kullan
        setAvatarUrl(user.avatar);
      } else if (user.avatar.startsWith("/uploads/")) {
        // Göreceli yol ise, API URL'si ile birleştir
        // config.apiUrl değeri boş string ise, tarayıcının mevcut origin'ini kullan
        const baseUrl = config.apiUrl || window.location.origin;
        setAvatarUrl(`${baseUrl}${user.avatar}`);
      } else {
        // Diğer durumlarda varsayılan yapı
        setAvatarUrl(user.avatar);
      }
    } else {
      setAvatarUrl(null);
    }
  }, [user]);

  if (!user) return null;

  // Kullanıcı adının baş harflerini al
  function stringAvatar(name) {
    if (!name) return { children: "?" };

    const nameParts = name.split(" ");
    let initials = "";

    if (nameParts.length >= 2) {
      initials = `${nameParts[0][0]}${nameParts[1][0]}`;
    } else if (nameParts.length === 1) {
      initials = `${nameParts[0][0]}`;
    }

    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: initials.toUpperCase(),
    };
  }

  const avatarComponent =
    avatarUrl && !imgError && !user.avatarError ? (
      <Avatar
        src={avatarUrl}
        alt={user.name || "Kullanıcı"}
        sx={{
          width: size,
          height: size,
          border: `1px solid ${avatarConfig.defaultBorderColor}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        onError={() => setImgError(true)}
        {...props}
      />
    ) : (
      <Avatar
        {...stringAvatar(user.name)}
        sx={{
          width: size,
          height: size,
          ...stringAvatar(user.name).sx,
          fontWeight: "bold",
          fontSize: `${size * 0.4}px`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        {...props}
      />
    );

  return showTooltip ? (
    <Tooltip title={user.name || "Kullanıcı"}>{avatarComponent}</Tooltip>
  ) : (
    avatarComponent
  );
};

export default UserAvatar;
