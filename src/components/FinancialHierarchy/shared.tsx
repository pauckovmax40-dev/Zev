import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount)

interface CollapsibleHeaderProps {
  isExpanded: boolean
  toggle: () => void
  children: React.ReactNode
  className?: string
}

export const CollapsibleHeader: React.FC<CollapsibleHeaderProps> = ({
  isExpanded,
  toggle,
  children,
  className = '',
}) => (
  <div
    onClick={toggle}
    className={`flex items-center justify-between cursor-pointer transition-all duration-150 ${className}`}
  >
    {children}
    <button className="text-gray-600 hover:text-blue-600 flex-shrink-0 transition-colors ml-2">
      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
    </button>
  </div>
)

interface FinancialTotalsProps {
  income: number
  expense: number
  profit: number
}

export const FinancialTotals: React.FC<FinancialTotalsProps> = ({
  income,
  expense,
  profit,
}) => (
  <div className="flex items-center space-x-3 text-sm ml-auto flex-shrink-0">
    <div className="flex items-center space-x-1">
      <span className="text-xs text-gray-600 font-medium">Д:</span>
      <span className="text-green-700 font-semibold">{formatCurrency(income)}</span>
    </div>
    <div className="flex items-center space-x-1">
      <span className="text-xs text-gray-600 font-medium">Р:</span>
      <span className="text-red-700 font-semibold">{formatCurrency(expense)}</span>
    </div>
    <div className="flex items-center space-x-1">
      <span className="text-xs text-gray-600 font-medium">П:</span>
      <span className="text-blue-700 font-bold">{formatCurrency(profit)}</span>
    </div>
  </div>
)
