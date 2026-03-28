using System.Security.Claims;
using ContactsApp.API.DTOs.Contacts;
using ContactsApp.API.Services.Contacts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ContactsApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Toutes les routes de ce controller nécessitent un JWT valide
public class ContactsController : ControllerBase
{
    private readonly IContactService _contactService;

    public ContactsController(IContactService contactService)
    {
        _contactService = contactService;
    }

    // Extrait l'Id de l'utilisateur connecté depuis les claims du JWT
    private string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /*
     * GET /api/contacts?page=1&pageSize=10&search=jean
     *
     * [FromQuery] = paramètres lus depuis l'URL (?page=1&pageSize=10)
     * Valeurs par défaut : page 1, 10 contacts par page
     */
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        // Sécuriser les valeurs pour éviter les abus (page=0, pageSize=10000)
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var (contacts, totalCount) = await _contactService.GetAll(
            CurrentUserId, page, pageSize, search);

        /*
         * DECISION : Retourner les métadonnées de pagination dans la réponse.
         * Le frontend a besoin de TotalCount pour calculer le nombre de pages.
         * On envoie aussi TotalPages pour éviter ce calcul côté client.
         */
        return Ok(new
        {
            data = contacts,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    // GET /api/contacts/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var contact = await _contactService.GetById(id, CurrentUserId);
        if (contact == null)
            return NotFound(new { message = "Contact introuvable." });
        return Ok(contact);
    }

    // POST /api/contacts
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateContactDto dto)
    {
        var contact = await _contactService.Create(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = contact.Id }, contact);
    }

    // PUT /api/contacts/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateContactDto dto)
    {
        var contact = await _contactService.Update(id, dto, CurrentUserId);
        if (contact == null)
            return NotFound(new { message = "Contact introuvable." });
        return Ok(contact);
    }

    // DELETE /api/contacts/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _contactService.Delete(id, CurrentUserId);
        if (!deleted)
            return NotFound(new { message = "Contact introuvable." });
        return NoContent(); // 204 : suppression réussie, pas de body
    }
}
