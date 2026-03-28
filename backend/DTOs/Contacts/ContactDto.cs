namespace ContactsApp.API.DTOs.Contacts;

/*
 * DECISION : ContactDto = ce qu'on RENVOIE au client (lecture).
 *
 * On n'inclut PAS UserId dans la réponse car :
 * - Ce n'est pas utile pour le frontend (il sait déjà à qui il est connecté)
 * - Principe du moindre privilège : ne partager que ce dont le client a besoin
 */
public class ContactDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Company { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Propriété calculée : utile pour afficher "Jean Dupont" facilement
    public string FullName => $"{FirstName} {LastName}";
}
