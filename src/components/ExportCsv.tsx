import { useState } from 'react'
import { motion } from 'motion/react'
import { DownloadSimple } from '@phosphor-icons/react'
import type { Category, Transaction } from '../lib/types'
import BottomSheet from '../components/BottomSheet'
import { transactionsToCSV, downloadFile } from '../lib/csv'
import { todayIsoDate } from '../lib/format'

function firstDayOfMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

export default function ExportCsv({
  transactions,
  categories,
}: {
  transactions: Transaction[]
  categories: Category[]
}) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState(firstDayOfMonth())
  const [to, setTo] = useState(todayIsoDate())

  function handleDownload() {
    const inRange = transactions.filter((t) => t.date >= from && t.date <= to)
    const csv = transactionsToCSV(inRange, categories)
    downloadFile(`brujula-movimientos-${from}-a-${to}.csv`, csv)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Exportar movimientos a Excel/CSV"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border-default bg-surface-elevated text-text-secondary"
      >
        <DownloadSimple size={20} />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Exportar a Excel/CSV">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Elige el rango de fechas que quieres exportar.</p>

          <div>
            <label htmlFor="fromDate" className="mb-1 block text-sm font-medium text-text-secondary">
              Desde
            </label>
            <input
              id="fromDate"
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div>
            <label htmlFor="toDate" className="mb-1 block text-sm font-medium text-text-secondary">
              Hasta
            </label>
            <input
              id="toDate"
              type="date"
              value={to}
              min={from}
              max={todayIsoDate()}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleDownload}
            className="w-full rounded-control bg-brand-primary py-2.5 font-medium text-text-inverse"
          >
            Descargar CSV
          </motion.button>
        </div>
      </BottomSheet>
    </>
  )
}
