export type CategoryType = 'income' | 'expense'

export interface Category {
  id: string
  user_id: string
  name: string
  type: CategoryType
  icon: string | null
  monthly_budget: number | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: CategoryType
  amount: number
  category_id: string | null
  description: string | null
  date: string
  created_at: string
}

export type AssetType = 'cash' | 'bank_account' | 'real_estate' | 'vehicle' | 'other'

export interface Asset {
  id: string
  user_id: string
  name: string
  type: AssetType
  value: number
  updated_at: string
  created_at: string
}

export type LiabilityType = 'credit_card' | 'loan' | 'mortgage' | 'other'

export interface Liability {
  id: string
  user_id: string
  name: string
  type: LiabilityType
  amount: number
  updated_at: string
  created_at: string
}

export type InvestmentType = 'stock' | 'crypto' | 'etf' | 'fund' | 'other'

export interface Investment {
  id: string
  user_id: string
  symbol: string
  name: string
  type: InvestmentType
  quantity: number
  avg_cost: number | null
  created_at: string
}

export interface PriceCache {
  symbol: string
  type: InvestmentType
  price: number
  currency: string
  fetched_at: string
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  cash: 'Efectivo',
  bank_account: 'Cuenta bancaria',
  real_estate: 'Inmueble',
  vehicle: 'Vehículo',
  other: 'Otro',
}

export const LIABILITY_TYPE_LABELS: Record<LiabilityType, string> = {
  credit_card: 'Tarjeta de crédito',
  loan: 'Préstamo',
  mortgage: 'Hipoteca',
  other: 'Otro',
}

export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  stock: 'Acción',
  crypto: 'Cripto',
  etf: 'ETF',
  fund: 'Fondo',
  other: 'Otro',
}
