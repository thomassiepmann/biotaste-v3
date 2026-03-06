# Backend Setup (lokal)

Diese Anleitung beschreibt ein minimales lokales Backend-Setup für die Mobile-App.

## 1) Python venv erstellen

```bash
cd /home/user/vibe-workspace
python3 -m venv .venv-backend
source /home/user/vibe-workspace/.venv-backend/bin/activate
```

## 2) Abhängigkeiten installieren

```bash
pip install -r /home/user/vibe-workspace/requirements.txt
```

## 3) Environment-Datei vorbereiten

Falls vorhanden:

```bash
cp /home/user/vibe-workspace/.env.example /home/user/vibe-workspace/.env
```

Alternativ die benötigten Variablen direkt setzen.

## 4) Backend starten

Je nach Projektstruktur gibt es typischerweise einen dieser Befehle:

```bash
python /home/user/vibe-workspace/app.py
```

oder

```bash
python /home/user/vibe-workspace/backend/app.py
```

## 5) Healthcheck prüfen

Standardmäßig wird Port `5000` erwartet:

```bash
curl http://localhost:5000/api/health
```

## 6) Mobile App auf Backend zeigen lassen

In `projects/biotaste-v3/.env` oder `.env.local`:

```env
# Android Emulator
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000

# iOS Simulator (Alternative)
# EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
```

Für physische Geräte:

```env
EXPO_PUBLIC_API_BASE_URL=http://<LAN-IP-DEINES-PC>:5000
```

## 7) Developer-Screen in der App

Im neuen Tab **Developer** kannst du prüfen:

- Backend Health
- Auth-Status (`/api/auth/me`)
- Reviews (`/api/reviews`)
- Lottery Status + Enter-Test (`/api/lottery/status`, `/api/lottery/enter`)
