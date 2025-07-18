import { createClient } from '@supabase/supabase-js'

// Project URL and anon key from environment
const SUPABASE_URL = 'https://yvdrxkakgepavxbfnctm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZHJ4a2FrZ2VwYXZ4YmZuY3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3ODAzMTEsImV4cCI6MjA2ODM1NjMxMX0.Yd-coZgLntHlIVSVEm5IPAPhVJmqSNmYK4ZgLyBZeZs'

// Initialize the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

console.log('Supabase initialized with URL:', SUPABASE_URL)

export default supabase