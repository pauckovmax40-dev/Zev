import { supabase } from '../lib/supabase'
import { ParsedCounterparty } from '../utils/csv'

export interface Counterparty {
  id: string
  created_at: string
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
 * Fetches all counterparties for the current user.
 */
export const getCounterparties = async (): Promise<Counterparty[]> => {
  const { data, error } = await supabase
    .from('counterparties')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching counterparties:', error)
    throw new Error('Не удалось загрузить список контрагентов.')
  }

  return data || []
}

/**
 * Imports counterparties from parsed CSV data into the Supabase table.
 * Uses upsert with explicit column names for onConflict to handle
 * composite unique indexes correctly with RLS.
 */
export const importCounterparties = async (
  data: ParsedCounterparty[],
): Promise<{ successCount: number; errorCount: number; errors: string[] }> => {
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData) {
    throw new Error('User not authenticated. Cannot import data.')
  }

  const userId = userData.user.id
  const errors: string[] = []
  let successCount = 0

  // Prepare data for insertion, ensuring user_id is set
  const insertData = data.map(item => ({
    ...item,
    user_id: userId,
    is_active: item.is_active,
  }))

  // Process records one by one to handle complex upsert logic based on INN presence
  for (const item of insertData) {
    try {
      // CORRECT FIX: The `onConflict` parameter for the Supabase client expects a
      // comma-separated string of COLUMN names, not the constraint name.
      const conflictTarget = item.inn
        ? 'user_id,inn' // Use columns for the partial unique index on (user_id, inn)
        : 'user_id,name' // Use columns for the unique index on (user_id, name)

      const { error } = await supabase
        .from('counterparties')
        .upsert(item, {
          onConflict: conflictTarget,
          ignoreDuplicates: false, // We want to update if a conflict occurs
        })
        .select()

      if (error) {
        // Provide a more user-friendly error message
        const detail = error.details || ''
        if (detail.includes('violates row-level security policy')) {
          errors.push(
            `Ошибка импорта ${item.name}: Отказано в доступе. Проверьте права RLS.`,
          )
        } else {
          errors.push(
            `Ошибка импорта ${item.name} (ИНН: ${
              item.inn || 'Н/Д'
            }): ${error.message}`,
          )
        }
      } else {
        successCount++
      }
    } catch (e) {
      errors.push(
        `Критическая ошибка при обработке ${item.name}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      )
    }
  }

  return {
    successCount,
    errorCount: errors.length,
    errors,
  }
}
