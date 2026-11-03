using System.ComponentModel.DataAnnotations;

namespace LabSmartTrack.Api.Models;

public abstract class AuditableEntity
{
    [Key]
    public int Id { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}