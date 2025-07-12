export const createDeleteMessage = (entityName, itemName) => {
  return `"${itemName}" kaydını silmek istediğinize emin misiniz?`;
};

export const createBulkDeleteMessage = (count, entityName) => {
  return `${count} adet ${entityName} kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`;
};

export const getDeleteSuccessMessage = (entityName, itemName) => {
  return `"${itemName}" ${entityName} başarıyla silindi`;
};

export const getBulkDeleteSuccessMessage = (count, entityName) => {
  return `${count} adet ${entityName} başarıyla silindi`;
};

export const getDeleteErrorMessage = (entityName) => {
  return `${entityName} silinirken bir hata oluştu`;
};
