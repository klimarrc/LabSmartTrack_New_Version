using System.ComponentModel.DataAnnotations;

namespace LabSmartTrack.Api.Models;

public sealed class Facility
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public ICollection<Room> Rooms { get; set; } =
        new List<Room>();
}