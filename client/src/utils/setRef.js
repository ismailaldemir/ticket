import Logger from "./logger";

/**
 * Ref değerini güvenli şekilde atar
 * İşlem sırasında React döngüsü oluşturmaz
 */
const setRef = (ref, value) => {
  if (ref == null) return;

  if (typeof ref === "function") {
    // Fonksiyon ref'leri için callback olarak çağır
    // Eğer aynı değer tekrar atanıyorsa, tekrar çağırma
    let lastValue;
    if (ref.__lastValue !== undefined && ref.__lastValue === value) return;
    ref.__lastValue = value;
    const callRef = () => ref(value);
    setTimeout(callRef, 0);
  } else {
    try {
      // Nesne ref'leri için, aynı değer ise tekrar atama yapma
      if (ref.current === value) return;
      ref.current = value;
    } catch (error) {
      Logger.error("Ref değeri atanırken hata oluştu", { error });
    }
  }
};

export default setRef;
