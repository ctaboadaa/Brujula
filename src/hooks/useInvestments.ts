import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Investment, InvestmentType } from '../lib/types'

export interface NewInvestment {
  symbol: string
  name: string
  type: InvestmentType
  quantity: number
  avg_cost: number | null
}

interface PriceInfo {
  price: number
  currency: string
  fetched_at: string
}

export interface InvestmentWithPrice extends Investment {
  priceUsd: number | null
  priceFetchedAt: string | null
  currentValuePen: number
  costValuePen: number
}

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [prices, setPrices] = useState<Record<string, PriceInfo>>({})
  const [loading, setLoading] = useState(true)
  const [pricesLoading, setPricesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setError('No pudimos cargar tus inversiones.')
    } else {
      setInvestments(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  const refreshPrices = useCallback(async () => {
    setPricesLoading(true)
    setPriceError(null)
    const { data, error } = await supabase.functions.invoke<{ prices: Record<string, PriceInfo> }>('get-prices')
    if (error || !data) {
      setPriceError('No pudimos actualizar los precios de mercado ahora. Mostramos los últimos que tenemos.')
    } else {
      setPrices(data.prices)
    }
    setPricesLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    if (investments.length > 0) {
      refreshPrices()
    }
  }, [investments.length, refreshPrices])

  async function addInvestment(input: NewInvestment) {
    const { error } = await supabase.from('investments').insert(input)
    if (error) return { error: 'No pudimos guardar la inversión.' }
    await refetch()
    return { error: null }
  }

  async function updateInvestment(id: string, input: Partial<NewInvestment>) {
    const { error } = await supabase.from('investments').update(input).eq('id', id)
    if (error) return { error: 'No pudimos guardar los cambios.' }
    await refetch()
    return { error: null }
  }

  async function removeInvestment(id: string) {
    const { error } = await supabase.from('investments').delete().eq('id', id)
    if (error) return { error: 'No pudimos borrar la inversión.' }
    await refetch()
    return { error: null }
  }

  const usdToPen = prices['USDPEN:other']?.price ?? null

  const withPrices: InvestmentWithPrice[] = investments.map((inv) => {
    const priceInfo = prices[`${inv.symbol}:${inv.type}`]
    const priceUsd = priceInfo?.price ?? inv.avg_cost ?? null
    const fx = usdToPen ?? 1
    return {
      ...inv,
      priceUsd,
      priceFetchedAt: priceInfo?.fetched_at ?? null,
      currentValuePen: priceUsd !== null ? priceUsd * inv.quantity * fx : 0,
      costValuePen: inv.avg_cost !== null ? inv.avg_cost * inv.quantity * fx : 0,
    }
  })

  return {
    investments: withPrices,
    loading,
    error,
    pricesLoading,
    priceError,
    usdToPen,
    addInvestment,
    updateInvestment,
    removeInvestment,
    refreshPrices,
  }
}
