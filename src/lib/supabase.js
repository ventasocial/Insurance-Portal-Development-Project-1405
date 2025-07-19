import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yvdrxkakgepavxbfnctm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZHJ4a2FrZ2VwYXZ4YmZuY3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3ODAzMTEsImV4cCI6MjA2ODM1NjMxMX0.Yd-coZgLntHlIVSVEm5IPAPhVJmqSNmYK4ZgLyBZeZs'

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

// Initialize the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

export default supabase