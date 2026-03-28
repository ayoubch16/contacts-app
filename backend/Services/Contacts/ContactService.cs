using ContactsApp.API.Data;
using ContactsApp.API.DTOs.Contacts;
using ContactsApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ContactsApp.API.Services.Contacts;

public class ContactService : IContactService
{
    private readonly AppDbContext _context;

    public ContactService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<ContactDto> Contacts, int TotalCount)> GetAll(
        string userId, int page, int pageSize, string? search = null)
    {
        /*
         * SÉCURITÉ CRITIQUE : toujours filtrer par UserId en premier.
         * Un utilisateur ne peut jamais voir les contacts d'un autre.
         */
        var query = _context.Contacts
            .Where(c => c.UserId == userId);

        // Recherche optionnelle sur plusieurs champs
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower().Trim();
            query = query.Where(c =>
                c.FirstName.ToLower().Contains(term) ||
                c.LastName.ToLower().Contains(term) ||
                (c.Email != null && c.Email.ToLower().Contains(term)) ||
                (c.Phone != null && c.Phone.Contains(term)) ||
                (c.Company != null && c.Company.ToLower().Contains(term))
            );
        }

        /*
         * DECISION PAGINATION :
         * On exécute deux requêtes SQL :
         * 1. CountAsync() → compte total (pour calculer le nb de pages côté frontend)
         * 2. Skip/Take → la page demandée seulement
         *
         * Skip((page-1) * pageSize) saute les enregistrements des pages précédentes.
         * Take(pageSize) prend uniquement les N enregistrements de la page courante.
         *
         * Ex: page=2, pageSize=10 → Skip(10).Take(10) → enregistrements 11 à 20.
         */
        var totalCount = await query.CountAsync();

        var contacts = await query
            .OrderBy(c => c.LastName)
            .ThenBy(c => c.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync();

        return (contacts.Select(MapToDto), totalCount);
    }

    public async Task<ContactDto?> GetById(int id, string userId)
    {
        var contact = await _context.Contacts
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        return contact == null ? null : MapToDto(contact);
    }

    public async Task<ContactDto> Create(CreateContactDto dto, string userId)
    {
        var contact = new Contact
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address,
            Company = dto.Company,
            Notes = dto.Notes,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Contacts.Add(contact);
        await _context.SaveChangesAsync();

        return MapToDto(contact);
    }

    public async Task<ContactDto?> Update(int id, UpdateContactDto dto, string userId)
    {
        var contact = await _context.Contacts
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (contact == null)
            return null;

        contact.FirstName = dto.FirstName;
        contact.LastName = dto.LastName;
        contact.Phone = dto.Phone;
        contact.Email = dto.Email;
        contact.Address = dto.Address;
        contact.Company = dto.Company;
        contact.Notes = dto.Notes;
        contact.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(contact);
    }

    public async Task<bool> Delete(int id, string userId)
    {
        var contact = await _context.Contacts
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (contact == null)
            return false;

        _context.Contacts.Remove(contact);
        await _context.SaveChangesAsync();

        return true;
    }

    private static ContactDto MapToDto(Contact contact) => new()
    {
        Id = contact.Id,
        FirstName = contact.FirstName,
        LastName = contact.LastName,
        Phone = contact.Phone,
        Email = contact.Email,
        Address = contact.Address,
        Company = contact.Company,
        Notes = contact.Notes,
        CreatedAt = contact.CreatedAt,
        UpdatedAt = contact.UpdatedAt
    };
}
