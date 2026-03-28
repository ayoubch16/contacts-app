using ContactsApp.API.DTOs.Contacts;

namespace ContactsApp.API.Services.Contacts;

public interface IContactService
{
    /*
     * GetAll retourne une page de contacts avec le compte total.
     * On retourne (liste, total) pour que le frontend puisse calculer
     * le nombre de pages : Math.ceil(total / pageSize)
     */
    Task<(IEnumerable<ContactDto> Contacts, int TotalCount)> GetAll(
        string userId, int page, int pageSize, string? search = null);

    Task<ContactDto?> GetById(int id, string userId);
    Task<ContactDto> Create(CreateContactDto dto, string userId);
    Task<ContactDto?> Update(int id, UpdateContactDto dto, string userId);
    Task<bool> Delete(int id, string userId);
}
