import React, { useState } from 'react'
import { HierarchicalOrderGroup } from '../../types/financialHierarchy'
import { CollapsibleHeader, FinancialTotals } from './shared'
import { WorkGroup } from './WorkGroup'

interface OrderGroupProps {
  order: HierarchicalOrderGroup
  onItemQuantityChange: (itemId: string, newQuantity: number) => void
  onSelectMotor: (itemId: string) => void
}

export const OrderGroup: React.FC<OrderGroupProps> = ({
  order,
  onItemQuantityChange,
  onSelectMotor,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <CollapsibleHeader
        isExpanded={isExpanded}
        toggle={() => setIsExpanded(!isExpanded)}
        className="p-3 hover:bg-gray-50 rounded-t-lg"
      >
        <span className="flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full text-sm font-bold flex-shrink-0">
          {order.orderNumber || '#'}
        </span>
        <h2 className="text-sm font-semibold text-gray-900 flex-grow min-w-0 ml-3">
          {order.orderName || 'Заказ без названия'}
        </h2>
        <FinancialTotals
          income={order.totalIncome}
          expense={order.totalExpense}
          profit={order.totalProfit}
        />
      </CollapsibleHeader>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {order.workGroups.map((wg) => (
            <WorkGroup
              key={wg.id}
              group={wg}
              onItemQuantityChange={onItemQuantityChange}
              onSelectMotor={onSelectMotor}
            />
          ))}
        </div>
      )}
    </div>
  )
}
