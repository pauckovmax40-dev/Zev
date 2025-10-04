import * as XLSX from 'xlsx'
import { FinancialRow } from '../types/financialHierarchy'

// Define a type for the raw row from Excel to ensure type safety
interface RawExcelRow {
  'Наименование услуги'?: string
  'Наименование позиции'?: string
  'Группа работ'?: string
  'Тип транзакции'?: 'Доходы' | 'Расходы'
  'Сумма'?: number
  'Количество'?: number
  'Номер позиции'?: number
}

/**
 * Parses an Excel file buffer and transforms its content into an array of FinancialRow objects.
 * @param fileBuffer The ArrayBuffer of the Excel file.
 * @returns A promise that resolves with an array of FinancialRow.
 */
export const parseAssembledPositionsExcel = (
  fileBuffer: ArrayBuffer,
): Promise<FinancialRow[]> => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        throw new Error('В файле Excel не найдено ни одного листа.')
      }
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet)

      const parsedData: FinancialRow[] = jsonData
        .map((row, index) => {
          // Validate required fields
          if (
            !row['Наименование услуги'] ||
            !row['Наименование позиции'] ||
            !row['Группа работ'] ||
            !row['Тип транзакции'] ||
            row['Сумма'] == null ||
            row['Количество'] == null ||
            row['Номер позиции'] == null
          ) {
            console.warn(`Пропуск невалидной строки ${index + 2}:`, row)
            return null
          }

          const transactionType = row['Тип транзакции']
          if (transactionType !== 'Доходы' && transactionType !== 'Расходы') {
            console.warn(
              `Пропуск строки ${
                index + 2
              } с неверным типом транзакции:`,
              transactionType,
            )
            return null
          }

          return {
            id: crypto.randomUUID(),
            serviceName: String(row['Наименование услуги']),
            itemName: String(row['Наименование позиции']),
            workGroup: String(row['Группа работ']),
            transactionType: transactionType,
            amount: Number(row['Сумма']),
            quantity: Number(row['Количество']),
            positionNumber: Number(row['Номер позиции']),
          }
        })
        .filter((row): row is FinancialRow => row !== null)

      resolve(parsedData)
    } catch (error) {
      console.error('Ошибка парсинга файла Excel:', error)
      reject(
        new Error(
          'Не удалось обработать файл Excel. Убедитесь, что формат файла и названия столбцов верны.',
        ),
      )
    }
  })
}
