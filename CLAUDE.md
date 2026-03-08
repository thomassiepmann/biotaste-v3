# CLAUDE.md — BioTaste v3 Projektdokumentation

> **Zweck dieses Dokuments:**
> Diese Datei ist für externe KI-Architekten/Entwickler ohne Kontext gedacht und beschreibt den aktuellen Stand von **BioTaste v3** vollständig.
>
> **WICHTIGE REGEL:** Diese Datei muss nach **jedem größeren Change** (Architektur, Login-Flow, Datenmodell, API, wichtige Bugfixes) aktualisiert werden.

---

## 1) Projekt-Überblick

### Was ist BioTaste?

**BioTaste** ist eine mobile Bewertungs-App (React Native / Expo) für interne Verkostungen (z. B. Obst/Gemüse/Bio-Produkte) in einem Team-/Unternehmenskontext.

Nutzer:
- geben ihren Namen ein (Name-basiertes Login)
- bewerten Produkte/Chargen
- sammeln Punkte
- sehen Belohnungen

Zusätzlich gibt es einen **Developer-/Debug-Screen**, um Backend-Integrationen und Connectivity zu prüfen.

### Für wen ist die App?

- Primär für interne Mitarbeiter:innen/Testpersonen
- Admin-/Entwicklerseitig für Debugging und Monitoring (Developer-Tab)

### Tech-Stack (komplett)

**Mobile App**
- Expo SDK `~54.0.0`
- React `19.1.0`
- React Native `0.81.5`
- TypeScript `~5.9.2`
- React Navigation (Stack + Bottom Tabs)
- AsyncStorage (`@react-native-async-storage/async-storage`)
- Supabase JS Client (`@supabase/supabase-js` `^2.38.5`)

**Backend/Services**
- Supabase (DB + REST via PostgREST)
- Optionales lokales Backend (Health/Auth/Reviews/Lottery-Endpunkte), erreichbar über `EXPO_PUBLIC_API_BASE_URL`

**Build/Tooling**
- Expo CLI
- EAS-Projekt-ID in `app.json` hinterlegt
- Git-basiertes Projekt

---

## 2) Architektur

### Ordnerstruktur (mit Erklärung)

```text
biotaste-v3/
├── app.json                    # Expo-Konfiguration (Name, Bundle-ID, Assets, EAS projectId)
├── App.tsx                     # App-Entry mit Navigation + Bootstrap-Flow (AsyncStorage)
├── index.ts                    # Expo Einstiegspunkt
├── package.json                # Scripts + Dependencies
├── .env.example                # Beispiel-Umgebungsvariablen
├── docs/
│   ├── backend-setup.md        # Anleitung lokales Backend
│   └── environment.md          # Connectivity-/Env-Hinweise
├── src/
│   ├── components/
│   │   ├── BackendHealthCard.tsx
│   │   └── ...                 # UI-Komponenten (Rating/Animation etc.)
│   ├── constants/
│   │   └── theme.ts            # Farbschema/Theming
│   ├── data/
│   │   └── dummyData.ts        # Dummy-Daten (Produkte/Chargen etc.)
│   ├── hooks/
│   │   ├── useBackendAuth.ts
│   │   ├── useBackendHealth.ts
│   │   ├── useBackendLottery.ts
│   │   └── useBackendReviews.ts
│   ├── lib/
│   │   ├── api.ts              # API-Wrapper für lokales Backend
│   │   └── supabase.ts         # Supabase-Client + Config-Check
│   ├── screens/
│   │   ├── NameInputScreen.tsx # Login-Flow (Name + Supabase app_users Validierung)
│   │   ├── HomeScreen.tsx
│   │   ├── RatingScreen.tsx
│   │   ├── RewardsScreen.tsx
│   │   └── DeveloperScreen.tsx # Debug-Status für Backend
│   └── types/
│       └── index.ts
└── supabase/
    ├── schema.sql              # Grundschema (users/products/charges/ratings/rewards)
    ├── app_users_schema.sql    # Login-Gate über registrierte Namen
    └── ratings_schema_update.sql # Emoji-Tags + Kommentarfeld
```

### Wie hängen App, Backend, Dashboard zusammen?

1. **App (Expo)**
   - Hauptprodukt für Endnutzer
   - Login via Name-Validierung gegen Supabase `app_users`
   - Nutzerdaten lokal via AsyncStorage (`userName`)

2. **Supabase**
   - Persistenz/Tabellen (mindestens `app_users`, zusätzlich Kernschema)
   - Login-Entscheidung hängt aktuell an `app_users`-Lookup

3. **Optionales lokales Backend** (separat vom React-Native-Projekt)
   - Endpunkte wie `/api/health`, `/api/auth/me`, `/api/reviews`, `/api/lottery/*`
   - Wird im Developer-Tab zur Diagnose verwendet

4. **Dashboard/Debug-Sicht**
   - In der mobilen App als `DeveloperScreen` implementiert
   - Zeigt Integrationsstatus und API-Reachability

