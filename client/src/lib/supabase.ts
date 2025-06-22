import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjrqsfvsnlmefmjwzltc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcnFzZnZzbmxtZWZtand6bHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTYwMTMsImV4cCI6MjA2NjEzMjAxM30.FRA9xlOtqjT7mIP88mTDrAm2IngvWn8VSAYi61Nt1YI';

// Create Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export { supabaseUrl, supabaseAnonKey };