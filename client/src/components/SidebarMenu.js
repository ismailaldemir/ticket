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
  ];

  return (
    <div>
      {menuItems.map((menu) => (
        <div key={menu.id}>
          <h3>{menu.label}</h3>
          <ul>
            {menu.items.map((item) => (
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
