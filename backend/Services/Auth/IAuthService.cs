using ContactsApp.API.DTOs.Auth;

namespace ContactsApp.API.Services.Auth;

/*
 * DECISION : Pourquoi une Interface (IAuthService) ?
 *
 * Une interface définit le CONTRAT : "voici ce que peut faire un AuthService",
 * sans définir COMMENT il le fait.
 *
 * Avantages :
 * 1. TESTABILITÉ : Dans les tests, on peut créer un "FakeAuthService" qui
 *    implémente IAuthService → on teste le Controller sans toucher la BDD.
 * 2. DÉCOUPLAGE : Le Controller ne dépend pas de AuthService concret,
 *    seulement de l'interface → plus facile à changer d'implémentation.
 * 3. CLARTÉ : L'interface sert de documentation : on voit immédiatement
 *    ce que le service peut faire.
 *
 * Convention C# : les interfaces commencent par "I" (IAuthService, IContactService)
 */
public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
}
