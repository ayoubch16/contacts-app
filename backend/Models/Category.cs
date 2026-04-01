using System.ComponentModel.DataAnnotations;

namespace ContactsApp.API.Models;

public class Category
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string UserId { get; set; } = string.Empty;

    public ApplicationUser? User { get; set; }
}
