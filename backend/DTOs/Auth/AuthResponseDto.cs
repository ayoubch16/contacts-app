namespace ContactsApp.API.DTOs.Auth;

/*
 * DECISION : Ce que l'API renvoie après un login/register réussi.
 *
 * On renvoie :
 * - Le token JWT : le frontend le stockera et l'enverra à chaque requête
 * - Les infos basiques de l'utilisateur : pour afficher "Bonjour Jean !" dans la navbar
 *
 * On ne renvoie PAS le mot de passe (même haché), jamais.
 */
public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    // Quand le token expire (le frontend peut afficher un message avant expiration)
    public DateTime ExpiresAt { get; set; }
}
