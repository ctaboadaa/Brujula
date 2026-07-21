import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Asset, AssetType } from '../lib/types'

export interface NewAsset {
  name: string
  type: AssetType
  value: number
}

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('value', { ascending: false })
    if (error) {
      setError('No pudimos cargar tus activos.')
    } else {
      setAssets(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function addAsset(input: NewAsset) {
    const { error } = await supabase.from('assets').insert(input)
    if (error) return { error: 'No pudimos guardar el activo.' }
    await refetch()
    return { error: null }
  }

  async function updateAsset(id: string, input: Partial<NewAsset>) {
    const { error } = await supabase
      .from('assets')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: 'No pudimos guardar los cambios.' }
    await refetch()
    return { error: null }
  }

  async function removeAsset(id: string) {
    const { error } = await supabase.from('assets').delete().eq('id', id)
    if (error) return { error: 'No pudimos borrar el activo.' }
    await refetch()
    return { error: null }
  }

  return { assets, loading, error, addAsset, updateAsset, removeAsset, refetch }
}
