import { combineReducers } from "redux";
import auth from "./auth/authSlice";
import alert from "./alert/alertSlice";
import theme from "./theme/themeSlice";
import layout from "./layout/layoutSlice";
import kisi from "./kisi/kisiSlice";
import grup from "./grup/grupSlice";
import borc from "./borc/borcSlice";
import cari from "./cari/cariSlice";
import uye from "./uye/uyeSlice";
import gider from "./gider/giderSlice";
import gelir from "./gelir/gelirSlice";
import odeme from "./odeme/odemeSlice";
import sabittanim from "./sabittanim/sabittanimSlice";
import user from "./user/userSlice";
import rol from "./rol/rolSlice";
import yetki from "./yetki/yetkiSlice";
import organizasyon from "./organizasyon/organizasyonSlice";
import sube from "./sube/subeSlice";
import randevuTanimi from "./randevuTanimi/randevuTanimiSlice";
import randevuSlot from "./randevuSlot/randevuSlotSlice";

export default combineReducers({
  auth,
  alert,
  theme,
  layout,
  kisi,
  grup,
  borc,
  cari,
  uye,
  gider,
  gelir,
  odeme,
  sabittanim,
  user,
  rol,
  yetki,
  organizasyon,
  sube,
  randevuTanimi,
  randevuSlot,
});
