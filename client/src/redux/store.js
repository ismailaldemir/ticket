import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import kisiReducer from "./kisi/kisiSlice";
import grupReducer from "./grup/grupSlice";
import borcReducer from "./borc/borcSlice";
import odemeReducer from "./odeme/odemeSlice";
import ucretReducer from "./ucret/ucretSlice";
import raporReducer from "./rapor/raporSlice";
import themeReducer from "./theme/themeSlice";
import layoutReducer from "./layout/layoutSlice";
import organizasyonReducer from "./organizasyon/organizasyonSlice";
import subeReducer from "./sube/subeSlice";
import uyeRolReducer from "./uyeRol/uyeRolSlice";
import sabitTanimReducer from "./sabitTanim/sabitTanimSlice";
import kasaReducer from "./kasa/kasaSlice";
import cariReducer from "./cari/cariSlice";
import gelirReducer from "./gelir/gelirSlice";
import giderReducer from "./gider/giderSlice";
import toplantiReducer from "./toplanti/toplantiSlice";
import evrakReducer from "./evrak/evrakSlice";
import projeReducer from "./proje/projeSlice";
import aboneReducer from "./abone/aboneSlice";
import aboneDetayReducer from "./aboneDetay/aboneDetaySlice";
import etkinlikReducer from "./etkinlik/etkinlikSlice";
import uyeReducer from "./uye/uyeSlice";
import tarifeReducer from "./tarife/tarifeSlice";
import uiReducer from "./layout/layoutSlice";
import rolReducer from "./rol/rolSlice";
import yetkiReducer from "./yetki/yetkiSlice";
import gorevReducer from "./gorev/gorevSlice";
import notificationReducer from "./notification/notificationSlice";
import emailReducer from "./email/emailSlice"; // E-posta modülünü içe aktar
import auditLogReducer from "./auditlog/auditLogSlice"; // AuditLog modülünü içe aktar
import quickActionReducer from "./quickAction/quickActionSlice"; // quickAction modülünü içe aktar

// api.js'den injectStore fonksiyonunu import et
import { injectStore } from "../utils/api";

const rootReducer = combineReducers({
  auth: authReducer,
  kisi: kisiReducer,
  grup: grupReducer,
  borc: borcReducer,
  odeme: odemeReducer,
  ucret: ucretReducer,
  rapor: raporReducer,
  theme: themeReducer,
  layout: layoutReducer,
  organizasyon: organizasyonReducer,
  sube: subeReducer,
  uyeRol: uyeRolReducer,
  sabitTanim: sabitTanimReducer,
  kasa: kasaReducer,
  cari: cariReducer,
  gelir: gelirReducer,
  gider: giderReducer,
  toplanti: toplantiReducer,
  evrak: evrakReducer,
  proje: projeReducer,
  abone: aboneReducer,
  aboneDetay: aboneDetayReducer,
  etkinlik: etkinlikReducer,
  uye: uyeReducer,
  tarife: tarifeReducer,
  ui: uiReducer,
  rol: rolReducer,
  yetki: yetkiReducer,
  gorev: gorevReducer,
  notification: notificationReducer,
  email: emailReducer, // E-posta modülünü ekle
  auditLog: auditLogReducer, // AuditLog modülünü ekle
  quickAction: quickActionReducer, // quickAction modülünü ekle
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Redux store'u api.js'e enjekte et
injectStore(store);

export default store;
