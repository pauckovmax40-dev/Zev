import * as XLSX from 'xlsx'

export interface ReceptionExcelRow {
  receptionId: string
  receptionDate: string
  receptionNumber: string
  counterpartyName: string
  subdivisionName: string
  positionNumber: number
  serviceName: string
  itemName: string
  workGroup: string
  transactionType: string
}

interface RawExcelRow {
  'ID приемки'?: string
  'Дата приемки'?: string | number
  'Номер приемки'?: string
  'Контрагент'?: string
  'Подразделение'?: string
  'Номер позиции'?: number | string
  'Наименование услуги'?: string
  'Наименование позиции'?: string
  'Группа работ'?: string
  'Тип транзакции'?: string
}

export const parseReceptionExcel = (
  fileBuffer: ArrayBuffer,
): Promise<ReceptionExcelRow[]> => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        throw new Error('В файле Excel не найдено ни одного листа.')
      }
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet)

      const parsedData: ReceptionExcelRow[] = jsonData
        .map((row, index) => {
          if (
            !row['Дата приемки'] ||
            !row['Номер приемки'] ||
            !row['Контрагент'] ||
            !row['Подразделение'] ||
            row['Номер позиции'] == null ||
            !row['Наименование услуги'] ||
            !row['Наименование позиции'] ||
            !row['Группа работ'] ||
            !row['Тип транзакции']
          ) {
            console.warn(`Пропуск невалидной строки ${index + 2}:`, row)
            return null
          }

          let receptionDate: string
          if (typeof row['Дата приемки'] === 'number') {
            const date = XLSX.SSF.parse_date_code(row['Дата приемки'])
            receptionDate = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
          } else {
            receptionDate = String(row['Дата приемки'])
          }

          return {
            receptionId: row['ID приемки'] || crypto.randomUUID(),
            receptionDate,
            receptionNumber: String(row['Номер приемки']),
            counterpartyName: String(row['Контрагент']),
            subdivisionName: String(row['Подразделение']),
            positionNumber: Number(row['Номер позиции']),
            serviceName: String(row['Наименование услуги']),
            itemName: String(row['Наименование позиции']),
            workGroup: String(row['Группа работ']),
            transactionType: String(row['Тип транзакции']),
          }
        })
        .filter((row): row is ReceptionExcelRow => row !== null)

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
