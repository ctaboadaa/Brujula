import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Plus, Vault, Trash } from '@phosphor-icons/react'
import { useAssets } from '../hooks/useAssets'
import { useLiabilities } from '../hooks/useLiabilities'
import { useCountUp } from '../hooks/useCountUp'
import BottomSheet from '../components/BottomSheet'
import EmptyState from '../components/EmptyState'
import { formatCurrency } from '../lib/format'
import {
  ASSET_TYPE_LABELS,
  LIABILITY_TYPE_LABELS,
  type AssetType,
  type LiabilityType,
} from '../lib/types'

type Tab = 'assets' | 'liabilities'

export default function Patrimonio() {
  const { assets, loading: loadingAssets, addAsset, removeAsset } = useAssets()
  const { liabilities, loading: loadingLiabilities, addLiability, removeLiability } = useLiabilities()
  const [tab, setTab] = useState<Tab>('assets')
  const [sheetOpen, setSheetOpen] = useState(false)

  const [name, setName] = useState('')
  const [assetType, setAssetType] = useState<AssetType>('bank_account')
  const [liabilityType, setLiabilityType] = useState<LiabilityType>('credit_card')
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0)
  const netWorth = useCountUp(totalAssets - totalLiabilities)

  function openSheet() {
    setName('')
    setValue('')
    setFormError(null)
    setSheetOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const parsedValue = Number(value)
    if (!name.trim()) {
      setFormError('Ponle un nombre.')
      return
    }
    if (!parsedValue || parsedValue <= 0) {
      setFormError('Ingresa un valor válido, mayor a 0.')
      return
    }
    setSubmitting(true)
    const result =
      tab === 'assets'
        ? await addAsset({ name: name.trim(), type: assetType, value: parsedValue })
        : await addLiability({ name: name.trim(), type: liabilityType, amount: parsedValue })
    setSubmitting(false)
    if (result.error) {
      setFormError(result.error)
      return
    }
    setSheetOpen(false)
  }

  const loading = loadingAssets || loadingLiabilities

  return (
    <div className="mx-auto max-w-md px-4 pt-8">
      <h1 className="mb-1 font-display text-2xl font-medium text-text-primary">Patrimonio</h1>
      <p className="mb-5 text-sm text-text-secondary">Lo que tienes menos lo que debes.</p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6 rounded-card border border-border-default bg-surface-elevated p-5 shadow-sm"
      >
        <p className="text-xs uppercase tracking-wide text-text-tertiary">Patrimonio neto</p>
        <p className="mt-1 font-mono text-3xl font-semibold text-text-primary">
          {formatCurrency(netWorth)}
        </p>
        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-success">Activos: {formatCurrency(totalAssets)}</span>
          <span className="text-error">Pasivos: {formatCurrency(totalLiabilities)}</span>
        </div>
      </motion.div>

      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-2">
          {(['assets', 'liabilities'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-brand-primary text-text-inverse'
                  : 'border border-border-default bg-surface-elevated text-text-secondary'
              }`}
            >
              {t === 'assets' ? 'Activos' : 'Pasivos'}
            </button>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          onClick={openSheet}
          aria-label={tab === 'assets' ? 'Agregar activo' : 'Agregar pasivo'}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-text-inverse shadow-md"
        >
          <Plus size={22} weight="bold" />
        </motion.button>
      </div>

      {loading && <p className="py-8 text-center text-text-secondary">Cargando…</p>}

      {!loading && tab === 'assets' && assets.length === 0 && (
        <EmptyState
          icon={<Vault size={32} weight="duotone" />}
          title="Aún no registras activos"
          description="Suma tu efectivo, cuentas bancarias, inmuebles o lo que tengas de valor."
          actionLabel="Agregar activo"
          onAction={openSheet}
        />
      )}
      {!loading && tab === 'liabilities' && liabilities.length === 0 && (
        <EmptyState
          icon={<Vault size={32} weight="duotone" />}
          title="No tienes deudas registradas"
          description="Si tienes tarjetas, préstamos o hipoteca, regístralos para ver tu patrimonio real."
          actionLabel="Agregar pasivo"
          onAction={openSheet}
        />
      )}

      <ul className="space-y-2 pb-4">
        {tab === 'assets'
          ? assets.map((a, i) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.3) }}
                className="flex items-center justify-between rounded-card border border-border-default bg-surface-elevated px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{a.name}</p>
                  <p className="text-xs text-text-secondary">{ASSET_TYPE_LABELS[a.type]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-success">{formatCurrency(a.value)}</span>
                  <button
                    type="button"
                    onClick={() => removeAsset(a.id)}
                    aria-label="Borrar activo"
                    className="text-text-tertiary hover:text-error"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </motion.li>
            ))
          : liabilities.map((l, i) => (
              <motion.li
                key={l.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.3) }}
                className="flex items-center justify-between rounded-card border border-border-default bg-surface-elevated px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{l.name}</p>
                  <p className="text-xs text-text-secondary">{LIABILITY_TYPE_LABELS[l.type]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-error">{formatCurrency(l.amount)}</span>
                  <button
                    type="button"
                    onClick={() => removeLiability(l.id)}
                    aria-label="Borrar pasivo"
                    className="text-text-tertiary hover:text-error"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </motion.li>
            ))}
      </ul>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={tab === 'assets' ? 'Agregar activo' : 'Agregar pasivo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder={tab === 'assets' ? 'Ej. Cuenta BCP' : 'Ej. Tarjeta Interbank'}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div>
            <label htmlFor="type" className="mb-1 block text-sm font-medium text-text-secondary">
              Tipo
            </label>
            {tab === 'assets' ? (
              <select
                id="type"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value as AssetType)}
                className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              >
                {Object.entries(ASSET_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            ) : (
              <select
                id="type"
                value={liabilityType}
                onChange={(e) => setLiabilityType(e.target.value as LiabilityType)}
                className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              >
                {Object.entries(LIABILITY_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="value" className="mb-1 block text-sm font-medium text-text-secondary">
              Valor actual (S/)
            </label>
            <input
              id="value"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
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
    </div>
  )
}
