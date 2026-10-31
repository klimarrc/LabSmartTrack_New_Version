using LabSmartTrack.Api.Data;
using Microsoft.EntityFrameworkCore;

const string AngularDevelopmentPolicy =
    "AngularDevelopmentPolicy";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var connectionString = builder.Configuration.GetConnectionString(
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

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(AngularDevelopmentPolicy);

app.MapControllers();

app.Run();

public partial class Program
{
}