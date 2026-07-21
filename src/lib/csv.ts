import type { Category, Transaction } from './types'

function cell(value: string): string {
  // Si una nota empieza con = + - @, Excel podría intentar leerla como fórmula al abrir
  // el archivo. Se antepone una comilla para que quede como texto plano.
  let v = /^[=+\-@]/.test(value) ? "'" + value : value
  if (/[",\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"'
  return v
}

export function transactionsToCSV(transactions: Transaction[], categories: Category[]): string {
  const headers = ['Fecha', 'Tipo', 'Categoría', 'Monto (S/)', 'Nota']
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at))
  const rows = sorted.map((t) => [
    t.date,
    t.type === 'income' ? 'Ingreso' : 'Gasto',
    categories.find((c) => c.id === t.category_id)?.name ?? 'Sin categoría',
    t.amount.toFixed(2),
    t.description ?? '',
  ])
  const lines = [headers, ...rows].map((row) => row.map(cell).join(','))
  const BOM = '﻿' // para que Excel reconozca los acentos (áéíóñ) como UTF-8 y no los rompa
  return BOM + lines.join('\r\n')
}

export function downloadFile(name: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
