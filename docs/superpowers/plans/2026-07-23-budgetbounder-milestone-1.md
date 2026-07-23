# BudgetBounder Milestone 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a functional, secure mobile finance application and desktop admin control surface backed by the shared ASP.NET Core API.

**Architecture:** Extend the existing API through additive EF Core migrations, policy-based authorization, focused domain services, and DTO-based endpoints. Connect the Expo Router mobile client and Vite/React admin client through typed Axios services and shared per-client design systems derived from Figma.

**Tech Stack:** .NET 10 / ASP.NET Core / EF Core / SQL Server / xUnit; Expo SDK 54 / React Native 0.81 / Expo Router; React 19 / Vite / React Router / CSS.

## Global Constraints

- Figma file `TFiIlj0wbYjkiTVdB3U3M4` is the visual source of truth.
- SQL Server remains the database and migrations must be additive.
- User and admin permissions must be enforced by the API.
- All financial copy uses Israeli `₪` formatting.
- Preserve existing working transactions, goals, missions, XP, and AI behavior.
- Do not introduce gambling or rewards for spending.
- Write a failing automated test before each production behavior.

---

### Task 1: API Test Harness and Progression Rules

**Files:**
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api.Tests/BudgetBounder.Api.Tests.csproj`
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api.Tests/Services/ProgressionServiceTests.cs`
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Services/ProgressionService.cs`
- Modify: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Services/LevelService.cs`

**Interfaces:**
- Produces: `ProgressionService.CalculateLevel(double xp)`, `ProgressionService.UpdateStreak(User user, DateOnly activityDate)`, and `ProgressionService.AwardXp(User user, int amount)`.

- [ ] Write tests for level boundaries, same-day activity, consecutive activity, broken streaks, and single XP awards.
- [ ] Run `dotnet test BudgetBounder/BudgetBounder.API/BudgetBounder.Api.Tests/BudgetBounder.Api.Tests.csproj` and verify failures because `ProgressionService` is absent.
- [ ] Implement the minimum progression service and make `LevelService` delegate to it.
- [ ] Run the test project and verify all progression tests pass.

### Task 2: Identity, Roles, Ownership, and Migration

