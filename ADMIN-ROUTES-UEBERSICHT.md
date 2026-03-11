# Admin Dashboard Hinweis (Auslagerung)

Das frühere Admin-Web-Dashboard wurde aus `biotaste-v3` in ein eigenes Projekt ausgelagert:

- **Neuer Ort:** `/home/user/vibe-workspace/projects/biotaste-admin`
- **Start:**
  ```bash
  cd /home/user/vibe-workspace/projects/biotaste-admin
  npm install
  npm run admin
  ```
- **URL:** `http://localhost:3001/admin`

## Warum ausgelagert?
- Saubere Trennung zwischen Mobile-App (`biotaste-v3`) und Admin-Webserver
- Einfachere Wartung
- Geringeres Risiko für unbeabsichtigte Änderungen im App-Code

## Alte Referenzen
Historische Admin-Dokumentation und frühere Stände liegen weiterhin in den Backups unter:
- `backups/biotaste-v3-backup-20260302-0649/`
