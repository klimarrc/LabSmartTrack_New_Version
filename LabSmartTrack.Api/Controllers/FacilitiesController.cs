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
    public async Task<ActionResult<Facility>> GetFacility(
        int id)
    {
        var facility = await _context.Facilities
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id);

        if (facility is null)
        {
            return NotFound();
        }

        return facility;
    }
    
    [HttpPost]
    public async Task<ActionResult<Facility>> PostFacility(
        Facility facility)
    {
        var name = facility.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new
            {
                message = "Facility name is required."
            });
        }

        var duplicateExists = await _context.Facilities
            .AnyAsync(item => item.Name == name);

        if (duplicateExists)
        {
            return Conflict(new
            {
                message = "A facility with this name already exists."
            });
        }

        // Create a new entity using only permitted input fields.
        var newFacility = new Facility
        {
            Name = name,
            Description = facility.Description?.Trim(),
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _context.Facilities.Add(newFacility);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetFacility),
            new { id = newFacility.Id },
            newFacility
        );
    }


    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutFacility(
        int id,
        Facility facility)
    {
        if (id != facility.Id)
        {
            return BadRequest(new
            {
                message = "The route ID must match the facility ID."
            });
        }

        var existingFacility =
            await _context.Facilities.FindAsync(id);

        if (existingFacility is null)
        {
            return NotFound();
        }

        var name = facility.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new
            {
                message = "Facility name is required."
            });
        }

        var duplicateExists = await _context.Facilities
            .AnyAsync(item =>
                item.Id != id &&
                item.Name == name);

        if (duplicateExists)
        {
            return Conflict(new
            {
                message = "A facility with this name already exists."
            });
        }

        existingFacility.Name = name;
        existingFacility.Description =
            facility.Description?.Trim();

        // Preserve CreatedAtUtc.
        existingFacility.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }


    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteFacility(
        int id)
    {
        var facility =
            await _context.Facilities.FindAsync(id);

        if (facility is null)
        {
            return NotFound();
        }

        var hasRooms = await _context.Rooms
            .AnyAsync(room => room.FacilityId == id);

        if (hasRooms)
        {
            return Conflict(new
            {
                message =
                    "This facility contains rooms and cannot be deleted."
            });
        }

        _context.Facilities.Remove(facility);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}