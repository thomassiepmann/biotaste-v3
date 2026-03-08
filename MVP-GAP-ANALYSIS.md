# BioTaste-v3 MVP Gap Analysis

**Datum:** 08.03.2026
**Ziel:** Identifikation aller offenen TODOs, fehlenden Features und Bugs fuer einen funktionierenden MVP

---

## Executive Summary

| Kategorie | Anzahl | Prioritaet |
|-----------|--------|------------|
| Kritische Bugs | 4 | KRITISCH |
| Fehlende MVP-Features | 6 | HOCH |
| Offene TODOs | 8 | MITTEL |
| Technische Schulden | 3 | NIEDRIG |

**Gesamtfortschritt:** ca. 60% (Backend fertig, UI-Komponenten fertig, Screen-Integration ausstehend)

---

## KRITISCHE BUGS (MVP-Blocker)

### Bug 1: TypeScript Type Mismatch in dummyData.ts
**Datei:** `src/data/dummyData.ts`
**Status:** BLOCKIERT Kompilierung

**Problem:**
Die DUMMY_USERS verwenden veraltete Felder (points, streak_days) die im aktuellen User Interface nicht mehr existieren.

**Fix erforderlich:**
Entferne points und streak_days aus DUMMY_USERS.

---

### Bug 2: RewardsScreen verwendet noch altes Punkte-System
**Datei:** `src/screens/RewardsScreen.tsx`
**Status:** VERALTETE LOGIK

**Problem:**
- Zeigt mockPoints = 0 an (hartkodiert)
- Verwendet DUMMY_REWARDS (altes Belohnungssystem)
- Zeigt veraltete Punkt-Regeln an
- Keine Integration mit Lottery-System

**Loesung:** RewardsScreen durch LotteryScreen ersetzen

---

### Bug 3: App.tsx referenziert falschen Screen
**Datei:** `App.tsx`
**Status:** NAVIGATION FEHLERHAFT

**Problem:**
Importiert und verwendet RewardsScreen statt LotteryScreen.

**Impact:** User koennen die Lotterie-Funktion nicht nutzen

---

### Bug 4: RatingScreen - Foto-Upload TODO nicht implementiert
**Datei:** `src/screens/RatingScreen.tsx`
**Status:** UNVOLLSTAENDIG

**Problem:**
const hasPhoto = false; // TODO: Foto-Upload implementieren

**Impact:** User koennen keine Fotos zu Bewertungen hinzufuegen (fehlendes Los)

---

## FEHLENDE MVP-FEATURES

### Feature 1: LotteryScreen erstellen (ersetzt RewardsScreen)
**Prioritaet:** KRITISCH
**Status:** Noch nicht implementiert

**Anforderungen:**
- Header mit Lose-Anzeige
- Countdown zur Ziehung
- Gewinner-Liste
- Regeln-Section
- Historie

**Abhaengigkeiten:** Alle Services sind bereits implementiert

---

### Feature 2: Admin-Screen fuer Gewinner-Ziehung
**Prioritaet:** HOCH
**Status:** Noch nicht implementiert

**Anforderungen:**
- QR-Code Generierung fuer Gewinne
- Gewinn-Einloesung markieren
- Manuelle Gewinner-Ziehung

---

### Feature 3: Datenbank-Migration durchfuehren
**Prioritaet:** KRITISCH
**Status:** Noch nicht ausgefuehrt

**Erforderliche Schritte:**
1. SQL Schema in Supabase ausfuehren: supabase/lottery_system_schema.sql
2. Alte Punkte-Felder entfernen/migrieren

**Impact:** Ohne Migration funktioniert das Lottery-System nicht

---

### Feature 4: Dummy-Daten aktualisieren
**Prioritaet:** MITTEL
**Status:** Teilweise veraltet

**Probleme:**
- DUMMY_USERS hat veraltete Felder
- DUMMY_REWARDS ist veraltet
- Fehlende Dummy-Daten fuer Lose, Streaks, Gewinner

---

### Feature 5: Push-Benachrichtigungen fuer Gewinner
**Prioritaet:** NIEDRIG (Optional fuer MVP)
**Status:** Nicht implementiert

---

### Feature 6: Foto-Upload fuer Bewertungen
**Prioritaet:** MITTEL
**Status:** TODO offen

---

## OFFENE TODOs IM CODEBASE

1. **RatingScreen.tsx:110** - Foto-Upload implementieren
2. **SUPABASE-SETUP.md:196-202** - RatingScreen Speicherung (moeglicherweise veraltet)
3. **docs/backend-setup.md:16** - Absoluter Pfad in Dokumentation
4. **IMPLEMENTATION-STATUS.md** - Screens umbauen (teilweise erledigt)

---

## TECHNISCHE SCHULDEN

1. **Veraltete Dokumentation** - SUPABASE-SETUP.md zeigt altes Punkte-System
2. **Nicht verwendete Imports** - HomeScreen verwendet DUMMY Daten statt Supabase
3. **Error Handling** - Services propagieren Fehler nicht an UI
4. **Keine Testabdeckung** - Keine Unit Tests, Integration Tests oder E2E Tests vorhanden
5. **Console Logs in Production** - Mehrere console.error Aufrufe im Code (sollten durch Logging-Framework ersetzt werden)

