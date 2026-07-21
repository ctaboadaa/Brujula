import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useUserSettings() {
  const [annualExpenseTarget, setAnnualExpenseTarget] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('user_settings').select('annual_expense_target').maybeSingle()
    setAnnualExpenseTarget(data?.annual_expense_target ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function setAnnualExpense(value: number | null) {
    const { error } = await supabase
      .from('user_settings')
      .upsert({ annual_expense_target: value, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error) return { error: 'No pudimos guardar tu meta.' }
    await refetch()
    return { error: null }
  }

  return { annualExpenseTarget, loading, setAnnualExpense }
}
