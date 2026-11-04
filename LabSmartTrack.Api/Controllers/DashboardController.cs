using LabSmartTrack.Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace LabSmartTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class DashboardController : ControllerBase
{
    private readonly LabSmartTrackDbContext _context;

    public DashboardController(LabSmartTrackDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummary>> GetSummary(
        CancellationToken cancellationToken)
    {
        var rooms = _context.Rooms.Count();
        var activeCages = _context.Cages.Count(
            cage => cage.Status == "Active");
        var mice = _context.Mice.Count();

        return Ok(new DashboardSummary(rooms, activeCages, mice));
    }
}

public sealed record DashboardSummary(int Rooms, int ActiveCages, int Mice);