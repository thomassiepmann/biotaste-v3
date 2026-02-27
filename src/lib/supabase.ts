import { createClient } from '@supabase/supabase-js';

// Supabase Konfiguration
// WICHTIG: Diese Werte müssen in der .env Datei gesetzt werden
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
