# 🎰 Lotterie/Los-System - BioTaste App

## Übersicht

Das neue Lotterie/Los-System ersetzt das alte Punkte-System und bietet ein spannendes wöchentliches Gewinnspiel für Mitarbeiter.

---

## 🎯 Konzept

### Grundprinzip
- **Lose sammeln** statt Punkte
- **Wöchentliche Ziehung** jeden Montag
- **4 Gewinner** pro Woche (3 zufällig + 1 Qualität)
- **Streak-Bonus** für tägliche Bewertungen
- **Fairness für Wochenziehung:** 1 Teilnehmer = 1 Los (alle mit mindestens 1 Bewertung)

### Gewinnchancen
Für die **Wochenziehung** gilt der faire Modus:
- Alle Teilnehmer mit mindestens einer Bewertung in der Woche kommen genau **einmal** in den Lostopf.
- Gewinnchance ist für alle gleich (`1 / Anzahl Teilnehmer`).

Die in der App angezeigten Lose dienen weiterhin Motivation, Feedback und Streak-Gamification.

---

## 📊 Lose-Vergabe

### Pro Bewertung
- **1 Los** = Basis-Bewertung (Sterne + Emojis)
- **+1 Los** = Mit Kommentar
- **+1 Los** = Mit Foto
- **Max. 3 Lose/Tag** = Tages-Limit

### Streak-Bonus
Tägliche Bewertungen werden belohnt:
- **3 Tage Streak** → +1 Bonus-Los
- **7 Tage Streak** → +2 Bonus-Lose
- **14 Tage Streak** → +3 Bonus-Lose
- **30 Tage Streak** → +5 Bonus-Lose

### Streak-Schutz
- **1x pro Monat** kann ein Streak geschützt werden
- Automatisch bei Unterbrechung (ab 3 Tagen Streak)
- Reset am 1. des Monats

---

## 🏆 Gewinner & Preise

### Gewinner-Typen

1. **Zufalls-Gewinner 1** 🎁
   - Preis: 10€ Gutschein
   - Faire Ziehung (alle Teilnehmer gleich wahrscheinlich)

2. **Zufalls-Gewinner 2** 🎁
   - Preis: 5€ Gutschein
   - Faire Ziehung (alle Teilnehmer gleich wahrscheinlich)

3. **Zufalls-Gewinner 3** 📦
   - Preis: Überraschungsbox
   - Faire Ziehung (alle Teilnehmer gleich wahrscheinlich)

4. **Qualitäts-Gewinner** ⭐
   - Preis: Spezial-Preis
   - Beste Bewertung der Woche (mit Kommentar)

### Ziehungs-Algorithmus (fair)

```
1. Sammle alle User mit >= 1 Bewertung dieser Woche (DISTINCT user_id)
2. Ziehe 3 zufällige Gewinner ohne Duplikate
4. Wähle Qualitäts-Gewinner (höchste Sterne + Kommentar)
```

Zufall erfolgt kryptografisch sicher:
- App-Service: `globalThis.crypto.getRandomValues` (via `react-native-get-random-values`)
- Script: `node:crypto.randomInt`

---

## 🗄️ Datenbank-Struktur

### Tabellen

#### `loses`
Wöchentliche Lose pro User
```sql
- user_id: UUID
- week_start: DATE (Montag)
- total_loses: INTEGER
- bonus_loses: INTEGER
- streak_loses: INTEGER
- daily_count: INTEGER (max 3)
- last_rating_date: DATE
```

#### `streaks`
Streak-Tracking
```sql
- user_id: UUID
- current_streak: INTEGER
- longest_streak: INTEGER
- last_rating_date: DATE
- streak_protection_used: BOOLEAN
- protection_reset_month: INTEGER (1-12)
```

#### `winners`
Gewinner-Historie
```sql
- user_id: UUID
- week_start: DATE
- winner_type: TEXT (random_1/2/3, quality)
- prize: TEXT
- is_anonymous: BOOLEAN
- reward_claimed: BOOLEAN
- reward_qr_code: TEXT
```

#### `user_settings`
User-Einstellungen
```sql
- user_id: UUID
- is_anonymous: BOOLEAN
- display_name: TEXT
```

---

## 💻 Services

### `lotteryService.ts`
Lose-Verwaltung
- `awardLoses()` - Vergibt Lose nach Bewertung
- `getCurrentWeekLoses()` - Lädt aktuelle Wochendaten
- `getDaysUntilNextDraw()` - Countdown zur Ziehung

### `streakService.ts`
Streak-Verwaltung
- `updateStreak()` - Aktualisiert Streak nach Bewertung
- `getCurrentStreak()` - Lädt aktuellen Streak
- `isStreakProtectionAvailable()` - Prüft Schutz-Status

### `winnerService.ts`
Gewinner-Verwaltung
- `drawWeeklyWinners()` - Zieht Gewinner im fairen Modus (Admin)
- `getCurrentWeekWinners()` - Lädt aktuelle Gewinner
- `getAllWinners()` - Gewinner-Historie

### `scripts/weekly-draw.mjs`
CLI für Draw-Läufe (inkl. Testmodus)
- `npm run weekly-draw -- --week=2024-W30 --dry-run`
- Unterstützt `YYYY-MM-DD` und `YYYY-Www`
- Lädt optional `.env.local` und `.env` automatisch

