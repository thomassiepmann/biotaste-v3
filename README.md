# biotaste-v3

Mobile App zur Qualitäts-/Frische-Bewertung von Bio-Obst & Gemüse durch Mitarbeiter via Emojis.

## Projektstruktur

```
src/
├── components/
├── screens/
├── services/
├── types/
└── utils/

supabase/
├── migrations/
├── functions/
└── seed.sql

scripts/
docs/
```

## Entwicklungsumgebung

1. Node.js installieren
2. Expo CLI installieren: `npm install -g expo-cli`
3. Abhängigkeiten installieren: `npm install`
4. Entwicklungsserver starten: `npm start`

## Umgebungsvariablen

Erstelle eine `.env` Datei im Projektstamm mit folgenden Variablen:

```
EXPO_PUBLIC_SUPABASE_URL=deine_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key
```

## Lizenz

MIT License - siehe LICENSE Datei für Details.