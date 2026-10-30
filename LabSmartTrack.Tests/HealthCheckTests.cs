using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LabSmartTrack.Tests;

public sealed class HealthCheckTests :
    IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthCheckTests(
        WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsHealthyResponse()
    {
        // Act
        HttpResponseMessage response = await _client.GetAsync(
            "/api/Health"
        );

        HealthResponse? content =
            await response.Content.ReadFromJsonAsync<HealthResponse>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(content);
        Assert.Equal("Healthy", content.Status);
        Assert.Equal("LabSmartTrack.Api", content.Application);
        Assert.NotEqual(default, content.TimestampUtc);
    }

    private sealed record HealthResponse(
        string Status,
        string Application,
        DateTime TimestampUtc
    );
}