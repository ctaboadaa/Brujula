import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendUp, TrendDown } from '@phosphor-icons/react'
import type { NetWorthSnapshot } from '../hooks/useNetWorthHistory'
import { formatCurrency, formatDate } from '../lib/format'

type Range = '7d' | '6m'

function filterByRange(snapshots: NetWorthSnapshot[], range: Range): NetWorthSnapshot[] {
  const days = range === '7d' ? 7 : 185
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceIso = since.toISOString().slice(0, 10)
  return snapshots.filter((s) => s.date >= sinceIso)
}

export default function NetWorthTrend({ snapshots }: { snapshots: NetWorthSnapshot[] }) {
  const [range, setRange] = useState<Range>('7d')
  const data = useMemo(() => filterByRange(snapshots, range), [snapshots, range])

  if (snapshots.length < 2) {
    return (
      <div className="rounded-card border border-border-default bg-surface-elevated p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-text-tertiary">Tendencia de tu patrimonio</p>
        <p className="mt-2 text-sm text-text-secondary">
          Estamos empezando a registrar tu historia. Vuelve mañana y verás cómo cambia tu patrimonio en el tiempo.
        </p>
      </div>
    )
  }

  const first = data[0]?.net_worth ?? 0
  const last = data[data.length - 1]?.net_worth ?? 0
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
          {(['7d', '6m'] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                range === r ? 'bg-brand-primary text-text-inverse' : 'text-text-secondary hover:bg-surface-secondary'
              }`}
            >
              {r === '7d' ? '7 días' : '6 meses'}
            </button>
          ))}
        </div>
      </div>

      {data.length < 2 ? (
        <p className="text-sm text-text-secondary">Necesitas más días registrados para ver esta vista.</p>
      ) : (
        <>
          <p className={`mb-2 flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-success' : 'text-error'}`}>
            {change >= 0 ? <TrendUp size={16} weight="bold" /> : <TrendDown size={16} weight="bold" />}
            {change >= 0 ? '+' : ''}
            {formatCurrency(change)} ({changePct >= 0 ? '+' : ''}
            {changePct.toFixed(1)}%) {range === '7d' ? 'en 7 días' : 'en 6 meses'}
          </p>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1F3A5F" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1F3A5F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => formatDate(String(label))}
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
                  stroke="#1F3A5F"
                  strokeWidth={2}
                  fill="url(#netWorthFill)"
                  animationDuration={600}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <table className="sr-only">
            <caption>Patrimonio neto por fecha</caption>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Patrimonio neto</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date}>
                  <td>{formatDate(d.date)}</td>
                  <td>{formatCurrency(d.net_worth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </motion.div>
  )
}
