import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlhzxxeqfznwutgkdvdp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaHp4eGVxZnpud3V0Z2tkdmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzkxMTEsImV4cCI6MjA3NjkxNTExMX0.PQD752L7jIc-XH76BkqI5owpGFW3QA_TIIe7zYCq7HQ';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
