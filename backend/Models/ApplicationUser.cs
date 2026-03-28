using Microsoft.AspNetCore.Identity;

namespace ContactsApp.API.Models;

/*
 * DECISION : Pourquoi hériter de IdentityUser ?
 *
 * ASP.NET Identity fournit déjà une classe "IdentityUser" avec :
 * - Id (GUID unique par utilisateur)
 * - Email, UserName
 * - PasswordHash (le mot de passe est automatiquement haché, jamais stocké en clair)
 * - Et plein d'autres champs utiles (LockoutEnabled, AccessFailedCount, etc.)
 *
 * En héritant d'IdentityUser, on ÉTEND ce comportement existant au lieu de
 * tout recréer from scratch. C'est le principe DRY (Don't Repeat Yourself).
 *
 * On ajoute uniquement les champs SPÉCIFIQUES à notre app.
 */
public class ApplicationUser : IdentityUser
{
    // Prénom de l'utilisateur (affiché dans la navbar par exemple)
    public string FirstName { get; set; } = string.Empty;

    // Nom de famille
    public string LastName { get; set; } = string.Empty;

    // Date d'inscription (= quand le compte a été créé)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /*
     * RELATION : Un utilisateur possède une LISTE de contacts.
     * C'est une relation One-to-Many : 1 utilisateur → N contacts.
     * Le "= new List<>()" initialise la liste pour éviter les NullReferenceException.
     *
     * Entity Framework Core va créer automatiquement la clé étrangère
     * UserId dans la table Contacts grâce à cette navigation property.
     */
    public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
}
