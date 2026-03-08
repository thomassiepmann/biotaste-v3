# 🔧 BioTaste v3 - Kritische Fixes (Senior Code Auditor)

## Durchgeführte Fixes

### 1. ✅ Bias-Kontroll Metadaten (Masterplan EISERN)
**Problem:** Bewertungen speicherten keine shift, location, batch_id, rated_at

**Fix:**
- `supabase/schema.sql`: Neue Spalten in ratings-Tabelle
  - `shift TEXT CHECK (shift IN ('frueh', 'spaet'))`
  - `location TEXT`
  - `batch_id TEXT`
  - `rated_at TIMESTAMP WITH TIME ZONE`
  
- `src/types/index.ts`: Rating Interface erweitert
  - `shift?: 'frueh' | 'spaet'`
  - `location?: string`
  - `batch_id?: string`
  - `rated_at?: string`

- `src/screens/RatingScreen.tsx`: 
  - `getCurrentShift()` Funktion hinzugefügt (6-14 Uhr = frueh)
  - Metadaten werden jetzt bei jeder Bewertung gespeichert

### 2. ✅ n≥10 Regel für Ampel (Masterplan EISERN)
**Problem:** Ampel wurde immer angezeigt, nicht erst ab n≥10

**Fix:**
- `supabase/schema.sql`: product_averages View aktualisiert
  - `confidence_level`: insufficient/indicative/robust
  - `ampel_status`: NULL wenn n<10
  - `ampel_text`: "Zu wenig Daten" wenn n<10

### 3. ✅ Race Condition bei Rating-Limit
**Problem:** Bewertung wurde gespeichert BEVOR Limit geprüft wurde

**Fix:**
- `src/screens/RatingScreen.tsx`: 
  - Tages-Limit wird JETZT VOR dem Speichern geprüft
  - Frühe Rückkehr wenn Limit erreicht

### 4. ✅ 3 Kritische SQL Views erstellt
**Problem:** v_product_signal, v_supplier_scorecard, v_weekly_action_report fehlten

**Fix:**
- `supabase/masterplan_views.sql` neu erstellt:
  - `v_product_signal`: Ampel + Konfidenz + P_score
  - `v_supplier_scorecard`: Lieferanten-Ranking
  - `v_weekly_action_report`: ACTION_REQUIRED/PROMOTE Empfehlungen

### 5. ✅ DB-Constraint für Comment-Länge
**Problem:** maxLength nur im Frontend, kein DB-Constraint

**Fix:**
- `supabase/schema.sql`: `CHECK (LENGTH(comment) <= 150)`

### 6. ✅ Schema-Update SQL
**Problem:** Bestehende DBs konnten nicht migriert werden

**Fix:**
- `supabase/ratings_schema_update.sql` erweitert:
  - ALTER TABLE für neue Spalten
  - Indizes für Performance

## Masterplan-Status nach Fixes

| Feature | Status | Blocker |
|---------|--------|---------|
| M1 Bewertungs-Flow | ✅ | - |
| M2 Admin Fokus | ⬜ | Admin-Screen fehlt |
| M3 Home-Screen Algo | 🔧 | P_score berechnet, Integration pending |
| M4 Ampel n≥10 | ✅ | - |
| M5 Lieferanten-Score | ✅ | View erstellt |
| M6 Aktionsbericht | ✅ | View erstellt |
| M7 Chargen-ID | ✅ | batch_id implementiert |

## Noch offen (Warnungen)

1. **Doppelte User-Tabellen**: `users`, `app_users`, `auth.users` konsolidieren
2. **PIN-Hashing**: Aktuell Plaintext, bcrypt empfohlen
3. **Home-Screen Algorithmus**: DUMMY_CHARGES durch P_score ersetzen
4. **Standort-Auswahl**: Aktuell hardcoded "Hauptfiliale"

## SQL Migration ausführen

```bash
# 1. Schema-Updates
psql -f supabase/ratings_schema_update.sql

# 2. Neue Views
psql -f supabase/masterplan_views.sql
```

---
**Fixes durchgeführt:** 2026-03-08  
**Auditor:** Senior Code Auditor (ridges-ai)