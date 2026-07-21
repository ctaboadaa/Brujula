import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CategoryType, Transaction } from '../lib/types'

export interface NewTransaction {
  type: CategoryType
  amount: number
  category_id: string | null
  description: string | null
  date: string
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) {
      setError('No pudimos cargar tus transacciones.')
    } else {
      setTransactions(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addTransaction(input: NewTransaction) {
    const { error } = await supabase.from('transactions').insert(input)
    if (error) return { error: 'No pudimos guardar el movimiento. Revisa los datos e intenta de nuevo.' }
    await refetch()
    return { error: null }
  }

  async function updateTransaction(id: string, input: Partial<NewTransaction>) {
    const { error } = await supabase.from('transactions').update(input).eq('id', id)
    if (error) return { error: 'No pudimos guardar los cambios.' }
    await refetch()
    return { error: null }
  }

  async function removeTransaction(id: string) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) return { error: 'No pudimos borrar el movimiento.' }
    await refetch()
    return { error: null }
  }

  return { transactions, loading, error, addTransaction, updateTransaction, removeTransaction, refetch }
}
