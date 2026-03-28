using ContactsApp.API.DTOs.Auth;
using ContactsApp.API.Services.Auth;
using Microsoft.AspNetCore.Mvc;

namespace ContactsApp.API.Controllers;

/*
 * DECISION : [ApiController] + hériter de ControllerBase (et non Controller).
 *
 * [ApiController] ajoute des comportements utiles :
 * - Validation automatique des DTOs (si un [Required] n'est pas rempli → 400 Bad Request auto)
 * - Binding automatique depuis le body JSON
 *
 * ControllerBase vs Controller :
 * - Controller : pour les apps MVC qui renvoient des vues HTML (Razor)
 * - ControllerBase : pour les API REST qui renvoient du JSON → c'est notre cas
 *
 * [Route("api/[controller]")] = l'URL sera /api/auth (le [controller] est remplacé
 * par "auth" = nom de la classe sans "Controller")
 */
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /*
     * POST /api/auth/register
     *
     * [HttpPost("register")] = cette méthode répond aux requêtes POST sur /api/auth/register
     * Le body JSON est désérialisé automatiquement en RegisterDto
     */
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var response = await _authService.RegisterAsync(dto);
            /*
             * DECISION HTTP : 201 Created au lieu de 200 OK pour une création.
             * C'est la convention REST : POST qui crée → 201.
             * CreatedAtAction génère aussi un header "Location" avec l'URL de la ressource créée.
             */
            return StatusCode(201, response);
        }
        catch (InvalidOperationException ex)
        {
            // 400 Bad Request : données invalides (email déjà utilisé, etc.)
            return BadRequest(new { message = ex.Message });
        }
    }

    /*
     * POST /api/auth/login
     */
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var response = await _authService.LoginAsync(dto);
            return Ok(response); // 200 OK avec le token
        }
        catch (UnauthorizedAccessException ex)
        {
            // 401 Unauthorized : mauvais email/mot de passe
            return Unauthorized(new { message = ex.Message });
        }
    }
}