---

## BEREITS IMPLEMENTIERT

### Backend & Services (100%)
- Datenbank-Schema
- TypeScript Typen
- lotteryService.ts
- streakService.ts
- winnerService.ts
- weekly-draw.mjs

### UI-Komponenten (100%)
- LosesAnimation.tsx
- StreakBadge.tsx
- WinnerCard.tsx

### Screens (Teilweise)
- HomeScreen.tsx - Lose-Anzeige & Streak integriert
- RatingScreen.tsx - Lose-Vergabe & Streak-Update integriert
- NameInputScreen.tsx - Login mit Supabase
- LotteryScreen.tsx - FEHLT
- RewardsScreen.tsx - VERALTET

---

## MVP-READINESS ASSESSMENT

### Was funktioniert bereits?
1. User-Login mit Namen
2. Produkt-Bewertung mit Sternen & Emojis
3. Lose-Vergabe nach Bewertung
4. Streak-Tracking & Bonus-Lose
5. Datenbank-Integration

### Was blockiert den MVP?
1. RewardsScreen zeigt falsches System an
2. LotteryScreen fehlt komplett
3. TypeScript Fehler in dummyData.ts
4. Datenbank-Migration nicht durchgefuehrt

### Was ist fuer MVP optional?
1. Push-Benachrichtigungen
2. Foto-Upload
3. Admin-Screen (kann ueber CLI erfolgen)
4. Analytics & Tracking

---

## EMPFOHLENE REIHENFOLGE

### Phase 1: Kritische Fixes (1-2 Tage)
1. Fix TypeScript Fehler in dummyData.ts
2. LotteryScreen.tsx erstellen
3. App.tsx aktualisieren (Rewards -> Lottery)
4. Datenbank-Migration durchfuehren

### Phase 2: MVP-Features (2-3 Tage)
5. Dummy-Daten aktualisieren
6. Testing durchfuehren
7. Dokumentation aktualisieren

### Phase 3: Optional (nach MVP)
8. Admin-Screen
9. Push-Benachrichtigungen
10. Foto-Upload
11. Analytics

---

## TESTING GAPS

### Fehlende Test-Typen

| Test-Typ | Status | Prioritaet |
|----------|--------|------------|
| Unit Tests | Nicht vorhanden | HOCH |
| Integration Tests | Nicht vorhanden | HOCH |
| E2E Tests | Nicht vorhanden | MITTEL |
| Snapshot Tests | Nicht vorhanden | NIEDRIG |

### Kritische Test-Szenarien (manuell durchfuehren)

1. **Lose-Vergabe**
   - Basis-Los fuer Bewertung
   - +1 Los fuer Kommentar
   - +1 Los fuer Foto
   - Tages-Limit (max 3)

2. **Streak-Logik**
   - Streak erhoehen bei taeglicher Bewertung
   - Streak-Schutz bei Unterbrechung
   - Monatlicher Reset des Schutzes
   - Bonus-Lose bei Meilensteinen

3. **Gewinner-Ziehung**
   - Faire Ziehung (alle gleiche Chance)
   - Keine Duplikate
   - Qualitaets-Gewinner korrekt ermittelt

4. **Datenbank-RLS**
   - User sieht nur eigene Daten
   - Gewinner sind oeffentlich sichtbar
   - Nur Admins koennen Gewinner erstellen

---

## DETAILLIERTE CODE-ANALYSE

### Datenbank-Schema Status
| Tabelle | Status | Bemerkung |
|---------|--------|-----------|
| app_users | Fertig | Existiert, wird verwendet |
| ratings | Fertig | Erweitert mit emoji_tags, comment |
| loses | Ausstehend | Schema definiert, nicht deployed |
| streaks | Ausstehend | Schema definiert, nicht deployed |
| winners | Ausstehend | Schema definiert, nicht deployed |
| user_settings | Ausstehend | Schema definiert, nicht deployed |

---

## RISIKOBEWERTUNG

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Datenbank-Migration schlaegt fehl | Mittel | Hoch | Backup vor Migration |
| TypeScript Build-Fehler | Hoch | Mittel | Vor Deployment fixen |
| User verwirrt durch alten Screen | Hoch | Mittel | Schnell LotteryScreen bauen |
| Streak-Logik Bugs | Mittel | Mittel | Gruendlich testen |

---

## NAECHSTE SCHRITTE

### Sofort (Heute)
1. Fix: dummyData.ts TypeScript Fehler beheben
2. Erstellen: LotteryScreen.tsx
3. Update: App.tsx mit LotteryScreen

### Kurzfristig (Diese Woche)
4. Datenbank-Migration in Supabase durchfuehren
5. Testing mit realen Daten
6. Dokumentation aktualisieren

### Mittelfristig (Naechste Woche)
7. Admin-Screen fuer interne Verwaltung
8. Beta-Test mit kleiner User-Gruppe

---

**Analyse erstellt:** 08.03.2026
