import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../auth/authSlice";
import kisiReducer from "../kisi/kisiSlice";
import grupReducer from "../grup/grupSlice";
import borcReducer from "../borc/borcSlice";
import odemeReducer from "../odeme/odemeSlice";
import ucretReducer from "../ucret/ucretSlice";
import raporReducer from "../rapor/raporSlice";
import themeReducer from "../theme/themeSlice";
import organizasyonReducer from "../organizasyon/organizasyonSlice";
import subeReducer from "../sube/subeSlice";
import uyeRolReducer from "../uyeRol/uyeRolSlice";
import sabitTanimReducer from "../sabitTanim/sabitTanimSlice";
import kasaReducer from "../kasa/kasaSlice";
import cariReducer from "../cari/cariSlice";
import evrakReducer from "../evrak/evrakSlice";
import projeReducer from "../proje/projeSlice";
import gelirReducer from "../gelir/gelirSlice";
import giderReducer from "../gider/giderSlice";
import toplantiReducer from "../toplanti/toplantiSlice";
import aboneReducer from "../abone/aboneSlice";
import aboneDetayReducer from "../aboneDetay/aboneDetaySlice";
import rolReducer from "../rol/rolSlice";
import yetkiReducer from "../yetki/yetkiSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    kisi: kisiReducer,
    grup: grupReducer,
    borc: borcReducer,
    odeme: odemeReducer,
    ucret: ucretReducer,
    rapor: raporReducer,
    theme: themeReducer,
    organizasyon: organizasyonReducer,
    sube: subeReducer,
    uyeRol: uyeRolReducer,
    sabitTanim: sabitTanimReducer,
    kasa: kasaReducer,
    cari: cariReducer,
    evrak: evrakReducer,
    gelir: gelirReducer,
    gider: giderReducer,
    toplanti: toplantiReducer,
    proje: projeReducer,
    abone: aboneReducer,
    aboneDetay: aboneDetayReducer,
    rol: rolReducer,
    yetki: yetkiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
