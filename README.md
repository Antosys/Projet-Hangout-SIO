# Hangout Mobile (Expo Go)

Branche mobile du projet Hangout.

Cette branche contient tout le projet (client, server, mobile), mais elle est orientee utilisation mobile via Expo Go.

## Prerequis

- Node.js 20+
- npm
- Expo Go sur smartphone (iOS/Android)
- Meme reseau Wi-Fi pour PC et smartphone

## 1. Installer les dependances

Depuis la racine :

```bash
cd server
npm install

cd ../mobile/HangoutMobile
npm install
```

## 2. Configurer l'API mobile

Edite `mobile/HangoutMobile/src/config.js` et mets l'IP locale de ton PC :

```js
export const API_CONFIG = {
  BASE_URL: "http://TON_IP_LOCALE:3000/api",
  TIMEOUT: 10000,
};
```

Exemple d'IP locale sur Windows :

```bash
ipconfig
```

Prends l'"Adresse IPv4".

## 3. Lancer le backend

```bash
cd server
node server.js
```

API disponible sur `http://localhost:3000`.

## 4. Lancer l'application mobile avec Expo Go

```bash
cd mobile/HangoutMobile
npx expo start --lan
```

Puis :

1. Ouvre Expo Go sur le telephone
2. Scanne le QR code du terminal
3. L'application se lance

## Scripts utiles

Dans `mobile/HangoutMobile` :

```bash
npm run start
npm run android
npm run ios
npm run web
```

## Depannage rapide

- Si le telephone ne se connecte pas : verifie que PC + telephone sont sur le meme Wi-Fi.
- Si l'API ne repond pas : verifie l'IP dans `src/config.js` et que `node server.js` tourne.
- Si Tunnel pose probleme : prefere `--lan`.

## Notes

- Cette branche est dediee mobile.
- La branche `main` est la base sans le dossier `mobile/`.
