using System.ComponentModel.DataAnnotations;

namespace ContactsApp.API.DTOs.Categories;

public class SaveCategoryDto
{
    [Required(ErrorMessage = "Le nom est obligatoire")]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;
}
