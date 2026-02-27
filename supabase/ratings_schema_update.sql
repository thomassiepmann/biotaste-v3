-- ============================================
-- Supabase Schema Update für Emoji-Tags & Kommentare
-- ============================================
-- Datum: 2026-02-28
-- Projekt: biotaste-v3
-- Feature: Emoji-Tags + Kommentarfeld im RatingScreen

-- Erweitere die ratings Tabelle um neue Felder
ALTER TABLE ratings 
ADD COLUMN IF NOT EXISTS emoji_tags text[], -- Array der gewählten Tag-IDs
ADD COLUMN IF NOT EXISTS comment text; -- Kommentar-Text (max. 150 Zeichen)

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
