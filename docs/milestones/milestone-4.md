# Milestone 4 — Breeding, Litters and Reports

**Goal:** A technician can open a breeding record, see its litters, identify which litters are due for weaning, and record a 
welfare observation. The dashboard should show those same records and counts—not placeholder values.

### 1. Breeding pairs

- Create BreedingPair with Id, a unique BreedingCode, SireId, DamId, CageId, StartDate, optional EndDate, and audit timestamps.
- Configure SireId and DamId as two separate foreign keys to Mouse. Prevent deletion of mice or cages referenced by breeding history.
- Validate that both mice and the cage exist, the two mice are different, and their sex and status meet your facility’s breeding rules.
- Define an active pair consistently. For a simple first version, an active pair is one with no EndDate. Ending a pair should
 preserve its litters and history.
- Add GET collection, GET by ID, POST, and PUT endpoints under /api/BreedingPairs. Connect the dashboard’s Create breeding 
pair button to the Angular form.

### 2. Litters and weaning

- Create Litter with Id, a unique LitterCode, BreedingPairId, BirthDate, pup counts, PlannedWeaningDate, optional ActualWeaningDate, 
and audit timestamps.
- Validate that the breeding pair exists, birth date is not in the future, and pup counts are nonnegative.
- Configure the planned weaning interval from your facility-approved protocol. Calculate PlannedWeaningDate = BirthDate + 
configured interval on the server. Store the result so a later protocol change does not silently reschedule existing litters.
- Keep planned and actual weaning separate. Reaching the planned date should flag a litter for review; it should not mark it as
weaned.
- Add litter create, view, and edit endpoints, plus an action to record actual weaning. Use date-only values and the same 
Winnipeg definition of “today” as the Mouse form.

### 3. Health and welfare records

- Create a WelfareRecord for an individual mouse or a cage. For the first version, require exactly one of MouseId or CageId.
- Record observation time, category, notes, action taken, follow-up due date, and whether the follow-up is complete.
- Add endpoints to create observations, view history, and list open follow-ups. Preserve completed records rather than removing 
them from history.
- Keep observations separate from scheduled husbandry tasks. “Wet bedding observed” is a record; “perform a cage change” is a task. 
That distinction will matter when you add QR-based room checks.

### 4. Dashboard and reports

- Add GET /api/Dashboard/summary for room, cage, mouse, active breeding-pair, weaning-due, and open welfare-follow-up counts.
- Define weaning due as ActualWeaningDate == null && PlannedWeaningDate <= facilityToday. Use that same rule for both the dashboard
count and the clickable due list.
- Add a chart for litters born by month, using litter birth dates rather than record creation timestamps.
- Add a room-level report showing racks, cages, active breeding pairs, and litters awaiting weaning. This can later become the 
destination for a room QR code.
- Show an error when a report fails to load. Display 0 only when a successful query actually returns zero.

### 5. Verification

- Review the EF migration for the new tables, foreign keys, unique codes, and indexes before applying it to LabSmartTrackDb.
- Test invalid parent IDs, duplicate codes, future dates, and negative counts.
- Test one litter due today, one due tomorrow, and one already weaned. Only the first should appear in the due count.
- Confirm the dashboard count matches its detail list, and saved records persist after refresh.
- Run the API build and xUnit tests, then the Angular tests and production build.

Start with one end-to-end workflow: create a breeding pair → register a litter → see it on the due list → record actual weaning 
→ confirm it leaves the due list but remains in the pair’s history. That gives you a concrete test for the models, endpoints, 
date calculation, and dashboard before you add charts.