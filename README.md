# Hangout Mobile (Expo Go)

Branche mobile du projet Hangout.

Cette branche contient uniquement :

- `server/` (API Node.js/Express + Sequelize)
- `mobile/HangoutMobile/` (application Expo Go)

## Prérequis

- Node.js 20+
- npm
- PostgreSQL
- Expo Go sur smartphone (iOS/Android)
- Même reseau Wi-Fi pour PC et smartphone

## 1. Installer les dépendances

Depuis la racine :

```bash
cd server
npm install

cd ../mobile/HangoutMobile
npm install
```

## 2. Configurer le serveur (variables d'environnement)

Créer le fichier `server/.env` avec au minimum :

```env
DB_USERNAME=hangout_user
DB_PASSWORD=mot_de_passe
DB_DATABASE=hangout_db
DB_HOST=127.0.0.1
DB_PORT=5432

PORT=3000

JWT_SECRET=une_cle_jwt_longue_et_securisee
JWT_EXPIRES_IN=2h

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## 3. Migrer la base de données

Depuis `server/` :

```bash
npx sequelize-cli db:migrate
```

Commandes utiles :

```bash
npx sequelize-cli db:migrate:status
npx sequelize-cli db:migrate:undo
```

## 4. Configurer l'API mobile

Editer `mobile/HangoutMobile/src/config.js` et mettre l'IP locale du PC :

```js
export const API_CONFIG = {
  BASE_URL: "http://TON_IP_LOCALE:3000/api",
  TIMEOUT: 10000,
};
```

Trouver l'IP locale sur Windows :

```bash
ipconfig
```

Prendre la ligne "Adresse IPv4".

## 5. Lancer le backend

```bash
cd server
node server.js
```

API disponible sur `http://localhost:3000`.

## 6. Lancer l'application mobile avec Expo Go

```bash
cd mobile/HangoutMobile
npx expo start --lan
```

Puis :

1. Ouvrir Expo Go sur le telephone
2. Scanner le QR code du terminal
3. L'application se lance

## Scripts utiles (mobile)

Dans `mobile/HangoutMobile` :

```bash
npm run start
npm run android
npm run ios
npm run web
```

## Depannage rapide

- Si le telephone ne se connecte pas : verifier que PC + telephone sont sur le meme Wi-Fi.
- Si l'API ne repond pas : verifier l'IP dans `src/config.js` et que `node server.js` tourne.
- Si tunnel pose probleme : preferer `--lan`.

## Notes

- Cette branche est dediee mobile.
- La branche `main` ne contient pas le dossier `mobile/`.
