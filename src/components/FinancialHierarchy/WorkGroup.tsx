import React, { useState } from 'react'
import { HierarchicalWorkGroup } from '../../types/financialHierarchy'
import { CollapsibleHeader, FinancialTotals } from './shared'
import { PositionGroup } from './PositionGroup'

interface WorkGroupProps {
  group: HierarchicalWorkGroup
  onItemQuantityChange: (itemId: string, newQuantity: number) => void
  onSelectMotor: (itemId: string) => void
}

export const WorkGroup: React.FC<WorkGroupProps> = ({
  group,
  onItemQuantityChange,
  onSelectMotor,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="border-l-4 border-blue-400 pl-4">
      <CollapsibleHeader
        isExpanded={isExpanded}
        toggle={() => setIsExpanded(!isExpanded)}
        className="py-2 px-2 hover:bg-blue-50 rounded"
      >
        <h2 className="text-sm font-medium text-gray-800 flex-grow min-w-0">
          {group.workGroup}
        </h2>
        <FinancialTotals
          income={group.totalIncome}
          expense={group.totalExpense}
          profit={group.totalProfit}
        />
      </CollapsibleHeader>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-4">
          {group.positions.map((pos) => (
            <PositionGroup
              key={pos.id}
              group={pos}
              onItemQuantityChange={onItemQuantityChange}
              onSelectMotor={onSelectMotor}
            />
          ))}
        </div>
      )}
    </div>
  )
}
