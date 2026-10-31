using System.ComponentModel.DataAnnotations;

namespace LabSmartTrack.Api.Models;

public sealed class Room
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public int FacilityId { get; set; }

    public Facility Facility { get; set; } = null!;

    public ICollection<Rack> Racks { get; set; } =
        new List<Rack>();
}