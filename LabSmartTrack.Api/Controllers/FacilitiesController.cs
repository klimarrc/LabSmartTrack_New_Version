using LabSmartTrack.Api.Data;
using LabSmartTrack.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LabSmartTrack.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public sealed class FacilitiesController : ControllerBase
{
    private readonly LabSmartTrackDbContext _context;

    public FacilitiesController(
        LabSmartTrackDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Facility>>>
        GetFacilities()
    {
        return await _context.Facilities
            .AsNoTracking()
            .ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Facility>>
        GetFacility(int id)
    {
        Facility? facility =
            await _context.Facilities.FindAsync(id);

        if (facility is null)
        {
            return NotFound();
        }

        return facility;
    }

    [HttpPost]
    public async Task<ActionResult<Facility>>
        PostFacility(Facility facility)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        _context.Facilities.Add(facility);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetFacility),
            new { id = facility.Id },
            facility
        );
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult>
        PutFacility(int id, Facility facility)
    {
        if (id != facility.Id)
        {
            return BadRequest(
                "Route ID does not match the facility ID."
            );
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        bool exists = await _context.Facilities
            .AnyAsync(existing => existing.Id == id);

        if (!exists)
        {
            return NotFound();
        }

        _context.Entry(facility).State =
            EntityState.Modified;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult>
        DeleteFacility(int id)
    {
        Facility? facility =
            await _context.Facilities.FindAsync(id);

        if (facility is null)
        {
            return NotFound();
        }

        _context.Facilities.Remove(facility);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}