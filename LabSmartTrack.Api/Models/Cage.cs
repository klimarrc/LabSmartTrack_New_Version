using System.ComponentModel.DataAnnotations;

namespace LabSmartTrack.Api.Models;

public sealed class Cage : AuditableEntity
{
    
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;


    [Required]
    [MaxLength(50)]
    public string CageNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Active";

    public int RackId { get; set; }

    public Rack? Rack { get; set; }
    public ICollection<Mouse> Mice { get; set; } =
        new List<Mouse>();
}