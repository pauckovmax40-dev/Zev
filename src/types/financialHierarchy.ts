/**
 * Represents a single row from the parsed Excel file.
 */
export interface FinancialRow {
  id: string // A unique ID for the row, can be generated
  serviceName: string // e.g., 'Ремонт электродвигателя...'
  itemName: string // e.g., 'Замена подшипника..._ID_...'
  workGroup: string // e.g., '2. Замены расходников'
  transactionType: 'Доходы' | 'Расходы'
  amount: number
  quantity: number
  positionNumber: number // NEW: from 'Номер позиции'
}

/**
 * Level 4: The individual item card.
 * Identical items are stacked (quantity is summed).
 */
export interface HierarchicalItem {
  id: string // Based on full itemName to be unique
  itemName: string
  totalAmount: number
  quantity: number
  unitPrice: number
}

/**
 * Level 3: A group of items, either all income or all expense.
 */
export interface HierarchicalTransactionGroup {
  type: 'income' | 'expense'
  items: HierarchicalItem[]
  totalAmount: number
}

/**
 * Level 2: A group of transactions for a specific base item name.
 */
export interface HierarchicalPositionGroup {
  id: string // Based on baseItemName
  baseItemName: string
  incomeGroup: HierarchicalTransactionGroup
  expenseGroup: HierarchicalTransactionGroup
  totalIncome: number
  totalExpense: number
  totalProfit: number
}

/**
 * Level 1: The group based on workGroup.
 */
export interface HierarchicalWorkGroup {
  id: string // Based on workGroup
  workGroup: string
  positions: HierarchicalPositionGroup[]
  totalIncome: number
  totalExpense: number
  totalProfit: number
}

/**
 * Level 0: The top-level order/service group.
 */
export interface HierarchicalOrderGroup {
  id: string // Based on positionNumber
  orderNumber: number
  orderName: string
  workGroups: HierarchicalWorkGroup[]
  totalIncome: number
  totalExpense: number
  totalProfit: number
}
