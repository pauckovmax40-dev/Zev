import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://arqxycghkorgvgdgkfnm.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFycXh5Y2doa29yZ3ZnZGdrZm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTE0MTEsImV4cCI6MjA3NTA4NzQxMX0.NiuWNqULeirtPsgc-SxKir4ht7K496E_QJLB3HtYydo'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
