# Milestone 3 — Colony Management Interface

**Goal:** Manage colony records through Angular instead of Swagger.

Implement one complete feature at a time: Rooms → Racks → Cages → Strains → Mice. Include Facilities as a selection dropdown when creating rooms.

## 1. Angular models and services

- [ ] Create TypeScript interfaces matching API responses.
- [ ] Create services for Facilities, Rooms, Racks, Cages, Strains and Mice.
- [ ] Implement collection GET, GET by ID, POST, PUT and DELETE methods.
- [ ] Reuse the configured API base URL.
Keep request interfaces separate from response interfaces. Creation requests should not include IDs, timestamps or navigation objects.

## 2. Colony pages and navigation

- [ ] Add routes for /rooms, /racks, /cages, /strains and /mice.
- [ ] Connect dashboard navigation links.
- [ ] Display records in responsive tables.
- [ ] Show loading, empty and error states.
- [ ] Add search and basic filtering.

## 3. Add and edit forms

- [ ] Use Angular Reactive Forms.
- [ ] Create add and edit forms for each entity.
- [ ] Populate relationship dropdowns from the API.
- [ ] Include mouse birth date.
- [ ] Validate required fields and maximum lengths.
- [ ] Disable submission while saving.
- [ ] Show success and API error messages.

## 3.1 Examples of relationship dropdowns:

Form    Required selections
Room    Facility
Rack    Room
Cage    Rack
Mouse  Cage and Strain

## 4. Delete workflow

- [ ] Request confirmation before deletion.
- [ ] Refresh the list after successful deletion.
- [ ] Explain when related records prevent deletion.
- [ ] Preserve the record if deletion fails.

## 5. Testing and completion

- [ ] Test service requests using Angular HTTP testing utilities.
- [ ] Test form validation.
- [ ] Test successful saving and API failures.
- [ ] Test delete confirmation.
- [ ] Confirm Angular tests pass.
- [ ] Confirm npm run build succeeds.
- [ ] Verify changes persist after refreshing the page.