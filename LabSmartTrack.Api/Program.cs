const string AngularDevelopmentPolicy =
    "AngularDevelopmentPolicy";

var builder = WebApplication.CreateBuilder(args);

// Controller services
builder.Services.AddControllers();

// Swagger/OpenAPI services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Allow requests from the Angular development server.
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

// Enable Swagger only in the development environment.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(AngularDevelopmentPolicy);

app.MapControllers();

app.Run();

public partial class Program
{
}