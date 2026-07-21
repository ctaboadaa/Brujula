import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Gear, ArrowsLeftRight } from '@phosphor-icons/react'
import { useAssets } from '../hooks/useAssets'
import { useLiabilities } from '../hooks/useLiabilities'
import { useInvestments } from '../hooks/useInvestments'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useCountUp } from '../hooks/useCountUp'
import { useNetWorthHistory } from '../hooks/useNetWorthHistory'
import { useAuth } from '../hooks/useAuth'
import BottomSheet from '../components/BottomSheet'
import EmptyState from '../components/EmptyState'
import NetWorthTrend from '../components/NetWorthTrend'
import CashflowTrend from '../components/CashflowTrend'
import { formatCurrency, formatDate } from '../lib/format'

export default function Resumen() {
  const { user, signOut } = useAuth()
  const { assets, loading: loadingAssets } = useAssets()
  const { liabilities, loading: loadingLiabilities } = useLiabilities()
  const { investments } = useInvestments()
  const { transactions, loading: loadingTransactions } = useTransactions()
  const { categories } = useCategories()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { snapshots, recordSnapshot } = useNetWorthHistory()

  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0)
  const totalInvestments = investments.reduce((sum, i) => sum + i.currentValuePen, 0)
  const netWorth = useCountUp(totalAssets + totalInvestments - totalLiabilities)

  useEffect(() => {
    if (loadingAssets || loadingLiabilities) return
    recordSnapshot({ totalAssets, totalInvestments, totalLiabilities })
  }, [loadingAssets, loadingLiabilities, totalAssets, totalInvestments, totalLiabilities, recordSnapshot])

  const recent = useMemo(() => transactions.slice(0, 4), [transactions])

  function categoryName(id: string | null) {
    if (!id) return 'Sin categoría'
    return categories.find((c) => c.id === id)?.name ?? 'Sin categoría'
  }

  const loading = loadingAssets || loadingLiabilities || loadingTransactions

  return (
    <div className="mx-auto max-w-md px-4 pt-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">Hola,</p>
          <h1 className="font-display text-2xl font-medium text-text-primary">tu rumbo financiero</h1>
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Ajustes"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border-default bg-surface-elevated text-text-secondary"
        >
          <Gear size={20} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-6 rounded-card border border-border-default bg-surface-elevated p-6 shadow-md"
      >
        <p className="text-xs uppercase tracking-wide text-text-tertiary">Patrimonio neto</p>
        <p className="mt-1 font-mono text-4xl font-semibold text-text-primary">
          {formatCurrency(netWorth)}
        </p>
        {totalInvestments > 0 && (
          <p className="mt-1 text-xs text-text-tertiary">Incluye {formatCurrency(totalInvestments)} en inversiones</p>
        )}
        <Link to="/patrimonio" className="mt-3 inline-block text-sm text-brand-primary underline underline-offset-4">
          Ver el detalle de activos y pasivos →
        </Link>
      </motion.div>

      <div className="mb-6">
        <NetWorthTrend snapshots={snapshots} />
      </div>

      <CashflowTrend transactions={transactions} />

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-medium text-text-primary">Últimos movimientos</h2>
        <Link to="/transacciones" className="text-sm text-brand-primary underline underline-offset-4">
          Ver todos
        </Link>
      </div>

      {loading && <p className="py-8 text-center text-text-secondary">Cargando…</p>}

      {!loading && recent.length === 0 && (
        <EmptyState
          icon={<ArrowsLeftRight size={32} weight="duotone" />}
          title="Todavía no hay movimientos"
          description="Registra tu primer ingreso o gasto para empezar a ver tu rumbo."
        />
      )}

      <ul className="space-y-2 pb-4">
        {recent.map((t, i) => (
          <motion.li
            key={t.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 + Math.min(i * 0.05, 0.3) }}
            className="flex items-center justify-between rounded-card border border-border-default bg-surface-elevated px-4 py-3 shadow-sm"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">{categoryName(t.category_id)}</p>
              <p className="text-xs text-text-secondary">{formatDate(t.date)}</p>
            </div>
            <span className={`shrink-0 font-mono text-sm font-medium ${t.type === 'income' ? 'text-success' : 'text-error'}`}>
              {t.type === 'income' ? '+' : '-'}
              {formatCurrency(t.amount)}
            </span>
          </motion.li>
        ))}
      </ul>

      <BottomSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Ajustes">
        <p className="mb-4 text-sm text-text-secondary">Sesión iniciada como {user?.email}</p>
        <button
          type="button"
          onClick={signOut}
          className="w-full rounded-control border border-border-strong py-2.5 text-sm font-medium text-error"
        >
          Cerrar sesión
        </button>
      </BottomSheet>
    </div>
  )
}
