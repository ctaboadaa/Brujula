import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Liability, LiabilityType } from '../lib/types'

export interface NewLiability {
  name: string
  type: LiabilityType
  amount: number
}

export function useLiabilities() {
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('liabilities')
      .select('*')
      .order('amount', { ascending: false })
    if (error) {
      setError('No pudimos cargar tus deudas.')
    } else {
      setLiabilities(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addLiability(input: NewLiability) {
    const { error } = await supabase.from('liabilities').insert(input)
    if (error) return { error: 'No pudimos guardar la deuda.' }
    await refetch()
    return { error: null }
  }

  async function updateLiability(id: string, input: Partial<NewLiability>) {
    const { error } = await supabase
      .from('liabilities')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: 'No pudimos guardar los cambios.' }
    await refetch()
    return { error: null }
  }

  async function removeLiability(id: string) {
    const { error } = await supabase.from('liabilities').delete().eq('id', id)
    if (error) return { error: 'No pudimos borrar la deuda.' }
    await refetch()
    return { error: null }
  }

  return { liabilities, loading, error, addLiability, updateLiability, removeLiability, refetch }
}
