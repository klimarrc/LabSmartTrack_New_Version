using System.ComponentModel.DataAnnotations;

namespace LabSmartTrack.Api.Models;

public sealed class BreedingPair : AuditableEntity
{
    [Required, MaxLength(50)]
    public string BreedingCode { get; set; } = string.Empty;

    public int SireId { get; set; }
    public Mouse? Sire { get; set; }

    public int DamId { get; set; }
    public Mouse? Dam { get; set; }

    public int CageId { get; set; }
    public Cage? Cage { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}