import { supabase } from '../lib/supabase'
import { Motor } from '../types/database'
import { ParsedMotor } from '../utils/motorCsv'

// NOTE: Assuming the database schema includes:
// name, power_kw, rpm, voltage, manufacturer, price_per_unit, current, efficiency, description, is_active, user_id, updated_at, text
// We only handle fields available in CSV for insert/update.

export type MotorInsert = Omit<Motor, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'text'>
export type MotorUpdate = Partial<MotorInsert>

const MOTORS_TABLE = 'motors'

/**
 * Fetches all motors belonging to the current user.
 */
export async function fetchMotors(): Promise<Motor[]> {
  const { data, error } = await supabase
    .from(MOTORS_TABLE)
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching motors:', error)
    throw new Error('Не удалось загрузить справочник двигателей.')
  }
  return data as Motor[]
}

/**
 * Creates a new motor entry.
 */
export async function createMotor(motorData: MotorInsert): Promise<Motor> {
  // Ensure numeric fields are handled correctly (Supabase expects numbers, not null for defaults)
  const dataToInsert = {
    ...motorData,
    power_kw: motorData.power_kw ?? 0,
    rpm: motorData.rpm ?? 0,
    voltage: motorData.voltage ?? 380, // Default based on user schema
    price_per_unit: motorData.price_per_unit ?? 0,
    manufacturer: motorData.manufacturer ?? '',
    current: motorData.current ?? 0,
    efficiency: motorData.efficiency ?? 0,
    description: motorData.description ?? '',
  }

  const { data, error } = await supabase
    .from(MOTORS_TABLE)
    .insert(dataToInsert)
    .select()
    .single()

  if (error) {
    console.error('Error creating motor:', error)
    throw new Error(`Ошибка при создании двигателя: ${error.message}`)
  }
  return data as Motor
}

/**
 * Updates an existing motor entry.
 */
export async function updateMotor(
  id: string,
  motorData: MotorUpdate,
): Promise<Motor> {
  const dataToUpdate = {
    ...motorData,
    // Ensure numeric fields are not sent as null if they are meant to be 0
    power_kw: motorData.power_kw === null ? 0 : motorData.power_kw,
    rpm: motorData.rpm === null ? 0 : motorData.rpm,
    voltage: motorData.voltage === null ? 380 : motorData.voltage,
    price_per_unit: motorData.price_per_unit === null ? 0 : motorData.price_per_unit,
    current: motorData.current === null ? 0 : motorData.current,
    efficiency: motorData.efficiency === null ? 0 : motorData.efficiency,
  }

  const { data, error } = await supabase
    .from(MOTORS_TABLE)
    .update(dataToUpdate)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating motor:', error)
    throw new Error(`Ошибка при обновлении двигателя: ${error.message}`)
  }
  return data as Motor
}

/**
 * Deletes a motor entry.
 */
export async function deleteMotor(id: string): Promise<void> {
  const { error } = await supabase.from(MOTORS_TABLE).delete().eq('id', id)

  if (error) {
    console.error('Error deleting motor:', error)
    throw new Error(`Ошибка при удалении двигателя: ${error.message}`)
  }
}

/**
 * Imports motors from parsed CSV data.
 * Upserts based on the combination of user_id and name.
 */
export const importMotors = async (
  data: ParsedMotor[],
): Promise<{ successCount: number; errorCount: number; errors: string[] }> => {
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    throw new Error('Пользователь не аутентифицирован. Импорт невозможен.')
  }

  const userId = userData.user.id
  const errors: string[] = []

  if (data.length === 0) {
    return { successCount: 0, errorCount: 0, errors: [] };
  }

  // Prepare data for insertion, ensuring user_id is set and nulls are handled
  const insertData = data.map(item => ({
    user_id: userId,
    name: item.name,
    power_kw: item.power_kw ?? 0,
    rpm: item.rpm ?? 0,
    voltage: item.voltage ?? 380,
    current: item.current ?? 0,
    efficiency: item.efficiency ?? 0,
    price_per_unit: item.price_per_unit ?? 0,
    manufacturer: item.manufacturer ?? '',
    description: '',
    is_active: true,
  }))

  // Upsert the data
  const { data: resultData, error } = await supabase
    .from(MOTORS_TABLE)
    .upsert(insertData, {
      onConflict: 'user_id,name',
      ignoreDuplicates: false,
    })
    .select()

  if (error) {
    console.error('Error importing motors:', error)
    // Capture the detailed error message from Supabase/PostgREST
    errors.push(`Произошла ошибка во время пакетного импорта: ${error.message}`)
    return { successCount: 0, errorCount: data.length, errors }
  }

  return {
    successCount: resultData?.length || 0,
    errorCount: errors.length,
    errors,
  }
}
