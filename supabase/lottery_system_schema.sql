-- ============================================
-- LOTTERIE/LOS-SYSTEM FÜR BIOTASTE APP
-- Ersetzt das alte Punkte-System
-- ============================================

-- Tabelle: Wöchentliche Lose pro User
CREATE TABLE IF NOT EXISTS loses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Montag der jeweiligen Woche
  total_loses INTEGER DEFAULT 0,
  bonus_loses INTEGER DEFAULT 0,
  streak_loses INTEGER DEFAULT 0,
  daily_count INTEGER DEFAULT 0, -- Anzahl Bewertungen heute
  last_rating_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Tabelle: Streak-Tracking
CREATE TABLE IF NOT EXISTS streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_rating_date DATE,
  streak_protection_used BOOLEAN DEFAULT FALSE,
  protection_reset_month INTEGER, -- Monatsnummer (1-12)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabelle: Gewinner
CREATE TABLE IF NOT EXISTS winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  winner_type TEXT CHECK (winner_type IN ('random_1', 'random_2', 'random_3', 'quality')),
  prize TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  reward_claimed BOOLEAN DEFAULT FALSE,
  reward_qr_code TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabelle: User Einstellungen
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  display_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE loses ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies für loses
DROP POLICY IF EXISTS "User sieht eigene Lose" ON loses;
CREATE POLICY "User sieht eigene Lose" ON loses 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User updated eigene Lose" ON loses;
CREATE POLICY "User updated eigene Lose" ON loses 
  FOR ALL USING (auth.uid() = user_id);

-- Policies für streaks
DROP POLICY IF EXISTS "User sieht eigenen Streak" ON streaks;
CREATE POLICY "User sieht eigenen Streak" ON streaks 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User updated eigenen Streak" ON streaks;
CREATE POLICY "User updated eigenen Streak" ON streaks 
  FOR ALL USING (auth.uid() = user_id);

-- Policies für winners
DROP POLICY IF EXISTS "Alle sehen Gewinner" ON winners;
CREATE POLICY "Alle sehen Gewinner" ON winners 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin erstellt Gewinner" ON winners;
CREATE POLICY "Admin erstellt Gewinner" ON winners 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies für user_settings
DROP POLICY IF EXISTS "User sieht eigene Settings" ON user_settings;
CREATE POLICY "User sieht eigene Settings" ON user_settings 
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INDIZES FÜR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_loses_user_week ON loses(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_loses_week ON loses(week_start);
CREATE INDEX IF NOT EXISTS idx_streaks_user ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_week ON winners(week_start);
CREATE INDEX IF NOT EXISTS idx_winners_user ON winners(user_id);

-- ============================================
-- FUNKTIONEN
-- ============================================

-- Funktion: Aktuellen Wochenstart (Montag) berechnen
CREATE OR REPLACE FUNCTION get_current_week_start()
RETURNS DATE AS $$
BEGIN
  RETURN DATE_TRUNC('week', CURRENT_DATE)::DATE + 
         CASE WHEN EXTRACT(DOW FROM CURRENT_DATE) = 0 THEN -6 ELSE 1 END;
END;
$$ LANGUAGE plpgsql;

-- Funktion: Updated_at automatisch aktualisieren
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für updated_at
DROP TRIGGER IF EXISTS update_loses_updated_at ON loses;
CREATE TRIGGER update_loses_updated_at
  BEFORE UPDATE ON loses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_streaks_updated_at ON streaks;
CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- KOMMENTARE
-- ============================================

COMMENT ON TABLE loses IS 'Wöchentliche Lose pro User für Lotterie-System';
COMMENT ON TABLE streaks IS 'Streak-Tracking mit monatlichem Schutz';
COMMENT ON TABLE winners IS 'Gewinner der wöchentlichen Ziehung';
COMMENT ON TABLE user_settings IS 'User-Einstellungen inkl. Anonym-Option';

COMMENT ON COLUMN loses.week_start IS 'Montag der Woche (ISO 8601)';
COMMENT ON COLUMN loses.daily_count IS 'Anzahl Bewertungen heute (max 3)';
COMMENT ON COLUMN streaks.protection_reset_month IS 'Monat des letzten Schutz-Resets (1-12)';
COMMENT ON COLUMN winners.winner_type IS 'Art des Gewinns: random_1/2/3 oder quality';
