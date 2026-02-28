# 📱 EAS Build Anleitung für Paradieschen App

## ✅ Bereits erledigt:

1. ✅ EAS CLI installiert (`npm install -g eas-cli`)
2. ✅ `app.json` konfiguriert mit:
   - Name: "Paradieschen"
   - Package: "com.thomassiepmann.biotaste"
   - Version Code: 1
3. ✅ `eas.json` erstellt mit preview profile für APK

## 🚀 Nächste Schritte (manuell im Terminal):

### Schritt 1: EAS Login

```bash
cd /home/user/vibe-workspace/projects/biotaste-v3
eas login
```

**Zugangsdaten:**
- Username: `siepmannt`
- Passwort: `!2812Horioshi@`

### Schritt 2: Projekt konfigurieren

```bash
eas build:configure
```

Dieser Befehl wird:
- Eine Project ID erstellen
- Die `app.json` mit der Project ID aktualisieren
- Fragen ob du ein neues Projekt erstellen möchtest → **JA**

### Schritt 3: Android APK Build starten

```bash
eas build -p android --profile preview
```

**Was passiert:**
- Der Build läuft auf Expo-Servern (nicht lokal)
- Dauer: ca. 10-20 Minuten
- Du erhältst einen Link zum Download der APK

**Build-Optionen während des Prozesses:**
- "Generate a new Android Keystore?" → **YES** (beim ersten Mal)
- "Would you like to automatically create an EAS project?" → **YES**

### Schritt 4: APK herunterladen

Nach erfolgreichem Build:
1. Du erhältst einen Download-Link in der Konsole
2. Oder gehe zu: https://expo.dev/accounts/siepmannt/projects/biotaste-v3/builds
3. Lade die APK-Datei herunter

### Schritt 5: APK auf Android installieren

**Option A: Direkter Download auf dem Handy**
- Öffne den Download-Link auf deinem Android-Gerät
- Installiere die APK (erlaube "Unbekannte Quellen" falls nötig)

**Option B: Via USB**
```bash
# APK auf Handy übertragen
adb install pfad/zur/app.apk
```

## 🔧 Troubleshooting

### Problem: "Not logged in"
```bash
eas logout
eas login
```

### Problem: "No project found"
```bash
eas build:configure
# Wähle "Create a new project"
```

### Problem: Build schlägt fehl
- Prüfe ob alle Dependencies in `package.json` korrekt sind
- Stelle sicher dass `@react-native-async-storage/async-storage` installiert ist
- Prüfe die Build-Logs auf expo.dev

## 📋 Wichtige Infos

**Bundle Identifier:** `com.thomassiepmann.biotaste`
**App Name:** Paradieschen
**Version:** 1.0.0
**Version Code:** 1

**Build Profile:** preview (erstellt APK statt AAB)

## 🌐 Nützliche Links

- **Expo Dashboard:** https://expo.dev/accounts/siepmannt
- **Build Dokumentation:** https://docs.expo.dev/build/introduction/
- **EAS CLI Docs:** https://docs.expo.dev/eas/cli/

## ⚡ Schnellstart (alle Befehle)

```bash
cd /home/user/vibe-workspace/projects/biotaste-v3
eas login
eas build:configure
eas build -p android --profile preview
```

---

**Hinweis:** Der erste Build kann länger dauern. Nachfolgende Builds sind schneller da der Cache genutzt wird.
