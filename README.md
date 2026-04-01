# Contacts App

Application web full-stack de gestion de contacts avec authentification JWT.

**Stack** : React + Vite (frontend) | ASP.NET Core 10 (backend) | SQLite | JWT

---

## Prérequis

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 18+](https://nodejs.org/)

Vérifier les installations :
```bash
dotnet --version   # doit afficher 10.x.x
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

# Lancer le serveur (http://localhost:5000)
# Les migrations sont appliquées automatiquement au démarrage
dotnet run
```

Le backend démarre sur **http://localhost:5000**  
La documentation Swagger est accessible sur **http://localhost:5000/swagger**

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
5. Gérer vos **catégories** via le bouton "🏷️ Catégories"
6. Ajouter, modifier, supprimer vos contacts via les modales
7. Sélectionner une catégorie lors de la création/modification d'un contact
8. La barre de recherche filtre les contacts par nom, email, téléphone

---

## Fonctionnalités

- **Authentification** : inscription, connexion, déconnexion (JWT)
- **Contacts** : CRUD complet avec pagination (9 par page)
- **Catégories** : CRUD complet par utilisateur (Famille, Amis, Collègue, etc.)
- **Formulaires en modale** : ajout et modification de contacts et catégories
- **Recherche** : filtrage en temps réel sur nom, email, téléphone
- **Sécurité** : chaque utilisateur ne voit que ses propres données

---

## Structure du projet

```
contacts-app/
├── backend/               ← ASP.NET Core 10 API
│   ├── Controllers/       ← AuthController, ContactsController, CategoriesController
│   ├── Services/
│   │   ├── Auth/          ← IAuthService, AuthService
│   │   ├── Contacts/      ← IContactService, ContactService
│   │   └── Categories/    ← ICategoryService, CategoryService
│   ├── Models/            ← ApplicationUser, Contact, Category
│   ├── DTOs/
│   │   ├── Auth/          ← LoginDto, RegisterDto, AuthResponseDto
│   │   ├── Contacts/      ← ContactDto, CreateContactDto, UpdateContactDto
│   │   └── Categories/    ← CategoryDto, SaveCategoryDto
│   ├── Data/              ← AppDbContext (EF Core + SQLite)
│   ├── Migrations/        ← Migrations EF Core
│   └── Program.cs         ← Configuration et démarrage
│
└── frontend/              ← React + Vite
    └── src/
        ├── api/           ← Configuration Axios + intercepteurs JWT
        ├── contexts/      ← AuthContext (état global d'authentification)
        ├── components/
        │   ├── Layout/    ← Navbar, PrivateRoute
        │   ├── Contacts/  ← ContactCard, ContactForm, DeleteConfirmModal
        │   ├── Categories/← CategoriesManager (CRUD catégories)
        │   └── UI/        ← Modal, Spinner, SearchBar
        └── pages/         ← LoginPage, RegisterPage, DashboardPage, NotFoundPage
```

---

## Architecture de sécurité

- Les mots de passe sont hachés avec **bcrypt** (via ASP.NET Identity)
- Chaque session génère un **token JWT** signé (valide 60 min)
- Chaque contact et catégorie ont une colonne **UserId** : un utilisateur ne voit jamais les données d'un autre
- Le token est stocké dans **localStorage** et envoyé automatiquement via un intercepteur Axios
- Expiration du token détectée automatiquement → redirection vers `/login`

---

## API Endpoints

| Méthode | Route                  | Auth | Description                  |
|---------|------------------------|------|------------------------------|
| POST    | /api/auth/register     | Non  | Créer un compte              |
| POST    | /api/auth/login        | Non  | Se connecter                 |
| GET     | /api/contacts          | Oui  | Lister ses contacts (paginé) |
| GET     | /api/contacts/{id}     | Oui  | Voir un contact              |
| POST    | /api/contacts          | Oui  | Créer un contact             |
| PUT     | /api/contacts/{id}     | Oui  | Modifier un contact          |
| DELETE  | /api/contacts/{id}     | Oui  | Supprimer un contact         |
| GET     | /api/categories        | Oui  | Lister ses catégories        |
| POST    | /api/categories        | Oui  | Créer une catégorie          |
| PUT     | /api/categories/{id}   | Oui  | Modifier une catégorie       |
| DELETE  | /api/categories/{id}   | Oui  | Supprimer une catégorie      |

La documentation interactive complète est disponible sur **http://localhost:5000/swagger** (Swagger UI).
