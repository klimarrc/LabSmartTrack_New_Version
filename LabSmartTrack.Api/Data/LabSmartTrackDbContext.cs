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

        modelBuilder.Entity<Mouse>()
            .HasIndex(mouse => mouse.Identifier)
            .IsUnique();

        modelBuilder.Entity<Strain>()
            .HasIndex(strain => strain.Name)
            .IsUnique();

        modelBuilder.Entity<Cage>()
            .HasIndex(cage => cage.CageNumber)
            .IsUnique();
    }
}