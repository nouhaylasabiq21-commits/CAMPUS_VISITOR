# Campus Visitor Frontend — ENS Marrakech

Interface React pour le système de gestion des visiteurs du campus.

## Installation

```bash
npm install
cp .env.example .env
npm start
```

## Variables d'environnement

```
REACT_APP_API_URL=http://localhost:3000
```

## Structure du projet

```
src/
├── context/
│   └── AuthContext.jsx       # Gestion JWT + état utilisateur global
├── services/
│   └── api.js                # Tous les appels API (auth, visitors, hosts, visits, logs)
├── components/
│   ├── Layout.jsx            # Sidebar + navigation par rôle
│   ├── Layout.css
│   └── ProtectedRoute.jsx    # Guard routes par rôle
├── pages/
│   ├── Login.jsx             # Connexion multi-profil
│   ├── Dashboard.jsx         # Statistiques temps réel
│   ├── Visits.jsx            # CRUD visites + check-in/out + statuts
│   ├── Visitors.jsx          # CRUD visiteurs
│   ├── Hosts.jsx             # CRUD hôtes (admin)
│   ├── CheckIn.jsx           # Interface check-in/check-out rapide
│   └── Logs.jsx              # Journal des événements
```

## Rôles et permissions

| Page         | admin | agent | host | visitor |
|--------------|:-----:|:-----:|:----:|:-------:|
| Dashboard    | ✓     | ✓     | ✓    | —       |
| Visites      | ✓     | ✓     | ✓    | ✓       |
| Visiteurs    | ✓     | ✓     | ✓    | —       |
| Hôtes        | ✓     | ✓     | ✓    | —       |
| Check-in/out | ✓     | ✓     | —    | —       |
| Journal      | ✓     | ✓     | ✓    | —       |

## Connexion

Lors du login, sélectionnez le type de profil correspondant à votre compte :

- **Admin / Hôte** → table `hosts`
- **Visiteur / Agent / Admin visiteur** → table `visitors`
