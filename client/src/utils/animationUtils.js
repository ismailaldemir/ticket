import React from "react";
import { Box, Skeleton } from "@mui/material";

/**
 * Yükleme sırasında gösterilecek liste iskelet yapısını oluşturur
 *
 * @param {Object} options - İskelet yapısı seçenekleri
 * @param {number} options.rowCount - Oluşturulacak iskelet satır sayısı
 * @param {number} options.columnCount - Oluşturulacak iskelet sütun sayısı
 * @param {boolean} options.hasCheckbox - Checkbox sütunu olup olmadığı
 * @param {boolean} options.hasActions - İşlem sütunu olup olmadığı
 * @param {Array} options.columnWidths - Sütun genişlikleri
 * @returns {JSX.Element} İskelet bileşeni
 */
export const ListSkeleton = ({
  rowCount = 5,
  columnCount = 5,
  hasCheckbox = true,
  hasActions = true,
  columnWidths = [],
}) => {
  // Skeleton sütunu genişliği belirtilmemişse rastgele genişlikler ata
  const getColumnWidth = (index) => {
    if (columnWidths[index]) return columnWidths[index];
    return `${Math.floor(Math.random() * 40) + 60}%`;
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Başlık satırı */}
      <Box
        sx={{
          display: "flex",
          mb: 1,
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {hasCheckbox && (
          <Box sx={{ width: 60, px: 1 }}>
            <Skeleton variant="rectangular" width={24} height={24} />
          </Box>
        )}

        {Array(columnCount)
          .fill(0)
          .map((_, index) => (
            <Box key={`header-${index}`} sx={{ flex: 1, px: 1 }}>
              <Skeleton
                variant="text"
                width={getColumnWidth(index)}
                height={24}
              />
            </Box>
          ))}

        {hasActions && (
          <Box sx={{ width: 120, px: 1 }}>
            <Skeleton variant="text" width={80} height={24} />
          </Box>
        )}
      </Box>

      {/* Satırlar */}
      {Array(rowCount)
        .fill(0)
        .map((_, rowIndex) => (
          <Box
            key={`row-${rowIndex}`}
            sx={{
              display: "flex",
              py: 2,
              alignItems: "center",
              borderBottom: 1,
              borderColor: "divider",
              transition: (theme) =>
                theme.transitions.create("background-color", {
                  duration: theme.transitions.duration.shortest,
                }),
            }}
          >
            {hasCheckbox && (
              <Box sx={{ width: 60, px: 1 }}>
                <Skeleton variant="rectangular" width={24} height={24} />
              </Box>
            )}

            {Array(columnCount)
              .fill(0)
              .map((_, colIndex) => (
                <Box
                  key={`cell-${rowIndex}-${colIndex}`}
                  sx={{ flex: 1, px: 1 }}
                >
                  <Skeleton
                    variant="text"
                    width={getColumnWidth(colIndex)}
                    height={24}
                    animation="wave"
                    // Her satır ve sütuna özel animasyon gecikmesi ekle
                    sx={{
                      animationDelay: `${rowIndex * 0.1 + colIndex * 0.05}s`,
                    }}
                  />
                </Box>
              ))}

            {hasActions && (
              <Box sx={{ width: 120, px: 1, display: "flex", gap: 1 }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
              </Box>
            )}
          </Box>
        ))}
    </Box>
  );
};

/**
 * Animasyon gecikmesi hesaplama fonksiyonu
 * @param {number} index - Öğenin listede kaçıncı öğe olduğu
 * @param {number} total - Toplam öğe sayısı
 * @returns {number} - Gecikme miktarı (ms)
 */
export const calculateAnimationDelay = (index, total) => {
  // Maksimum 800ms gecikme uygula, öğeleri arasında eşit dağıt
  const maxDelay = 800;
  const itemDelay = Math.min(50, maxDelay / total); // Minimum 50ms, maksimum maxDelay/total
  return index * itemDelay;
};
