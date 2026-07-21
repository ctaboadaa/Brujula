import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { todayIsoDate } from '../lib/format'

export interface NetWorthSnapshot {
  date: string
  total_assets: number
  total_investments: number
  total_liabilities: number
  net_worth: number
}

interface Totals {
  totalAssets: number
  totalInvestments: number
  totalLiabilities: number
}

export function useNetWorthHistory() {
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const lastRecorded = useRef<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    const since = new Date()
    since.setDate(since.getDate() - 185)
    const { data, error } = await supabase
      .from('net_worth_snapshots')
      .select('date, total_assets, total_investments, total_liabilities, net_worth')
      .gte('date', since.toISOString().slice(0, 10))
      .order('date', { ascending: true })
    if (!error) setSnapshots(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const recordSnapshot = useCallback(
    async (totals: Totals) => {
      const date = todayIsoDate()
      const key = `${date}:${totals.totalAssets}:${totals.totalInvestments}:${totals.totalLiabilities}`
      if (lastRecorded.current === key) return
      lastRecorded.current = key

      const netWorth = totals.totalAssets + totals.totalInvestments - totals.totalLiabilities
      const { error } = await supabase.from('net_worth_snapshots').upsert(
        {
          date,
          total_assets: totals.totalAssets,
          total_investments: totals.totalInvestments,
          total_liabilities: totals.totalLiabilities,
          net_worth: netWorth,
        },
        { onConflict: 'user_id,date' },
      )
      if (!error) await refetch()
    },
    [refetch],
  )

  return { snapshots, loading, recordSnapshot }
}
