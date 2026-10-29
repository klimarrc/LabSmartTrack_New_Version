// LabSmartTrack.Api/Program.cs
const string AngularDevelopmentPolicy =
    "AngularDevelopmentPolicy";

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

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

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors(AngularDevelopmentPolicy);
// Configure the HTTP request pipeline.
app.MapControllers();

app.Run();