### Navigation-Flow der App

Implementiert in `App.tsx`:

- Beim Start: `bootstrap()` liest `AsyncStorage.getItem('userName')`
- Falls Name vorhanden → Route `MainTabs`
- Falls nicht → Route `NameInput`

Stack:
- `NameInput`
- `MainTabs` (Bottom Tabs)
- `Rating`

Tabs:
- `Home` (Verkosten)
- `Rewards` (Belohnungen)
- `Developer` (Debug)

---

## 3) Supabase

### Tabellen, Spalten und Typen

#### A) Aus `supabase/schema.sql` (Basisschema)

1) `users`
- `id uuid` (PK, default `gen_random_uuid()`)
- `name text not null`
- `pin text`
- `points integer default 0`
- `streak_days integer default 0`
- `last_rating_date date`
- `role text default 'employee'`
- `active boolean default true`
- `created_at timestamptz default now()`

2) `products`
- `id uuid` (PK)
- `name text not null`
- `category text`
- `supplier text`
- `image_url text`
- `active boolean default true`
- `created_at timestamptz default now()`

3) `charges`
- `id uuid` (PK)
- `product_id uuid` (FK → `products.id`)
- `charge_code text not null`
- `delivery_date date not null`
- `supplier_batch text`
- `qr_code text unique`
- `active boolean default true`
- `created_at timestamptz default now()`

4) `ratings`
- `id uuid` (PK)
- `user_id uuid` (FK → `users.id`)
- `charge_id uuid` (FK → `charges.id`)
- `overall_stars integer` (Check 1..5)
- `taste_emoji text`
- `optic_emoji text`
- `texture_emoji text`
- `comment text`
- `photo_url text`
- `points_earned integer default 15`
- `created_at timestamptz default now()`
- Unique Constraint `(user_id, charge_id)`

5) `rewards`
- `id uuid` (PK)
- `name text not null`
- `points_cost integer not null`
- `description text`
- `icon text`
- `active boolean default true`

6) View `product_averages`
- Aggregierte Ratings pro Produkt/Charge inkl. Ampelstatus (green/yellow/red)

#### B) Login-relevantes Schema aus `supabase/app_users_schema.sql`

`app_users`
- `id uuid` (PK, default `gen_random_uuid()`)
- `name text unique not null`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Index:
- `idx_app_users_name_lower` auf `LOWER(name)` (case-insensitive Suche)

#### C) Schema-Update aus `supabase/ratings_schema_update.sql`

`ratings` erweitert um:
- `emoji_tags text[]`
- `comment text`

Index:
- `idx_ratings_emoji_tags` (GIN auf `emoji_tags`)

### RLS Policies

Explizit in `app_users_schema.sql` definiert:

- `ALTER TABLE app_users ENABLE ROW LEVEL SECURITY`
- Policy **Allow public read access**
  - `FOR SELECT USING (true)`
- Policy **Only admins can insert**
  - `FOR INSERT WITH CHECK (false)`
- Policy **Only admins can update**
  - `FOR UPDATE USING (false)`
- Policy **Only admins can delete**
  - `FOR DELETE USING (false)`

Interpretation:
- Lesen für Login-Validierung erlaubt
- Schreiben über App/API standardmäßig blockiert

### Welche User existieren in `app_users`?

Aus dem SQL-Seed in `app_users_schema.sql` (Beispieldaten):
- Max Mustermann
- Anna Schmidt
- Tom Weber
- Lisa Müller
- Peter Klein

> Hinweis: Das sind Seed-/Soll-Daten aus dem Repo. Der tatsächliche Live-Inhalt der Supabase-Tabelle kann abweichen, wenn manuell geändert wurde.

---

## 4) Screens & Features

### `NameInputScreen.tsx` (Login)
- Nutzer gibt Namen ein
- Validierung:
  1. leerer Name -> Fehlermeldung
  2. Supabase konfiguriert? (`isSupabaseConfigured`)
  3. Lookup in `app_users`:
     ```ts
     .from('app_users').select('name').ilike('name', trimmedName).single()
     ```
- Bei Treffer:
  - `AsyncStorage.setItem('userName', data.name)`
  - `navigation.reset({ routes: [{ name: 'MainTabs' }] })`
- Bei Fehler/kein Treffer:
  - Meldung „Name nicht bekannt…“ oder Verbindungsfehler

### `HomeScreen.tsx`
- Begrüßung mit lokal gespeichertem Namen
- Zeigt Dummy-Chargen/Produkte
- Navigation zu `Rating`
- Logout entfernt `userName` und springt zurück zu `NameInput`

### `RatingScreen.tsx`
- Bewertungsflow inkl. Sterne/Emoji/Kommentar (Details im Screen-Code)

### `RewardsScreen.tsx`
- Belohnungsdarstellung (Punkte-/Reward-Kontext)

