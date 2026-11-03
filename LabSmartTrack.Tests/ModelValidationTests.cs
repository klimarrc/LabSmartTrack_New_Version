using System.ComponentModel.DataAnnotations;
using LabSmartTrack.Api.Models;

namespace LabSmartTrack.Tests;

public sealed class ModelValidationTests
{
    private static List<ValidationResult> Validate(
        object model)
    {
        var results = new List<ValidationResult>();

        Validator.TryValidateObject(
            model,
            new ValidationContext(model),
            results,
            validateAllProperties: true
        );

        return results;
    }

    [Fact]
    public void Facility_WithoutName_IsInvalid()
    {
        var facility = new Facility
        {
            Name = string.Empty
        };

        var results = Validate(facility);

        Assert.Contains(
            results,
            result => result.MemberNames.Contains(
                nameof(Facility.Name)
            )
        );
    }

    [Fact]
    public void Mouse_WithRequiredValues_IsValid()
    {
        var mouse = new Mouse
        {
            Identifier = "M-TEST-001",
            Sex = "Female",
            Status = "Active",
            CageId = 1,
            StrainId = 1
        };

        var results = Validate(mouse);

        Assert.Empty(results);
    }
}