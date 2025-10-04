import { Motor } from './database'

/**
 * Represents a single item (service, part, or motor) in the Acceptance/UPD document structure.
 * This structure supports hierarchical nesting.
 */
export interface AcceptanceItem {
  // Unique ID for client-side management (can be temporary UUID)
  id: string
  // Description of the item (e.g., 'Ремонт двигателя стандарт')
  description: string
  // Type of item (e.g., 'service', 'part', 'motor')
  item_type: string
  // Nesting level (1 for top-level, 2 for sub-group, 3 for detail)
  level: number
  // Price per unit (can be income or expense)
  price: number
  // Quantity
  quantity: number
  // True if this item represents income (Доходы), False if expense (Расходы)
  is_income: boolean
  // Optional reference to a motor if this item is a motor repair
  motor_id?: string | null
  // Nested items
  children: AcceptanceItem[]
}

/**
 * Represents the state of a top-level repair group (e.g., Repair of Motor X).
 */
export interface RepairGroup {
  id: string
  // The main item being repaired/accepted (Level 1)
  mainItem: AcceptanceItem
  // Total calculated income for this group
  totalIncome: number
  // Total calculated expense for this group
  totalExpense: number
  // Total profit (Income - Expense)
  totalProfit: number
}
