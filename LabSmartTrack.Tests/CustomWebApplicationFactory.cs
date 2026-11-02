using LabSmartTrack.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace LabSmartTrack.Tests;

public sealed class CustomWebApplicationFactory
    : WebApplicationFactory<Program>
{
    private readonly string databaseName =
        $"LabSmartTrackTests-{Guid.NewGuid()}";

    protected override void ConfigureWebHost(
        IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<
                DbContextOptions<LabSmartTrackDbContext>>();

            services.RemoveAll<LabSmartTrackDbContext>();

            services.AddDbContext<LabSmartTrackDbContext>(
                options =>
                    options.UseInMemoryDatabase(databaseName)
            );
        });
    }
}