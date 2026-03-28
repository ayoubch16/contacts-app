using ContactsApp.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ContactsApp.API.Data;

/*
 * DECISION : Pourquoi hériter de IdentityDbContext<ApplicationUser> ?
 *
 * IdentityDbContext est une version spécialisée de DbContext qui :
 * 1. Crée automatiquement les tables nécessaires à ASP.NET Identity :
 *    - AspNetUsers (nos utilisateurs)
 *    - AspNetRoles (les rôles : Admin, User, etc.)
 *    - AspNetUserRoles (qui a quel rôle)
 *    - AspNetUserClaims, AspNetUserTokens, etc.
 *
 * 2. On lui passe notre ApplicationUser pour qu'il utilise notre
 *    classe étendue plutôt que la classe IdentityUser de base.
 *
 * Si on héritait juste de DbContext, on devrait créer toutes ces
 * tables manuellement → beaucoup de travail inutile.
 */
public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    /*
     * Le constructeur reçoit les options (chaîne de connexion SQLite, etc.)
     * qu'on configure dans Program.cs via la méthode AddDbContext.
     * On les passe au constructeur parent avec : base(options)
     */
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    /*
     * DbSet<Contact> = représente la table "Contacts" dans SQLite.
     * Grâce à cette propriété, on peut écrire :
     *   _context.Contacts.Where(c => c.UserId == userId).ToListAsync()
     * Et EF Core traduit ça en SQL : SELECT * FROM Contacts WHERE UserId = @userId
     */
    public DbSet<Contact> Contacts { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        /*
         * IMPORTANT : Toujours appeler base.OnModelCreating() en premier
         * quand on hérite de IdentityDbContext.
         * Sinon les tables d'Identity ne sont pas configurées correctement.
         */
        base.OnModelCreating(builder);

        /*
         * DECISION : Configuration Fluent API pour la table Contacts.
         *
         * On aurait pu tout mettre dans le Model avec des [Attributes],
         * mais la Fluent API est plus puissante pour des configurations complexes.
         * Ici on s'assure qu'EF Core crée un INDEX sur UserId.
         *
         * INDEX sur UserId : quand on filtre WHERE UserId = '...', SQLite
         * parcourt l'index au lieu de toute la table → requêtes beaucoup plus rapides
         * quand la table a beaucoup de données.
         */
        builder.Entity<Contact>(entity =>
        {
            // Index sur UserId pour accélérer les requêtes filtrées par utilisateur
            entity.HasIndex(c => c.UserId);

            // Index composite pour les recherches par nom
            entity.HasIndex(c => new { c.UserId, c.LastName });

            // Configuration de la relation Contact → ApplicationUser
            entity.HasOne(c => c.User)           // Un contact a un User
                  .WithMany(u => u.Contacts)      // Un User a plusieurs Contacts
                  .HasForeignKey(c => c.UserId)   // La FK est UserId
                  .OnDelete(DeleteBehavior.Cascade); // Si on supprime un User, ses contacts sont supprimés aussi
        });
    }
}
