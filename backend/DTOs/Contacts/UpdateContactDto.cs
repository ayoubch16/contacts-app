using System.ComponentModel.DataAnnotations;

namespace ContactsApp.API.DTOs.Contacts;

// Identique à CreateContactDto pour la mise à jour
// L'Id est passé dans l'URL (ex: PUT /api/contacts/5), pas dans le body
public class UpdateContactDto
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
