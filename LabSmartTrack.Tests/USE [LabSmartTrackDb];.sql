USE [LabSmartTrackDb];
GO

SELECT
    m.Identifier AS MouseIdentifier,
    m.Sex,
    m.BirthDate,
    m.Status,
    s.Name AS Strain,
    c.Name AS Cage,
    c.CageNumber,
    r.Name AS Rack,
    r.RackNumber,
    ro.Name AS Room,
    ro.RoomNumber,
    f.Name AS Facility
FROM dbo.Mice AS m
INNER JOIN dbo.Strains AS s
    ON m.StrainId = s.Id
INNER JOIN dbo.Cages AS c
    ON m.CageId = c.Id
INNER JOIN dbo.Racks AS r
    ON c.RackId = r.Id
INNER JOIN dbo.Rooms AS ro
    ON r.RoomId = ro.Id
INNER JOIN dbo.Facilities AS f
    ON ro.FacilityId = f.Id;