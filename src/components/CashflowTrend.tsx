import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Transaction } from '../lib/types'
import { formatCurrency } from '../lib/format'
import { lastNMonthKeys, lastNWeekRanges } from '../lib/timeBuckets'

type Range = 'month' | '12m'

interface Point {
  key: string
  label: string
  income: number
  expense: number
}

function weeklyPoints(transactions: Transaction[]): Point[] {
  return lastNWeekRanges(5).map((w) => {
    const inWeek = transactions.filter((t) => t.date >= w.startIso && t.date <= w.endIso)
    return {
      key: w.key,
      label: w.label,
      income: inWeek.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: inWeek.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })
}

function monthlyPoints(transactions: Transaction[]): Point[] {
  return lastNMonthKeys(12).map((m) => {
    const inMonth = transactions.filter((t) => t.date.startsWith(m.key))
    return {
      key: m.key,
      label: m.label,
      income: inMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: inMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })
}

export default function CashflowTrend({ transactions }: { transactions: Transaction[] }) {
  const [range, setRange] = useState<Range>('month')
  const data = useMemo(
    () => (range === 'month' ? weeklyPoints(transactions) : monthlyPoints(transactions)),
    [transactions, range],
  )

  const totalIncome = data.reduce((s, d) => s + d.income, 0)
  const totalExpense = data.reduce((s, d) => s + d.expense, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
      className="mb-6 rounded-card border border-border-default bg-surface-elevated p-5 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-text-tertiary">Ingresos y gastos</p>
        <div className="flex gap-1">
          {(['month', '12m'] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                range === r ? 'bg-brand-primary text-text-inverse' : 'text-text-secondary hover:bg-surface-secondary'
              }`}
            >
              {r === 'month' ? 'Este mes' : '12 meses'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex justify-between text-sm">
        <span className="text-success">Ingresos {formatCurrency(totalIncome)}</span>
        <span className="text-error">Gastos {formatCurrency(totalExpense)}</span>
      </div>

      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }} barGap={2}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
            <YAxis hide />
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
            <Bar dataKey="income" name="Ingresos" fill="var(--status-success)" radius={[3, 3, 0, 0]} animationDuration={600} />
            <Bar dataKey="expense" name="Gastos" fill="var(--status-error)" radius={[3, 3, 0, 0]} animationDuration={600} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Ingresos y gastos por {range === 'month' ? 'semana' : 'mes'}</caption>
        <thead>
          <tr>
            <th>{range === 'month' ? 'Semana' : 'Mes'}</th>
            <th>Ingresos</th>
            <th>Gastos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <td>{d.label}</td>
              <td>{formatCurrency(d.income)}</td>
              <td>{formatCurrency(d.expense)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}
