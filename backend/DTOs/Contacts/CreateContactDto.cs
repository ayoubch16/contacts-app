using System.ComponentModel.DataAnnotations;

namespace ContactsApp.API.DTOs.Contacts;

/*
 * DECISION : DTO séparé pour la CRÉATION d'un contact.
 *
 * Pourquoi pas un seul DTO pour tout ?
 * - À la création : pas d'Id (la BDD l'assigne automatiquement)
 * - À la modification : on envoie l'Id pour savoir quel contact mettre à jour
 * - En lecture : on reçoit en plus CreatedAt, UpdatedAt (gérés côté serveur)
 *
 * Chaque opération CRUD a ses propres besoins → DTO spécifique.
 */
public class CreateContactDto
{
    [Required(ErrorMessage = "Le prénom est obligatoire")]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nom est obligatoire")]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(200)]
    [EmailAddress(ErrorMessage = "Format email invalide")]
    public string? Email { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? Company { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
