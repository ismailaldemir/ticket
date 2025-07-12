import { useState, useEffect, useMemo } from "react";

const useAnimatedList = ({
  data = [],
  loading = false,
  filters = {},
  filterFunction,
  initialPage = 0,
  rowsPerPage = 10,
}) => {
  const [contentLoaded, setContentLoaded] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(rowsPerPage);
  const [filterTrigger, setFilterTrigger] = useState(0);

  // useMemo kullanarak filtrelenmiş veriyi hesapla
  const filteredData = useMemo(() => {
    return Array.isArray(data) ? filterFunction(data, filters) : [];
  }, [data, filters, filterFunction, filterTrigger]);

  // useMemo kullanarak görünür veriyi hesapla
  const visibleData = useMemo(() => {
    const startIndex = page * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, page, pageSize]);

  // Yükleme durumuna göre içeriğin yüklenme durumunu ayarla
  useEffect(() => {
    if (!loading && Array.isArray(data) && data.length > 0) {
      setContentLoaded(true);
    }
  }, [loading, data]);

  // Sayfa değiştiğinde sayfa numarasını ayarla
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Sayfa başına gösterilecek öğe sayısı değiştiğinde ayarla
  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Listeyi yenile
  const refresh = () => {
    setPage(0);
    setFilterTrigger((prev) => prev + 1);
  };

  // Filtreleri uygula
  const applyFilters = () => {
    setPage(0);
    setFilterTrigger((prev) => prev + 1);
  };

  return {
    contentLoaded,
    filteredData,
    visibleData,
    page,
    pageSize,
    handleChangePage,
    handleChangeRowsPerPage,
    refresh,
    applyFilters,
    totalCount: filteredData.length,
  };
};

export default useAnimatedList;
