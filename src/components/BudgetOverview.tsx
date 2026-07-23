import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Gauge, Check } from '@phosphor-icons/react'
import type { Category, Transaction } from '../lib/types'
import { useCategories } from '../hooks/useCategories'
import BottomSheet from '../components/BottomSheet'
import { formatCurrency } from '../lib/format'

interface BudgetRow {
  category: Category
  spent: number
}

function barColor(pct: number): string {
  if (pct >= 100) return 'bg-error'
  if (pct >= 70) return 'bg-warning'
  return 'bg-success'
}

export default function BudgetOverview({
  categories,
  transactions,
  monthKey,
  monthLabel,
}: {
  categories: Category[]
  transactions: Transaction[]
  monthKey: string
  monthLabel: string
}) {
  const { setCategoryBudget } = useCategories()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories])

  const rows: BudgetRow[] = useMemo(() => {
    return expenseCategories
      .filter((c) => c.monthly_budget !== null && c.monthly_budget > 0)
      .map((category) => {
        const spent = transactions
          .filter((t) => t.type === 'expense' && t.category_id === category.id && t.date.startsWith(monthKey))
          .reduce((s, t) => s + t.amount, 0)
        return { category, spent }
      })
      .sort((a, b) => b.spent / (b.category.monthly_budget ?? 1) - a.spent / (a.category.monthly_budget ?? 1))
  }, [expenseCategories, transactions, monthKey])

  function openSheet() {
    const initial: Record<string, string> = {}
    for (const c of expenseCategories) {
      initial[c.id] = c.monthly_budget !== null ? String(c.monthly_budget) : ''
    }
    setEdits(initial)
    setSheetOpen(true)
  }

  async function saveRow(id: string) {
    const raw = edits[id]?.trim() ?? ''
    const value = raw === '' ? null : Number(raw)
    if (value !== null && (!value || value <= 0)) return
    setSavingId(id)
    await setCategoryBudget(id, value)
    setSavingId(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6 rounded-card border border-border-default bg-surface-elevated p-5 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-text-tertiary">
          <Gauge size={14} />
          Presupuestos · {monthLabel}
        </p>
        <button
          type="button"
          onClick={openSheet}
          className="text-xs font-medium text-brand-primary underline underline-offset-4"
        >
          {rows.length > 0 ? 'Editar' : 'Configurar'}
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-text-secondary">
          Ponle un límite mensual a tus categorías de gasto y te avisamos antes de que te pases.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ category, spent }) => {
            const budget = category.monthly_budget ?? 0
            const pct = budget > 0 ? Math.min(150, (spent / budget) * 100) : 0
            return (
              <li key={category.id}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-medium text-text-primary">{category.name}</span>
                  <span className="font-mono text-xs text-text-secondary">
                    {formatCurrency(spent)} / {formatCurrency(budget)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, pct)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${barColor(pct)}`}
                  />
                </div>
                {pct >= 100 && <p className="mt-1 text-xs text-error">Superaste el límite mensual.</p>}
              </li>
            )
          })}
        </ul>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Configurar presupuestos">
        {expenseCategories.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Todavía no tienes categorías de gasto. Créalas al registrar un movimiento.
          </p>
        ) : (
          <ul className="space-y-3">
            {expenseCategories.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <label htmlFor={`budget-${c.id}`} className="flex-1 truncate text-sm text-text-primary">
                  {c.name}
                </label>
                <input
                  id={`budget-${c.id}`}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="Sin límite"
                  value={edits[c.id] ?? ''}
                  onChange={(e) => setEdits((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  className="w-28 rounded-control border border-border-default bg-surface-secondary px-2 py-1.5 font-mono text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
                <button
                  type="button"
                  onClick={() => saveRow(c.id)}
                  disabled={savingId === c.id}
                  aria-label={`Guardar presupuesto de ${c.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-text-inverse disabled:opacity-50"
                >
                  <Check size={14} weight="bold" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </BottomSheet>
    </motion.div>
  )
}
