import React, { createContext, useState, useEffect } from "react";

export const DashboardContext = createContext();

// Widget'ların varsayılan konfigürasyonu
const defaultWidgets = [
  { id: "kisiler", title: "Kişiler", visible: true, order: 1, size: 3 },
  { id: "gruplar", title: "Gruplar", visible: true, order: 2, size: 3 },
  { id: "uyeler", title: "Üyeler", visible: true, order: 3, size: 3 },
  { id: "aboneler", title: "Aboneler", visible: true, order: 4, size: 3 },
  { id: "borclar", title: "Toplam Borç", visible: true, order: 5, size: 3 },
  { id: "odeme", title: "Toplam Ödeme", visible: true, order: 6, size: 3 },
  { id: "gelir", title: "Toplam Gelir", visible: true, order: 7, size: 3 },
  { id: "gider", title: "Toplam Gider", visible: true, order: 8, size: 3 },
  {
    id: "hizliGenel",
    title: "Hızlı İşlemler",
    visible: true,
    order: 9,
    size: 12,
  },
  {
    id: "sonOdemeler",
    title: "Son Ödemeler",
    visible: true,
    order: 10,
    size: 6,
  },
  { id: "sonBorclar", title: "Son Borçlar", visible: true, order: 11, size: 6 },
];

export const DashboardProvider = ({ children }) => {
  const [widgets, setWidgets] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // LocalStorage'dan widget ayarlarını yükleme
  useEffect(() => {
    const savedWidgets = localStorage.getItem("dashboard_widgets");

    if (savedWidgets) {
      try {
        const parsedWidgets = JSON.parse(savedWidgets);
        setWidgets(parsedWidgets);
      } catch (e) {
        console.error("Widget ayarları yüklenemedi", e);
        setWidgets(defaultWidgets);
      }
    } else {
      setWidgets(defaultWidgets);
    }
  }, []);

  // Widget ayarlarını güncelleme ve kaydetme
  const updateWidgets = (newWidgets) => {
    setWidgets(newWidgets);
    localStorage.setItem("dashboard_widgets", JSON.stringify(newWidgets));
  };

  // Widget görünürlüğünü değiştirme
  const toggleWidgetVisibility = (widgetId) => {
    const updatedWidgets = widgets.map((widget) =>
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    );
    updateWidgets(updatedWidgets);
  };

  // Widget sırasını değiştirme
  const reorderWidgets = (startIndex, endIndex) => {
    const result = Array.from(widgets);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Sıralama değerlerini güncelle
    const reordered = result.map((widget, index) => ({
      ...widget,
      order: index + 1,
    }));

    updateWidgets(reordered);
  };

  // Widget boyutunu değiştirme
  const resizeWidget = (widgetId, newSize) => {
    const updatedWidgets = widgets.map((widget) =>
      widget.id === widgetId ? { ...widget, size: newSize } : widget
    );
    updateWidgets(updatedWidgets);
  };

  // Tüm widget'ları görünür yapma
  const showAllWidgets = () => {
    const updatedWidgets = widgets.map((widget) => ({
      ...widget,
      visible: true,
    }));
    updateWidgets(updatedWidgets);
  };

  // Ayarları sıfırlama
  const resetWidgets = () => {
    updateWidgets(defaultWidgets);
  };

  // Context değerleri
  const contextValue = {
    widgets,
    isEditMode,
    isSettingsOpen,
    setIsEditMode,
    setIsSettingsOpen,
    toggleWidgetVisibility,
    reorderWidgets,
    resizeWidget,
    showAllWidgets,
    resetWidgets,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};
