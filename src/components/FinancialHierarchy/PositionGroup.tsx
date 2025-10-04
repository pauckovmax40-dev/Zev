import React, { useState } from 'react'
import { HierarchicalPositionGroup } from '../../types/financialHierarchy'
import { CollapsibleHeader, FinancialTotals } from './shared'
import { TransactionTypeGroup } from './TransactionTypeGroup'

interface PositionGroupProps {
  group: HierarchicalPositionGroup
  onItemQuantityChange: (itemId: string, newQuantity: number) => void
  onSelectMotor: (itemId: string) => void
}

export const PositionGroup: React.FC<PositionGroupProps> = ({
  group,
  onItemQuantityChange,
  onSelectMotor,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div>
      <CollapsibleHeader
        isExpanded={isExpanded}
        toggle={() => setIsExpanded(!isExpanded)}
        className="py-2 px-2 hover:bg-blue-50 rounded"
      >
        <h3 className="text-sm text-gray-800 flex-grow min-w-0">
          {group.baseItemName}
        </h3>
        <FinancialTotals
          income={group.totalIncome}
          expense={group.totalExpense}
          profit={group.totalProfit}
        />
      </CollapsibleHeader>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-4">
          <TransactionTypeGroup
            group={group.incomeGroup}
            onItemQuantityChange={onItemQuantityChange}
            onSelectMotor={onSelectMotor}
          />
          <TransactionTypeGroup
            group={group.expenseGroup}
            onItemQuantityChange={onItemQuantityChange}
            onSelectMotor={onSelectMotor}
          />
        </div>
      )}
    </div>
  )
}
