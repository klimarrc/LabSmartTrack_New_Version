using System.ComponentModel.DataAnnotations;

namespace LabSmartTrack.Api.Models;

public sealed class Rack : AuditableEntity
{

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public int RoomId { get; set; }

    public Room Room { get; set; } = null!;

    public ICollection<Cage> Cages { get; set; } =
        new List<Cage>();
}