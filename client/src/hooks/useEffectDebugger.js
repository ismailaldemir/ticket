import { useEffect, useRef } from "react";
import Logger from "../utils/logger";

/**
 * useEffect hook'unu izleyen ve değişiklikleri günlüğe kaydeden özel hook
 * @param {Function} effectHook - Etki fonksiyonu
 * @param {Array} dependencies - Bağımlılık dizisi
 * @param {string} [name='unknown'] - Bileşenin adı
 */
const useEffectDebugger = (effectHook, dependencies, name = "unknown") => {
  const previousDeps = useRef(dependencies);
  const changedDeps = dependencies.reduce((accum, dependency, index) => {
    if (dependency !== previousDeps.current[index]) {
      const keyName = Object.keys({ ...previousDeps.current })[index] || index;
      accum.push({
        key: keyName,
        prev: previousDeps.current[index],
        next: dependency,
      });
    }
    return accum;
  }, []);

  if (changedDeps.length) {
    Logger.debug(`[${name}] useEffect dependency changes:`, changedDeps);
  }

  // Eğer mevcut bağımlılıklar arasında undefined varsa ve bu ilk render değilse uyarı göster
  const hasUndefined = dependencies.some((dep) => dep === undefined);
  if (hasUndefined && previousDeps.current.length > 0) {
    Logger.warn(
      `[${name}] useEffect dependency array contains undefined values! This might cause infinite loops.`
    );
  }

  // Eğer obje veya dizi tipinde bağımlılıklar varsa uyarı göster
  dependencies.forEach((dep, index) => {
    if ((typeof dep === "object" && dep !== null) || Array.isArray(dep)) {
      Logger.warn(
        `[${name}] useEffect dependency at index ${index} is an object or array.` +
          " This might cause infinite loops if the object reference changes each render."
      );
    }
  });

  useEffect(() => {
    effectHook();
    previousDeps.current = dependencies;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

export default useEffectDebugger;
