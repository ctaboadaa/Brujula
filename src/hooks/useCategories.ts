import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category, CategoryType } from '../lib/types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    if (error) {
      setError('No pudimos cargar las categorías.')
    } else {
      setCategories(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addCategory(name: string, type: CategoryType) {
    const { data, error } = await supabase.from('categories').insert({ name, type }).select().single()
    if (error) return { error: 'No pudimos crear la categoría.', id: null }
    await refetch()
    return { error: null, id: data.id as string }
  }

  async function removeCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return { error: 'No pudimos borrar la categoría.' }
    await refetch()
    return { error: null }
  }

  async function setCategoryBudget(id: string, monthlyBudget: number | null) {
    const { error } = await supabase.from('categories').update({ monthly_budget: monthlyBudget }).eq('id', id)
    if (error) return { error: 'No pudimos guardar el presupuesto.' }
    await refetch()
    return { error: null }
  }

  return { categories, loading, error, addCategory, removeCategory, setCategoryBudget, refetch }
}
