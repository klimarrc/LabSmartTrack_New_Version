using LabSmartTrack.Api.Data;
using Microsoft.EntityFrameworkCore;

const string AngularDevelopmentPolicy =
    "AngularDevelopmentPolicy";

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// SQL Server and Entity Framework Core
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
    options =>
        options.UseSqlServer(connectionString)
);

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
}

app.UseCors(AngularDevelopmentPolicy);

// Redirect the API root to Swagger.
app.MapGet(
    "/",
    () => Results.Redirect("/swagger")
);

app.MapControllers();

app.Run();

// Required by the integration test project.
public partial class Program
{
}