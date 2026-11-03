Milestone 2 — SQL Server and Colony Models
Description
Configure persistent SQL Server storage for LabSmartTrack and implement the core colony-management models and RESTful API endpoints.
Tasks
SQL Server
- [ ] Install or confirm access to SQL Server.
- [ ] Create the LabSmartTrack database.
- [ ] Add the SQL Server connection string to appsettings.Development.json.
- [ ] Keep database credentials out of Git.
- [ ] Confirm that the API can connect to SQL Server.
Entity Framework Core
- [ ] Install the EF Core SQL Server provider.
- [ ] Install EF Core design tools.
- [ ] Create LabSmartTrackDbContext.
- [ ] Register the database context in Program.cs.
- [ ] Add DbSet properties for all colony entities.
Suggested packages:
dotnet add .\LabSmartTrack.Api package Microsoft.EntityFrameworkCore.SqlServer --version 9.0.9

dotnet add .\LabSmartTrack.Api package Microsoft.EntityFrameworkCore.Design --version 9.0.9

dotnet tool install --global dotnet-ef --version 9.0.9

Colony Models
- [ ] Create the Facility model.
- [ ] Create the Room model.
- [ ] Create the Rack model.
- [ ] Create the Cage model.
- [ ] Create the Strain model.
- [ ] Create the Mouse model.
- [ ] Add primary keys.
- [ ] Add required-field validation.
- [ ] Configure relationships and foreign keys.
- [ ] Add created and updated timestamps.

Model	Important fields
Facility	Id, Name, Description
Room	Id, Name, FacilityId
Rack	Id, Name, RoomId
Cage	Id, CageNumber, Status, RackId
Strain	Id, Name, Description
Mouse	Id, Identifier, Sex, BirthDate, Status, CageId, StrainId


Database migrations
- [ ] Create the initial colony database migration.
- [ ] Review the generated migration.
- [ ] Apply the migration to SQL Server.
- [ ] Confirm that all expected tables were created.
- [ ] Confirm that foreign keys and indexes were created.
dotnet ef migrations add InitialColonyModels `
  --project .\LabSmartTrack.Api `
  --startup-project .\LabSmartTrack.Api

dotnet ef database update `
  --project .\LabSmartTrack.Api `
  --startup-project .\LabSmartTrack.Api

RESTful CRUD endpoints
- [ ] Create a Facilities controller.
- [ ] Create a Rooms controller.
- [ ] Create a Racks controller.
- [ ] Create a Cages controller.
- [ ] Create a Strains controller.
- [ ] Create a Mice controller.
- [ ] Implement GET collection endpoints.
- [ ] Implement GET endpoints by ID.
- [ ] Implement POST endpoints.
- [ ] Implement PUT endpoints.
- [ ] Implement DELETE endpoints.
- [ ] Return 404 Not Found for missing records.
- [ ] Return 400 Bad Request for invalid input.
- [ ] Return 201 Created after successful creation.
- [ ] Display and test all endpoints through Swagger.
Example routes:
GET    /api/facilities
GET    /api/facilities/{id}
POST   /api/facilities
PUT    /api/facilities/{id}
DELETE /api/facilities/{id}

Use the same pattern for rooms, racks, cages, strains, and mice.
Testing
- [ ] Add DbContext configuration tests.
- [ ] Add model validation tests.
- [ ] Add tests for successful CRUD operations.
- [ ] Add tests for invalid requests.
- [ ] Add tests for records that do not exist.
- [ ] Confirm that all xUnit tests pass.
- [ ] Confirm that the API builds without errors.
Acceptance criteria
- The API connects successfully to SQL Server.
- EF Core creates and updates the database through migrations.
- All six colony models are stored in SQL Server.
- Relationships between the models are correctly enforced.
- Every model has working RESTful CRUD endpoints.
- Swagger documents and executes the endpoints.
- Invalid and missing records return appropriate HTTP responses.
- All automated tests pass.
- The solution builds without errors.