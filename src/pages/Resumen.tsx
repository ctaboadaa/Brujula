import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Gear, ArrowsLeftRight, Sun, Moon, DeviceMobile } from '@phosphor-icons/react'
import { useTheme } from '../hooks/useTheme'
import { useAssets } from '../hooks/useAssets'
import { useLiabilities } from '../hooks/useLiabilities'
import { useInvestments } from '../hooks/useInvestments'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useCountUp } from '../hooks/useCountUp'
import { useNetWorthHistory } from '../hooks/useNetWorthHistory'
import { useUserSettings } from '../hooks/useUserSettings'
import { useAuth } from '../hooks/useAuth'
import BottomSheet from '../components/BottomSheet'
import EmptyState from '../components/EmptyState'
import NetWorthTrend from '../components/NetWorthTrend'
import CashflowTrend from '../components/CashflowTrend'
import FreedomNumber from '../components/FreedomNumber'
import MilestoneCelebration from '../components/MilestoneCelebration'
import { formatCurrency, formatDate } from '../lib/format'
import { highestMilestone } from '../lib/milestones'

export default function Resumen() {
  const { user, signOut, updateDisplayName } = useAuth()
  const { preference, setPreference } = useTheme()
  const { assets, loading: loadingAssets } = useAssets()
  const { liabilities, loading: loadingLiabilities } = useLiabilities()
  const { investments } = useInvestments()
  const { transactions, loading: loadingTransactions } = useTransactions()
  const { categories } = useCategories()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [celebratingMilestone, setCelebratingMilestone] = useState<number | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [nameSubmitting, setNameSubmitting] = useState(false)

  const displayName = (user?.user_metadata?.display_name as string | undefined)?.trim() || null

  const { snapshots, recordSnapshot } = useNetWorthHistory()
  const { celebratedMilestone, loading: loadingSettings, setCelebratedMilestoneValue } = useUserSettings()

  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0)
  const totalInvestments = investments.reduce((sum, i) => sum + i.currentValuePen, 0)
  const currentNetWorth = totalAssets + totalInvestments - totalLiabilities
  const netWorth = useCountUp(currentNetWorth)

  useEffect(() => {
    if (loadingAssets || loadingLiabilities) return
    recordSnapshot({ totalAssets, totalInvestments, totalLiabilities })
  }, [loadingAssets, loadingLiabilities, totalAssets, totalInvestments, totalLiabilities, recordSnapshot])

  useEffect(() => {
    if (loadingAssets || loadingLiabilities || loadingSettings) return
    const reached = highestMilestone(currentNetWorth)
    if (reached === 0) return
    if (celebratedMilestone === null) {
      setCelebratedMilestoneValue(reached)
      return
    }
    if (reached > celebratedMilestone) {
      setCelebratingMilestone(reached)
      setCelebratedMilestoneValue(reached)
    }
  }, [loadingAssets, loadingLiabilities, loadingSettings, currentNetWorth, celebratedMilestone])

  const recent = useMemo(() => transactions.slice(0, 4), [transactions])

  function categoryName(id: string | null) {
    if (!id) return 'Sin categoría'
    return categories.find((c) => c.id === id)?.name ?? 'Sin categoría'
  }

  function openSettings() {
    setNameInput(displayName ?? '')
    setSettingsOpen(true)
  }

  async function handleSaveName(e: FormEvent) {
    e.preventDefault()
    if (!nameInput.trim()) return
    setNameSubmitting(true)
    await updateDisplayName(nameInput.trim())
    setNameSubmitting(false)
  }

  const loading = loadingAssets || loadingLiabilities || loadingTransactions

  return (
    <div className="mx-auto max-w-md px-4 pt-8">
      <MilestoneCelebration milestone={celebratingMilestone} onDismiss={() => setCelebratingMilestone(null)} />

      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">{displayName ? `Hola, ${displayName}` : 'Hola,'}</p>
          <h1 className="font-display text-2xl font-medium text-text-primary">tu rumbo financiero</h1>
        </div>
        <button
          type="button"
          onClick={openSettings}
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

      <FreedomNumber transactions={transactions} currentNetWorth={currentNetWorth} />

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

        <form onSubmit={handleSaveName} className="mb-6">
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-text-secondary">
            Tu nombre
          </label>
          <div className="flex gap-2">
            <input
              id="displayName"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="¿Cómo te llamamos?"
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
            <button
              type="submit"
              disabled={nameSubmitting || !nameInput.trim()}
              className="shrink-0 rounded-control bg-brand-primary px-4 py-2.5 text-sm font-medium text-text-inverse disabled:opacity-50"
            >
              {nameSubmitting ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>

        <p className="mb-2 text-sm font-medium text-text-secondary">Apariencia</p>
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setPreference('light')}
            className={`flex flex-1 flex-col items-center gap-1 rounded-control border py-2.5 text-xs font-medium transition-colors ${
              preference === 'light'
                ? 'border-brand-primary bg-brand-primary-soft text-brand-primary'
                : 'border-border-default text-text-secondary'
            }`}
          >
            <Sun size={18} />
            Claro
          </button>
          <button
            type="button"
            onClick={() => setPreference('dark')}
            className={`flex flex-1 flex-col items-center gap-1 rounded-control border py-2.5 text-xs font-medium transition-colors ${
              preference === 'dark'
                ? 'border-brand-primary bg-brand-primary-soft text-brand-primary'
                : 'border-border-default text-text-secondary'
            }`}
          >
            <Moon size={18} />
            Oscuro
          </button>
          <button
            type="button"
            onClick={() => setPreference('system')}
            className={`flex flex-1 flex-col items-center gap-1 rounded-control border py-2.5 text-xs font-medium transition-colors ${
              preference === 'system'
                ? 'border-brand-primary bg-brand-primary-soft text-brand-primary'
                : 'border-border-default text-text-secondary'
            }`}
          >
            <DeviceMobile size={18} />
            Automático
          </button>
        </div>

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
