import { useState } from 'react'
import { Tag, Trash, Check } from '@phosphor-icons/react'
import { useCategories } from '../hooks/useCategories'
import BottomSheet from '../components/BottomSheet'
import type { Category } from '../lib/types'

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const { removeCategory, renameCategory } = useCategories()
  const [open, setOpen] = useState(false)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const income = categories.filter((c) => c.type === 'income')
  const expense = categories.filter((c) => c.type === 'expense')

  function openSheet() {
    const initial: Record<string, string> = {}
    for (const c of categories) initial[c.id] = c.name
    setEdits(initial)
    setError(null)
    setOpen(true)
  }

  async function saveRow(id: string) {
    const newName = edits[id]?.trim() ?? ''
    if (!newName) {
      setError('El nombre no puede quedar vacío.')
      return
    }
    setError(null)
    setSavingId(id)
    const result = await renameCategory(id, newName)
    setSavingId(null)
    if (result.error) setError(result.error)
  }

  function renderGroup(title: string, list: Category[]) {
    if (list.length === 0) return null
    return (
      <div className="mb-4">
        <p className="mb-2 text-xs uppercase tracking-wide text-text-tertiary">{title}</p>
        <ul className="space-y-2">
          {list.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <input
                type="text"
                value={edits[c.id] ?? ''}
                onChange={(e) => setEdits((prev) => ({ ...prev, [c.id]: e.target.value }))}
                className="flex-1 rounded-control border border-border-default bg-surface-secondary px-2 py-1.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
              <button
                type="button"
                onClick={() => saveRow(c.id)}
                disabled={savingId === c.id}
                aria-label={`Guardar nombre de ${c.name}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-text-inverse disabled:opacity-50"
              >
                <Check size={14} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => removeCategory(c.id)}
                aria-label={`Borrar categoría ${c.name}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center text-text-tertiary hover:text-error"
              >
                <Trash size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        aria-label="Gestionar categorías"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border-default bg-surface-elevated text-text-secondary"
      >
        <Tag size={20} />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Gestionar categorías">
        {categories.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Todavía no tienes categorías. Se crean al vuelo cuando registras un movimiento.
          </p>
        ) : (
          <>
            {renderGroup('Ingresos', income)}
            {renderGroup('Gastos', expense)}
            <p className="mt-2 text-xs text-text-tertiary">
              Borrar una categoría no borra sus movimientos — solo quedan como "Sin categoría".
            </p>
            {error && (
              <p role="alert" className="mt-2 text-sm text-error">
                {error}
              </p>
            )}
          </>
        )}
      </BottomSheet>
    </>
  )
}
