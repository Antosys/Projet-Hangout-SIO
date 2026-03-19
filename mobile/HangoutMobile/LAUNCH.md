# HangoutMobile - Guide de démarrage

## 🚀 Lancement rapide

### Mode 1: LAN (WiFi - RECOMMANDÉ)

```bash
npx expo start --lan
```

**Avantages:**
✅ Pas besoin de ngrok
✅ Connexion plus stable
✅ Fonctionne sur les appareils locaux
✅ Pas de limitation de bande passante

**Pour iPhone:**

1. Installer Expo Go depuis l'App Store
2. Scannez le code QR displayed dans le terminal
3. L'app charge automatiquement

### Mode 2: App developnement build (Recommandé pour production)

```bash
npx eas build --platform ios --profile development
```

**Avantages:**
✅ Vrai build iOS (.ipa)
✅ Peut être distribué directement
✅ TestFlight compatible

### Mode 3: Web (pour tests rapides)

```bash
npx expo start --web
```

### Mode 4: Tunnel (pas recommandé actuellement)

```bash
npx expo start --tunnel
```

**⚠️ Attention:** Le mode tunnel a des problèmes connus avec ngrok sur Windows. Utilisez LAN à la place.

---

## 📱 Configuration de l'API

**Avant de tester**, mettez à jour l'IP du serveur backend dans `src/config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: "http://YOUR_IPADDRESS:3000/api", // Remplacer YOUR_IPADDRESS
  TIMEOUT: 10000,
};
```

**Trouver votre IP:**

```bash
ipconfig
```

Cherchez la ligne "Adresse IPv4"

---

## 🔧 Scripts de lancement

### PowerShell (Windows)

```bash
powershell -ExecutionPolicy Bypass -File start-dev.ps1
```

### Terminal/Bash (macOS/Linux)

```bash
bash start.sh
```

---

## 📡 Accès distant (avec tunnel - si ça marche)

Si le tunnel fonctionne:

```bash
npx expo start --tunnel
```

**Pour iPhone:**

1. Installer Expo Go
2. Cliquez sur "Scan QR code"
3. Scannez le code QR du terminal

---

## 🏗️ Build production iOS

### Avec EAS (Recommandé)

```bash
# Login
eas login

# Build development
eas build --platform ios --profile development

# Build production
eas build --platform ios
```

### Sans EAS (Expo Go)

```bash
npx expo start --lan
```

---

## 📊 Dépannage

### Erreur: "ConfigError: The expected package.json path... does not exist"

➜ Vérifiez que vous êtes dans le bon répertoire:

```bash
cd c:\CFA\Hangout\Projet\event-app\mobile\HangoutMobile
```

### Erreur: "@expo/ngrok installation fails"

➜ Utilisez le mode LAN à la place:

```bash
npx expo start --lan
```

### L'API ne répond pas

➜ Vérifiez que:

1. Le serveur backend est lancé
2. L'IPv4 dans `src/config.js` est correcte
3. Le backend et mobile sont sur le même Wi-Fi

---

## 🎯 Workflow recommandé

```bash
# 1. S'assurer que le backend fonctionne
cd server
node server.js

# 2. Dans un autre terminal, lancer l'app mobile
cd mobile/HangoutMobile
npx expo start --lan

# 3. Sur iPhone: Scannez le QR code
```

---

## 📚 Ressources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [EAS (Expo Application Services)](https://eas.expo.dev/)

---

**Status:** ✅ Prêt pour développement et production
