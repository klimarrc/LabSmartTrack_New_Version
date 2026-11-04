using System.ComponentModel.DataAnnotations;
using LabSmartTrack.Api.Data;
using LabSmartTrack.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace LabSmartTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class BreedingPairsController : ControllerBase
{
    private readonly LabSmartTrackDbContext _context;
    private readonly TimeZoneInfo _zone;

    public BreedingPairsController(
        LabSmartTrackDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        var zoneId = configuration["FacilityTimeZone"]
            ?? throw new InvalidOperationException("FacilityTimeZone is missing.");
        _zone = TimeZoneInfo.FindSystemTimeZoneById(zoneId);
    }

    private DateOnly Today() => DateOnly.FromDateTime(
        TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, _zone).DateTime);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BreedingPair>>> GetAll(
        [FromQuery] bool? active, CancellationToken ct)
    {
        var query = _context.BreedingPairs.AsNoTracking();

        if (active is bool activeOnly)
        {
            query = activeOnly
                ? query.Where(p => p.EndDate == null)
                : query.Where(p => p.EndDate != null);
        }

        return Ok(await query.OrderBy(p => p.BreedingCode).ToListAsync(ct));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BreedingPair>> GetById(
        int id, CancellationToken ct)
    {
        var pair = await _context.BreedingPairs.AsNoTracking()
            .SingleOrDefaultAsync(p => p.Id == id, ct);

        if (pair is null) return NotFound();
        return Ok(pair);
    }

    [HttpPost]
    public async Task<ActionResult<BreedingPair>> Create(
        CreateBreedingPairRequest request, CancellationToken ct)
    {
        if (request.SireId == request.DamId)
        {
            ModelState.AddModelError(nameof(request.DamId),
                "The sire and dam must be different mice.");
        }

        if (request.StartDate is not DateOnly start || start > Today())
        {
            ModelState.AddModelError(nameof(request.StartDate),
                "Enter a start date no later than the facility date.");
        }

        var mice = await _context.Mice.AsNoTracking()
            .Where(m => m.Id == request.SireId || m.Id == request.DamId)
            .ToDictionaryAsync(m => m.Id, ct);

        if (!mice.TryGetValue(request.SireId, out var sire) ||
            sire.Sex != "Male" || sire.Status != "Active")
        {
            ModelState.AddModelError(nameof(request.SireId),
                "Select an existing active male mouse as the sire.");
        }

        if (!mice.TryGetValue(request.DamId, out var dam) ||
            dam.Sex != "Female" || dam.Status != "Active")
        {
            ModelState.AddModelError(nameof(request.DamId),
                "Select an existing active female mouse as the dam.");
        }

        if (!await _context.Cages.AnyAsync(c => c.Id == request.CageId, ct))
        {
            ModelState.AddModelError(nameof(request.CageId),
                "Select an existing cage.");
        }

        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var code = request.BreedingCode.Trim();
        if (await _context.BreedingPairs.AnyAsync(p => p.BreedingCode == code, ct))
            return DuplicateCode();

        var now = DateTime.UtcNow;
        var pair = new BreedingPair
        {
            BreedingCode = code,
            SireId = request.SireId,
            DamId = request.DamId,
            CageId = request.CageId,
            StartDate = request.StartDate!.Value,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _context.BreedingPairs.Add(pair);
        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (
            ex.InnerException is SqlException sql &&
            (sql.Number is 2601 or 2627) &&
            sql.Message.Contains("UX_BreedingPairs_BreedingCode",
                StringComparison.OrdinalIgnoreCase))
        {
            return DuplicateCode();
        }

        return CreatedAtAction(nameof(GetById), new { id = pair.Id }, pair);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> EndPair(
        int id, EndBreedingPairRequest request, CancellationToken ct)
    {
        var pair = await _context.BreedingPairs
            .SingleOrDefaultAsync(p => p.Id == id, ct);

        if (pair is null) return NotFound();

        if (request.EndDate is not DateOnly end ||
            end < pair.StartDate || end > Today())
        {
            ModelState.AddModelError(nameof(request.EndDate),
                "End date must be between the start date and the facility date.");
            return ValidationProblem(ModelState);
        }

        if (pair.EndDate == end) return NoContent();

        if (pair.EndDate.HasValue)
            return Conflict(new { message = "This pair has already ended." });

        pair.EndDate = end;
        pair.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
        return NoContent();
    }

    private ConflictObjectResult DuplicateCode() =>
        Conflict(new { message = "This breeding code already exists." });
}


public sealed class CreateBreedingPairRequest
{
    [Required, MaxLength(50)]
    public string BreedingCode { get; init; } = string.Empty;

    [Range(1, int.MaxValue)] public int SireId { get; init; }
    [Range(1, int.MaxValue)] public int DamId { get; init; }
    [Range(1, int.MaxValue)] public int CageId { get; init; }
    [Required] public DateOnly? StartDate { get; init; }
}

public sealed class EndBreedingPairRequest
{
    [Required] public DateOnly? EndDate { get; init; }
}