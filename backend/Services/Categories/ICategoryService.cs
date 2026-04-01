using ContactsApp.API.DTOs.Categories;

namespace ContactsApp.API.Services.Categories;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAll(string userId);
    Task<CategoryDto> Create(SaveCategoryDto dto, string userId);
    Task<CategoryDto?> Update(int id, SaveCategoryDto dto, string userId);
    Task<bool> Delete(int id, string userId);
}
