using System.ComponentModel.DataAnnotations;
using System.Globalization;
using LabSmartTrack.Api.Data;
using LabSmartTrack.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace LabSmartTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class MiceController : ControllerBase
{
    private static readonly string[] AllowedSexes = ["Male", "Female"];
    private static readonly string[] AllowedStatuses = ["Active", "Deceased"];
    // This must match the unique index name in your EF migration.
    private const string IdentifierIndexName = "IX_Mice_Identifier";

    private readonly LabSmartTrackDbContext _context;
    private readonly TimeZoneInfo _facilityTimeZone;

    public MiceController(
        LabSmartTrackDbContext context,
        IConfiguration configuration)
    {
        _context = context;

        var zoneId = configuration["FacilityTimeZone"];
        if (string.IsNullOrWhiteSpace(zoneId))
        {
            throw new InvalidOperationException(
                "FacilityTimeZone is missing from the API configuration.");
        }

        _facilityTimeZone = TimeZoneInfo.FindSystemTimeZoneById(zoneId);
    }

    // GET /api/Mice/form-options
    [HttpGet("form-options")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult GetFormOptions()
    {
        return Ok(new
        {
            sexes = AllowedSexes,
            statuses = AllowedStatuses,
            timeZone = _facilityTimeZone.Id,
            today = FacilityToday().ToString(
                "yyyy-MM-dd", CultureInfo.InvariantCulture)
        });
    }

    // GET /api/Mice
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Mouse>>> GetMice(
        CancellationToken cancellationToken)
    {
        var mice = await _context.Mice
            .AsNoTracking()
            .OrderBy(m => m.Identifier)
            .ToListAsync(cancellationToken);

        return Ok(mice);
    }

    // GET /api/Mice/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Mouse>> GetMouse(
        int id,
        CancellationToken cancellationToken)
    {
        var mouse = await _context.Mice
            .AsNoTracking()
            .SingleOrDefaultAsync(m => m.Id == id, cancellationToken);

        if (mouse is null)
        {
            return NotFound();
        }

        return Ok(mouse);
    }

    // POST /api/Mice
    [HttpPost]
    public async Task<ActionResult<Mouse>> PostMouse(
        MouseWriteRequest request,
        CancellationToken cancellationToken)
    {
        await ValidateMouseAsync(request, cancellationToken);

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var identifier = request.Identifier.Trim();

        if (await IdentifierExistsAsync(identifier, null, cancellationToken))
        {
            return DuplicateIdentifier();
        }

        var now = DateTime.UtcNow;
        var mouse = new Mouse
        {
            Identifier = identifier,
            Sex = request.Sex,
            Status = request.Status,
            BirthDate = request.BirthDate,
            CageId = request.CageId,
            StrainId = request.StrainId,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _context.Mice.Add(mouse);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (IsIdentifierConflict(ex))
        {
            return DuplicateIdentifier();
        }

        return CreatedAtAction(nameof(GetMouse), new { id = mouse.Id }, mouse);
    }

    // PUT /api/Mice/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutMouse(
        int id,
        MouseWriteRequest request,
        CancellationToken cancellationToken)
    {
        // The Angular update service sends the ID in the body as well.
        if (request.Id.HasValue && request.Id.Value != id)
        {
            ModelState.AddModelError(
                nameof(request.Id), "The mouse ID must match the route ID.");

            return ValidationProblem(ModelState);
        }

        var mouse = await _context.Mice
            .SingleOrDefaultAsync(m => m.Id == id, cancellationToken);

        if (mouse is null)
        {
            return NotFound();
        }

        await ValidateMouseAsync(request, cancellationToken);

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var identifier = request.Identifier.Trim();

        // Exclude this record so an unchanged identifier is valid.
        if (await IdentifierExistsAsync(identifier, id, cancellationToken))
        {
            return DuplicateIdentifier();
        }

        mouse.Identifier = identifier;
        mouse.Sex = request.Sex;
        mouse.Status = request.Status;
        mouse.BirthDate = request.BirthDate;
        mouse.CageId = request.CageId;
        mouse.StrainId = request.StrainId;
        mouse.UpdatedAtUtc = DateTime.UtcNow;

        // The existing entity is tracked. CreatedAtUtc is left unchanged.
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Mice.AnyAsync(m => m.Id == id, cancellationToken))
            {
                return NotFound();
            }

            throw;
        }
        catch (DbUpdateException ex) when (IsIdentifierConflict(ex))
        {
            return DuplicateIdentifier();
        }

        return NoContent();
    }

    // DELETE /api/Mice/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteMouse(
        int id,
        CancellationToken cancellationToken)
    {
        var mouse = await _context.Mice
            .SingleOrDefaultAsync(m => m.Id == id, cancellationToken);

        if (mouse is null)
        {
            return NotFound();
        }

        _context.Mice.Remove(mouse);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private DateOnly FacilityToday()
    {
        var localNow = TimeZoneInfo.ConvertTime(
            DateTimeOffset.UtcNow, _facilityTimeZone);

        return DateOnly.FromDateTime(localNow.DateTime);
    }

    private async Task ValidateMouseAsync(
        MouseWriteRequest request,
        CancellationToken cancellationToken)
    {
        if (!AllowedSexes.Contains(request.Sex, StringComparer.Ordinal))
        {
            ModelState.AddModelError(
                nameof(request.Sex), "Select a sex from the available options.");
        }

        if (!AllowedStatuses.Contains(request.Status, StringComparer.Ordinal))
        {
            ModelState.AddModelError(
                nameof(request.Status), "Select a status from the available options.");
        }

        if (request.BirthDate is DateOnly birthDate && birthDate > FacilityToday())
        {
            ModelState.AddModelError(
                nameof(request.BirthDate),
                "Birth date cannot be later than today's date at the facility.");
        }

        if (!await _context.Cages.AnyAsync(c => c.Id == request.CageId, cancellationToken))
        {
            ModelState.AddModelError(nameof(request.CageId), "Select an existing cage.");
        }

        if (!await _context.Strains.AnyAsync(s => s.Id == request.StrainId, cancellationToken))
        {
            ModelState.AddModelError(nameof(request.StrainId), "Select an existing strain.");
        }
    }

    private Task<bool> IdentifierExistsAsync(
        string identifier,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var query = _context.Mice.Where(m => m.Identifier == identifier);

        if (excludeId is int id)
        {
            query = query.Where(m => m.Id != id);
        }

        return query.AnyAsync(cancellationToken);
    }

    private ConflictObjectResult DuplicateIdentifier()
    {
        return Conflict(new
        {
            message = "A mouse with this identifier already exists."
        });
    }

    private static bool IsIdentifierConflict(DbUpdateException exception)
    {
        return exception.InnerException is SqlException sql
            && (sql.Number is 2601 or 2627)
            && sql.Message.Contains(
                IdentifierIndexName, StringComparison.OrdinalIgnoreCase);
    }
}

// Keep this class once only. The client sends editable fields,
// not timestamps or nested Cage and Strain objects.
public sealed class MouseWriteRequest
{
    public int? Id { get; init; }

    [Required]
    [MaxLength(50)]
    public string Identifier { get; init; } = string.Empty;

    [Required]
    public string Sex { get; init; } = string.Empty;

    [Required]
    public string Status { get; init; } = string.Empty;

    public DateOnly? BirthDate { get; init; }

    [Range(1, int.MaxValue)]
    public int CageId { get; init; }

    [Range(1, int.MaxValue)]
    public int StrainId { get; init; }
}