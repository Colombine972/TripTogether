# TripTogether - Documentation API

> En attente de l'intégration Swagger - Documentation temporaire des routes API

## 📋 Table des matières
1. [Authentification](#authentification)
2. [Utilisateurs](#utilisateurs)
3. [Voyages](#voyages)
4. [Invitations](#invitations)
5. [Dépenses](#dépenses)
6. [Catégories de dépenses](#catégories-de-dépenses)

---

## Authentification

### POST `/auth/register`
Créer un nouveau compte utilisateur.

**Requête:**
```json
POST /auth/register
Content-Type: application/json

{
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean.dupont@email.com",
  "password": "SecurePassword123!"
}
```

**Réponse (201):**
```json
{
  "id": 1,
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean.dupont@email.com",
  "avatar_url": null
}
```

---

### POST `/auth/login`
Authentifier un utilisateur et obtenir un token JWT.

**Requête:**
```json
POST /auth/login
Content-Type: application/json

{
  "email": "jean.dupont@email.com",
  "password": "SecurePassword123!"
}
```

**Réponse (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstname": "Jean",
    "lastname": "Dupont",
    "email": "jean.dupont@email.com",
    "avatar_url": null
  }
}
```

---

## Utilisateurs

### GET `/users`
Récupérer la liste de tous les utilisateurs.

**Requête:**
```http
GET /users
```

**Réponse (200):**
```json
[
  {
    "id": 1,
    "firstname": "Jean",
    "lastname": "Dupont",
    "email": "jean.dupont@email.com",
    "avatar_url": null
  },
  {
    "id": 2,
    "firstname": "Marie",
    "lastname": "Martin",
    "email": "marie.martin@email.com",
    "avatar_url": null
  }
]
```

---

### GET `/users/:id`
Récupérer les informations d'un utilisateur spécifique.

**Requête:**
```http
GET /users/1
```

**Réponse (200):**
```json
{
  "id": 1,
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean.dupont@email.com",
  "avatar_url": null
}
```

---

### GET `/users/my-trips`
Récupérer tous les voyages de l'utilisateur connecté.

**Requête:**
```http
GET /users/my-trips
Authorization: Bearer <token_jwt>
```

**Réponse (200):**
```json
[
  {
    "id": 1,
    "title": "Vacances à Paris",
    "description": "Une semaine à découvrir la belle capitale",
    "city": "Paris",
    "country": "France",
    "start_at": "2025-06-15T00:00:00Z",
    "end_at": "2025-06-22T00:00:00Z",
    "user_id": 1,
    "image_url": "https://example.com/paris.jpg",
    "owner_firstname": "Jean",
    "owner_lastname": "Dupont"
  }
]
```

---

### PUT `/users/me`
Mettre à jour les informations du profil de l'utilisateur connecté.

**Requête:**
```json
PUT /users/me
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "firstname": "Jean-Paul",
  "lastname": "Dupont",
  "email": "jean.paul.dupont@email.com",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Réponse (200):**
```json
{
  "id": 1,
  "firstname": "Jean-Paul",
  "lastname": "Dupont",
  "email": "jean.paul.dupont@email.com",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

---

## Voyages

### GET `/trips`
Récupérer la liste de tous les voyages.

**Requête:**
```http
GET /trips
```

**Réponse (200):**
```json
[
  {
    "id": 1,
    "title": "Vacances à Paris",
    "description": "Une semaine à découvrir la belle capitale",
    "city": "Paris",
    "country": "France",
    "start_at": "2025-06-15T00:00:00Z",
    "end_at": "2025-06-22T00:00:00Z",
    "user_id": 1,
    "image_url": "https://example.com/paris.jpg",
    "owner_firstname": "Jean",
    "owner_lastname": "Dupont"
  }
]
```

---

### GET `/trips/count`
Récupérer le nombre total de voyages.

**Requête:**
```http
GET /trips/count
```

**Réponse (200):**
```json
{
  "count": 5
}
```

---

### GET `/trips/countries`
Récupérer la liste des pays des voyages.

**Requête:**
```http
GET /trips/countries
```

**Réponse (200):**
```json
[
  "France",
  "Espagne",
  "Italie",
  "Belgique"
]
```

---

### GET `/trips/info/:id`
Récupérer les informations détaillées d'un voyage.

**Requête:**
```http
GET /trips/info/1
```

**Réponse (200):**
```json
{
  "id": 1,
  "title": "Vacances à Paris",
  "description": "Une semaine à découvrir la belle capitale",
  "city": "Paris",
  "country": "France",
  "start_at": "2025-06-15T00:00:00Z",
  "end_at": "2025-06-22T00:00:00Z",
  "user_id": 1,
  "image_url": "https://example.com/paris.jpg",
  "owner_firstname": "Jean",
  "owner_lastname": "Dupont"
}
```

---

### GET `/trips/:id`
Récupérer les détails d'un voyage pour l'utilisateur connecté.

**Requête:**
```http
GET /trips/1
Authorization: Bearer <token_jwt>
```

**Réponse (200):**
```json
{
  "id": 1,
  "title": "Vacances à Paris",
  "description": "Une semaine à découvrir la belle capitale",
  "city": "Paris",
  "country": "France",
  "start_at": "2025-06-15T00:00:00Z",
  "end_at": "2025-06-22T00:00:00Z",
  "user_id": 1,
  "image_url": "https://example.com/paris.jpg",
  "owner_firstname": "Jean",
  "owner_lastname": "Dupont",
  "status": "futur"
}
```

---

### GET `/trips/:id/members`
Récupérer la liste des membres participants à un voyage.

**Requête:**
```http
GET /trips/1/members
```

**Réponse (200):**
```json
[
  {
    "id": 1,
    "firstname": "Jean",
    "lastname": "Dupont",
    "email": "jean.dupont@email.com",
    "avatar_url": null,
    "role": "owner"
  },
  {
    "id": 2,
    "firstname": "Marie",
    "lastname": "Martin",
    "email": "marie.martin@email.com",
    "avatar_url": null,
    "role": "participant"
  }
]
```

---

### POST `/trips`
Créer un nouveau voyage.

**Requête:**
```json
POST /trips
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "title": "Vacances à Barcelone",
  "description": "Explorer la architecture de Gaudi",
  "city": "Barcelone",
  "country": "Espagne",
  "start_at": "2025-07-10T00:00:00Z",
  "end_at": "2025-07-17T00:00:00Z",
  "image_url": "https://example.com/barcelona.jpg"
}
```

**Réponse (201):**
```json
{
  "id": 2,
  "title": "Vacances à Barcelone",
  "description": "Explorer la architecture de Gaudi",
  "city": "Barcelone",
  "country": "Espagne",
  "start_at": "2025-07-10T00:00:00Z",
  "end_at": "2025-07-17T00:00:00Z",
  "user_id": 1,
  "image_url": "https://example.com/barcelona.jpg",
  "owner_firstname": "Jean",
  "owner_lastname": "Dupont"
}
```

---

### DELETE `/trips/:id`
Supprimer un voyage (propriétaire uniquement).

**Requête:**
```http
DELETE /trips/2
Authorization: Bearer <token_jwt>
```

**Réponse (204):**
```
No Content
```

---

## Étapes du Voyage

### GET `/trips/:tripId/steps`
Récupérer toutes les étapes d'un voyage.

**Requête:**
```http
GET /trips/1/steps
Authorization: Bearer <token_jwt>
```

**Réponse (200):**
```json
[
  {
    "id": 1,
    "city": "Paris",
    "country": "France",
    "trip_id": 1,
    "image_url": "https://example.com/paris.jpg",
    "user_id": 1
  },
  {
    "id": 2,
    "city": "Lyon",
    "country": "France",
    "trip_id": 1,
    "image_url": "https://example.com/lyon.jpg",
    "user_id": 1
  }
]
```

---

### POST `/trips/:tripId/steps`
Ajouter une nouvelle étape au voyage.

**Requête:**
```json
POST /trips/1/steps
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "city": "Marseille",
  "country": "France",
  "image_url": "https://example.com/marseille.jpg"
}
```

**Réponse (201):**
```json
{
  "id": 3,
  "city": "Marseille",
  "country": "France",
  "trip_id": 1,
  "image_url": "https://example.com/marseille.jpg",
  "user_id": 1
}
```

---

### GET `/trips/:tripId/steps/:id/votes`
Récupérer les votes pour une étape.

**Requête:**
```http
GET /trips/1/steps/1/votes
Authorization: Bearer <token_jwt>
```

**Réponse (200):**
```json
[
  {
    "id": 1,
    "step_id": 1,
    "user_id": 1,
    "vote_value": 1,
    "user_firstname": "Jean",
    "user_lastname": "Dupont"
  },
  {
    "id": 2,
    "step_id": 1,
    "user_id": 2,
    "vote_value": 1,
    "user_firstname": "Marie",
    "user_lastname": "Martin"
  }
]
```

---

### POST `/trips/:tripId/steps/:id/votes`
Ajouter un vote pour une étape.

**Requête:**
```json
POST /trips/1/steps/1/votes
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "vote_value": 1
}
```

**Réponse (201):**
```json
{
  "id": 3,
  "step_id": 1,
  "user_id": 1,
  "vote_value": 1
}
```

---

### DELETE `/trips/:tripId/steps/:stepId`
Supprimer une étape du voyage.

**Requête:**
```http
DELETE /trips/1/steps/3
Authorization: Bearer <token_jwt>
```

**Réponse (204):**
```
No Content
```

---

## Invitations

### GET `/invitation/:id`
Récupérer une invitation spécifique (vérifie l'expiration).

**Requête:**
```http
GET /invitation/abc123xyz
```

**Réponse (200):**
```json
{
  "id": "abc123xyz",
  "trip_id": 1,
  "email": "invited@email.com",
  "status": "pending",
  "created_at": "2025-03-20T10:00:00Z",
  "expires_at": "2025-04-20T10:00:00Z"
}
```

---

### PATCH `/invitation/:id`
Accepter ou rejeter une invitation.

**Requête:**
```json
PATCH /invitation/abc123xyz
Content-Type: application/json

{
  "status": "accepted",
  "user_id": 2
}
```

**Réponse (200):**
```json
{
  "id": "abc123xyz",
  "trip_id": 1,
  "user_id": 2,
  "status": "accepted",
  "created_at": "2025-03-20T10:00:00Z",
  "accepted_at": "2025-03-22T14:30:00Z"
}
```

---

### GET `/trips/:id/invitations`
Récupérer toutes les invitations d'un voyage.

**Requête:**
```http
GET /trips/1/invitations
```

**Réponse (200):**
```json
[
  {
    "id": "inv001",
    "trip_id": 1,
    "email": "alice@email.com",
    "status": "pending",
    "created_at": "2025-03-20T10:00:00Z",
    "expires_at": "2025-04-20T10:00:00Z"
  },
  {
    "id": "inv002",
    "trip_id": 1,
    "user_id": 2,
    "email": "marie.martin@email.com",
    "status": "accepted",
    "created_at": "2025-03-19T09:00:00Z",
    "accepted_at": "2025-03-20T16:45:00Z"
  }
]
```

---

### POST `/trips/:id/invitations`
Envoyer une invitation pour rejoindre un voyage.

**Requête:**
```json
POST /trips/1/invitations
Content-Type: application/json

{
  "email": "alice@email.com"
}
```

**Réponse (201):**
```json
{
  "id": "inv001",
  "trip_id": 1,
  "email": "alice@email.com",
  "status": "pending",
  "created_at": "2025-03-20T10:00:00Z",
  "expires_at": "2025-04-20T10:00:00Z",
  "invitation_link": "https://triptogether.app/invitation/inv001"
}
```

---

### GET `/trips/:tripId/invitation/:id`
Récupérer les détails d'une invitation spécifique (vérifie l'expiration).

**Requête:**
```http
GET /trips/1/invitation/inv001
```

**Réponse (200):**
```json
{
  "id": "inv001",
  "trip_id": 1,
  "email": "alice@email.com",
  "status": "pending",
  "created_at": "2025-03-20T10:00:00Z",
  "expires_at": "2025-04-20T10:00:00Z"
}
```

---

### PATCH `/trips/:tripId/invitation/:id`
Modifier le statut d'une invitation.

**Requête:**
```json
PATCH /trips/1/invitation/inv001
Content-Type: application/json

{
  "status": "accepted",
  "user_id": 3
}
```

**Réponse (200):**
```json
{
  "id": "inv001",
  "trip_id": 1,
  "user_id": 3,
  "status": "accepted",
  "created_at": "2025-03-20T10:00:00Z",
  "accepted_at": "2025-03-22T14:30:00Z"
}
```

---

### DELETE `/invitation/:tripId/:userId`
Supprimer un utilisateur d'un voyage (via invitation).

**Requête:**
```http
DELETE /invitation/1/2
```

**Réponse (204):**
```
No Content
```

---

## Dépenses

### GET `/expenses/:id`
Récupérer toutes les dépenses pour un voyage.

**Requête:**
```http
GET /expenses/1
```

**Réponse (200):**
```json
[
  {
    "id": 1,
    "trip_id": 1,
    "description": "Hotel Paris",
    "amount": 450.00,
    "category": "hébergement",
    "paid_by_id": 1,
    "paid_by_firstname": "Jean",
    "paid_by_lastname": "Dupont",
    "date": "2025-06-15T00:00:00Z",
    "created_at": "2025-03-20T10:00:00Z"
  },
  {
    "id": 2,
    "trip_id": 1,
    "description": "Restaurant dîner",
    "amount": 85.50,
    "category": "restauration",
    "paid_by_id": 2,
    "paid_by_firstname": "Marie",
    "paid_by_lastname": "Martin",
    "date": "2025-06-16T19:30:00Z",
    "created_at": "2025-03-20T11:00:00Z"
  }
]
```

---

### POST `/expenses/:id`
Ajouter une nouvelle dépense pour un voyage.

**Requête:**
```json
POST /expenses/1
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "description": "Transport train",
  "amount": 120.00,
  "category": "transportt",
  "date": "2025-06-15T10:00:00Z"
}
```

**Réponse (201):**
```json
{
  "id": 3,
  "trip_id": 1,
  "description": "Transport train",
  "amount": 120.00,
  "category": "transport",
  "paid_by_id": 1,
  "paid_by_firstname": "Jean",
  "paid_by_lastname": "Dupont",
  "date": "2025-06-15T10:00:00Z",
  "created_at": "2025-03-20T12:00:00Z"
}
```

---

### GET `/expenses/:id/summary`
Récupérer le résumé des dépenses et les remboursements pour un voyage.

**Requête:**
```http
GET /expenses/1/summary
Authorization: Bearer <token_jwt>
```

**Réponse (200):**
```json
{
  "trip_id": 1,
  "total_expenses": 655.50,
  "per_person": 327.75,
  "expenses_count": 3,
  "participants": 2,
  "settled": [
    {
      "from_user_id": 2,
      "from_firstname": "Marie",
      "from_lastname": "Martin",
      "to_user_id": 1,
      "to_firstname": "Jean",
      "to_lastname": "Dupont",
      "amount": 167.75
    }
  ]
}
```

---

### GET `/expenses/:id/budget`
Récupérer le budget détaillé d'un voyage.

**Requête:**
```http
GET /expenses/1/budget
```

**Réponse (200):**
```json
{
  "trip_id": 1,
  "total_budget": 655.50,
  "by_category": {
    "hébergement": 450.00,
    "transport": 120.00,
    "restauration": 85.50
  },
  "by_person": {
    "1": {
      "firstname": "Jean",
      "lastname": "Dupont",
      "total_spent": 570.00
    },
    "2": {
      "firstname": "Marie",
      "lastname": "Martin",
      "total_spent": 85.50
    }
  }
}
```

---

### DELETE `/expenses/:id`
Supprimer une dépense.

**Requête:**
```http
DELETE /expenses/3
Authorization: Bearer <token_jwt>
```

**Réponse (204):**
```
No Content
```

---

### POST `/expenses/:id/shares`
Ajouter ou mettre à jour les partages de dépense entre participants.

**Requête:**
```json
POST /expenses/1/shares
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "expense_id": 1,
  "shares": [
    {
      "user_id": 1,
      "amount": 225.00
    },
    {
      "user_id": 2,
      "amount": 225.00
    }
  ]
}
```

**Réponse (201):**
```json
{
  "expense_id": 1,
  "shares": [
    {
      "id": 1,
      "expense_id": 1,
      "user_id": 1,
      "amount": 225.00
    },
    {
      "id": 2,
      "expense_id": 1,
      "user_id": 2,
      "amount": 225.00
    }
  ]
}
```

---

## Catégories de Dépenses

### GET `/categories`
Récupérer la liste de toutes les catégories de dépenses disponibles.

**Requête:**
```http
GET /categories
```

**Réponse (200):**
```json
[
  {
    "id": 1,
    "name": "hébergement"
  },
  {
    "id": 2,
    "name": "transport"
  },
  {
    "id": 3,
    "name": "restauration"
  },
  {
    "id": 4,
    "name": "activités"
  },
  {
    "id": 5,
    "name": "shopping"
  },
  {
    "id": 6,
    "name": "autre"
  }
]
```

---

## 🔐 Authentification

Tous les endpoints marqués avec 🔒 nécessitent un token JWT dans le header `Authorization`.

**Format du header:**
```
Authorization: Bearer <your_jwt_token>
```

Les tokens JWT sont obtenus via la route `/auth/login`.

---

## ⚠️ Codes d'Erreur Courants

- **400 Bad Request** : Données invalides ou paramètres manquants
- **401 Unauthorized** : Token manquant ou expiré
- **403 Forbidden** : Permissions insuffisantes pour effectuer l'action
- **404 Not Found** : Ressource non trouvée
- **409 Conflict** : Conflit de données (ex: email déjà utilisé)
- **500 Internal Server Error** : Erreur serveur

---

## 📝 Notes

- Les formats de date suivent la norme ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- Tous les corps de requête utilisent le format JSON
- Les réponses 204 (No Content) ne retournent aucun corps
- Certains champs optionnels peuvent ne pas être présents dans les réponses

---

**Dernière mise à jour:** 29 mars 2026
