using Microsoft.AspNetCore.Mvc;

namespace LabSmartTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult GetHealth()
    {
        return Ok(new
        {
            status = "healthy",
            service = "LabSmartTrack.Api",
            timestampUtc = DateTime.UtcNow
        });
    }
}