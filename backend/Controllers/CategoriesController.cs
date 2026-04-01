using System.Security.Claims;
using ContactsApp.API.DTOs.Categories;
using ContactsApp.API.Services.Categories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ContactsApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    private string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // GET /api/categories
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _categoryService.GetAll(CurrentUserId);
        return Ok(categories);
    }

    // POST /api/categories
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveCategoryDto dto)
    {
        var category = await _categoryService.Create(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetAll), new { id = category.Id }, category);
    }

    // PUT /api/categories/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SaveCategoryDto dto)
    {
        var category = await _categoryService.Update(id, dto, CurrentUserId);
        if (category == null)
            return NotFound(new { message = "Catégorie introuvable." });
        return Ok(category);
    }

    // DELETE /api/categories/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _categoryService.Delete(id, CurrentUserId);
        if (!deleted)
            return NotFound(new { message = "Catégorie introuvable." });
        return NoContent();
    }
}
