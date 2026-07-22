import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Plus, ChartLineUp, Trash, ArrowClockwise, PencilSimple } from '@phosphor-icons/react'
import { useInvestments, type InvestmentWithPrice } from '../hooks/useInvestments'
import { useCountUp } from '../hooks/useCountUp'
import BottomSheet from '../components/BottomSheet'
import EmptyState from '../components/EmptyState'
import { formatCurrency } from '../lib/format'
import { INVESTMENT_TYPE_LABELS, type InvestmentType } from '../lib/types'

function timeAgo(iso: string | null): string {
  if (!iso) return 'sin datos aún'
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60_000)
  if (minutes < 1) return 'justo ahora'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.round(hours / 24)
  return `hace ${days} d`
}

export default function Inversiones() {
  const {
    investments,
    loading,
    error,
    pricesLoading,
    priceError,
    addInvestment,
    updateInvestment,
    removeInvestment,
    refreshPrices,
  } = useInvestments()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [symbol, setSymbol] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<InvestmentType>('stock')
  const [quantity, setQuantity] = useState('')
  const [avgCost, setAvgCost] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const totalValueRaw = investments.reduce((sum, i) => sum + i.currentValuePen, 0)
  const totalValue = useCountUp(totalValueRaw)
  const totalCost = investments.reduce((sum, i) => sum + i.costValuePen, 0)
  const gain = totalValueRaw - totalCost
  const oldestUpdate = investments.reduce<string | null>((oldest, inv) => {
    if (!inv.priceFetchedAt) return oldest
    if (!oldest) return inv.priceFetchedAt
    return inv.priceFetchedAt < oldest ? inv.priceFetchedAt : oldest
  }, null)

  function openSheet() {
    setEditingId(null)
    setSymbol('')
    setName('')
    setType('stock')
    setQuantity('')
    setAvgCost('')
    setFormError(null)
    setSheetOpen(true)
  }

  function openEdit(inv: InvestmentWithPrice) {
    setEditingId(inv.id)
    setSymbol(inv.symbol)
    setName(inv.name)
    setType(inv.type)
    setQuantity(String(inv.quantity))
    setAvgCost(inv.avg_cost !== null ? String(inv.avg_cost) : '')
    setFormError(null)
    setSheetOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const parsedQuantity = Number(quantity)
    if (!symbol.trim() || !name.trim()) {
      setFormError('Ponle un símbolo y un nombre.')
      return
    }
    if (!parsedQuantity || parsedQuantity <= 0) {
      setFormError('Ingresa una cantidad válida, mayor a 0.')
      return
    }
    setSubmitting(true)
    const payload = {
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
      type,
      quantity: parsedQuantity,
      avg_cost: avgCost ? Number(avgCost) : null,
    }
    const result = editingId ? await updateInvestment(editingId, payload) : await addInvestment(payload)
    setSubmitting(false)
    if (result.error) {
      setFormError(result.error)
      return
    }
    setSheetOpen(false)
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-text-primary">Inversiones</h1>
        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          onClick={openSheet}
          aria-label="Agregar inversión"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-text-inverse shadow-md"
        >
          <Plus size={22} weight="bold" />
        </motion.button>
      </div>

      {investments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 rounded-card border border-border-default bg-surface-elevated p-5 shadow-sm"
        >
          <p className="text-xs uppercase tracking-wide text-text-tertiary">Valor del portafolio</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-text-primary">{formatCurrency(totalValue)}</p>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className={gain >= 0 ? 'text-success' : 'text-error'}>
              {gain >= 0 ? '+' : ''}
              {formatCurrency(gain)} vs. costo
            </span>
            <button
              type="button"
              onClick={refreshPrices}
              disabled={pricesLoading}
              className="flex items-center gap-1 text-xs text-text-tertiary hover:text-brand-primary disabled:opacity-50"
            >
              <ArrowClockwise size={14} className={pricesLoading ? 'animate-spin' : ''} />
              última señal: {timeAgo(oldestUpdate)}
            </button>
          </div>
        </motion.div>
      )}

      {priceError && (
        <p className="mb-4 rounded-control bg-warning-soft px-3 py-2 text-sm text-warning">{priceError}</p>
      )}

      {loading && <p className="py-8 text-center text-text-secondary">Cargando…</p>}
      {error && <p className="py-4 text-center text-error">{error}</p>}

      {!loading && !error && investments.length === 0 && (
        <EmptyState
          icon={<ChartLineUp size={32} weight="duotone" />}
          title="Todavía no registras inversiones"
          description="Agrega tus acciones, ETFs o cripto y verás su valor actualizado automáticamente."
          actionLabel="Agregar inversión"
          onAction={openSheet}
        />
      )}

      <ul className="space-y-2 pb-4">
        {investments.map((inv, i) => {
          const gainInv = inv.currentValuePen - inv.costValuePen
          return (
            <motion.li
              key={inv.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.3) }}
              className="rounded-card border border-border-default bg-surface-elevated px-4 py-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold text-text-primary">{inv.symbol}</p>
                  <p className="text-xs text-text-secondary">
                    {inv.name} · {INVESTMENT_TYPE_LABELS[inv.type]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium text-text-primary">
                    {formatCurrency(inv.currentValuePen)}
                  </p>
                  {inv.avg_cost !== null && (
                    <p className={`text-xs ${gainInv >= 0 ? 'text-success' : 'text-error'}`}>
                      {gainInv >= 0 ? '+' : ''}
                      {formatCurrency(gainInv)}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-text-tertiary">
                <span className="font-mono">
                  {inv.quantity} × {inv.priceUsd !== null ? `US$ ${inv.priceUsd.toFixed(2)}` : '—'} · {timeAgo(inv.priceFetchedAt)}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(inv)}
                    aria-label={`Editar ${inv.symbol}`}
                    className="text-text-tertiary hover:text-brand-primary"
                  >
                    <PencilSimple size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeInvestment(inv.id)}
                    aria-label="Borrar inversión"
                    className="text-text-tertiary hover:text-error"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </motion.li>
          )
        })}
      </ul>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingId ? 'Editar inversión' : 'Agregar inversión'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="type" className="mb-1 block text-sm font-medium text-text-secondary">
              Tipo
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as InvestmentType)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            >
              {Object.entries(INVESTMENT_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="symbol" className="mb-1 block text-sm font-medium text-text-secondary">
              Símbolo {type === 'crypto' ? '(ej. BTC, ETH)' : '(ej. AAPL, VOO)'}
            </label>
            <input
              id="symbol"
              type="text"
              required
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 font-mono uppercase text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-text-secondary">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'crypto' ? 'Ej. Bitcoin' : 'Ej. Apple Inc.'}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-text-secondary">
              Cantidad
            </label>
            <input
              id="quantity"
              type="number"
              inputMode="decimal"
              step="any"
              min="0.00000001"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 font-mono text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div>
            <label htmlFor="avgCost" className="mb-1 block text-sm font-medium text-text-secondary">
              Costo promedio por unidad, en US$ (opcional)
            </label>
            <input
              id="avgCost"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
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
            {submitting ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Guardar inversión'}
          </motion.button>
        </form>
      </BottomSheet>
    </div>
  )
}
