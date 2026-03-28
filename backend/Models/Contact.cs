using System.ComponentModel.DataAnnotations;

namespace ContactsApp.API.Models;

/*
 * DECISION : La classe Contact représente UNE ligne dans la table "Contacts" de SQLite.
 * Entity Framework Core lit cette classe et génère le SQL correspondant.
 * C'est le principe ORM (Object-Relational Mapping) : du code C# → de la BDD.
 */
public class Contact
{
    /*
     * DECISION : Id de type int (entier auto-incrémenté).
     * Alternatif possible : Guid (identifiant unique universel ex: "550e8400-e29b-41d4...").
     * On choisit int car :
     * - Plus simple pour un débutant
     * - Légèrement plus performant pour les requêtes SQL
     * - EF Core auto-incrémente automatiquement (1, 2, 3, ...)
     */
    public int Id { get; set; }

    // [Required] = validation : ce champ NE PEUT PAS être null ou vide
    [Required]
    [MaxLength(100)] // Limite la taille en BDD pour éviter les abus
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    // Champs optionnels (pas de [Required]) - l'utilisateur peut les laisser vides
    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(200)]
    [EmailAddress] // Valide le format email (ex: "toto@example.com")
    public string? Email { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? Company { get; set; }

    // Notes libres sur le contact
    [MaxLength(1000)]
    public string? Notes { get; set; }

    // Quand ce contact a été ajouté
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Quand ce contact a été modifié pour la dernière fois
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /*
     * DECISION SÉCURITÉ : La clé étrangère vers l'utilisateur propriétaire.
     *
     * C'est LA COLONNE LA PLUS IMPORTANTE pour la sécurité !
     * Chaque contact appartient à UN SEUL utilisateur.
     * Dans le ContactService, on filtrera TOUJOURS par UserId pour que
     * l'utilisateur A ne puisse JAMAIS voir les contacts de l'utilisateur B.
     *
     * Sans cette colonne, n'importe qui pourrait voir tous les contacts
     * de tout le monde → faille de sécurité majeure.
     */
    [Required]
    public string UserId { get; set; } = string.Empty;

    // Propriété de navigation : permet d'accéder à l'objet User complet depuis un Contact
    // EF Core fait la jointure SQL automatiquement quand on utilise .Include(c => c.User)
    public ApplicationUser? User { get; set; }
}
