import React, { useState } from 'react'
import { RepairGroup, AcceptanceItem } from '../../types/acceptance'
import { SubItemRow } from './SubItemRow'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Edit,
  MoreVertical,
  Trash2,
} from 'lucide-react'

interface RepairItemCardProps {
  group: RepairGroup
  index: number
  onUpdate: (updatedGroup: RepairGroup) => void
  onDeleteGroup: (id: string) => void
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount)

const calculateTotals = (items: AcceptanceItem[]) => {
  let income = 0
  let expense = 0

  const processItems = (list: AcceptanceItem[]) => {
    list.forEach((item) => {
      const total = item.price * item.quantity
      if (item.is_income) {
        income += total
      } else {
        expense += total
      }
      processItems(item.children)
    })
  }

  processItems(items)
  return { income, expense, profit: income - expense }
}

export const RepairItemCard: React.FC<RepairItemCardProps> = ({
  group,
  index,
  onUpdate,
  onDeleteGroup,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  // Recalculate totals based on current children state
  const { income, expense, profit } = calculateTotals(group.mainItem.children)

  const handleUpdateItem = (itemId: string, updates: Partial<AcceptanceItem>) => {
    const updateChildren = (items: AcceptanceItem[]): AcceptanceItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return { ...item, ...updates }
        }
        return { ...item, children: updateChildren(item.children) }
      })
    }

    const updatedChildren = updateChildren(group.mainItem.children)
    const updatedGroup: RepairGroup = {
      ...group,
      mainItem: { ...group.mainItem, children: updatedChildren },
    }
    onUpdate(updatedGroup)
  }

  const handleQuantityChange = (itemId: string, delta: number) => {
    handleUpdateItem(itemId, { quantity: Math.max(1, group.mainItem.children.find(i => i.id === itemId)?.quantity || 1) + delta })
  }

  const handleDeleteItem = (itemId: string) => {
    const filterChildren = (items: AcceptanceItem[]): AcceptanceItem[] => {
      return items
        .filter((item) => item.id !== itemId)
        .map((item) => ({ ...item, children: filterChildren(item.children) }))
    }

    const updatedChildren = filterChildren(group.mainItem.children)
    const updatedGroup: RepairGroup = {
      ...group,
      mainItem: { ...group.mainItem, children: updatedChildren },
    }
    onUpdate(updatedGroup)
  }

  const renderSubItems = (items: AcceptanceItem[]) => {
    return items.map((item) => (
      <React.Fragment key={item.id}>
        {item.level === 2 ? (
          // Level 2 Group Header
          <div className="bg-indigo-50/50 p-3 mt-2 rounded-lg border border-indigo-100">
            <div className="flex justify-between items-center text-sm font-semibold text-indigo-800">
              <span>{item.description}</span>
              <div className="flex space-x-4 text-gray-600">
                <span className="text-green-600">
                  {formatCurrency(
                    calculateTotals(item.children).income,
                  )}
                </span>
                <span className="text-red-600">
                  {formatCurrency(
                    calculateTotals(item.children).expense,
                  )}
                </span>
                <span className="text-indigo-600">
                  {formatCurrency(
                    calculateTotals(item.children).profit,
                  )}
                </span>
                <button className="text-gray-400 hover:text-indigo-600">
                  <ChevronUp size={16} />
                </button>
              </div>
            </div>
            {/* Render Level 3 children */}
            <div className="mt-2 space-y-1">
              {item.children.map((child) => (
                <SubItemRow
                  key={child.id}
                  item={child}
                  onQuantityChange={handleQuantityChange}
                  onDelete={handleDeleteItem}
                  onUpdateItem={handleUpdateItem} // Passed down
                />
              ))}
            </div>
          </div>
        ) : (
          // Level 3 items are rendered directly inside their Level 2 parent via the logic above
          item.level === 3 && (
            <SubItemRow
              key={item.id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onDelete={handleDeleteItem}
              onUpdateItem={handleUpdateItem} // Passed down
            />
          )
        )}
      </React.Fragment>
    ))
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <span className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full font-bold text-sm">
            {index}
          </span>
          <h3 className="text-lg font-semibold text-gray-800">
            {group.mainItem.description}
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-indigo-600"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Totals and Actions */}
        <div className="flex items-center space-x-6 text-sm">
          {/* Income */}
          <div className="flex items-center space-x-1 text-green-600 font-semibold">
            <span className="text-xs text-gray-500">Доходы:</span>
            <span>{formatCurrency(income)}</span>
          </div>
          {/* Expense */}
          <div className="flex items-center space-x-1 text-red-600 font-semibold">
            <span className="text-xs text-gray-500">Расходы:</span>
            <span>{formatCurrency(expense)}</span>
          </div>
          {/* Profit */}
          <div className="flex items-center space-x-1 text-indigo-600 font-bold">
            <span className="text-xs text-gray-500">Прибыль:</span>
            <span>{formatCurrency(profit)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 text-gray-500">
            <button className="hover:text-indigo-600" title="Редактировать">
              <Edit size={18} />
            </button>
            <button className="hover:text-indigo-600" title="Копировать">
              <Copy size={18} />
            </button>
            <button
              onClick={() => onDeleteGroup(group.id)}
              className="hover:text-red-600"
              title="Удалить группу"
            >
              <Trash2 size={18} />
            </button>
            <button className="hover:text-indigo-600">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          <div className="space-y-3">{renderSubItems(group.mainItem.children)}</div>
        </div>
      )}
    </div>
  )
}
