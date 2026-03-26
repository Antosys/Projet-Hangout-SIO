# Hangout - Accès au site

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

## 2. Accès au site

Le site est actuellement hébergé, le back-end déployé sur Render et le front-end sur netlify. Le nom de domaine vient de amen.fr.

L'accès est possible à l'URL suivante : https://antoinegiblin-projet-bts.com/

Le back-end s'alimente à partir de n'importe quel appel API, ce qui veut dire qu'au lancement de la page, l'API ne répondra pas, il faudra attendre 50 secondes puis faire CTRL + F5 ou relancer la page web pour accéder au site avec l'API fonctionnelle. Comme ce projet est fictif, cela évite que l'application tourne 24h/24h.

Pour tester les différents accès :
`Email Mot de passe`

Rôle admin : admin@hangout.fr	admin2026!

Rôle organisateur : organisateur@hangout.fr	orga2026!

Rôle utilisateur : user@hangout.fr	user2026!

## 3. Inscription payante

Pour rejoindre un événement payant, vous pouvez utiliser la carte 4242 4242 4242 01/30 150 pour payer et vous inscrire gratuitement. Toute autre carte est refusée par l'environnement Stripe.
