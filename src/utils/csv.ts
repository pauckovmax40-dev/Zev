export interface ParsedCounterparty {
  name: string
  inn: string | null
  kpp: string | null
  address: string | null
  contact_person: string | null
  phone: string | null
  email: string | null
  description: string | null
  is_active: boolean
}

/**
 * Parses CSV content into an array of ParsedCounterparty objects.
 * Assumes the first row is a header and uses comma (,) as delimiter.
 * Expected headers (case-insensitive): name, inn, kpp, address, contact_person, phone, email, description, is_active
 */
export const parseCSV = (csvText: string): ParsedCounterparty[] => {
  const lines = csvText.trim().split('\n')
  if (lines.length === 0) return []

  const headerLine = lines[0].toLowerCase().split(',').map(h => h.trim())
  const dataLines = lines.slice(1)

  const requiredHeaders = ['name']
  const availableHeaders = [
    'name',
    'inn',
    'kpp',
    'address',
    'contact_person',
    'phone',
    'email',
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

  // Basic validation: check if required headers are present
  for (const req of requiredHeaders) {
    if (!(req in headerMap)) {
      throw new Error(`Missing required column: ${req}`)
    }
  }

  const results: ParsedCounterparty[] = []

  for (const line of dataLines) {
    if (!line.trim()) continue

    // Simple split, might fail on complex CSVs with quoted commas, but sufficient for basic utility
    const values = line.split(',').map(v => v.trim())

    const counterparty: ParsedCounterparty = {
      name: values[headerMap['name']] || '',
      inn: headerMap['inn'] !== undefined ? values[headerMap['inn']] || null : null,
      kpp: headerMap['kpp'] !== undefined ? values[headerMap['kpp']] || null : null,
      address: headerMap['address'] !== undefined ? values[headerMap['address']] || null : null,
      contact_person: headerMap['contact_person'] !== undefined ? values[headerMap['contact_person']] || null : null,
      phone: headerMap['phone'] !== undefined ? values[headerMap['phone']] || null : null,
      email: headerMap['email'] !== undefined ? values[headerMap['email']] || null : null,
      description: headerMap['description'] !== undefined ? values[headerMap['description']] || null : null,
      is_active: headerMap['is_active'] !== undefined ? (values[headerMap['is_active']]?.toLowerCase() === 'true' || values[headerMap['is_active']] === '1') : true,
    }

    if (counterparty.name) {
      results.push(counterparty)
    }
  }

  return results
}
