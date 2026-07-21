import { useMemo, useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Plus, ArrowsLeftRight, TrendUp, TrendDown, Trash } from '@phosphor-icons/react'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import BottomSheet from '../components/BottomSheet'
import EmptyState from '../components/EmptyState'
import { formatCurrency, formatDate, todayIsoDate } from '../lib/format'
import type { CategoryType } from '../lib/types'

type Filter = 'all' | CategoryType

export default function Transacciones() {
  const { transactions, loading, error, addTransaction, removeTransaction } = useTransactions()
  const { categories, addCategory } = useCategories()
  const [filter, setFilter] = useState<Filter>('all')
  const [sheetOpen, setSheetOpen] = useState(false)

  const [type, setType] = useState<CategoryType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayIsoDate())
  const [newCategoryName, setNewCategoryName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const filteredCategories = categories.filter((c) => c.type === type)
  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter)

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof filtered>()
    for (const t of filtered) {
      const list = groups.get(t.date) ?? []
      list.push(t)
      groups.set(t.date, list)
    }
    return Array.from(groups.entries())
  }, [filtered])

  function openSheet() {
    setFormError(null)
    setAmount('')
    setDescription('')
    setDate(todayIsoDate())
    setCategoryId('')
    setSheetOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const parsedAmount = Number(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      setFormError('Ingresa un monto válido, mayor a 0.')
      return
    }
    setSubmitting(true)
    let finalCategoryId: string | null = categoryId || null
    if (!finalCategoryId && newCategoryName.trim()) {
      const result = await addCategory(newCategoryName.trim(), type)
      if (result.error) {
        setSubmitting(false)
        setFormError(result.error)
        return
      }
      finalCategoryId = result.id
    }
    const result = await addTransaction({
      type,
      amount: parsedAmount,
      category_id: finalCategoryId,
      description: description.trim() || null,
      date,
    })
    setSubmitting(false)
    if (result.error) {
      setFormError(result.error)
      return
    }
    setNewCategoryName('')
    setSheetOpen(false)
  }

  function categoryName(id: string | null) {
    if (!id) return 'Sin categoría'
    return categories.find((c) => c.id === id)?.name ?? 'Sin categoría'
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-text-primary">Movimientos</h1>
        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          onClick={openSheet}
          aria-label="Registrar movimiento"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-text-inverse shadow-md"
        >
          <Plus size={22} weight="bold" />
        </motion.button>
      </div>

      <div className="mb-5 flex gap-2">
        {(['all', 'income', 'expense'] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-brand-primary text-text-inverse'
                : 'border border-border-default bg-surface-elevated text-text-secondary'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'income' ? 'Ingresos' : 'Gastos'}
          </button>
        ))}
      </div>

      {loading && <p className="py-8 text-center text-text-secondary">Cargando…</p>}
      {error && <p className="py-4 text-center text-error">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={<ArrowsLeftRight size={32} weight="duotone" />}
          title="Todavía no registras movimientos"
          description="Anota tu primer ingreso o gasto y empieza a ver el rumbo de tu dinero."
          actionLabel="Registrar movimiento"
          onAction={openSheet}
        />
      )}

      <div className="space-y-6 pb-4">
        {grouped.map(([date, items]) => (
          <div key={date}>
            <p className="mb-2 font-mono text-xs uppercase tracking-wide text-text-tertiary">
              {formatDate(date)}
            </p>
            <ul className="space-y-2">
              {items.map((t, i) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.3) }}
                  className="flex items-center justify-between rounded-card border border-border-default bg-surface-elevated px-4 py-3 shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        t.type === 'income' ? 'bg-success-soft text-success' : 'bg-error-soft text-error'
                      }`}
                    >
                      {t.type === 'income' ? <TrendUp size={18} weight="bold" /> : <TrendDown size={18} weight="bold" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {categoryName(t.category_id)}
                      </p>
                      {t.description && (
                        <p className="truncate text-xs text-text-secondary">{t.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`font-mono text-sm font-medium ${
                        t.type === 'income' ? 'text-success' : 'text-error'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTransaction(t.id)}
                      aria-label="Borrar movimiento"
                      className="text-text-tertiary hover:text-error"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Registrar movimiento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {(['expense', 'income'] as CategoryType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t)
                  setCategoryId('')
                }}
                className={`flex-1 rounded-control py-2.5 text-sm font-medium ${
                  type === t
                    ? t === 'income'
                      ? 'bg-success text-text-inverse'
                      : 'bg-error text-text-inverse'
                    : 'border border-border-default text-text-secondary'
                }`}
              >
                {t === 'income' ? 'Ingreso' : 'Gasto'}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="amount" className="mb-1 block text-sm font-medium text-text-secondary">
              Monto (S/)
            </label>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 font-mono text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-text-secondary">
              Categoría
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            >
              <option value="">Sin categoría</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categoryId === '' && (
              <input
                type="text"
                placeholder="O crea una categoría nueva (opcional)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="mt-2 w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            )}
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-text-secondary">
              Nota (opcional)
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-medium text-text-secondary">
              Fecha
            </label>
            <input
              id="date"
              type="date"
              required
              value={date}
              max={todayIsoDate()}
              onChange={(e) => setDate(e.target.value)}
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
            {submitting ? 'Guardando…' : 'Guardar movimiento'}
          </motion.button>
        </form>
      </BottomSheet>
    </div>
  )
}
