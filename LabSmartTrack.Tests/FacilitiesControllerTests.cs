using System.Net;
using System.Net.Http.Json;
using LabSmartTrack.Api.Models;

namespace LabSmartTrack.Tests;

public sealed class FacilitiesControllerTests
{
    [Fact]
    public async Task Facility_CrudOperations_Succeed()
    {
        using var factory =
            new CustomWebApplicationFactory();

        using var client = factory.CreateClient();

        // Create
        var createResponse = await client.PostAsJsonAsync(
            "/api/Facilities",
            new
            {
                name = "Test Facility",
                description = "Created by xUnit"
            }
        );

        Assert.Equal(
            HttpStatusCode.Created,
            createResponse.StatusCode
        );

        var created = await createResponse.Content
            .ReadFromJsonAsync<Facility>();

        Assert.NotNull(created);
        Assert.True(created.Id > 0);

        // Read
        var getResponse = await client.GetAsync(
            $"/api/Facilities/{created.Id}"
        );

        Assert.Equal(
            HttpStatusCode.OK,
            getResponse.StatusCode
        );

        // Update
        var updateResponse = await client.PutAsJsonAsync(
            $"/api/Facilities/{created.Id}",
            new
            {
                id = created.Id,
                name = "Updated Facility",
                description = "Updated by xUnit"
            }
        );

        Assert.Equal(
            HttpStatusCode.NoContent,
            updateResponse.StatusCode
        );

        // Delete
        var deleteResponse = await client.DeleteAsync(
            $"/api/Facilities/{created.Id}"
        );

        Assert.Equal(
            HttpStatusCode.NoContent,
            deleteResponse.StatusCode
        );

        var deletedGetResponse = await client.GetAsync(
            $"/api/Facilities/{created.Id}"
        );

        Assert.Equal(
            HttpStatusCode.NotFound,
            deletedGetResponse.StatusCode
        );
    }

    [Fact]
    public async Task PostFacility_WithEmptyName_ReturnsBadRequest()
    {
        using var factory =
            new CustomWebApplicationFactory();

        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/Facilities",
            new
            {
                name = "",
                description = "Invalid facility"
            }
        );

        Assert.Equal(
            HttpStatusCode.BadRequest,
            response.StatusCode
        );
    }

    [Fact]
    public async Task GetFacility_WithMissingId_ReturnsNotFound()
    {
        using var factory =
            new CustomWebApplicationFactory();

        using var client = factory.CreateClient();

        var response = await client.GetAsync(
            "/api/Facilities/999999"
        );

        Assert.Equal(
            HttpStatusCode.NotFound,
            response.StatusCode
        );
    }
}