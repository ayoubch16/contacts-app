using ContactsApp.API.Data;
using ContactsApp.API.DTOs.Categories;
using ContactsApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ContactsApp.API.Services.Categories;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CategoryDto>> GetAll(string userId)
    {
        return await _context.Categories
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .AsNoTracking()
            .Select(c => new CategoryDto { Id = c.Id, Name = c.Name })
            .ToListAsync();
    }

    public async Task<CategoryDto> Create(SaveCategoryDto dto, string userId)
    {
        var category = new Category
        {
            Name = dto.Name.Trim(),
            UserId = userId
        };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return new CategoryDto { Id = category.Id, Name = category.Name };
    }

    public async Task<CategoryDto?> Update(int id, SaveCategoryDto dto, string userId)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category == null) return null;

        category.Name = dto.Name.Trim();
        await _context.SaveChangesAsync();
        return new CategoryDto { Id = category.Id, Name = category.Name };
    }

    public async Task<bool> Delete(int id, string userId)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category == null) return false;

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }
}
