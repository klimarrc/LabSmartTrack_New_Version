using System.ComponentModel.DataAnnotations;

namespace LabSmartTrack.Api.Models;

public sealed class Mouse : AuditableEntity
{

    [Required]
    [MaxLength(50)]
    public string Identifier { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Sex { get; set; } = string.Empty;

    public DateOnly? BirthDate { get; set; }

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Active";

    public int CageId { get; set; }

    public Cage?  Cage { get; set; }

    public int StrainId { get; set; }

    public Strain? Strain { get; set; } 
}