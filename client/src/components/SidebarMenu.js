import React from "react";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventIcon from "@mui/icons-material/Event";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";

const SidebarMenu = () => {
  const menuItems = [
    // Randevu Yönetimi menü grubu
    {
      id: "randevular",
      label: "Randevu Yönetimi",
      icon: <CalendarTodayIcon />,
      permission: "randevular_goruntuleme",
      items: [
        {
          id: "randevu-anasayfa",
          label: "Genel Bakış",
          path: "/randevu",
          permission: "randevular_goruntuleme",
          icon: <DashboardIcon fontSize="small" />,
        },
        {
          id: "randevu-slotlar",
          label: "Randevu Slotları",
          path: "/randevu/slotlar",
          permission: "randevular_goruntuleme",
          icon: <EventIcon fontSize="small" />,
        },
        {
          id: "randevu-tanimlar",
          label: "Randevu Tanımları",
          path: "/randevu/tanimlar",
          permission: "randevular_goruntuleme",
          icon: <SettingsIcon fontSize="small" />,
        },
        {
          id: "randevu-toplu-olustur",
          label: "Toplu Randevu Oluştur",
          path: "/randevu/toplu-olustur",
          permission: "randevular_ekleme",
          icon: <AddIcon fontSize="small" />,
        },
      ],
    },
    // Talep Yönetimi menü grubu
    {
      id: "talepler",
      label: "Talep Yönetimi",
      icon: <EventIcon />,
      permission: "talepler_goruntuleme",
      items: [
        {
          id: "talep-listesi",
          label: "Talep Listesi",
          path: "/talepler",
          permission: "talepler_goruntuleme",
          icon: <DashboardIcon fontSize="small" />,
        },
        {
          id: "talep-yeni",
          label: "Yeni Talep Oluştur",
          path: "/talepler/yeni",
          permission: "talepler_ekleme",
          icon: <AddIcon fontSize="small" />,
        },
      ],
    },
  ];

  // Kullanıcıyı al
  const user = JSON.parse(localStorage.getItem("user"));
  // Superadmin kontrolü
  const isSuperadmin = user && (
    user.email === (window.config?.app?.adminEmail || process.env.REACT_APP_ADMIN_EMAIL) ||
    (user.permissions && user.permissions.some(
      (perm) => perm === "superadmin_full_access" || perm.kod === "superadmin_full_access"
    ))
  );

  // Menüleri filtrele: superadmin ise tüm menüler ve alt menüler görünür
  const visibleMenus = isSuperadmin
    ? menuItems
    : menuItems.filter((menu) => {
        if (menu.permission && !(user?.permissions?.some(
          (perm) => perm === menu.permission || perm.kod === menu.permission
        ))) {
          return false;
        }
        return true;
      });

  return (
    <div>
      {visibleMenus.map((menu) => (
        <div key={menu.id}>
          <h3>{menu.label}</h3>
          <ul>
            {(isSuperadmin
              ? menu.items
              : menu.items.filter((item) => {
                  if (item.permission && !(user?.permissions?.some(
                    (perm) => perm === item.permission || perm.kod === item.permission
                  ))) {
                    return false;
                  }
                  return true;
                })
            ).map((item) => (
              <li key={item.id}>
                <a href={item.path}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SidebarMenu;
