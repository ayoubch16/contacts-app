# Contacts App

Application web full-stack de gestion de contacts avec authentification JWT.

**Stack** : React + Vite (frontend) | ASP.NET Core 8 (backend) | SQLite | JWT

---

## Prérequis

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)

Vérifier les installations :
```bash
dotnet --version   # doit afficher 8.x.x
node --version     # doit afficher 18.x.x ou plus
```

---

## Lancer le projet

### 1. Backend (ASP.NET Core)

```bash
cd backend

# Restaurer les packages NuGet
dotnet restore

# Installer l'outil EF Core (une seule fois sur la machine)
dotnet tool install --global dotnet-ef

# Créer la première migration (génère le schéma de BDD)
dotnet ef migrations add InitialCreate

# Lancer le serveur (http://localhost:5000)
dotnet run
```

Le backend démarre sur **http://localhost:5000**
La documentation Swagger est accessible sur **http://localhost:5000**

### 2. Frontend (React + Vite)

Dans un **nouveau terminal** :

```bash
cd frontend

# Installer les dépendances npm
npm install

# Lancer le serveur de développement (http://localhost:5173)
npm run dev
```

Le frontend démarre sur **http://localhost:5173**

---

## Utilisation

1. Ouvrir **http://localhost:5173** dans le navigateur
2. Cliquer sur **"Créer un compte"**
3. Remplir le formulaire d'inscription
4. Une fois connecté, vous arrivez sur le **Dashboard**
5. Ajouter, modifier, supprimer vos contacts
6. La barre de recherche filtre en temps réel

---

## Structure du projet

```
contacts-app/
├── backend/          ← ASP.NET Core 8 API
│   ├── Controllers/  ← Routes HTTP (AuthController, ContactsController)
│   ├── Services/     ← Logique métier (AuthService, ContactService)
│   ├── Models/       ← Entités BDD (ApplicationUser, Contact)
│   ├── DTOs/         ← Objets de transfert de données
│   ├── Data/         ← AppDbContext (EF Core + SQLite)
│   └── Program.cs    ← Configuration et démarrage
│
└── frontend/         ← React + Vite
    └── src/
        ├── api/      ← Configuration Axios + intercepteurs JWT
        ├── contexts/ ← AuthContext (état global d'authentification)
        ├── components/
        │   ├── Layout/    ← Navbar, PrivateRoute
        │   ├── Contacts/  ← ContactCard, ContactForm, DeleteConfirmModal
        │   └── UI/        ← Spinner, SearchBar
        └── pages/    ← LoginPage, RegisterPage, DashboardPage, NotFoundPage
```

---

## Architecture de sécurité

- Les mots de passe sont hachés avec **bcrypt** (via ASP.NET Identity)
- Chaque session génère un **token JWT** signé (valide 60 min)
- Chaque contact a une colonne **UserId** : un utilisateur ne voit jamais les contacts d'un autre
- Le token est stocké dans **localStorage** et envoyé automatiquement via un intercepteur Axios

---

## API Endpoints

| Méthode | Route                | Auth | Description              |
|---------|----------------------|------|--------------------------|
| POST    | /api/auth/register   | Non  | Créer un compte          |
| POST    | /api/auth/login      | Non  | Se connecter             |
| GET     | /api/contacts        | Oui  | Lister ses contacts      |
| GET     | /api/contacts/{id}   | Oui  | Voir un contact          |
| POST    | /api/contacts        | Oui  | Créer un contact         |
| PUT     | /api/contacts/{id}   | Oui  | Modifier un contact      |
| DELETE  | /api/contacts/{id}   | Oui  | Supprimer un contact     |

La documentation interactive complète est disponible sur **http://localhost:5000** (Swagger UI).
