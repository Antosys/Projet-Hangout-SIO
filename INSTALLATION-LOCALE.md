# Hangout - Guide d'installation (Client + Server)

Hangout est une application d'organisation d'événements avec :

- un front web React/Vite (dossier `client`),
- une API Node.js/Express + Sequelize (dossier `server`),
- une base PostgreSQL.

Fonctionnellement, la version PC couvre l'authentification (JWT), la gestion d'événements, inscriptions, messagerie de groupe, upload d'images et paiements Stripe.

## 1. Architecture du projet

Structure principale :

- `client/` : application web React + TypeScript + Vite.
- `server/` : API Express + Sequelize + PostgreSQL.
- `mobile/` : application mobile (hors scope de ce guide).

Flux de base :

- Le front appelle l'API sur `/api/...`.
- En développement, Vite proxie `/api` vers `http://localhost:5000`.
- Le serveur expose aussi les fichiers uploadés sur `/uploads`.

## 2. Prérequis (nouveau PC ou VPS)

Installe ces composants :

- Node.js 20 LTS (recommandé) + npm.
- PostgreSQL 14+.
- Git.
- (VPS production) Nginx + PM2 (recommandé).

Vérifier les versions :

```bash
node -v
npm -v
psql --version
```

## 3. Cloner le projet

```bash
git clone https://github.com/Antosys/Hangout event-app
cd event-app
```

## 4. Configuration PostgreSQL

### 4.1 Créer utilisateur + base

Exemple SQL à exécuter dans `psql` :

```sql
CREATE USER hangout_user WITH PASSWORD 'mot_de_passe_solide';
CREATE DATABASE hangout_db OWNER hangout_user;
GRANT ALL PRIVILEGES ON DATABASE hangout_db TO hangout_user;
```

### 4.2 Autoriser les connexions

Sur serveur distant/VPS, vérifier :

- `postgresql.conf` : `listen_addresses = '*'` (si accès réseau nécessaire).
- `pg_hba.conf` : règles autorisant l'hôte de l'API.

Puis redémarrer PostgreSQL.

## 5. Installer les dépendances

Depuis la racine du repo :

```bash
cd server
npm install

cd ../client
npm install
```

## 6. Variables d'environnement (obligatoire)

### 6.1 Fichier `server/.env`

Créer/éditer le fichier `server/.env` avec au minimum :

```env
DB_USERNAME=hangout_user
DB_PASSWORD=mot_de_passe_solide
DB_DATABASE=hangout_db
DB_HOST=127.0.0.1
DB_PORT=5432

PORT=5000

JWT_SECRET=remplace_par_une_cle_longue_et_aleatoire
JWT_EXPIRES_IN=1h

STRIPE_SECRET_KEY=sk_test_ou_sk_live...
STRIPE_PUBLIC_KEY=pk_test_ou_pk_live...
STRIPE_WEBHOOK_SECRET=whsec_...

CLIENT_URL=https://ton-domaine-front.com
```

> **Sécurité :** Ne jamais committer de vraies clés/secrets dans le repo. Si des secrets ont déjà été exposés (ex. via un push Git public), les régénérer immédiatement (JWT secret, clés Stripe, mot de passe DB).

### 6.2 Variables côté `client`

Dans l'état actuel du code :

- le front utilise `API_BASE_URL = '/api'` (pas de `.env` front obligatoire),
- la résolution vers le backend se fait via proxy Vite (dev) ou reverse-proxy Nginx (prod).

## 7. Initialiser la base avec Sequelize CLI

Depuis `server/` :

```bash
# Optionnel : crée la base via Sequelize (si droits suffisants)
npx sequelize-cli db:create

# Applique toutes les migrations
npx sequelize-cli db:migrate
```

Commandes utiles :

```bash
# Voir l'état des migrations
npx sequelize-cli db:migrate:status

# Annuler la dernière migration
npx sequelize-cli db:migrate:undo

# Annuler toutes les migrations
npx sequelize-cli db:migrate:undo:all
```

