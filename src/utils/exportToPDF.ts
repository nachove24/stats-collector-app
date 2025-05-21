import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export async function exportToPDF(data: any[]) {
  const doc = new jsPDF()
  const headers = Object.keys(data[0])
  const rows = data.map(d => headers.map(k => d[k]))

  doc.text('Resumen del Partido', 14, 15)
  ;(doc as any).autoTable({
    startY: 20,
    head: [headers],
    body: rows,
    theme: 'grid'
  })

  doc.save('resumen_partido.pdf')
}
