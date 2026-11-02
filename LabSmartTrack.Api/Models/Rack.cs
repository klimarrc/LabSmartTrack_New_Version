using System.ComponentModel.DataAnnotations;

namespace LabSmartTrack.Api.Models;

public sealed class Rack : AuditableEntity
{

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string RackNumber { get; set; } = string.Empty;

    // Foreign key to the Room entity
    public int RoomId { get; set; }
    // Optional in the API request
    public Room? Room { get; set; }

    public ICollection<Cage> Cages { get; set; } =
        new List<Cage>();
}