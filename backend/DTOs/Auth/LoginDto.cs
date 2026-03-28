using System.ComponentModel.DataAnnotations;

namespace ContactsApp.API.DTOs.Auth;

public class LoginDto
{
    [Required(ErrorMessage = "L'email est obligatoire")]
    [EmailAddress(ErrorMessage = "Format email invalide")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le mot de passe est obligatoire")]
    public string Password { get; set; } = string.Empty;
}
