# Environment & Backend Connectivity

## Backend API URL für lokale Entwicklung

Die Mobile-App kann optional ein lokales Backend für einen Healthcheck verwenden.

Dafür in `.env` oder `.env.local` setzen:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000
```

Empfohlene Werte je Laufumgebung:

- **Android Emulator:** `http://10.0.2.2:5000`
- **iOS Simulator:** `http://localhost:5000`
- **Physisches Gerät (WLAN):** `http://<DEINE-LAN-IP>:5000`

## Sichtbarer Connectivity Check in der App

Im **Developer-Tab** gibt es eine Karte **„Backend Connectivity Check“**.

Die Karte zeigt:

- Endpoint
- Status (`OK`/`FAIL`)
- Backend-Version (falls verfügbar)
- Letzten Check-Zeitpunkt
- Fehlermeldung bei Netzwerk-/HTTP-Problemen

## Testschritte

1. Lokales Backend starten (Port 5000).
2. App mit Expo starten.
3. Developer-Tab öffnen.
4. In der Debug-Karte auf **„Erneut prüfen“** tippen.

Wenn das Backend erreichbar ist, sollte `status: ok` angezeigt werden.

## Weiterführende Doku

- Für vollständiges lokales Backend-Setup siehe: `docs/backend-setup.md`