Empfohlene ENV für CLI:
```env
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

Dry-Run Beispiel (verifiziert):
```bash
npm run weekly-draw -- --week=2024-W30 --dry-run
```
Ergebnis in dieser Umgebung:
- Zeitraum korrekt auf `2024-07-22` bis `2024-07-29` aufgelöst
- `Bewertungen: 0`, `Teilnehmer: 0`
- Keine DB-Schreiboperation (`Dry-run abgeschlossen` / keine Gewinner)

---

## 🎨 UI-Komponenten

### Geplante Komponenten

#### `LosesAnimation.tsx`
Ersetzt `PointsAnimation.tsx`
- Animierte Lose beim Sammeln
- Konfetti-Effekt bei Bonus-Losen

#### `StreakBadge.tsx`
Streak-Anzeige
- Flammen-Icon 🔥
- Tage-Counter
- Schutz-Status

#### `WinnerCard.tsx`
Gewinner-Darstellung
- Preis-Icon
- Name (oder Anonym)
- Datum

---

## 📱 Screens

### `LotteryScreen.tsx` (ehem. RewardsScreen)

**Sections:**
1. **Header**
   - "Deine Lose diese Woche: 🎟️ X"
   - Streak-Badge

2. **Countdown**
   - "Nächste Ziehung in: X Tagen"
   - Fortschrittsbalken

3. **Gewinner**
   - Aktuelle Woche
   - "Du hast gewonnen!" (falls zutreffend)
   - Gewinner-Liste

4. **Regeln**
   - Wie sammle ich Lose?
   - Streak-Bonus Erklärung

5. **Historie**
   - Vergangene Gewinner
   - Eigene Gewinn-Historie

### `RatingScreen.tsx` (angepasst)
- Integration von `awardLoses()`
- Integration von `updateStreak()`
- Anzeige der gesammelten Lose
- Streak-Update Feedback

---

## 🔧 Setup & Installation

### 1. Datenbank-Migration

```bash
# In Supabase SQL Editor ausführen:
supabase/lottery_system_schema.sql
```

### 2. Bestehende Daten

**Option A: Reset**
```sql
-- Alte Punkte-Felder aus app_users entfernen
ALTER TABLE app_users DROP COLUMN IF EXISTS points;
ALTER TABLE app_users DROP COLUMN IF EXISTS streak_days;
```

**Option B: Migration**
```sql
-- Punkte in Lose umwandeln (10 Punkte = 1 Los)
INSERT INTO loses (user_id, week_start, total_loses)
SELECT id, get_current_week_start(), FLOOR(points / 10)
FROM app_users WHERE points > 0;
```

### 3. Services importieren

```typescript
import { awardLoses, getCurrentWeekLoses } from './services/lotteryService';
import { updateStreak, getCurrentStreak } from './services/streakService';
import { getCurrentWeekWinners } from './services/winnerService';
```

---

## 📋 Checkliste Implementation

- [x] Datenbank-Schema erstellt
- [x] TypeScript-Typen definiert
- [x] lotteryService.ts implementiert
- [x] streakService.ts implementiert
- [x] winnerService.ts implementiert
- [ ] LosesAnimation Komponente
- [ ] StreakBadge Komponente
- [ ] WinnerCard Komponente
- [ ] LotteryScreen umbauen
- [ ] RatingScreen anpassen
- [ ] HomeScreen anpassen
- [ ] Dummy-Daten erstellen
- [ ] Testing
- [ ] Admin-Panel für Ziehung

---

## 🎮 User Flow

### Bewertung abgeben
1. User öffnet RatingScreen
2. Gibt Bewertung ab (Sterne, Emojis, optional Kommentar/Foto)
3. System vergibt Lose (1-3)
4. System aktualisiert Streak
5. Feedback: "🎟️ +2 Lose gesammelt! 🔥 5 Tage Streak!"

### Gewinner prüfen
1. User öffnet LotteryScreen
2. Sieht eigene Lose dieser Woche
3. Sieht Countdown zur nächsten Ziehung
4. Sieht aktuelle Gewinner
5. Falls gewonnen: "🎉 Glückwunsch! Du hast gewonnen!"

### Gewinn einlösen
1. Gewinner erhält Benachrichtigung
2. QR-Code wird generiert
3. Einlösung im Laden
4. Status: "Eingelöst ✓"

---

## 🔐 Sicherheit & Datenschutz

### Row Level Security (RLS)
- User sehen nur eigene Lose
- User sehen nur eigenen Streak
- Alle sehen Gewinner (mit Anonym-Option)
- Nur Admins können Gewinner ziehen

### Anonym-Option
- User können anonym bleiben
- Display-Name statt echtem Namen
- Einstellung in `user_settings`

---

## 🚀 Nächste Schritte

1. **UI-Komponenten bauen**
2. **Screens umbauen**
3. **Testing mit Dummy-Daten**
4. **Admin-Panel für Ziehung**
5. **Push-Benachrichtigungen für Gewinner**
6. **Analytics & Tracking**

---

## 📞 Support

Bei Fragen oder Problemen:
- Siehe `SUPABASE-SETUP.md` für Datenbank-Setup
- Siehe `EAS-BUILD-ANLEITUNG.md` für App-Build
- Services sind vollständig dokumentiert (JSDoc)

---

**Version:** 1.0.0  
**Datum:** 28.02.2026  
**Status:** In Entwicklung
