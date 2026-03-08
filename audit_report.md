# 🔴 Senior Code Auditor Report - biotaste-v3

## 🔴 Kritische Fehler

| Datei | Zeile | Problem | Fix |
|-------|-------|---------|-----|
| `src/screens/RatingScreen.tsx` | 113-126 | **FEHLENDE Bias-Kontroll-Felder**: Bewertung speichert keine shift, location, batch_id, rated_at Metadaten. Verstößt gegen Masterplan-Datenbank-Regeln (EISERN). | `ALTER TABLE ratings ADD COLUMN shift TEXT, location TEXT, batch_id TEXT, rated_at TIMESTAMP;` und RatingScreen.tsx erweitern |
| `supabase/schema.sql` | 47-60 | **Falsche Bewertungs-Limit-Implementierung**: Limit (3/Tag) wird nur in App geprüft, nicht in DB. Race Condition möglich. | RLS Policy oder Trigger hinzufügen: `CHECK (daily_count <= 3)` oder DB-seitige Validierung |
| `supabase/schema.sql` | 73-93 | **product_averages View ignoriert n≥10 Regel**: Ampel wird IMMED gezeigt, nicht erst ab n≥10. Konfidenz-Stufen fehlen. | View erweitern: `CASE WHEN COUNT(r.id) < 10 THEN 'insufficient` |
| `src/screens/RatingScreen.tsx` | 87-166 | **Race Condition**: Bewertung wird in DB gespeichert BEVOR Tages-Limit geprüft wird. | Reihenfolge tauschen: Zuerst `awardLoses()` prüfen, dann rating speichern |
| `supabase/` | - | **3 kritische SQL Views fehlen**: v_product_signal, v_supplier_scorecard, v_weekly_action_report existieren nicht. | Neue SQL-Dateien erstellen mit den 3 Views per Masterplan-Spezifikation |
| `supabase/schema.sql` | 7 | **PIN als Plaintext**: Keine Hashing, 4-stellige PINs unsicher. | bcrypt/argon2 Hashing implementieren oder Auth-System migrieren |

## 🟡 Warnungen

| Datei | Zeile | Problem | Vorschlag |
|-------|-------|---------|-----------|
| `src/types/index.ts` | 38 | **Type Mismatch**: `loses_earned` in Interface, aber DB hat `points_earned` | Einheitliche Benennung: Interface oder DB anpassen |
| `supabase/schema.sql` + `app_users_schema.sql` | - | **Doppelte User-Tabellen: `users`, `app_users`, `auth.users` verwendet | Konsolidieren auf eine User-Tabelle mit RLS |
| `src/screens/HomeScreen.tsx` | 137-167 | **DUMMY_CHARGES statt Algorithmus**: Home-Screen zeigt statische Dummy-Daten, keine P_score-Berechnung | Priorisierungs-Algorithmus implementieren per Masterplan |
| `supabase/schema.sql` | 55 | **Fehlende Comment-Validierung: maxLength nur im Frontend, kein DB-Constraint | `CHECK (LENGTH(comment) <= 150)` hinzufügen |
| `src/services/lotteryService.ts` | 97 | **Race Condition bei concurrent calls: Mehrere schnelle Bewertungen können Limit überschreiten | DB-seitige Serialisierung oder Optimistic Locking |
| `App.tsx` | 17-52 | **Fehlende Error Boundaries: Keine Fehlerbehandlung für Navigation | React Error Boundary für Stack/Tabs implementieren |

## 🟢 Verbesserungen

| Datei | Bereich | Vorschlag | Priorität |
|-------|---------|-----------|-----------|
| `src/screens/RatingScreen.tsx` | UX | Schicht-Auswahl (Früh/Spät) für Bias-Kontrolle | Hoch |
| `src/screens/RatingScreen.tsx` | UX | Standort-Auto-Detection oder Auswahl | Hoch |
| `supabase/schema.sql` | Performance | Index auf ratings(user_id, created_at) für Limit-Prüfung | Mittel |
| `src/screens/HomeScreen.tsx` | Algorithmus | P_score = 0.30×R_einkauf + 0.25×U_anteil + 0.20×D_lücke + 0.15×N_faktor + 0.10×L_problem | Hoch |
| `src/services/` | TypeScript | Strict null checks aktivieren, keine `any` Typen | Mittel |
| `supabase/` | Monitoring | Audit-Logging für alle Bewertungen mit Metadaten | Niedrig |

## 📋 Masterplan-Status

| Feature | Status | Blocker |
|---------|--------|---------|
| M1 Bewertungs-Flow | 🔧 | FEHLEND: shift, location, batch_id, rated_at |
| M2 Admin Fokus | ⬜ | Nicht implementiert - Admin-Screen fehlt |
| M3 Home-Screen Algo | ⬜ | DUMMY_CHARGES statt P_score Algorithmus |
| M4 Ampel n≥10 | 🔧 | View zeigt Ampel immer, nicht erst ab n≥10 |
| M5 Lieferanten-Score | ⬜ | v_supplier_scorecard View fehlt komplett |
| M6 Aktionsbericht | ⬜ | v_weekly_action_report View fehlt komplett |
| M7 Chargen-ID | 🔧 | charge_id existiert, batch_id fehlt in Rating |

## 🚨 Nächster kritischer Schritt

**Die ratings-Tabelle muss SOFORT um die Bias-Kontroll-Felder (shift, location, batch_id, rated_at) erweitert werden und der RatingScreen.tsx entsprechend angepasst werden, da dies die Grundlage für alle Masterplan-Datenanalysen ist und aktuell komplett fehlt. |

---

**Audit durchgeführt am:** 2026-03-08  
**Auditor:** Senior Code Auditor (ridges-ai)  
**Umfang:** Komplette Codebase (React Native/Expo + Supabase/PostgreSQL)