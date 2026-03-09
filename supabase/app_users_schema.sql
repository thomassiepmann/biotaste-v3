-- ============================================
-- Supabase Schema für App Users (Registrierte Nutzer)
-- ============================================
-- Datum: 2026-02-28
-- Projekt: biotaste-v3
-- Feature: Nur registrierte User dürfen die App nutzen

-- Erstelle app_users Tabelle
CREATE TABLE IF NOT EXISTS app_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  code text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index für schnelle Name-Suche (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_app_users_name_lower ON app_users (LOWER(name));

-- Index für schnelle Code-Suche (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_app_users_code_lower ON app_users (LOWER(code));

-- Kommentar für Dokumentation
COMMENT ON TABLE app_users IS 'Registrierte App-Nutzer - nur diese Namen dürfen sich einloggen';
COMMENT ON COLUMN app_users.name IS 'Vollständiger Name des Users (case-insensitive beim Login)';
COMMENT ON COLUMN app_users.code IS '3-Buchstaben-Code für den Login (z.B. MXM, THS)';

-- ============================================
-- Beispiel-Daten (für Testing)
-- ============================================
INSERT INTO app_users (name, code) VALUES 
  ('Max Mustermann', 'MXM'),
  ('Anna Schmidt', 'ANS'),
  ('Tom Weber', 'TOW'),
  ('Lisa Müller', 'LIM'),
  ('Peter Klein', 'PEK')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Row Level Security (RLS) - Optional
-- ============================================
-- Aktiviere RLS für zusätzliche Sicherheit
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann Namen lesen (für Login-Validierung)
CREATE POLICY "Allow public read access" ON app_users
  FOR SELECT
  USING (true);

-- Policy: Nur Admins können Namen hinzufügen/ändern
-- (Später kann hier eine Admin-Rolle definiert werden)
CREATE POLICY "Only admins can insert" ON app_users
  FOR INSERT
  WITH CHECK (false); -- Vorerst blockiert, Admin muss direkt in DB arbeiten

CREATE POLICY "Only admins can update" ON app_users
  FOR UPDATE
  USING (false);

CREATE POLICY "Only admins can delete" ON app_users
  FOR DELETE
  USING (false);