La migration `20250101000000-create-all-tables.js` crée les 8 tables suivantes dans le bon ordre :

| #   | Table           | Dépendances         |
| --- | --------------- | ------------------- |
| 1   | `Localisation`  | —                   |
| 2   | `Users`         | —                   |
| 3   | `Events`        | Users, Localisation |
| 4   | `GroupChats`    | Events              |
| 5   | `Inscriptions`  | Users, Events       |
| 6   | `Messages`      | GroupChats, Users   |
| 7   | `Payments`      | Users, Events       |
| 8   | `UserGroupChat` | Users, GroupChats   |

## 8. Lancer en développement (nouveau PC local)

### 8.1 Backend

Depuis `server/` :

```bash
node server.js
```

API disponible sur : `http://localhost:5000`

### 8.2 Frontend

Depuis `client/` :

```bash
npm run dev
```

Front disponible sur : `http://localhost:8080`

En développement, `client/vite.config.ts` proxie automatiquement :

- `/api` → `http://localhost:5000`
- `/uploads` → `http://localhost:5000`

## 9. Déploiement VPS (production)

### 9.1 Build du front

Depuis `client/` :

```bash
npm run build
```

Les fichiers statiques seront dans `client/dist`.

### 9.2 Exécuter le backend en service (PM2)

Depuis `server/` :

```bash
npm install -g pm2
pm2 start server.js --name hangout-api
pm2 save
pm2 startup
```

### 9.3 Configurer Nginx (front + proxy API)

Objectif conseillé :

- servir `client/dist` sur le domaine,
- proxifier `/api` et `/uploads` vers `http://127.0.0.1:5000`.

Exemple de bloc Nginx :

```nginx
server {
    listen 80;
    server_name ton-domaine.com;

    root /var/www/hangout/client/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ensuite :

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 9.4 HTTPS (recommandé)

Configurer TLS avec Certbot :

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d ton-domaine.com
```

## 10. Ajustements production à ne pas oublier

Dans le code actuel, certains points sont codés en dur avec `localhost` :

- `server/server.js` : le CORS est fixé sur `http://localhost:8080` → à remplacer par `process.env.CLIENT_URL`.
- `server/services/stripeService.js` : `success_url` et `cancel_url` pointent vers `http://localhost:8080/...` → à remplacer par `process.env.CLIENT_URL`.

Pour un VPS, ces valeurs doivent utiliser la variable `CLIENT_URL` définie dans `.env`.

## 11. Checklist de vérification finale

- [ ] PostgreSQL actif et accessible.
- [ ] `server/.env` correctement rempli.
- [ ] `npx sequelize-cli db:migrate` exécuté sans erreur.
- [ ] API répond sur `/api`.
- [ ] Uploads accessibles via `/uploads/...`.
- [ ] Front charge correctement et appelle l'API sans erreur CORS.
- [ ] Paiements Stripe testés en mode test avant la mise en production.

## 12. Dépannage rapide

- **Erreur DB auth/connexion refusée** :
  Vérifier `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, ainsi que `pg_hba.conf`.

- **Token invalide / erreur JWT** :
  Vérifier la présence de `JWT_SECRET` dans `.env` et redémarrer l'API.

- **Le front ne touche pas l'API** :
  Vérifier le proxy Vite en dev ou la config Nginx en prod (les blocs `location /api/` et `location /uploads/`).

- **404/500 sur certaines routes après migration** :
  Vérifier que `20250101000000-create-all-tables.js` a bien été exécuté (voir `npx sequelize-cli db:migrate:status`). Si le statut est `down`, relancer `npx sequelize-cli db:migrate`.

---

Si tu veux, je peux aussi générer automatiquement :

- un `server/.env.example` propre et prêt à copier,
- des scripts npm (`dev`, `start`, `migrate`) dans `server/package.json`,
- une version "production ready" de la config CORS + URLs Stripe basée sur `CLIENT_URL`.
