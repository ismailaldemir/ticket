import React from "react";
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  MonetizationOn as MonetizationOnIcon,
  Payment as PaymentIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  Apartment as ApartmentIcon,
  Badge as BadgeIcon,
  Settings as SettingsIcon,
  Event as EventIcon,
  EventNote as EventNoteIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  AttachMoney as AttachMoneyIcon,
  WaterDrop as WaterDropIcon,
  DateRange as DateRangeIcon,
  AccountCircle as AccountCircleIcon,
  PeopleAlt as PeopleAltIcon,
  SupervisorAccount as SupervisorAccountIcon,
  FileCopy as FileCopyIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
} from "@mui/icons-material";

// Ana menü öğeleri
export const menuItems = [
  {
    text: "Ana Sayfa",
    icon: DashboardIcon,
    path: "/dashboard",
  },
  {
    text: "Kişiler",
    icon: PersonIcon,
    path: "/kisiler",
  },
  {
    text: "Gruplar",
    icon: GroupIcon,
    path: "/gruplar",
  },
  {
    text: "Takvim",
    icon: DateRangeIcon,
    path: "/takvim",
  },
  {
    text: "Borçlar",
    icon: MonetizationOnIcon,
    path: "/borclar",
  },
  {
    text: "Ödemeler",
    icon: PaymentIcon,
    path: "/odemeler",
  },
  {
    text: "Aboneler",
    icon: WaterDropIcon,
    path: "/aboneler",
  },
  {
    text: "Üyeler",
    icon: PeopleAltIcon,
    path: "/uyeler",
  },
];

// Organizasyon menü öğeleri
export const organizasyonMenuItems = [
  {
    text: "Organizasyonlar",
    icon: BusinessIcon,
    path: "/organizasyonlar",
  },
  {
    text: "Şubeler",
    icon: ApartmentIcon,
    path: "/subeler",
  },
  {
    text: "Üye Rolleri",
    icon: BadgeIcon,
    path: "/uye-roller",
  },
  {
    text: "Üyeler",
    icon: PeopleAltIcon,
    path: "/uyeler",
  },
];

// Sistem menü öğeleri
export const sistemMenuItems = [
  {
    text: "Sabit Tanımlar",
    icon: SettingsIcon,
    path: "/sabit-tanimlar",
  },
  {
    text: "Ücretler",
    icon: AttachMoneyIcon,
    path: "/ucretler",
  },
  {
    text: "Tarifeler",
    icon: DescriptionIcon,
    path: "/tarifeler",
  },
  {
    text: "Kullanıcılar",
    icon: AccountCircleIcon,
    path: "/users",
  },
  {
    text: "Roller",
    icon: SupervisorAccountIcon,
    path: "/roller",
  },
  {
    text: "Yetkiler",
    icon: SecurityIcon,
    path: "/yetkiler",
  },
];

// Etkinlik menü öğeleri
export const etkinlikMenuItems = [
  {
    text: "Etkinlikler",
    icon: EventNoteIcon,
    path: "/etkinlikler",
  },
  {
    text: "Toplantılar",
    icon: EventIcon,
    path: "/toplantilar",
  },
  {
    text: "Projeler",
    icon: AssignmentIcon,
    path: "/projeler",
  },
  {
    text: "Evraklar",
    icon: DescriptionIcon,
    path: "/evraklar",
  },
];

// Finans menü öğeleri
export const finansMenuItems = [
  {
    text: "Kasalar",
    icon: AccountBalanceIcon,
    path: "/kasalar",
  },
  {
    text: "Gelirler",
    icon: AttachMoneyIcon,
    path: "/gelirler",
  },
  {
    text: "Giderler",
    icon: PaymentIcon,
    path: "/giderler",
  },
  {
    text: "Cariler",
    icon: PeopleIcon,
    path: "/cariler",
  },
  {
    text: "Borçlar",
    icon: MonetizationOnIcon,
    path: "/borclar",
  },
  {
    text: "Ödemeler",
    icon: PaymentIcon,
    path: "/odemeler",
  },
];

// Kullanıcı ayarları menü öğeleri
export const userMenuItems = [
  {
    path: "/profile",
    text: "Profilim",
    icon: PersonIcon,
  },
];

// Settings menü öğeleri
export const settingsMenuItems = [
  {
    path: "/users",
    text: "Kullanıcılar",
    icon: SupervisorAccountIcon,
  },
  {
    path: "/settings",
    text: "Genel Ayarlar",
    icon: SettingsIcon,
  },
  {
    path: "/backup",
    text: "Yedekleme",
    icon: PersonIcon,
  },
  {
    path: "/restore",
    text: "Geri Yükleme",
    icon: PersonIcon,
  },
  {
    path: "/email-listesi",
    text: "E-posta Listesi",
    icon: EmailIcon,
  },
];

// Rapor menü öğeleri
export const raporMenuItems = [
  {
    text: "Aylık Borç Raporu",
    icon: AssessmentIcon,
    path: "/raporlar/aylik-borc",
  },
  {
    text: "Tahsilat Raporu",
    icon: AssessmentIcon,
    path: "/raporlar/tahsilat",
  },
];

// Alt menüleri olan öğelerin yapısı (Bu kısmı gözden geçirmek gerekebilir)
const MENU_ITEMS = [
  {
    id: "evraklar",
    path: "/evraklar",
    text: "Evraklar",
    icon: (color) => <FileCopyIcon sx={{ color }} />,
    children: [
      { id: "evraklarList", path: "/evraklar", text: "Evrak Listesi" },
      { id: "evraklarEkle", path: "/evraklar/ekle", text: "Yeni Evrak Ekle" },
    ],
  },
  {
    id: "projeler",
    path: "/projeler",
    text: "Projeler",
    icon: (color) => <AssignmentIcon sx={{ color }} />,
    children: [
      { id: "projelerList", path: "/projeler", text: "Proje Listesi" },
      { id: "projelerEkle", path: "/projeler/ekle", text: "Yeni Proje Ekle" },
    ],
  },
  {
    id: "ayarlar",
    path: "/ayarlar",
    text: "Ayarlar",
    icon: (color) => <SettingsIcon sx={{ color }} />,
    children: [
      {
        id: "emailYonetim",
        path: "/ayarlar/email-yonetim",
        text: "E-posta Yönetimi",
        icon: (color) => <EmailIcon sx={{ color }} />,
      },
    ],
  },
];

export default MENU_ITEMS;
