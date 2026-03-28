using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ContactsApp.API.DTOs.Auth;
using ContactsApp.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace ContactsApp.API.Services.Auth;

/*
 * DECISION : AuthService implémente IAuthService.
 *
 * Ce service s'occupe de TOUTE la logique d'authentification :
 * - Créer un compte (hacher le mot de passe, sauvegarder en BDD)
 * - Vérifier un login (comparer le mot de passe avec le hash)
 * - Générer un token JWT signé
 *
 * On injecte UserManager<ApplicationUser> depuis ASP.NET Identity :
 * c'est lui qui gère le hachage bcrypt des mots de passe, les règles
 * de complexité (majuscules, chiffres...), etc.
 */
public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Vérifier si l'email est déjà utilisé
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            throw new InvalidOperationException("Un compte avec cet email existe déjà.");

        // Créer le nouvel utilisateur (sans hacher le mot de passe nous-mêmes)
        var user = new ApplicationUser
        {
            UserName = dto.Email,   // Identity utilise UserName pour l'authentification
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            CreatedAt = DateTime.UtcNow
        };

        /*
         * CreateAsync hache automatiquement le mot de passe avec bcrypt
         * et sauvegarde l'utilisateur en BDD.
         * On ne voit JAMAIS le mot de passe en clair dans la BDD → sécurité.
         */
        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            // Concaténer les messages d'erreur d'Identity (ex: "Le mot de passe doit contenir une majuscule")
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }

        // Générer et retourner le token JWT
        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        // Chercher l'utilisateur par email
        var user = await _userManager.FindByEmailAsync(dto.Email);

        /*
         * DECISION SÉCURITÉ : Message d'erreur GÉNÉRIQUE intentionnel.
         * On ne précise pas si c'est l'email ou le mot de passe qui est faux.
         * Pourquoi ? Si on disait "email incorrect", un attaquant saurait
         * quels emails sont enregistrés → enumeration attack.
         */
        if (user == null)
            throw new UnauthorizedAccessException("Email ou mot de passe incorrect.");

        /*
         * CheckPasswordAsync compare le mot de passe en clair avec le hash
         * stocké en BDD. C'est bcrypt qui fait le travail.
         */
        var passwordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!passwordValid)
            throw new UnauthorizedAccessException("Email ou mot de passe incorrect.");

        return GenerateAuthResponse(user);
    }

    /*
     * DECISION : Génération du token JWT.
     *
     * Un token JWT est composé de 3 parties séparées par des points :
     * Header.Payload.Signature
     *
     * - Header : algorithme de signature (HS256)
     * - Payload : les "claims" = informations sur l'utilisateur (userId, email, etc.)
     * - Signature : garantit que le token n'a pas été modifié
     *
     * Le serveur SIGNE le token avec la clé secrète.
     * À chaque requête, il VÉRIFIE la signature → si quelqu'un modifie le token,
     * la signature ne correspond plus → rejeté.
     */
    private AuthResponseDto GenerateAuthResponse(ApplicationUser user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]!;
        var expirationDays = int.Parse(jwtSettings["ExpirationInDays"]!);
        var expiresAt = DateTime.UtcNow.AddDays(expirationDays);

        /*
         * Les "Claims" = informations encodées dans le token.
         * Le frontend peut les lire (sans les modifier car le token est signé).
         * L'API les utilise pour identifier l'utilisateur à chaque requête.
         */
        var claims = new List<Claim>
        {
            // NameIdentifier = l'Id de l'utilisateur (convention standard)
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            // Claim personnalisé pour stocker le prénom facilement
            new("firstName", user.FirstName),
            new("lastName", user.LastName),
            // JTI = JWT ID : identifiant unique du token (utile pour les blacklists)
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Créer la clé de signature à partir de la clé secrète
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Assembler le token
        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            UserId = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ExpiresAt = expiresAt
        };
    }
}
