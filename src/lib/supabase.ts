import { createClient } from '@supabase/supabase-js';

// Supabase Konfiguration
// WICHTIG: Diese Werte müssen in der .env Datei gesetzt werden
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Prüfe ob Supabase konfiguriert ist
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here';

// Erstelle Supabase Client nur wenn konfiguriert, sonst Dummy-Client
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Export ob Supabase konfiguriert ist
export const isSupabaseConfigured = isConfigured;
