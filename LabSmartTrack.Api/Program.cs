using LabSmartTrack.Api.Data;
using Microsoft.EntityFrameworkCore;

const string AngularDevelopmentPolicy =
    "AngularDevelopmentPolicy";

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// SQL Server is used outside the test environment.
// The test factory registers its own in-memory database.
if (!builder.Environment.IsEnvironment("Testing"))
{
    var connectionString =
        builder.Configuration.GetConnectionString(
            "LabSmartTrackDatabase"
        );

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException(
            "Connection string 'LabSmartTrackDatabase' was not found."
        );
    }

    builder.Services.AddDbContext<LabSmartTrackDbContext>(
        options => options.UseSqlServer(connectionString)
    );
}

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Angular development CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        AngularDevelopmentPolicy,
        policy =>
        {
            policy
                .WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();

// Swagger is available during development.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    app.MapGet(
        "/",
        () => Results.Redirect("/swagger")
    );
}

app.UseCors(AngularDevelopmentPolicy);

app.MapControllers();

app.Run();

// Allows the test project to access Program.
public partial class Program
{
}
