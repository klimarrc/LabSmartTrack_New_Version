using LabSmartTrack.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LabSmartTrack.Api.Data;

public sealed class LabSmartTrackDbContext : DbContext
{
    public LabSmartTrackDbContext(
        DbContextOptions<LabSmartTrackDbContext> options)
        : base(options)
    {
    }

    public DbSet<Facility> Facilities =>
        Set<Facility>();

    public DbSet<Room> Rooms =>
        Set<Room>();

    public DbSet<Rack> Racks =>
        Set<Rack>();

    public DbSet<Cage> Cages =>
        Set<Cage>();

    public DbSet<Strain> Strains =>
        Set<Strain>();

    public DbSet<Mouse> Mice =>
        Set<Mouse>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Facility>()
            .HasIndex(facility => facility.Name)
            .IsUnique();

        modelBuilder.Entity<Room>()
            .HasIndex(room => new
            {
                room.FacilityId,
                room.Name
            })
            .IsUnique();

        modelBuilder.Entity<Rack>()
            .HasIndex(rack => new
            {
                rack.RoomId,
                rack.Name
            })
            .IsUnique();

        modelBuilder.Entity<Cage>()
            .HasIndex(cage => cage.CageNumber)
            .IsUnique();

        modelBuilder.Entity<Strain>()
            .HasIndex(strain => strain.Name)
            .IsUnique();

        modelBuilder.Entity<Mouse>()
            .HasIndex(mouse => mouse.Identifier)
            .IsUnique();

        modelBuilder.Entity<Room>()
            .HasOne(room => room.Facility)
            .WithMany(facility => facility.Rooms)
            .HasForeignKey(room => room.FacilityId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Rack>()
            .HasOne(rack => rack.Room)
            .WithMany(room => room.Racks)
            .HasForeignKey(rack => rack.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Cage>()
            .HasOne(cage => cage.Rack)
            .WithMany(rack => rack.Cages)
            .HasForeignKey(cage => cage.RackId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Mouse>()
            .HasOne(mouse => mouse.Cage)
            .WithMany(cage => cage.Mice)
            .HasForeignKey(mouse => mouse.CageId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Mouse>()
            .HasOne(mouse => mouse.Strain)
            .WithMany(strain => strain.Mice)
            .HasForeignKey(mouse => mouse.StrainId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    public override int SaveChanges()
    {
        ApplyTimestamps();

        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        ApplyTimestamps();

        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyTimestamps()
    {
        DateTime currentTime = DateTime.UtcNow;

        foreach (
            var entry in ChangeTracker
                .Entries<AuditableEntity>()
        )
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAtUtc = currentTime;
                entry.Entity.UpdatedAtUtc = currentTime;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAtUtc = currentTime;

                entry.Property(
                    entity => entity.CreatedAtUtc
                ).IsModified = false;
            }
        }
    }
}