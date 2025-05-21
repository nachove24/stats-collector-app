import { saveAs } from 'file-saver'

export function exportToCSV(data: any[]) {
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(field => row[field]).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, 'resumen_partido.csv')
}
