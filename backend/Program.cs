using System.Text;
using ContactsApp.API.Data;
using ContactsApp.API.Models;
using ContactsApp.API.Services.Auth;
using ContactsApp.API.Services.Categories;
using ContactsApp.API.Services.Contacts;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

/*
 * DECISION : Program.cs avec "top-level statements" (C# 10+).
 *
 * Plus besoin d'une classe Program avec une méthode Main.
 * Le code s'exécute directement → plus lisible.
 *
 * Ce fichier a deux responsabilités :
 * 1. BUILDER PHASE : configurer les services (DI container)
 * 2. APP PHASE : configurer le pipeline de requêtes HTTP (middleware)
 */

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// SECTION 1 : BASE DE DONNÉES
// ============================================================

/*
 * DECISION : AddDbContext enregistre AppDbContext dans le DI container.
 *
 * Lifetime "Scoped" (par défaut) = une instance par requête HTTP.
 * C'est parfait pour EF Core : chaque requête a son propre context,
 * pas de conflits entre requêtes parallèles.
 *
 * SQLite : la base sera créée dans le dossier d'exécution (backend/)
 */
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// ============================================================
// SECTION 2 : ASP.NET IDENTITY
// ============================================================

/*
 * DECISION : Configuration d'Identity.
 *
 * AddIdentity<ApplicationUser, IdentityRole> enregistre tous les services
 * d'Identity (UserManager, SignInManager, etc.) avec nos types personnalisés.
 *
 * On assouplit les règles de mot de passe pour le développement.
 * En production, on activerait RequireUppercase, RequireNonAlphanumeric, etc.
 */
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Règles de mot de passe
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;

    // L'email doit être unique
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>() // Utiliser EF Core + SQLite pour stocker les users
.AddDefaultTokenProviders();

// ============================================================
// SECTION 3 : AUTHENTIFICATION JWT
// ============================================================

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]!;

/*
 * DECISION : Configurer JWT Bearer Authentication.
 *
 * On dit à ASP.NET Core : "pour authentifier les requêtes, cherche un
 * token JWT dans le header Authorization: Bearer <token>"
 *
 * TokenValidationParameters définit comment VALIDER un token reçu :
 * - Vérifier la signature (avec la même clé secrète qu'on a utilisée pour signer)
 * - Vérifier que le token n'est pas expiré
 * - Vérifier l'Issuer et l'Audience
 */
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,            // Rejette les tokens expirés
        ValidateIssuerSigningKey = true,    // Vérifie la signature
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        // Tolérance d'horloge : 0 = strict. En prod, mettre 5 minutes pour les serveurs désynchronisés.
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ============================================================
// SECTION 4 : NOS SERVICES MÉTIER (Dependency Injection)
// ============================================================

/*
 * DECISION : AddScoped = une instance par requête HTTP.
 *
 * Alternatives :
 * - AddSingleton : une seule instance pour toute la durée de vie de l'app
 *   → pour les services stateless (caches, configurations)
 * - AddTransient : nouvelle instance à chaque injection
 *   → pour les services légers et stateless
 * - AddScoped : une instance par requête HTTP (partagée dans la même requête)
 *   → PARFAIT pour les services qui utilisent DbContext
 *
 * On enregistre l'interface → l'implémentation :
 * "Quand quelqu'un demande IAuthService, donne-lui AuthService"
 */
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IContactService, ContactService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

// ============================================================
// SECTION 5 : CORS (Cross-Origin Resource Sharing)
// ============================================================

/*
 * DECISION : CORS est obligatoire pour que le navigateur autorise
 * les requêtes du frontend (localhost:5173) vers le backend (localhost:5000).
 *
 * Par défaut, les navigateurs bloquent les requêtes cross-origin pour des
 * raisons de sécurité (Same-Origin Policy).
 *
 * On autorise UNIQUEMENT notre frontend en dev, pas "*" (tous les domaines).
 * En production, remplacer par l'URL réelle du frontend.
 */
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // URL Vite dev server
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ============================================================
// SECTION 6 : SWAGGER (documentation API interactive)
// ============================================================

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

/*
 * DECISION : Swagger UI avec support JWT.
 *
 * On configure Swagger pour qu'il inclue un bouton "Authorize" permettant
 * d'entrer le token JWT directement dans l'interface.
 * Très utile pour tester l'API sans avoir besoin de Postman/Insomnia.
 */
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ContactsApp API",
        Version = "v1",
        Description = "API de gestion des contacts avec authentification JWT"
    });

    // Ajouter le support JWT dans Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization. Format: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ============================================================
// CONSTRUCTION DE L'APPLICATION
// ============================================================

var app = builder.Build();

// ============================================================
// PIPELINE HTTP (l'ordre EST IMPORTANT)
// ============================================================

/*
 * DECISION : Pourquoi l'ordre du middleware est crucial ?
 *
 * Chaque requête HTTP traverse ces middlewares dans l'ordre.
 * Exemple : si on met Authorization avant Authentication,
 * l'autorisation se fait avant de savoir qui est l'utilisateur → bug.
 *
 * Ordre standard recommandé par Microsoft :
 * 1. Exception handling (pour attraper les erreurs globalement)
 * 2. HTTPS Redirection
 * 3. Routing
 * 4. CORS (avant Auth !)
 * 5. Authentication (qui es-tu ?)
 * 6. Authorization (qu'as-tu le droit de faire ?)
 * 7. Controllers
 */

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ContactsApp API v1");
        // Swagger disponible sur : http://localhost:5000/swagger
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseAuthentication(); // Lit et valide le JWT
app.UseAuthorization();  // Vérifie les [Authorize]
app.MapControllers();

// ============================================================
// MIGRATION AUTOMATIQUE AU DÉMARRAGE
// ============================================================

/*
 * DECISION : Appliquer les migrations EF Core automatiquement au démarrage.
 *
 * Cela crée le fichier contacts.db et toutes les tables si elles n'existent pas.
 * Pour un projet de démo/débutant c'est pratique.
 * En production, on préfèrerait appliquer les migrations manuellement
 * (pour contrôler exactement quand la BDD change).
 */
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();
