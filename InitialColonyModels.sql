IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Facilities] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NULL,
    [CreatedAtUtc] datetime2 NOT NULL,
    [UpdatedAtUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_Facilities] PRIMARY KEY ([Id])
);

CREATE TABLE [Strains] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NULL,
    [CreatedAtUtc] datetime2 NOT NULL,
    [UpdatedAtUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_Strains] PRIMARY KEY ([Id])
);

CREATE TABLE [Rooms] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [FacilityId] int NOT NULL,
    [CreatedAtUtc] datetime2 NOT NULL,
    [UpdatedAtUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_Rooms] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Rooms_Facilities_FacilityId] FOREIGN KEY ([FacilityId]) REFERENCES [Facilities] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Racks] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [RoomId] int NOT NULL,
    [CreatedAtUtc] datetime2 NOT NULL,
    [UpdatedAtUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_Racks] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Racks_Rooms_RoomId] FOREIGN KEY ([RoomId]) REFERENCES [Rooms] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Cages] (
    [Id] int NOT NULL IDENTITY,
    [CageNumber] nvarchar(50) NOT NULL,
    [Status] nvarchar(30) NOT NULL,
    [RackId] int NOT NULL,
    [CreatedAtUtc] datetime2 NOT NULL,
    [UpdatedAtUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_Cages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Cages_Racks_RackId] FOREIGN KEY ([RackId]) REFERENCES [Racks] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Mice] (
    [Id] int NOT NULL IDENTITY,
    [Identifier] nvarchar(50) NOT NULL,
    [Sex] nvarchar(20) NOT NULL,
    [BirthDate] date NULL,
    [Status] nvarchar(30) NOT NULL,
    [CageId] int NOT NULL,
    [StrainId] int NOT NULL,
    [CreatedAtUtc] datetime2 NOT NULL,
    [UpdatedAtUtc] datetime2 NOT NULL,
    CONSTRAINT [PK_Mice] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Mice_Cages_CageId] FOREIGN KEY ([CageId]) REFERENCES [Cages] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Mice_Strains_StrainId] FOREIGN KEY ([StrainId]) REFERENCES [Strains] ([Id]) ON DELETE NO ACTION
);

CREATE UNIQUE INDEX [IX_Cages_CageNumber] ON [Cages] ([CageNumber]);

CREATE INDEX [IX_Cages_RackId] ON [Cages] ([RackId]);

CREATE UNIQUE INDEX [IX_Facilities_Name] ON [Facilities] ([Name]);

CREATE INDEX [IX_Mice_CageId] ON [Mice] ([CageId]);

CREATE UNIQUE INDEX [IX_Mice_Identifier] ON [Mice] ([Identifier]);

CREATE INDEX [IX_Mice_StrainId] ON [Mice] ([StrainId]);

CREATE UNIQUE INDEX [IX_Racks_RoomId_Name] ON [Racks] ([RoomId], [Name]);

CREATE UNIQUE INDEX [IX_Rooms_FacilityId_Name] ON [Rooms] ([FacilityId], [Name]);

CREATE UNIQUE INDEX [IX_Strains_Name] ON [Strains] ([Name]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261031163127_InitialColonyModels', N'9.0.9');

COMMIT;
GO