**Files:**
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api.Tests/Authorization/AuthorizationTests.cs`
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Authorization/CurrentUserService.cs`
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Models/MonthlyBudget.cs`
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Models/AdminAuditLog.cs`
- Modify: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Models/User.cs`
- Modify: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Data/BudgetBounderDbContext.cs`
- Modify: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Program.cs`
- Modify: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Controllers/UsersController.cs`
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Migrations/*_AddRolesBudgetsAndAdminOperations.cs`

**Interfaces:**
- Produces: `ICurrentUserService.UserId`, `ICurrentUserService.IsAdmin`, `AdminOnly` authorization policy, role claim in JWT, and additive database schema.

- [ ] Write controller/service tests proving registration cannot assign admin, inactive users cannot log in, and user tokens fail the admin policy.
- [ ] Run the tests and verify the expected authorization failures.
- [ ] Add user role/status/streak fields, budgets, audit logs, indexes, and service registrations.
- [ ] Generate `AddRolesBudgetsAndAdminOperations` with `dotnet ef migrations add`.
- [ ] Run tests and inspect the migration to confirm it contains no destructive drop/rename operations.

### Task 3: Secure Finance and Dashboard APIs

**Files:**
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api.Tests/Services/FinancialSummaryServiceTests.cs`
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api.Tests/Controllers/FinanceOwnershipTests.cs`
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Services/FinancialSummaryService.cs`
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Controllers/DashboardController.cs`
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Controllers/BudgetsController.cs`
- Modify: transaction, saving-goal, mission, and AI controllers.

**Interfaces:**
- Produces: `GET /api/dashboard/me`, authenticated `me` finance endpoints, owner/admin mutation rules, and monthly summary DTOs.

- [ ] Write failing tests for income/expense totals, remaining budget, category totals, cross-user rejection, and authenticated AI context.
- [ ] Run tests and verify failures for missing services/endpoints.
- [ ] Implement summaries and ownership checks while retaining compatible existing routes.
- [ ] Run API tests and verify finance and authorization behavior passes.

### Task 4: Admin Core API

**Files:**
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api.Tests/Controllers/AdminControllerTests.cs`
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Controllers/AdminController.cs`
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Services/AdminDashboardService.cs`
- Create: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api/Dtos/AdminDtos.cs`

**Interfaces:**
- Produces: admin overview, users, account status, missions, analytics summary, monitoring, and audit endpoints.

- [ ] Write failing tests for admin role enforcement and aggregate DTO values.
- [ ] Run tests and verify non-admin access and missing endpoints fail as expected.
- [ ] Implement admin service, endpoints, audit logging, pagination, and safe user projections.
- [ ] Run all API tests.

### Task 5: Mobile Foundation and Authentication

**Files:**
- Create: `BudgetBounder/BudgetBounderMobile/src/theme/tokens.ts`
- Create: `BudgetBounder/BudgetBounderMobile/src/types/api.ts`
- Create: `BudgetBounder/BudgetBounderMobile/src/auth/AuthProvider.tsx`
- Create: `BudgetBounder/BudgetBounderMobile/src/components/ui/*`
- Create: `BudgetBounder/BudgetBounderMobile/app/(auth)/*`
- Modify: root and tab layouts.
- Add the smallest compatible Jest/React Native test configuration.

**Interfaces:**
- Produces: `useAuth()`, typed API contracts, Figma-derived components, protected router groups, and state panels.

- [ ] Write failing tests for `formatIls`, token restoration/clear behavior, and auth route decisions.
- [ ] Run mobile tests and verify the helpers/providers are missing.
- [ ] Implement tokens, formatters, auth provider, reusable cards/buttons/progress/state components, and protected routing.
- [ ] Run mobile tests, TypeScript, and Expo lint.

### Task 6: Mobile Functional Core

**Files:**
- Modify/create routes for Home, Activity, Missions, Goals, Profile, transaction forms/details, goal forms/details, mission details, AI, and budget overview.
- Modify: `BudgetBounder/BudgetBounderMobile/src/services/api.ts`

**Interfaces:**
- Consumes: authenticated API contracts and shared UI.
- Produces: connected core user flows with loading, empty, success, and error states.

- [ ] Write failing view-model/service tests for dashboard mapping, transaction submission, goal contribution, and mission completion.
- [ ] Run tests and verify missing behavior.
- [ ] Implement the smallest connected routes and mutations matching Figma node `3:132` and related mobile screens.
- [ ] Run tests, TypeScript, and lint.

### Task 7: Admin Foundation and Protected Shell

**Files:**
- Create: `BudgetBounder/BudgetBounder.Web/BudgetBounder-web/src/theme.css`
- Create: `BudgetBounder/BudgetBounder.Web/BudgetBounder-web/src/components/admin/*`
- Create: `BudgetBounder/BudgetBounder.Web/BudgetBounder-web/src/types/admin.ts`
- Modify: `AuthContext.tsx`, `App.tsx`, `App.css`, `index.css`, and API service.
- Add Vitest and React Testing Library configuration compatible with Vite 8.

**Interfaces:**
- Produces: role-aware auth, `AdminRoute`, admin shell, Figma-derived tokens/components, and normalized API states.

- [ ] Write failing tests proving non-admin tokens cannot render protected content and admin tokens can.
- [ ] Run tests and verify the route guard does not yet exist.
- [ ] Implement admin authentication, persistent shell, sidebar, top navigation, state panels, and responsive CSS based on Figma node `4:65`.
- [ ] Run web tests, TypeScript build, and lint.

### Task 8: Admin Core Screens

**Files:**
- Create/replace admin pages for overview, users, user detail, missions, mission editor, AI review, analytics, monitoring, game placeholder, rewards placeholder, and audit log.

**Interfaces:**
- Consumes: admin API DTOs and shell.
- Produces: operational milestone-1 routes with real data where endpoints exist and explicit milestone-2 states otherwise.

- [ ] Write failing tests for overview metric mapping, user-status confirmation, and mission-editor validation.
- [ ] Run tests and verify the pages do not satisfy the contracts.
- [ ] Implement responsive pages, tables, filters, dialogs, charts, and state handling.
- [ ] Run web tests, build, and lint.

### Task 9: Integrated Verification

**Files:**
- Modify only files required to fix verified defects.

- [ ] Run all API tests.
- [ ] Build the API.
- [ ] Run mobile tests, TypeScript, and lint.
- [ ] Run admin tests, build, and lint.
- [ ] Run browser smoke tests for admin login/shell and mobile-web rendering where supported.
- [ ] Confirm migrations are additive and document local run commands.

