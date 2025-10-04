export interface ParsedMotor {
  name: string
  manufacturer: string | null // Matches DB schema
  power_kw: number | null
  rpm: number | null // Integer in DB
  voltage: number | null // Integer in DB
  current: number | null // Matches DB schema
  efficiency: number | null // Matches DB schema
  price_per_unit: number | null // Matches DB schema
}

/**
 * Parses CSV content into an array of ParsedMotor objects.
 * Assumes the first row is a header and uses comma (,) as delimiter.
 * Expected headers (case-insensitive): name, brand/manufacturer, power_kw, rpm, voltage, current, efficiency, price/price_per_unit
 */
export const parseMotorsCSV = (csvText: string): ParsedMotor[] => {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  const headerLine = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''))
  const dataLines = lines.slice(1)

  const availableHeaders = [
    'name',
    'brand', // Alias for manufacturer
    'manufacturer',
    'power_kw',
    'rpm',
    'voltage',
    'current',
    'efficiency',
    'price', // Alias for price_per_unit
    'price_per_unit',
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

  // Determine which header to use for manufacturer and price
  const manufacturerKey = headerMap['manufacturer'] !== undefined ? 'manufacturer' : (headerMap['brand'] !== undefined ? 'brand' : null)
  const priceKey = headerMap['price_per_unit'] !== undefined ? 'price_per_unit' : (headerMap['price'] !== undefined ? 'price' : null)


  const results: ParsedMotor[] = []

  // FIX: Helper functions must accept 'values' array as argument to access row data correctly.
  const getNumericOrNull = (key: string, values: string[]): number | null => {
      if (headerMap[key] === undefined) return null
      const val = parseFloat(values[headerMap[key]])
      return isNaN(val) ? null : val
  }

  const getIntegerOrNull = (key: string, values: string[]): number | null => {
      if (headerMap[key] === undefined) return null
      // CRITICAL FIX: Use parseInt to ensure integer type for DB columns (rpm, voltage).
      // This truncates floats (e.g., "5.5" -> 5) preventing 'invalid input syntax' errors.
      const val = parseInt(values[headerMap[key]], 10)
      return isNaN(val) ? null : val
  }

  for (const line of dataLines) {
    if (!line.trim()) continue

    // 'values' is defined here, inside the loop scope
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''))

    const name = values[headerMap['name']] || ''
    if (!name) continue // Skip rows without a name

    const motor: ParsedMotor = {
      name,
      manufacturer: manufacturerKey ? values[headerMap[manufacturerKey]] || null : null,
      // Pass 'values' to helper functions
      power_kw: getNumericOrNull('power_kw', values),
      rpm: getIntegerOrNull('rpm', values),
      voltage: getIntegerOrNull('voltage', values),
      current: getNumericOrNull('current', values),
      efficiency: getNumericOrNull('efficiency', values),
      price_per_unit: priceKey ? getNumericOrNull(priceKey, values) : null,
    }

    results.push(motor)
  }

  return results
}
