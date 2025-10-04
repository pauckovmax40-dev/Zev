import { supabase } from '../lib/supabase'
import { ReceptionExcelRow } from '../utils/parseReceptionExcel'

interface GroupedMotor {
  positionNumber: number
  subdivisionName: string
  serviceName: string
  inventoryNumber: string
  items: ReceptionExcelRow[]
}

export const saveReceptionData = async (rows: ReceptionExcelRow[]) => {
  if (rows.length === 0) {
    throw new Error('Нет данных для сохранения')
  }

  const firstRow = rows[0]
  const receptionNumber = firstRow.receptionNumber
  const counterpartyName = firstRow.counterpartyName
  const receptionDate = firstRow.receptionDate

  let { data: counterparty, error: counterpartyError } = await supabase
    .from('counterparties')
    .select('id')
    .eq('name', counterpartyName)
    .maybeSingle()

  if (counterpartyError) {
    throw new Error(`Ошибка поиска контрагента: ${counterpartyError.message}`)
  }

  if (!counterparty) {
    const { data: newCounterparty, error: createError } = await supabase
      .from('counterparties')
      .insert({
        name: counterpartyName,
        code: '',
        contact_info: '',
      })
      .select()
      .single()

    if (createError) {
      throw new Error(`Ошибка создания контрагента: ${createError.message}`)
    }

    counterparty = newCounterparty
  }

  const { data: reception, error: receptionError } = await supabase
    .from('receptions')
    .insert({
      reception_date: receptionDate,
      reception_number: receptionNumber,
      counterparty_id: counterparty.id,
    })
    .select()
    .single()

  if (receptionError) {
    throw new Error(`Ошибка создания приемки: ${receptionError.message}`)
  }

  const motorGroups = new Map<number, GroupedMotor>()
  for (const row of rows) {
    if (!motorGroups.has(row.positionNumber)) {
      motorGroups.set(row.positionNumber, {
        positionNumber: row.positionNumber,
        subdivisionName: row.subdivisionName,
        serviceName: row.serviceName,
        inventoryNumber: row.motorInventoryNumber,
        items: [],
      })
    }
    motorGroups.get(row.positionNumber)!.items.push(row)
  }

  const motorGroupsArray = Array.from(motorGroups.values()).sort(
    (a, b) => a.positionNumber - b.positionNumber
  )

  for (const group of motorGroupsArray) {
    let { data: subdivision, error: subdivisionError } = await supabase
      .from('subdivisions')
      .select('id')
      .eq('name', group.subdivisionName)
      .maybeSingle()

    if (subdivisionError) {
      throw new Error(
        `Ошибка поиска подразделения: ${subdivisionError.message}`
      )
    }

    if (!subdivision) {
      const { data: newSubdivision, error: createError } = await supabase
        .from('subdivisions')
        .insert({
          name: group.subdivisionName,
          code: '',
          description: '',
        })
        .select()
        .single()

      if (createError) {
        throw new Error(`Ошибка создания подразделения: ${createError.message}`)
      }

      subdivision = newSubdivision
    }

    const { data: acceptedMotor, error: motorError } = await supabase
      .from('accepted_motors')
      .insert({
        reception_id: reception.id,
        subdivision_id: subdivision.id,
        position_in_reception: group.positionNumber,
        motor_service_description: group.serviceName,
        motor_inventory_number: group.inventoryNumber,
      })
      .select()
      .single()

    if (motorError) {
      throw new Error(`Ошибка создания двигателя: ${motorError.message}`)
    }

    const itemsToInsert = group.items.map((item) => ({
      accepted_motor_id: acceptedMotor.id,
      item_description: item.itemName,
      work_group: item.workGroup,
      transaction_type: item.transactionType,
      quantity: 1,
      price: 0,
    }))

    const { error: itemsError } = await supabase
      .from('reception_items')
      .insert(itemsToInsert)

    if (itemsError) {
      throw new Error(`Ошибка создания позиций: ${itemsError.message}`)
    }
  }

  return reception
}
