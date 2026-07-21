import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Plus, Target, Trash, CheckCircle } from '@phosphor-icons/react'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import BottomSheet from '../components/BottomSheet'
import EmptyState from '../components/EmptyState'
import { formatCurrency, formatDate } from '../lib/format'

export default function SavingsGoals() {
  const { goals, loading, addGoal, contribute, removeGoal } = useSavingsGoals()
  const [createOpen, setCreateOpen] = useState(false)
  const [contributeId, setContributeId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [contributionAmount, setContributionAmount] = useState('')
  const [contributionError, setContributionError] = useState<string | null>(null)
  const [contributing, setContributing] = useState(false)

  function openCreate() {
    setName('')
    setTargetAmount('')
    setCurrentAmount('')
    setTargetDate('')
    setFormError(null)
    setCreateOpen(true)
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const parsedTarget = Number(targetAmount)
    const parsedCurrent = currentAmount.trim() === '' ? 0 : Number(currentAmount)
    if (!name.trim()) {
      setFormError('Ponle un nombre a tu meta.')
      return
    }
    if (!parsedTarget || parsedTarget <= 0) {
      setFormError('Ingresa un monto objetivo válido, mayor a 0.')
      return
    }
    setSubmitting(true)
    const result = await addGoal({
      name: name.trim(),
      target_amount: parsedTarget,
      current_amount: parsedCurrent,
      target_date: targetDate || null,
    })
    setSubmitting(false)
    if (result.error) {
      setFormError(result.error)
      return
    }
    setCreateOpen(false)
  }

  function openContribute(id: string) {
    setContributionAmount('')
    setContributionError(null)
    setContributeId(id)
  }

  async function handleContribute(e: FormEvent) {
    e.preventDefault()
    setContributionError(null)
    const parsed = Number(contributionAmount)
    if (!parsed || parsed === 0) {
      setContributionError('Ingresa un monto válido (puede ser negativo si quieres restar).')
      return
    }
    if (!contributeId) return
    setContributing(true)
    const result = await contribute(contributeId, parsed)
    setContributing(false)
    if (result.error) {
      setContributionError(result.error)
      return
    }
    setContributeId(null)
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-end">
        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          onClick={openCreate}
          aria-label="Crear meta de ahorro"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-text-inverse shadow-md"
        >
          <Plus size={22} weight="bold" />
        </motion.button>
      </div>

      {loading && <p className="py-8 text-center text-text-secondary">Cargando…</p>}

      {!loading && goals.length === 0 && (
        <EmptyState
          icon={<Target size={32} weight="duotone" />}
          title="Aún no tienes metas de ahorro"
          description="Crea una meta concreta (fondo de emergencia, vacaciones) y ve tu progreso."
          actionLabel="Crear meta"
          onAction={openCreate}
        />
      )}

      <ul className="space-y-3 pb-4">
        {goals.map((g, i) => {
          const pct = Math.min(100, (g.current_amount / g.target_amount) * 100)
          const reached = pct >= 100
          return (
            <motion.li
              key={g.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.3) }}
              className="rounded-card border border-border-default bg-surface-elevated px-4 py-3 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {reached && <CheckCircle size={16} weight="fill" className="text-success" />}
                  <p className="text-sm font-medium text-text-primary">{g.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeGoal(g.id)}
                  aria-label="Borrar meta"
                  className="text-text-tertiary hover:text-error"
                >
                  <Trash size={16} />
                </button>
              </div>

              <div className="mb-1 flex justify-between text-xs text-text-secondary">
                <span className="font-mono">
                  {formatCurrency(g.current_amount)} / {formatCurrency(g.target_amount)}
                </span>
                <span>{pct.toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${reached ? 'bg-success' : 'bg-brand-secondary'}`}
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                {g.target_date ? (
                  <span className="text-xs text-text-tertiary">Meta: {formatDate(g.target_date)}</span>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => openContribute(g.id)}
                  className="text-xs font-medium text-brand-primary underline underline-offset-4"
                >
                  Agregar aporte
                </button>
              </div>
            </motion.li>
          )
        })}
      </ul>

      <BottomSheet open={createOpen} onClose={() => setCreateOpen(false)} title="Crear meta de ahorro">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="goalName" className="mb-1 block text-sm font-medium text-text-secondary">
              Nombre
            </label>
            <input
              id="goalName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Fondo de emergencia"
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div>
            <label htmlFor="targetAmount" className="mb-1 block text-sm font-medium text-text-secondary">
              Monto objetivo (S/)
            </label>
            <input
              id="targetAmount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 font-mono text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div>
            <label htmlFor="currentAmount" className="mb-1 block text-sm font-medium text-text-secondary">
              Ya tienes ahorrado (S/, opcional)
            </label>
            <input
              id="currentAmount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 font-mono text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div>
            <label htmlFor="targetDate" className="mb-1 block text-sm font-medium text-text-secondary">
              Fecha objetivo (opcional)
            </label>
            <input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
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
            {submitting ? 'Guardando…' : 'Crear meta'}
          </motion.button>
        </form>
      </BottomSheet>

      <BottomSheet open={contributeId !== null} onClose={() => setContributeId(null)} title="Agregar aporte">
        <form onSubmit={handleContribute} className="space-y-4">
          <div>
            <label htmlFor="contribution" className="mb-1 block text-sm font-medium text-text-secondary">
              Monto (S/) — usa un número negativo para restar
            </label>
            <input
              id="contribution"
              type="number"
              inputMode="decimal"
              step="0.01"
              autoFocus
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 font-mono text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          {contributionError && (
            <p role="alert" className="text-sm text-error">
              {contributionError}
            </p>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={contributing}
            className="w-full rounded-control bg-brand-primary py-2.5 font-medium text-text-inverse disabled:opacity-50"
          >
            {contributing ? 'Guardando…' : 'Guardar aporte'}
          </motion.button>
        </form>
      </BottomSheet>
    </div>
  )
}
