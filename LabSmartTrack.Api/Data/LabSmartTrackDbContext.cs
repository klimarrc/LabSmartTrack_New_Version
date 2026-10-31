using Microsoft.EntityFrameworkCore;

namespace LabSmartTrack.Api.Data;

public sealed class LabSmartTrackDbContext : DbContext
{
    public LabSmartTrackDbContext(
        DbContextOptions<LabSmartTrackDbContext> options)
        : base(options)
    {
    }

    // DbSet properties will be added with the colony models.
}