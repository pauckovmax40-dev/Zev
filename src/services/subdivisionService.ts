import { supabase } from '../lib/supabase'
import { Subdivision } from '../types/database'

// Define the structure for data insertion/upsertion
export type SubdivisionInsert = {
  name: string
  description: string | null
  code: string | null
  is_active: boolean
}

export interface ImportResult {
  successCount: number
  errorCount: number
  errors: string[]
}

export const subdivisionService = {
  async fetchSubdivisions(): Promise<Subdivision[]> {
    const { data, error } = await supabase
      .from('subdivisions')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return data as Subdivision[]
  },

  async createSubdivision(subdivisionData: SubdivisionInsert): Promise<Subdivision> {
    const { data, error } = await supabase
      .from('subdivisions')
      .insert(subdivisionData)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Subdivision
  },

  async updateSubdivision(id: string, subdivisionData: Partial<SubdivisionInsert>): Promise<Subdivision> {
    const { data, error } = await supabase
      .from('subdivisions')
      .update(subdivisionData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Subdivision
  },

  async deleteSubdivision(id: string): Promise<void> {
    const { error } = await supabase
      .from('subdivisions')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  async importSubdivisions(subdivisions: SubdivisionInsert[]): Promise<ImportResult> {
    if (subdivisions.length === 0) {
      return { successCount: 0, errorCount: 0, errors: [] }
    }

    // Use upsert based on 'name'. This handles updates/inserts in one go.
    // Assumes 'name' is the unique identifier for conflict resolution.
    const { data, error } = await supabase
      .from('subdivisions')
      .upsert(subdivisions, { onConflict: 'name', ignoreDuplicates: false })
      .select('id, name')

    if (error) {
      // Handle batch failure due to constraints or RLS issues
      return {
        successCount: 0,
        errorCount: subdivisions.length,
        errors: [`Пакетный импорт не удался: ${error.message}`],
      }
    }

    // If successful, data contains the inserted/updated rows.
    return {
      successCount: data.length,
      errorCount: 0,
      errors: [],
    }
  },
}
