using System.ComponentModel.DataAnnotations;

namespace LabSmartTrack.Api.Models;

public sealed class Cage
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string CageNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Active";

    public int RackId { get; set; }

    public Rack Rack { get; set; } = null!;

    public ICollection<Mouse> Mice { get; set; } =
        new List<Mouse>();
}