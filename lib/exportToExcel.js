import * as XLSX from "xlsx";

export const exportToExcel = (data, fileName) => {
  if (data.length === 0) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  // Atur lebar kolom agar otomatis
  const columnWidths = Object.keys(data[0]).map(key => ({
    wch: Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    ) + 2 // Tambahkan sedikit padding
  }));

  worksheet["!cols"] = columnWidths;

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};