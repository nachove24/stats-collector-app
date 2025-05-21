import * as XLSX from 'xlsx'

export async function exportToXLSX(data: any[]) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumen')

  XLSX.writeFile(workbook, 'resumen_partido.xlsx')
}
