import * as XLSX from 'xlsx'
import { FinancialRow } from '../types/financialHierarchy'

/**
 * Flattens the hierarchical data back into a format suitable for Excel export.
 * This function takes the raw flat data.
 */
export const exportAssembledPositionsToExcel = (
  data: FinancialRow[],
  fileName: string,
): void => {
  const serviceNameMap = new Map<string, number>()
  let positionCounter = 1

  // Map the data to match the expected Excel column headers
  const worksheetData = data.map((row) => {
    if (!serviceNameMap.has(row.serviceName)) {
      serviceNameMap.set(row.serviceName, positionCounter++)
    }
    const positionNumber = serviceNameMap.get(row.serviceName)

    return {
      'Номер позиции': positionNumber,
      'Наименование услуги': row.serviceName,
      'Наименование позиции': row.itemName,
      'Группа работ': row.workGroup,
      'Тип транзакции': row.transactionType,
      'Сумма': row.amount,
      'Количество': row.quantity,
    }
  })

  // Create a new worksheet from the JSON data
  const ws = XLSX.utils.json_to_sheet(worksheetData)

  // Optional: Set column widths for better readability
  ws['!cols'] = [
    { wch: 15 }, // Номер позиции
    { wch: 40 }, // Наименование услуги
    { wch: 50 }, // Наименование позиции
    { wch: 30 }, // Группа работ
    { wch: 15 }, // Тип транзакции
    { wch: 10 }, // Сумма
    { wch: 10 }, // Количество
  ]

  // Create a new workbook
  const wb = XLSX.utils.book_new()

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Собранные Позиции')

  // Write the workbook and trigger a download
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}
