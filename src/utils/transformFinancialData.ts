import {
  FinancialRow,
  HierarchicalOrderGroup,
  HierarchicalWorkGroup,
  HierarchicalPositionGroup,
  HierarchicalItem,
} from '../types/financialHierarchy'

/**
 * Extracts the base name from an item name by removing the _ID_ suffix.
 */
const getBaseItemName = (itemName: string): string => {
  return itemName.split('_ID_')[0].trim()
}

/**
 * Processes a flat list of financial rows into a stacked list of hierarchical items.
 * Identical items are merged, and their quantities are summed.
 */
const processItems = (items: FinancialRow[]): HierarchicalItem[] => {
  const itemMap = new Map<string, HierarchicalItem>()
  for (const item of items) {
    if (itemMap.has(item.itemName)) {
      const existing = itemMap.get(item.itemName)!
      existing.quantity += item.quantity
      existing.totalAmount += item.amount * item.quantity
    } else {
      itemMap.set(item.itemName, {
        id: item.id,
        itemName: item.itemName,
        quantity: item.quantity,
        totalAmount: item.amount * item.quantity,
        unitPrice: item.amount,
      })
    }
  }
  return Array.from(itemMap.values())
}

/**
 * Transforms a flat array of financial data into a 5-level hierarchical structure.
 */
export const transformFinancialData = (
  rows: FinancialRow[],
): HierarchicalOrderGroup[] => {
  // Level 0 -> Level 1 -> Level 2 Grouping
  const orderMap = new Map<
    number, // positionNumber
    {
      orderName: string // serviceName
      workGroupMap: Map<
        string, // workGroup
        Map<string, { incomeItems: FinancialRow[]; expenseItems: FinancialRow[] }> // baseItemName
      >
    }
  >()

  for (const row of rows) {
    const baseItemName = getBaseItemName(row.itemName)

    if (!orderMap.has(row.positionNumber)) {
      orderMap.set(row.positionNumber, {
        orderName: row.serviceName, // Store the name
        workGroupMap: new Map(),
      })
    }
    const orderData = orderMap.get(row.positionNumber)!
    const workGroupMap = orderData.workGroupMap

    if (!workGroupMap.has(row.workGroup)) {
      workGroupMap.set(row.workGroup, new Map())
    }
    const positionMap = workGroupMap.get(row.workGroup)!

    if (!positionMap.has(baseItemName)) {
      positionMap.set(baseItemName, { incomeItems: [], expenseItems: [] })
    }
    const transactionGroups = positionMap.get(baseItemName)!

    if (row.transactionType === 'Доходы') {
      transactionGroups.incomeItems.push(row)
    } else {
      transactionGroups.expenseItems.push(row)
    }
  }

  // Build the final hierarchical structure from the maps
  const result: HierarchicalOrderGroup[] = []

  for (const [
    positionNumber,
    { orderName, workGroupMap },
  ] of orderMap.entries()) {
    const order: HierarchicalOrderGroup = {
      id: String(positionNumber),
      orderNumber: positionNumber,
      orderName: orderName,
      workGroups: [],
      totalIncome: 0,
      totalExpense: 0,
      totalProfit: 0,
    }

    for (const [workGroupName, positionMap] of workGroupMap.entries()) {
      const workGroup: HierarchicalWorkGroup = {
        id: workGroupName,
        workGroup: workGroupName,
        positions: [],
        totalIncome: 0,
        totalExpense: 0,
        totalProfit: 0,
      }

      for (const [
        baseItemName,
        { incomeItems, expenseItems },
      ] of positionMap.entries()) {
        const processedIncomes = processItems(incomeItems)
        const processedExpenses = processItems(expenseItems)

        const totalIncome = processedIncomes.reduce(
          (sum, item) => sum + item.totalAmount,
          0,
        )
        const totalExpense = processedExpenses.reduce(
          (sum, item) => sum + item.totalAmount,
          0,
        )

        const positionGroup: HierarchicalPositionGroup = {
          id: `${workGroupName}-${baseItemName}`,
          baseItemName,
          incomeGroup: {
            type: 'income',
            items: processedIncomes,
            totalAmount: totalIncome,
          },
          expenseGroup: {
            type: 'expense',
            items: processedExpenses,
            totalAmount: totalExpense,
          },
          totalIncome,
          totalExpense,
          totalProfit: totalIncome - totalExpense,
        }

        workGroup.positions.push(positionGroup)
        workGroup.totalIncome += totalIncome
        workGroup.totalExpense += totalExpense
      }

      workGroup.totalProfit = workGroup.totalIncome - workGroup.totalExpense
      order.workGroups.push(workGroup)
      order.totalIncome += workGroup.totalIncome
      order.totalExpense += workGroup.totalExpense
    }

    order.totalProfit = order.totalIncome - order.totalExpense
    order.workGroups.sort((a, b) => a.workGroup.localeCompare(b.workGroup))
    result.push(order)
  }

  return result.sort((a, b) => a.orderNumber - b.orderNumber)
}
