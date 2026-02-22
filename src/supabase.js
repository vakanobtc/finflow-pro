import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://acgnhhgnuqmpctrxttmr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZ25oaGdudXFtcGN0cnh0dG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MzUwMTAsImV4cCI6MjA4NzMxMTAxMH0.fmq1RhSQKjf19aca30N3ckGSUqdMehf9n2XqatmV9VM'

export const supabase = createClient(supabaseUrl, supabaseKey)