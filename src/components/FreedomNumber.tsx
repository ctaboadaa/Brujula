import { useMemo, useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Compass, PencilSimple } from '@phosphor-icons/react'
import type { Transaction } from '../lib/types'
import { useUserSettings } from '../hooks/useUserSettings'
import { useCountUp } from '../hooks/useCountUp'
import BottomSheet from '../components/BottomSheet'
import { formatCurrency } from '../lib/format'
import { lastNMonthKeys } from '../lib/timeBuckets'

function averageActiveMonth(transactions: Transaction[], type: 'income' | 'expense'): number {
  const months = lastNMonthKeys(3)
  const totals = months.map((m) =>
    transactions.filter((t) => t.type === type && t.date.startsWith(m.key)).reduce((s, t) => s + t.amount, 0),
  )
  const active = totals.filter((v) => v > 0)
  return active.length ? active.reduce((a, b) => a + b, 0) / active.length : 0
}

export default function FreedomNumber({
  transactions,
  currentNetWorth,
}: {
  transactions: Transaction[]
  currentNetWorth: number
}) {
  const { annualExpenseTarget, setAnnualExpense } = useUserSettings()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const avgMonthlyExpense = useMemo(() => averageActiveMonth(transactions, 'expense'), [transactions])
  const avgMonthlyIncome = useMemo(() => averageActiveMonth(transactions, 'income'), [transactions])

  const autoAnnualExpense = avgMonthlyExpense * 12
  const annualExpense = annualExpenseTarget ?? autoAnnualExpense
  const freedomNumber = annualExpense * 25
  const progressRaw = freedomNumber > 0 ? Math.min(100, (currentNetWorth / freedomNumber) * 100) : 0
  const progress = useCountUp(progressRaw)

  const monthlySavings = avgMonthlyIncome - avgMonthlyExpense
  const gap = freedomNumber - currentNetWorth
  const yearsToGo = monthlySavings > 0 ? gap / (monthlySavings * 12) : null

  function openSheet() {
    setInputValue(annualExpenseTarget ? String(annualExpenseTarget) : '')
    setFormError(null)
    setSheetOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    const parsed = inputValue.trim() === '' ? null : Number(inputValue)
    if (parsed !== null && (!parsed || parsed <= 0)) {
      setSubmitting(false)
      setFormError('Ingresa un monto válido, mayor a 0, o deja vacío para calcularlo automáticamente.')
      return
    }
    const result = await setAnnualExpense(parsed)
    setSubmitting(false)
    if (result.error) {
      setFormError(result.error)
      return
    }
    setSheetOpen(false)
  }

  if (autoAnnualExpense === 0 && annualExpenseTarget === null) {
    return (
      <div className="mb-6 rounded-card border border-border-default bg-surface-elevated p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-text-tertiary">Tu número de libertad financiera</p>
        <p className="mt-2 text-sm text-text-secondary">
          Registra al menos un mes de gastos para calcular cuánto patrimonio necesitas para ser libre financieramente.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.02, ease: 'easeOut' }}
      className="mb-6 rounded-card border border-border-default bg-surface-elevated p-6 shadow-md"
    >
      <div className="mb-1 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-text-tertiary">
          <Compass size={14} />
          Tu número de libertad financiera
        </p>
        <button
          type="button"
          onClick={openSheet}
          aria-label="Ajustar tu gasto anual objetivo"
          className="text-text-tertiary hover:text-brand-primary"
        >
          <PencilSimple size={16} />
        </button>
      </div>

      <p className="font-mono text-3xl font-semibold text-text-primary">{formatCurrency(freedomNumber)}</p>
      <p className="mt-1 text-xs text-text-secondary">
        Con {formatCurrency(annualExpense)} de gasto anual{annualExpenseTarget === null ? ' (calculado de tu historial)' : ' (tu meta personalizada)'}, a una tasa de retiro del 4%.
      </p>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-sm">
          <span className="font-medium text-text-primary">{progress.toFixed(1)}% del camino</span>
          <span className="text-text-secondary">{formatCurrency(currentNetWorth)}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressRaw}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-brand-secondary"
          />
        </div>
      </div>

      <p className="mt-3 text-sm text-text-secondary">
        {progressRaw >= 100
          ? '🎉 Ya alcanzaste tu número de libertad financiera.'
          : yearsToGo !== null
            ? `A tu ritmo actual de ahorro, lo alcanzarías en aproximadamente ${Math.ceil(yearsToGo)} ${Math.ceil(yearsToGo) === 1 ? 'año' : 'años'}.`
            : 'Necesitas ahorrar más de lo que gastas para ver una proyección de años.'}
      </p>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Tu gasto anual objetivo">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-text-secondary">
            Por defecto calculamos tu gasto anual con el promedio de tus últimos meses (
            {formatCurrency(autoAnnualExpense)}). Si tu estilo de vida al ser libre financieramente sería distinto,
            personalízalo aquí.
          </p>
          <div>
            <label htmlFor="annualExpense" className="mb-1 block text-sm font-medium text-text-secondary">
              Gasto anual objetivo (S/) — deja vacío para calcularlo automático
            </label>
            <input
              id="annualExpense"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={formatCurrency(autoAnnualExpense)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 font-mono text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          {formError && (
            <p role="alert" className="text-sm text-error">
              {formError}
            </p>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={submitting}
            className="w-full rounded-control bg-brand-primary py-2.5 font-medium text-text-inverse disabled:opacity-50"
          >
            {submitting ? 'Guardando…' : 'Guardar'}
          </motion.button>
        </form>
      </BottomSheet>
    </motion.div>
  )
}
