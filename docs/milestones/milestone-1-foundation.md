# Milestone 1: Create the .NET and Angular Foundation

## Description

Create the initial technical foundation for the new LabSmartTrack application using ASP.NET Core, C#, Angular, TypeScript, and SQL Server.

This milestone will establish the solution structure, backend REST API, Angular frontend, API documentation, frontend-to-backend communication, basic dashboard layout, and initial automated tests.

Authentication and administrator functionality are not included in this milestone.

## Technology Stack

- C#
- ASP.NET Core Web API
- Angular
- TypeScript
- HTML and CSS
- RESTful web services
- SQL Server
- Entity Framework Core
- Swagger/OpenAPI
- xUnit
- Git and GitHub

## User Story

As a developer, I want to create the initial .NET and Angular foundation so that future LabSmartTrack features can be developed using an organized and testable architecture.

## Tasks

### .NET Solution

- [X] Create the `LabSmartTrack` .NET solution.
- [X] Create the `LabSmartTrack.Api` ASP.NET Core Web API project.
- [X] Create the `LabSmartTrack.Tests` xUnit project.
- [X] Add both projects to the solution.
- [X] Add a project reference from the test project to the API project.
- [X] Create an appropriate `.gitignore` file.

### ASP.NET Core API

- [X] Confirm that the Web API starts successfully.
- [X] Create a health-check endpoint.
- [X] Return a successful JSON response from the health-check endpoint.
- [X] Enable controllers in `Program.cs`.
- [X] Configure development CORS for the Angular application.

### Angular Application

- [ ] Create the `LabSmartTrack.Client` Angular application.
- [ ] Enable Angular routing.
- [ ] Use CSS for the application styles.
- [ ] Confirm that the Angular development server starts.
- [ ] Create the initial dashboard page.
- [ ] Create the dashboard navigation layout.
- [ ] Add placeholder summary cards.

### Swagger

- [ ] Configure Swagger/OpenAPI in the API project.
- [ ] Confirm that the Swagger page opens in development.
- [ ] Confirm that the health-check endpoint appears in Swagger.
- [ ] Test the health-check endpoint through Swagger.

### API Communication

- [ ] Add Angular `HttpClient`.
- [ ] Create an Angular API service.
- [ ] Configure the API base URL.
- [ ] Call the ASP.NET Core health-check endpoint from Angular.
- [ ] Display the API status on the dashboard.
- [ ] Display a helpful message if the API is unavailable.

### Testing

- [ ] Create an initial xUnit test.
- [ ] Test the health-check endpoint or service.
- [ ] Confirm that all xUnit tests pass.
- [ ] Confirm that the API builds without errors.
- [ ] Confirm that the Angular application builds without errors.

## Acceptance Criteria

- [ ] The repository contains a valid `.NET` solution.
- [ ] The solution contains the API and xUnit test projects.
- [ ] The ASP.NET Core API starts without errors.
- [ ] The Angular application starts without errors.
- [ ] Swagger displays the available API endpoints.
- [ ] The API provides a working health-check endpoint.
- [ ] The Angular application successfully requests data from the API.
- [ ] The dashboard displays the current API status.
- [ ] The dashboard has a responsive initial layout.
- [ ] At least one xUnit test passes.
- [ ] No passwords, connection strings, or secrets are committed to GitHub.
- [ ] The project includes setup instructions in `README.md`.
- [ ] All changes are committed and pushed to GitHub.

## Suggested Project Structure

```text
LabSmartTrack_New_Version/
├── LabSmartTrack.Api/
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   ├── Program.cs
│   └── appsettings.json
├── LabSmartTrack.Client/
│   └── src/
│       └── app/
│           ├── components/
│           ├── pages/
│           ├── models/
│           └── services/
├── LabSmartTrack.Tests/
├── LabSmartTrack.sln
├── .gitignore
└── README.md
```

## Out of Scope

The following features will be completed in later milestones:

- SQL Server colony tables
- Mouse and cage management
- Breeding and litter management
- Authentication
- Staff registration
- Role-based authorization
- Administrator approval
- Email notifications

## Definition of Done

- [ ] All acceptance criteria are satisfied.
- [ ] The API and Angular application run locally.
- [ ] The Angular application communicates with the API.
- [ ] Swagger is working.
- [ ] The initial dashboard is visible.
- [ ] xUnit tests pass.
- [ ] The code is committed to a feature branch.
- [ ] A pull request is created and connected to this issue.

