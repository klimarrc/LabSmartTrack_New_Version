using Microsoft.AspNetCore.Mvc;

namespace LabSmartTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]

    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    public ActionResult<HealthResponse> GetHealth()
    {
        return Ok(new HealthResponse(
            Status: "Healthy",
            Application: "LabSmartTrack.Api",
            TimestampUtc: DateTime.UtcNow
        ));
    }
}
    

public record HealthResponse(
    string Status,
    string Application,
    DateTime TimestampUtc
);