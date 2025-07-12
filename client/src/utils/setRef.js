import Logger from "./logger";

/**
 * Ref değerini güvenli şekilde atar
 * İşlem sırasında React döngüsü oluşturmaz
 */
const setRef = (ref, value) => {
  if (ref == null) return;

  if (typeof ref === "function") {
    // Fonksiyon ref'leri için callback olarak çağır
    // ama bunu setTimeout ile asenkron yap ki render döngüsünü engelleme
    const callRef = () => ref(value);
    setTimeout(callRef, 0);
  } else {
    try {
      // Nesne ref'leri için direkt ata
      ref.current = value;
    } catch (error) {
      Logger.error("Ref değeri atanırken hata oluştu", { error });
    }
  }
};

export default setRef;
