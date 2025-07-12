import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Excel'e dışa aktarma fonksiyonu
export const exportToExcel = (data, columns, fileName) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map(item => {
        const row = {};
        columns.forEach(column => {
          row[column.header] = column.accessor(item);
        });
        return row;
      })
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sayfa1');
    
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Excel dışa aktarma hatası:", error);
    throw error;
  }
};

// PDF'e dışa aktarma fonksiyonu
export const exportToPdf = (data, columns, fileName, title) => {
  try {
    // Veri güvenliği için boş data kontrolü
    if (!data || data.length === 0) {
      throw new Error("Dışa aktarılacak veri bulunamadı");
    }
    
    // jsPDF doğru şekilde oluştur
    const doc = new jsPDF();
    
    // Veri hazırlama
    const tableData = [];
    for (const item of data) {
      const rowData = [];
      for (const column of columns) {
        const value = column.accessor(item);
        rowData.push(value === null || value === undefined ? '' : String(value));
      }
      tableData.push(rowData);
    }
    
    // Başlık ekleme
    doc.setFontSize(16);
    doc.text(title || fileName, 14, 15);
    
    // Tarih ekleme
    doc.setFontSize(10);
    doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 22);
    
    // Tablo başlıklarını hazırlama
    const tableHeaders = columns.map(column => column.header);
    
    // Tabloyu oluştur
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 25,
      styles: { 
        fontSize: 9, 
        cellPadding: 2,
        overflow: 'linebreak',
        font: 'helvetica', 
        halign: 'left'
      },
      headStyles: { 
        fillColor: [60, 90, 153],
        textColor: 255 
      }
    });
    
    // PDF'i kaydetme
    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("PDF dışa aktarma hatası:", error);
    throw new Error("PDF oluşturulurken bir hata oluştu: " + error.message);
  }
};

// Formatları kontrol eden yardımcı fonksiyonlar
export const formatCurrency = (value) => {
  if (!value && value !== 0) return '';
  try {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '' : `₺${numValue.toFixed(2)}`;
  } catch (err) {
    return '';
  }
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('tr-TR');
  } catch (err) {
    return '';
  }
};

export const formatBoolean = (value) => {
  return value ? 'Evet' : 'Hayır';
};

// Verileri temizleme fonksiyonu
export const cleanData = (data) => {
  try {
    if (!data) return [];
    
    // Veriyi kopyala
    const safeData = JSON.parse(JSON.stringify(data));
    
    // HTML ve zararlı karakterleri temizle
    return safeData.map(item => {
      const cleanItem = {};
      Object.keys(item).forEach(key => {
        if (typeof item[key] === 'string') {
          cleanItem[key] = item[key].replace(/<[^>]+>/g, '');
        } else {
          cleanItem[key] = item[key];
        }
      });
      return cleanItem;
    });
  } catch (error) {
    console.error("Veri temizleme hatası:", error);
    return [];
  }
};
