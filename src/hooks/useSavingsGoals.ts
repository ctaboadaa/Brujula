import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { SavingsGoal } from '../lib/types'

export interface NewSavingsGoal {
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
}

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) {
      setError('No pudimos cargar tus metas.')
    } else {
      setGoals(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addGoal(input: NewSavingsGoal) {
    const { error } = await supabase.from('savings_goals').insert(input)
    if (error) return { error: 'No pudimos crear la meta.' }
    await refetch()
    return { error: null }
  }

  async function contribute(id: string, amount: number) {
    const goal = goals.find((g) => g.id === id)
    if (!goal) return { error: 'No encontramos la meta.' }
    const newAmount = Math.max(0, goal.current_amount + amount)
    const { error } = await supabase
      .from('savings_goals')
      .update({ current_amount: newAmount, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: 'No pudimos actualizar la meta.' }
    await refetch()
    return { error: null }
  }

  async function removeGoal(id: string) {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (error) return { error: 'No pudimos borrar la meta.' }
    await refetch()
    return { error: null }
  }

  return { goals, loading, error, addGoal, contribute, removeGoal, refetch }
}
