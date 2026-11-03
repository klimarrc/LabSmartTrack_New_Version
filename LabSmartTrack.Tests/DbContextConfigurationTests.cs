using LabSmartTrack.Api.Data;
using LabSmartTrack.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LabSmartTrack.Tests;

public sealed class DbContextConfigurationTests
{
    private static LabSmartTrackDbContext CreateContext()
    {
        var options =
            new DbContextOptionsBuilder<LabSmartTrackDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

        return new LabSmartTrackDbContext(options);
    }

    [Fact]
    public void DbContext_ContainsAllColonyEntities()
    {
        using var context = CreateContext();

        Assert.NotNull(
            context.Model.FindEntityType(typeof(Facility)));
        Assert.NotNull(
            context.Model.FindEntityType(typeof(Room)));
        Assert.NotNull(
            context.Model.FindEntityType(typeof(Rack)));
        Assert.NotNull(
            context.Model.FindEntityType(typeof(Cage)));
        Assert.NotNull(
            context.Model.FindEntityType(typeof(Strain)));
        Assert.NotNull(
            context.Model.FindEntityType(typeof(Mouse)));
    }

    [Fact]
    public void Room_HasRequiredFacilityRelationship()
    {
        using var context = CreateContext();

        var roomType = context.Model.FindEntityType(
            typeof(Room)
        );

        Assert.NotNull(roomType);

        var foreignKey = roomType.GetForeignKeys()
            .Single(key =>
                key.PrincipalEntityType.ClrType ==
                typeof(Facility));

        Assert.Equal(
            nameof(Room.FacilityId),
            foreignKey.Properties.Single().Name
        );

        Assert.True(foreignKey.IsRequired);
        Assert.Equal(
            DeleteBehavior.Restrict,
            foreignKey.DeleteBehavior
        );
    }
}