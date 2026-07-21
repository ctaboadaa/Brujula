export interface Bucket {
  key: string
  label: string
}

const MONTH_SHORT = new Intl.DateTimeFormat('es-PE', { month: 'short' })

/** Últimos N meses calendario (más antiguo primero), ej. clave "2026-07" */
export function lastNMonthKeys(n: number): Bucket[] {
  const now = new Date()
  const months: Bucket[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = MONTH_SHORT.format(d).replace('.', '')
    months.push({ key, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  return months
}

/** Últimos N años calendario (más antiguo primero) */
export function lastNYearKeys(n: number): Bucket[] {
  const currentYear = new Date().getFullYear()
  const years: Bucket[] = []
  for (let i = n - 1; i >= 0; i--) {
    const y = currentYear - i
    years.push({ key: String(y), label: String(y) })
  }
  return years
}

/** Últimas N semanas rodantes de 7 días (más antigua primero) */
export function lastNWeekRanges(n: number): { key: string; label: string; startIso: string; endIso: string }[] {
  const now = new Date()
  const ranges = []
  for (let i = n - 1; i >= 0; i--) {
    const end = new Date(now)
    end.setDate(end.getDate() - i * 7)
    const start = new Date(end)
    start.setDate(start.getDate() - 6)
    const label = `${start.getDate()}-${end.getDate()} ${MONTH_SHORT.format(end).replace('.', '')}`
    ranges.push({
      key: `w${i}`,
      label,
      startIso: start.toISOString().slice(0, 10),
      endIso: end.toISOString().slice(0, 10),
    })
  }
  return ranges
}
