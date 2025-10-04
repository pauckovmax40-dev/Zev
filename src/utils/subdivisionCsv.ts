import { SubdivisionInsert } from '../services/subdivisionService'

export interface ParsedSubdivision {
  name: string
  description: string | null
  code: string | null
  is_active: boolean
}

/**
 * Parses CSV content into an array of ParsedSubdivision objects.
 * Assumes the first row is a header and uses comma (,) as delimiter.
 * Expected headers (case-insensitive): name, code, description, is_active
 */
export const parseSubdivisionsCSV = (csvText: string): ParsedSubdivision[] => {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  const headerLine = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''))
  const dataLines = lines.slice(1)

  const availableHeaders = [
    'name',
    'code',
    'description',
    'is_active',
  ]

  const headerMap: { [key: string]: number } = {}
  availableHeaders.forEach(key => {
    const index = headerLine.indexOf(key)
    if (index !== -1) {
      headerMap[key] = index
    }
  })

  if (!('name' in headerMap)) {
    throw new Error('Отсутствует обязательная колонка: name')
  }

  const results: ParsedSubdivision[] = []

  const getStringOrNull = (key: string, values: string[]): string | null => {
      if (headerMap[key] === undefined) return null
      const val = values[headerMap[key]].trim()
      return val === '' ? null : val
  }

  const getBoolean = (key: string, values: string[]): boolean => {
      if (headerMap[key] === undefined) return true // Default to active if column missing
      const val = values[headerMap[key]].trim().toLowerCase()
      // Treat '1', 'true', 'да', 'yes', 'активно' as true
      return ['1', 'true', 'да', 'yes', 'активно'].includes(val)
  }

  for (const line of dataLines) {
    if (!line.trim()) continue

    // Simple split by comma, handling quoted values is complex, sticking to basic split for now
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''))

    const name = getStringOrNull('name', values)
    if (!name) continue // Skip rows without a name

    const subdivision: ParsedSubdivision = {
      name,
      code: getStringOrNull('code', values),
      description: getStringOrNull('description', values),
      is_active: getBoolean('is_active', values),
    }

    results.push(subdivision)
  }

  return results
}
