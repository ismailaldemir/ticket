import React from "react";

/**
 * İki referansı tek bir referans olarak birleştirir
 * Performans için memoize edilmiş ve stable bir fonksiyon döndürür
 */
const useForkRef = (refA, refB) => {
  return React.useMemo(() => {
    if (refA == null && refB == null) {
      return null;
    }

    return (refValue) => {
      // setRef fonksiyonu yerine doğrudan işlem yaparak
      // gereksiz renderlama döngüsünü engelliyoruz
      if (typeof refA === "function") {
        refA(refValue);
      } else if (refA) {
        refA.current = refValue;
      }

      if (typeof refB === "function") {
        refB(refValue);
      } else if (refB) {
        refB.current = refValue;
      }
    };
  }, [refA, refB]);
};

export default useForkRef;
