import { supabase } from '../lib/supabase'
import { HierarchicalOrderGroup } from '../types/financialHierarchy'
import { UPDDocumentItem } from '../types/database'

type DocumentItemPayload = Omit<UPDDocumentItem, 'created_at' | 'id'> & {
  id: string
}

/**
 * Flattens the hierarchical order data into a list of database-ready items.
 */
const flattenHierarchyForDB = (
  order: HierarchicalOrderGroup,
  documentId: string,
  repairOrderId: string,
): DocumentItemPayload[] => {
  const itemsToInsert: DocumentItemPayload[] = []
  let orderIndexCounter = 0

  // Level 0: Order Group
  const orderItem: DocumentItemPayload = {
    id: crypto.randomUUID(),
    document_id: documentId,
    original_order_id: repairOrderId,
    parent_id: null,
    description: order.orderName,
    level: 0,
    item_type: 'order_group',
    is_income: null,
    price: null,
    quantity: null,
    motor_id: null,
    order_index: orderIndexCounter++,
  }
  itemsToInsert.push(orderItem)

  order.workGroups.forEach((workGroup) => {
    // Level 1: Work Group
    const workGroupItem: DocumentItemPayload = {
      id: crypto.randomUUID(),
      document_id: documentId,
      original_order_id: repairOrderId,
      parent_id: orderItem.id,
      description: workGroup.workGroup,
      level: 1,
      item_type: 'work_group',
      is_income: null,
      price: null,
      quantity: null,
      motor_id: null,
      order_index: orderIndexCounter++,
    }
    itemsToInsert.push(workGroupItem)

    workGroup.positions.forEach((position) => {
      // Level 2: Position Group
      const positionItem: DocumentItemPayload = {
        id: crypto.randomUUID(),
        document_id: documentId,
        original_order_id: repairOrderId,
        parent_id: workGroupItem.id,
        description: position.baseItemName,
        level: 2,
        item_type: 'position_group',
        is_income: null,
        price: null,
        quantity: null,
        motor_id: null,
        order_index: orderIndexCounter++,
      }
      itemsToInsert.push(positionItem)

      // Level 3: Income Items
      position.incomeGroup.items.forEach((income) => {
        itemsToInsert.push({
          id: crypto.randomUUID(),
          document_id: documentId,
          original_order_id: repairOrderId,
          parent_id: positionItem.id,
          description: income.itemName,
          level: 3,
          item_type: 'item',
          is_income: true,
          price: income.unitPrice,
          quantity: income.quantity,
          motor_id: null,
          order_index: orderIndexCounter++,
        })
      })

      // Level 3: Expense Items
      position.expenseGroup.items.forEach((expense) => {
        itemsToInsert.push({
          id: crypto.randomUUID(),
          document_id: documentId,
          original_order_id: repairOrderId,
          parent_id: positionItem.id,
          description: expense.itemName,
          level: 3,
          item_type: 'item',
          is_income: false,
          price: expense.unitPrice,
          quantity: expense.quantity,
          motor_id: null,
          order_index: orderIndexCounter++,
        })
      })
    })
  })

  return itemsToInsert
}

/**
 * Saves a set of assembled orders for a given counterparty.
 */
export const saveRepairOrders = async (
  orders: HierarchicalOrderGroup[],
  counterpartyId: string,
): Promise<void> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Пользователь не аутентифицирован.')

  for (const order of orders) {
    // 1. Create the UPD Document
    const { data: docData, error: docError } = await supabase
      .from('upd_documents')
      .insert({
        counterparty_id: counterpartyId,
        document_number: `ЗАКАЗ-${order.orderNumber}-${Date.now()}`,
        status: 'draft',
        user_id: user.id,
        total_income: order.totalIncome,
        total_expense: order.totalExpense,
      })
      .select('id')
      .single()

    if (docError) {
      console.error('Error creating UPD document:', docError)
      throw new Error('Не удалось создать документ УПД.')
    }
    const documentId = docData.id

    // 2. Create the Repair Order
    const { data: repairOrderData, error: repairOrderError } = await supabase
      .from('repair_orders')
      .insert({
        counterparty_id: counterpartyId,
        description: order.orderName,
        qr_code_data: `repair-order-${crypto.randomUUID()}`,
        status: 'pending',
        user_id: user.id,
        allocated_document_id: documentId,
        motor_id: null, // Nullable, to be set in a later step
        subdivision_id: null, // Nullable, to be set in a later step
      })
      .select('id')
      .single()

    if (repairOrderError) {
      console.error('Error creating repair order:', repairOrderError)
      // TODO: Add cleanup logic for the created document
      throw new Error('Не удалось создать заказ на ремонт.')
    }
    const repairOrderId = repairOrderData.id

    // 3. Flatten the hierarchy and insert all items
    const itemsToInsert = flattenHierarchyForDB(order, documentId, repairOrderId)

    const { error: itemsError } = await supabase
      .from('upd_document_items')
      .insert(itemsToInsert)

    if (itemsError) {
      console.error('Error inserting document items:', itemsError)
      // TODO: Add cleanup logic for created document and order
      throw new Error('Не удалось сохранить позиции заказа.')
    }
  }
}
