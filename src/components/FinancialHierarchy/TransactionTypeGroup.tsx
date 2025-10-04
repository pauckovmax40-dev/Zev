import React, { useState } from 'react'
import { HierarchicalTransactionGroup } from '../../types/financialHierarchy'
import { CollapsibleHeader, formatCurrency } from './shared'
import { ItemCard } from './ItemCard'

interface TransactionTypeGroupProps {
  group: HierarchicalTransactionGroup
  onItemQuantityChange: (itemId: string, newQuantity: number) => void
  onSelectMotor: (itemId: string) => void
}

export const TransactionTypeGroup: React.FC<TransactionTypeGroupProps> = ({
  group,
  onItemQuantityChange,
  onSelectMotor,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (group.items.length === 0) {
    return null
  }

  const isIncome = group.type === 'income'
  const headerColor = isIncome
    ? 'bg-green-50 hover:bg-green-100 border-green-300'
    : 'bg-red-50 hover:bg-red-100 border-red-300'
  const textColor = isIncome ? 'text-green-800' : 'text-red-800'

  return (
    <div>
      <CollapsibleHeader
        isExpanded={isExpanded}
        toggle={() => setIsExpanded(!isExpanded)}
        className="py-1.5 px-2 hover:bg-gray-50 rounded"
      >
        <h4 className={`text-sm ${textColor} flex-grow min-w-0`}>
          {isIncome ? 'Доходы' : 'Расходы'}
        </h4>
        <span className={`text-sm font-semibold ${textColor}`}>
          {formatCurrency(group.totalAmount)}
        </span>
      </CollapsibleHeader>

      {isExpanded && (
        <div className="mt-1 space-y-1 pl-4">
          {group.items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onQuantityChange={onItemQuantityChange}
              onSelectMotor={onSelectMotor}
            />
          ))}
        </div>
      )}
    </div>
  )
}