### `DeveloperScreen.tsx`
- Health/Auth/Reviews/Lottery Status via `src/lib/api.ts`
- Nutzt `EXPO_PUBLIC_API_BASE_URL`
- Zeigt `OK/FAIL`, Fehlertexte, Endpunkte, Retry-Aktionen

### Komponenten/Hook-Features
- `BackendHealthCard` + Hooks (`useBackendHealth`, `useBackendAuth`, `useBackendReviews`, `useBackendLottery`)
- `src/lib/api.ts` kapselt REST-Calls und Fehlerbehandlung (`ApiError`)

### Login-Flow im Detail (wichtig)

1. App-Start -> Bootstrap liest `userName` aus AsyncStorage
2. Kein Name -> `NameInputScreen`
3. User klickt „Los geht’s!“
4. Name wird gegen `app_users` geprüft
5. Nur wenn gültig -> Speicherung lokal + Wechsel in `MainTabs`

Das ist ein **harter Gatekeeper**: Ohne passenden Supabase-Eintrag kein Login.

---

## 5) Aktueller Stand

### Was funktioniert (Stand Repo)
- Expo-App startet
- Navigation/Screen-Struktur ist konsistent
- Supabase-Konfiguration ist im Code vorhanden
- Name-basiertes Login ist implementiert
- Developer-Debug-Tab ist implementiert

### Was ist kaputt / kritisch

#### A) Login-Bug (aus Nutzersicht „Button tut nichts“)
Wahrscheinliche Ursachen:
1. eingegebener Name nicht in `app_users`
2. Supabase nicht erreichbar/fehlkonfiguriert
3. `.single()` schlägt fehl bei >1 Treffern (Duplikate)

User-Symptom: Klick auf „Los geht’s!“ ohne erwarteten Übergang in die App.

#### B) Dashboard/Backend startet nicht (insb. auf physischem Handy)
- `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000` ist **nur Emulator-kompatibel**
- Auf physischem Gerät muss LAN-IP genutzt werden (`http://<LAN-IP>:5000`)
- Folge: Developer-/Backend-Endpunkte (`/api/*`) failen

### Letzte relevante Änderungen (aus Git)

Top Commits:
- `1f50159` chore: ignore local artifacts and builds outputs
- `6a0da80` feat: add developer debug screen and backend diagnostics
- `d9d5366` fix: Supabase downgrade 2.98.0 -> 2.38.5 (Metro Bundler Bug)
- `2850815` feat: Supabase User-Validierung - nur registrierte Namen erlaubt
- `8bdf6f1` feat: Namen-basiertes Login mit AsyncStorage statt PIN-System
- `dd1d2c2` feat: SDK 54 downgrade - App läuft auf Handy mit Tunnel

Interpretation:
- Der Login ist seit einigen Änderungen deutlich restriktiver als früher.
- Gleichzeitig wurden Debug-/Backend-Features ergänzt, die von korrekter Netzwerk-Konfiguration abhängen.

---

## 6) `.env` Variablen (ohne echte Werte)

Aus `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_BASE_URL=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Hinweise:
- `EXPO_PUBLIC_*` wird in der Expo-App verwendet
- `SUPABASE_*` ist optional für CLI/Skripte (z. B. Weekly Draw)
- Secrets niemals committen

---

## 7) Bekannte Probleme & Entscheidungen

### Warum Supabase Downgrade auf `2.38.5`?
- Laut Commit-Historie wegen **Metro Bundler Bug** bei höherer Version.
- Entscheidung: stabile Version pinnen, um Build/Runtime-Probleme zu vermeiden.

### Warum Expo SDK 54?
- Laut Commit-Historie Downgrade, damit die App auf physischem Handy (inkl. Tunnel-Setup) stabil läuft.

### Relevante bisherige Bugfixes (aus Git-Historie)
- LoadingScreen Freeze behoben (NavigationContainer/Flow)
- UUID-Probleme in Dummy-Daten behoben
- Crash-safe Verhalten ohne Supabase-Konfiguration ergänzt
- Rating-Speicherung (emoji_tags/comment) erweitert
- Name-basiertes Login statt PIN-System eingeführt
- Nur registrierte User (`app_users`) zugelassen
- Developer-Diagnostics für Backend-Checks eingeführt

### Bekannte technische Risiken
- `ilike(...).single()` kann fehlschlagen bei Dateninkonsistenz (Mehrfachtreffer)
- Physische Geräte benötigen LAN-IP statt `10.0.2.2`
- Supabase-Verfügbarkeit/Policies beeinflussen Login direkt

---

## Wartungsregel für dieses Dokument

Bei jedem größeren Change bitte mindestens diese Bereiche aktualisieren:
- Architektur/Ordner
- Login-Flow
- Supabase-Schema/RLS
- Env-Konfiguration
- Aktueller Stand + offene Bugs
- Entscheidungslog (warum wurde etwas geändert)

**Verantwortung:** Wer den Change merged, aktualisiert `CLAUDE.md` im selben PR/Commit.
