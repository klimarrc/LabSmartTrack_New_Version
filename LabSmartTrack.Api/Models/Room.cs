using System.ComponentModel.DataAnnotations;

namespace LabSmartTrack.Api.Models;

public sealed class Room
: AuditableEntity
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string RoomNumber { get; set; } = string.Empty;

    // Foreign key to the Facility entity
    public int FacilityId { get; set; }
    // Optional in the API request
    public Facility? Facility { get; set; }

    public ICollection<Rack> Racks { get; set; } =
        new List<Rack>();
}