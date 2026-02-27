# 🚀 Supabase Setup für biotaste-v3

## 📋 Schritt-für-Schritt Anleitung

---

## 1️⃣ Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Warte bis das Projekt bereit ist (~2 Minuten)

---

## 2️⃣ SQL Schema ausführen

Gehe zu **SQL Editor** im Supabase Dashboard und führe folgendes SQL aus:

```sql
-- ============================================
-- KOMPLETTES SUPABASE SCHEMA FÜR BIOTASTE-V3
-- ============================================

-- 1. App Users Tabelle (Registrierte Nutzer)
CREATE TABLE IF NOT EXISTS app_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index für schnelle Name-Suche (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_app_users_name_lower ON app_users (LOWER(name));

-- Row Level Security aktivieren
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann Namen lesen (für Login-Validierung)
CREATE POLICY "Allow public read access" ON app_users
  FOR SELECT
  USING (true);

-- Policy: Nur Admins können Namen hinzufügen/ändern
CREATE POLICY "Only admins can insert" ON app_users
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only admins can update" ON app_users
  FOR UPDATE
  USING (false);

CREATE POLICY "Only admins can delete" ON app_users
  FOR DELETE
  USING (false);

-- Beispiel-Daten einfügen
INSERT INTO app_users (name) VALUES 
  ('Max Mustermann'),
  ('Anna Schmidt'),
  ('Tom Weber'),
  ('Lisa Müller'),
  ('Peter Klein')
ON CONFLICT (name) DO NOTHING;

-- 2. Ratings Tabelle erweitern (falls noch nicht vorhanden)
-- WICHTIG: Wenn die Tabelle schon existiert, nur die ALTER TABLE Befehle ausführen!

-- Falls Tabelle noch nicht existiert:
CREATE TABLE IF NOT EXISTS ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name text NOT NULL,
  charge_id uuid NOT NULL,
  product_id uuid NOT NULL,
  overall_stars integer NOT NULL CHECK (overall_stars >= 1 AND overall_stars <= 5),
  taste_emoji text,
  optic_emoji text,
  texture_emoji text,
  emoji_tags text[] DEFAULT '{}',
  comment text DEFAULT '',
  created_at timestamp with time zone DEFAULT now()
);

-- Falls Tabelle bereits existiert, nur neue Spalten hinzufügen:
ALTER TABLE ratings 
  ADD COLUMN IF NOT EXISTS emoji_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS comment text DEFAULT '';

-- Index für bessere Performance bei Tag-Suchen
CREATE INDEX IF NOT EXISTS idx_ratings_emoji_tags ON ratings USING GIN (emoji_tags);

-- Row Level Security für ratings
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann seine eigenen Ratings lesen
CREATE POLICY "Users can read all ratings" ON ratings
  FOR SELECT
  USING (true);

-- Policy: Jeder kann Ratings erstellen
CREATE POLICY "Users can insert ratings" ON ratings
  FOR INSERT
  WITH CHECK (true);
```

---

## 3️⃣ .env Datei konfigurieren

1. Öffne die `.env` Datei im Projekt-Root
2. Gehe zu **Supabase Dashboard > Settings > API**
3. Kopiere die Werte:

```env
EXPO_PUBLIC_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=DEIN-ANON-KEY-HIER
```

**Wichtig:** 
- Die URL endet mit `.supabase.co`
- Der Anon Key ist der **public** Key (nicht der service_role Key!)

---

## 4️⃣ App testen

```bash
cd /home/user/vibe-workspace/projects/biotaste-v3
npx expo start --tunnel
```

### Test-Szenarien:

#### ✅ Erfolgreicher Login:
- Name eingeben: "Max Mustermann" → ✅ Zugang
- Name eingeben: "Anna Schmidt" → ✅ Zugang

#### ❌ Fehlgeschlagener Login:
- Name eingeben: "Unbekannter Name" → ❌ Fehlermeldung
- Leeres Feld → ❌ Fehlermeldung

#### ✅ Bewertung mit Emoji-Tags:
1. Produkt auswählen
2. Sterne vergeben (1-5)
3. Smileys auswählen (Geschmack, Optik, Textur)
4. Tags wählen (z.B. "🍬 Süß", "✨ Frisch")
5. Kommentar schreiben (optional)
6. Punkte-Vorschau prüfen (20-35 Punkte)
7. Abschicken → Animation

---

## 5️⃣ Neue User hinzufügen (Admin)

Im Supabase Dashboard → **SQL Editor**:

```sql
INSERT INTO app_users (name) VALUES ('Neuer Name');
```

---

## 📊 Verfügbare Emoji-Tags

### Geschmack:
- 🍬 Süß
- 🍋 Sauer
- 🧂 Salzig
- 💧 Wässrig
- 🌿 Aromatisch

### Zustand:
- ✨ Frisch
- ⚠️ Überreif
- 🌱 Noch nicht reif
- 🤢 Matschig

### Besonders:
- 🏆 Top Qualität
- 👎 Enttäuschend
- 🐛 Schädling

---

## 🎯 Punkte-System

| Aktion | Punkte |
|--------|--------|
| Bewertung abgeben (Basis) | +20 |
| Alle 3 Smileys ausgefüllt | +5 |
| Mindestens 1 Tag gewählt | +5 |
| Kommentar geschrieben | +5 |
| **Maximum** | **+35** |

---

## ⚠️ WICHTIG: RatingScreen speichert noch NICHT in Supabase!

Der RatingScreen zeigt die Tags und Kommentare an, aber speichert sie noch nicht in der Datenbank.

**Das muss noch implementiert werden:**
- Supabase INSERT in handleSubmit()
- emoji_tags und comment in ratings Tabelle speichern

---

## 🔧 Troubleshooting

### Problem: "Name nicht bekannt"
- Prüfe ob der Name in der app_users Tabelle existiert
- Groß/Kleinschreibung ist egal (case-insensitive)

### Problem: "Verbindungsfehler"
- Prüfe .env Datei (URL und Key korrekt?)
- Prüfe Internet-Verbindung
- Prüfe Supabase Dashboard (Projekt aktiv?)

### Problem: App startet nicht
- `npx expo start --clear` (Cache löschen)
- .env Datei im Root-Verzeichnis?
- Supabase Package installiert? (`npm install`)

---

## 📁 Wichtige Dateien

- `.env` - Supabase Credentials (NICHT committen!)
- `.env.example` - Vorlage für .env
- `src/lib/supabase.ts` - Supabase Client
- `src/screens/NameInputScreen.tsx` - Login mit Validierung
- `src/screens/RatingScreen.tsx` - Bewertung mit Tags
- `supabase/app_users_schema.sql` - User Tabelle
- `supabase/ratings_schema_update.sql` - Ratings Erweiterung
