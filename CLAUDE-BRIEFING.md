nano CLAUDE-BRIEFING.md
```

Drücke Enter. Ein Editor öffnet sich. Dann kopiere diesen Text und füge ihn ein (Rechtsklick → Einfügen oder Strg+Shift+V):
```
# BRIEFING FUER CLAUDE CODE
# Stand: 13.03.2026

## DRINGEND: Morgen Praesentation vor Kurt!

## Projekt: biotaste-v3 (Mobile App)
- Tech: Expo SDK 54, React Native, TypeScript, Supabase
- Supabase Projekt-ID: raqvtzzzvhvhyfwyqokm
- Login nutzt employees-Tabelle (nicht app_users!)
- KEIN Lose/Streak-System (liegt in src/_legacy/, nicht anfassen)

## Was erledigt wurde:
- VerlosungsScreen.tsx erstellt, App.tsx aktualisiert
- TypeScript kompiliert fehlerfrei
- Legacy Code in src/_legacy/ verschoben
- Login nutzt jetzt employees Tabelle

## Was JETZT zu tun ist:
1. Login-Texte in src/screens/NameInputScreen.tsx aendern:
   - Wer bist du heute? aendern zu Mitarbeiter-Login
   - Dein Name z B Max Mustermann aendern zu Name eingeben (min. 3 Buchstaben)
   - fuer Punktezwecke aendern zu Gib die ersten 3 Buchstaben deines Namens ein.
2. git add . und git commit -m fix: update login texts und git push
3. Testen: npx expo start

## REGELN:
- KEINE eigenmaechtige Aenderungen
- JEDE Aenderung sofort committen und pushen
- .env NIEMALS committen
- src/_legacy/ NICHT anfassen
```

Dann drücke: **Strg+O** → **Enter** → **Strg+X**

Dann sag dem Claude Code Chat in VS Code:
```
Lies die Datei CLAUDE-BRIEFING.md und führe die Aufgaben aus.

