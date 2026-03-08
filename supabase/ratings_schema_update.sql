-- ============================================
-- Supabase Schema Update für Emoji-Tags & Kommentare
-- ============================================
-- Datum: 2026-02-28
-- Projekt: biotaste-v3
-- Feature: Emoji-Tags + Kommentarfeld im RatingScreen

-- ============================================
-- BIASTASTE V3 - KRITISCHE MASTERPLAN UPDATES
-- ============================================
-- Datum: 2026-03-08
-- Feature: Bias-Kontroll-Felder + n>=10 Regel

-- Erweitere die ratings Tabelle um neue Felder
ALTER TABLE ratings 
ADD COLUMN IF NOT EXISTS emoji_tags text[], -- Array der gewählten Tag-IDs
ADD COLUMN IF NOT EXISTS comment text CHECK (LENGTH(comment) <= 150); -- Kommentar-Text (max. 150 Zeichen)

-- ============================================
-- KRITISCH: Bias-Kontroll Metadaten (Masterplan EISERN)
-- ============================================
ALTER TABLE ratings
ADD COLUMN IF NOT EXISTS shift TEXT CHECK (shift IN ('frueh', 'spaet')), -- Schicht-Bias Kontrolle
ADD COLUMN IF NOT EXISTS location TEXT, -- Standort für Bias-Analyse
ADD COLUMN IF NOT EXISTS batch_id TEXT, -- Chargen-ID für Tracking
ADD COLUMN IF NOT EXISTS rated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); -- Exakter Zeitpunkt

-- Index für schnelle Bias-Analysen
CREATE INDEX IF NOT EXISTS idx_ratings_shift ON ratings(shift);
CREATE INDEX IF NOT EXISTS idx_ratings_location ON ratings(location);
CREATE INDEX IF NOT EXISTS idx_ratings_batch ON ratings(batch_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated_at ON ratings(rated_at);

-- Beispiel-Daten:
-- emoji_tags: ['suess', 'frisch', 'top_qualitaet']
-- comment: 'Sehr leckere Äpfel, perfekt reif!'

-- Index für bessere Performance bei Tag-Suchen
CREATE INDEX IF NOT EXISTS idx_ratings_emoji_tags ON ratings USING GIN (emoji_tags);

-- Kommentar für Dokumentation
COMMENT ON COLUMN ratings.emoji_tags IS 'Array von Tag-IDs aus den Kategorien: Geschmack, Zustand, Besonders';
COMMENT ON COLUMN ratings.comment IS 'Optionaler Kommentar des Users (max. 150 Zeichen)';

-- ============================================
-- Verfügbare Tag-IDs:
-- ============================================
-- Geschmack: suess, sauer, salzig, waessrig, aromatisch
-- Zustand: frisch, ueberreif, noch_nicht_reif, matschig
-- Besonders: top_qualitaet, enttaeuschend, schaedling
