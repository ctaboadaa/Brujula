import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendUp, TrendDown } from '@phosphor-icons/react'
import type { NetWorthSnapshot } from '../hooks/useNetWorthHistory'
import { formatCurrency } from '../lib/format'
import { lastNMonthKeys, lastNYearKeys } from '../lib/timeBuckets'

type Range = '12m' | 'years'

interface Point {
  key: string
  label: string
  net_worth: number
}

function monthlyPoints(snapshots: NetWorthSnapshot[]): Point[] {
  return lastNMonthKeys(12)
    .map((m) => {
      const inMonth = snapshots.filter((s) => s.date.startsWith(m.key))
      const last = inMonth[inMonth.length - 1]
      return last ? { key: m.key, label: m.label, net_worth: last.net_worth } : null
    })
    .filter((p): p is Point => p !== null)
}

function yearlyPoints(snapshots: NetWorthSnapshot[]): Point[] {
  const years = new Set(snapshots.map((s) => s.date.slice(0, 4)))
  return lastNYearKeys(Math.max(years.size, 1))
    .map((y) => {
      const inYear = snapshots.filter((s) => s.date.startsWith(y.key))
      const last = inYear[inYear.length - 1]
      return last ? { key: y.key, label: y.label, net_worth: last.net_worth } : null
    })
    .filter((p): p is Point => p !== null)
}

export default function NetWorthTrend({ snapshots }: { snapshots: NetWorthSnapshot[] }) {
  const [range, setRange] = useState<Range>('12m')
  const data = useMemo(
    () => (range === '12m' ? monthlyPoints(snapshots) : yearlyPoints(snapshots)),
    [snapshots, range],
  )

  if (data.length < 2) {
    return (
      <div className="rounded-card border border-border-default bg-surface-elevated p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-text-tertiary">Tendencia de tu patrimonio</p>
        <p className="mt-2 text-sm text-text-secondary">
          Necesitas historial de al menos 2 {range === '12m' ? 'meses' : 'años'} distintos para ver esta vista. Sigue
          usando la app y el gráfico se irá completando solo.
        </p>
      </div>
    )
  }

  const first = data[0].net_worth
  const last = data[data.length - 1].net_worth
  const change = last - first
  const changePct = first !== 0 ? (change / Math.abs(first)) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-card border border-border-default bg-surface-elevated p-5 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-text-tertiary">Tendencia de tu patrimonio</p>
        <div className="flex gap-1">
          {(['12m', 'years'] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                range === r ? 'bg-brand-primary text-text-inverse' : 'text-text-secondary hover:bg-surface-secondary'
              }`}
            >
              {r === '12m' ? '12 meses' : 'Años'}
            </button>
          ))}
        </div>
      </div>

      <p className={`mb-2 flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-success' : 'text-error'}`}>
        {change >= 0 ? <TrendUp size={16} weight="bold" /> : <TrendDown size={16} weight="bold" />}
        {change >= 0 ? '+' : ''}
        {formatCurrency(change)} ({changePct >= 0 ? '+' : ''}
        {changePct.toFixed(1)}%) {range === '12m' ? 'en el período' : 'entre años'}
      </p>

      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
              }}
            />
            <Area
              type="monotone"
              dataKey="net_worth"
              stroke="var(--brand-primary)"
              strokeWidth={2}
              fill="url(#netWorthFill)"
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Patrimonio neto por {range === '12m' ? 'mes' : 'año'}</caption>
        <thead>
          <tr>
            <th>{range === '12m' ? 'Mes' : 'Año'}</th>
            <th>Patrimonio neto</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <td>{d.label}</td>
              <td>{formatCurrency(d.net_worth)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}
