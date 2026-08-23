# Admin Milestone 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every Milestone 2 admin placeholder with persistent, authorized operations and connect Unity results to the hosted API.

**Architecture:** Add focused EF Core entities and API contracts for recommendations, game sessions, and cosmetic rewards. Keep administrative mutations behind `AdminOnly`, identify ordinary callers from JWT claims, and expose typed React pages through the existing Axios client and admin component library.

**Tech Stack:** ASP.NET Core 10, EF Core SQL Server, xUnit, React 19, TypeScript 6, Axios, Vitest, Unity C#.

**Spec:** `docs/superpowers/specs/2026-08-23-admin-milestone-2-design.md`

## Global Constraints

- Preserve the existing dark arcade-style design and `AdminOnly` authorization.
- Do not add monetary prizes, purchases, or arbitrary code-driven rewards.
- Never trust user IDs, XP awards, or review identities supplied by clients.
- Secrets and deployment credentials must not be stored in the repository.
- Unity replay must remain available when result submission fails.

---

### Task 1: Persistent Admin Domain Model

**Files:**
- Create: `BudgetBounder.API/BudgetBounder.Api/Models/AiRecommendation.cs`
- Create: `BudgetBounder.API/BudgetBounder.Api/Models/GameSession.cs`
- Create: `BudgetBounder.API/BudgetBounder.Api/Models/RewardDefinition.cs`
- Create: `BudgetBounder.API/BudgetBounder.Api/Models/UserReward.cs`
- Modify: `BudgetBounder.API/BudgetBounder.Api/Data/BudgetBounderDbContext.cs`
- Create: `BudgetBounder.API/BudgetBounder.Api.Tests/AdminPersistenceTests.cs`
- Create: EF migration generated with `dotnet ef migrations add AddAdminMilestoneTwo`

**Interfaces:**
- Produces: `DbSet<AiRecommendation> AiRecommendations`, `DbSet<GameSession> GameSessions`, `DbSet<RewardDefinition> RewardDefinitions`, and `DbSet<UserReward> UserRewards`.
- Produces: unique `(UserId, RewardDefinitionId)` unlock constraint and indexed timestamps/status fields.

- [ ] **Step 1: Write the failing persistence tests**

```csharp
[Fact]
public void UserReward_HasUniqueUserAndRewardIndex()
{
    using var db = TestDb.Create();
    var entity = db.Model.FindEntityType(typeof(UserReward))!;
    Assert.Contains(entity.GetIndexes(), i => i.IsUnique &&
        i.Properties.Select(p => p.Name).SequenceEqual(["UserId", "RewardDefinitionId"]));
}
```

- [ ] **Step 2: Run the targeted test and confirm it fails**

Run: `dotnet test BudgetBounder.API/BudgetBounder.Api.Tests --filter AdminPersistenceTests`
Expected: FAIL because the milestone entities and mappings do not exist.

- [ ] **Step 3: Implement entities and mappings**

Use explicit statuses (`Draft`, `Approved`, `Rejected`) and validation lengths. `GameSession` owns server-calculated `AwardedXp` and `ValidationState`; `AiRecommendation` owns nullable `ReviewedByAdminId` and `ReviewedAt`; rewards are cosmetic definitions with `IsActive`.

```csharp
modelBuilder.Entity<UserReward>()
    .HasIndex(x => new { x.UserId, x.RewardDefinitionId })
    .IsUnique();
modelBuilder.Entity<GameSession>()
    .HasIndex(x => new { x.UserId, x.SubmittedAt });
```

- [ ] **Step 4: Generate the migration and pass persistence tests**

Run: `dotnet ef migrations add AddAdminMilestoneTwo --project BudgetBounder.API/BudgetBounder.Api`
Run: `dotnet test BudgetBounder.API/BudgetBounder.Api.Tests --filter AdminPersistenceTests`
Expected: PASS.

- [ ] **Step 5: Commit the domain slice**

```powershell
git add BudgetBounder.API/BudgetBounder.Api/Models BudgetBounder.API/BudgetBounder.Api/Data BudgetBounder.API/BudgetBounder.Api/Migrations BudgetBounder.API/BudgetBounder.Api.Tests/AdminPersistenceTests.cs
git commit -m "feat: add milestone two admin persistence"
```

### Task 2: Existing Analytics and Audit Screens

**Files:**
- Create: `BudgetBounder.Web/BudgetBounder-web/src/pages/admin/Analytics.tsx`
- Create: `BudgetBounder.Web/BudgetBounder-web/src/pages/admin/AuditLog.tsx`
- Create: `BudgetBounder.Web/BudgetBounder-web/src/pages/admin/Analytics.test.tsx`
- Create: `BudgetBounder.Web/BudgetBounder-web/src/pages/admin/AuditLog.test.tsx`
- Modify: `BudgetBounder.Web/BudgetBounder-web/src/App.tsx`
- Modify: `BudgetBounder.Web/BudgetBounder-web/src/services/api.ts`

**Interfaces:**
- Consumes: `GET /admin/analytics` and `GET /admin/audit-log`.
- Produces: typed `adminApi.analytics()` and `adminApi.auditLog()` service calls.

- [ ] **Step 1: Add failing route/page tests**

```tsx
it("renders analytics returned by the API", async () => {
  vi.spyOn(adminApi, "analytics").mockResolvedValue({ users: 4, activeUsers: 3, transactions: 9 });
  render(<Analytics />);
  expect(await screen.findByText("4")).toBeTruthy();
});
```

- [ ] **Step 2: Confirm the frontend tests fail**

Run: `npm test -- Analytics.test.tsx AuditLog.test.tsx`
Expected: FAIL because the pages and typed service do not exist.

- [ ] **Step 3: Implement typed API methods and pages**

Analytics renders `StatCard` values. Audit Log renders the latest 200 records, a text filter matching action/target/details, and loading, empty, and error `StatePanel` states.

```ts
export const adminApi = {
  analytics: () => api.get<AdminOverview>("/admin/analytics").then(r => r.data),
  auditLog: () => api.get<AuditEntry[]>("/admin/audit-log").then(r => r.data),
};
```

- [ ] **Step 4: Run tests, lint, and build**

Run: `npm test && npm run lint && npm run build`
Expected: all commands exit 0.

- [ ] **Step 5: Commit the existing-data slice**

```powershell
git add BudgetBounder.Web/BudgetBounder-web/src
git commit -m "feat: connect admin analytics and audit log"
```

### Task 3: AI Recommendation Review

**Files:**
- Create: `BudgetBounder.API/BudgetBounder.Api/Dtos/AdminAiDtos.cs`
- Create: `BudgetBounder.API/BudgetBounder.Api/Controllers/AdminAiController.cs`
- Create: `BudgetBounder.API/BudgetBounder.Api.Tests/AdminAiControllerTests.cs`
- Create: `BudgetBounder.Web/BudgetBounder-web/src/pages/admin/AiReview.tsx`
- Create: `BudgetBounder.Web/BudgetBounder-web/src/pages/admin/AiReview.test.tsx`
- Modify: `BudgetBounder.Web/BudgetBounder-web/src/services/api.ts`
- Modify: `BudgetBounder.Web/BudgetBounder-web/src/App.tsx`

**Interfaces:**
- Produces: `GET /api/admin/ai-recommendations?status=Draft`.
- Produces: `PATCH /api/admin/ai-recommendations/{id}/review` with `{ decision: "Approved" | "Rejected" }`.

- [ ] **Step 1: Write failing authorization and state-transition tests**

```csharp
[Fact]
public async Task Review_RecordsAuthenticatedAdminAndDecision()
{
    var result = await controller.Review(7, new("Approved"), CancellationToken.None);
    Assert.IsType<NoContentResult>(result);
    Assert.Equal(UserRoles.Admin, context.AiRecommendations.Single().Status == "Approved" ? UserRoles.Admin : "");
    Assert.Equal(adminId, context.AiRecommendations.Single().ReviewedByAdminId);
}
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `dotnet test BudgetBounder.API/BudgetBounder.Api.Tests --filter AdminAiControllerTests`
Expected: FAIL because controller/contracts do not exist.

- [ ] **Step 3: Implement API, audit entry, service methods, and review page**

Reject invalid decisions with `400`; return `404` for missing records; reject already-reviewed records with `409`. The page uses status filters and explicit Approve/Reject buttons, then refreshes the list.

- [ ] **Step 4: Pass backend and frontend tests**

Run: `dotnet test BudgetBounder.API/BudgetBounder.Api.Tests --filter AdminAiControllerTests`
Run: `npm test -- AiReview.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit the AI review slice**

```powershell
git add BudgetBounder.API BudgetBounder.Web/BudgetBounder-web/src
git commit -m "feat: add admin AI recommendation review"
```

### Task 4: Game Session Submission and Operations

**Files:**
- Create: `BudgetBounder.API/BudgetBounder.Api/Dtos/GameSessionDtos.cs`
- Create: `BudgetBounder.API/BudgetBounder.Api/Controllers/GameSessionsController.cs`
- Create: `BudgetBounder.API/BudgetBounder.Api/Controllers/AdminGameController.cs`
- Create: `BudgetBounder.API/BudgetBounder.Api/Services/GameResultValidator.cs`
- Create: `BudgetBounder.API/BudgetBounder.Api.Tests/GameSessionTests.cs`
- Create: `BudgetBounder.Web/BudgetBounder-web/src/pages/admin/GameOperations.tsx`
- Create: `BudgetBounder.Web/BudgetBounder-web/src/pages/admin/GameOperations.test.tsx`
- Modify: `BudgetBounder.Web/BudgetBounder-web/src/services/api.ts`
- Modify: `BudgetBounder.Web/BudgetBounder-web/src/App.tsx`
- Modify: `BudgetBounder.API/BudgetBounder.Api/Controllers/AdminController.cs`

**Interfaces:**
- Produces: `POST /api/game-sessions` using JWT user identity and `{ clientResultId, score, durationSeconds, coins, savingsStars }`.
- Produces: `GET /api/admin/game-sessions` returning the latest 200 sessions.
- Produces: monitoring Unity status `Operational` when the game-session store can be queried.

- [ ] **Step 1: Write failing validation/idempotency tests**

```csharp
[Fact]
public async Task Submit_DuplicateClientResult_ReturnsExistingSessionWithoutDoubleXp()
{
    var first = await controller.Submit(validRequest, CancellationToken.None);
    var second = await controller.Submit(validRequest, CancellationToken.None);
    Assert.Single(context.GameSessions);
    Assert.Equal(xpAfterFirst, context.Users.Single().XP);
}
```

- [ ] **Step 2: Confirm tests fail**

Run: `dotnet test BudgetBounder.API/BudgetBounder.Api.Tests --filter GameSessionTests`
Expected: FAIL because submission and validation do not exist.

- [ ] **Step 3: Implement safe server-side ingestion**

Cap awarded XP at 500, reject negative values and durations outside `1..7200`, flag scores above documented limits, and make `(UserId, ClientResultId)` unique. Never accept `UserId` or awarded XP from the client.

- [ ] **Step 4: Implement operations page and pass tests**

Run: `dotnet test BudgetBounder.API/BudgetBounder.Api.Tests --filter GameSessionTests`
Run: `npm test -- GameOperations.test.tsx`
Expected: PASS and the page differentiates Valid/Flagged sessions with badges.

- [ ] **Step 5: Commit the game-session slice**

```powershell
git add BudgetBounder.API BudgetBounder.Web/BudgetBounder-web/src
git commit -m "feat: persist and monitor Unity game sessions"
```

### Task 5: Cosmetic Rewards Administration

**Files:**
- Create: `BudgetBounder.API/BudgetBounder.Api/Dtos/RewardDtos.cs`
- Create: `BudgetBounder.API/BudgetBounder.Api/Controllers/AdminRewardsController.cs`
- Create: `BudgetBounder.API/BudgetBounder.Api.Tests/AdminRewardsTests.cs`
- Create: `BudgetBounder.Web/BudgetBounder-web/src/pages/admin/Rewards.tsx`
- Create: `BudgetBounder.Web/BudgetBounder-web/src/pages/admin/Rewards.test.tsx`
- Modify: `BudgetBounder.Web/BudgetBounder-web/src/services/api.ts`
- Modify: `BudgetBounder.Web/BudgetBounder-web/src/App.tsx`

**Interfaces:**
- Produces: `GET /api/admin/rewards`.
- Produces: `POST /api/admin/rewards` with `{ code, name, description, cosmeticType }`.
- Produces: `PATCH /api/admin/rewards/{id}/status` with `{ isActive }`.

- [ ] **Step 1: Write failing validation and audit tests**

```csharp
[Fact]
public async Task Create_RejectsUnknownCosmeticType()
{
    var result = await controller.Create(new("gold", "Gold", "x", "Cash"), default);
    Assert.IsType<BadRequestObjectResult>(result.Result);
}
```

- [ ] **Step 2: Confirm failure, then implement API and UI**

Run: `dotnet test BudgetBounder.API/BudgetBounder.Api.Tests --filter AdminRewardsTests`
Expected: FAIL before implementation. Allow only `Badge`, `Theme`, and `AvatarFrame`; require unique normalized codes; audit create/status mutations.

- [ ] **Step 3: Add the page with creation and activation controls**

Render reward definitions, unlock counts, creation validation, and active/inactive badges. Do not expose deletion or financial reward types.

- [ ] **Step 4: Pass backend and frontend tests**

Run: `dotnet test BudgetBounder.API/BudgetBounder.Api.Tests --filter AdminRewardsTests`
Run: `npm test -- Rewards.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit the rewards slice**

```powershell
git add BudgetBounder.API BudgetBounder.Web/BudgetBounder-web/src
git commit -m "feat: add cosmetic reward administration"
```

### Task 6: Unity Result Bridge and Full Verification

**Files:**
- Create: `C:/Unity dev/CreateWithCode/BudgetBounder/Assets/Scripts/Api/GameSessionApiClient.cs`
- Create: `C:/Unity dev/CreateWithCode/BudgetBounder/Assets/Tests/EditMode/GameSessionPayloadTests.cs`
- Modify: `C:/Unity dev/CreateWithCode/BudgetBounder/Assets/Scripts/ResultsData.cs`
- Modify: `C:/Unity dev/CreateWithCode/BudgetBounder/Assets/Scripts/ResultsUIManager.cs`
- Modify: `C:/Unity dev/CreateWithCode/BudgetBounder/Assets/Scripts/WebGLBridge.cs`
- Modify: `BudgetBounder.Web/BudgetBounder-web/src/pages/admin/Monitoring.tsx`

**Interfaces:**
- Consumes: `POST /api/game-sessions`.
- Produces: a stable JSON payload with a GUID `clientResultId` reused during retries.

- [ ] **Step 1: Write the failing Unity payload test**

```csharp
[Test]
public void Payload_PreservesClientResultIdAcrossSerialization()
{
    var payload = GameSessionPayload.Create(1200, 95, 20, 3);
    var copy = JsonUtility.FromJson<GameSessionPayload>(JsonUtility.ToJson(payload));
    Assert.AreEqual(payload.clientResultId, copy.clientResultId);
}
```

- [ ] **Step 2: Implement the non-blocking API client**

Use `UnityWebRequest`, attach the stored JWT bearer token, retry only transient failures with the same client result ID, and invoke completion without blocking the Results → Replay flow.

- [ ] **Step 3: Run Unity EditMode tests and project builds**

Run the repository's Unity EditMode test command if configured; otherwise open the project in its pinned Unity editor and run `Assets/Tests/EditMode`. Expected: payload test passes and scripts compile.

- [ ] **Step 4: Run full backend and desktop verification**

Run: `dotnet test BudgetBounder.API/BudgetBounder.Api.Tests`
Run: `dotnet build BudgetBounder.API/BudgetBounder.Api -c Release`
Run: `npm test && npm run lint && npm run build` from `BudgetBounder.Web/BudgetBounder-web`.
Expected: every command exits 0.

- [ ] **Step 5: Produce and verify the Somee migration script**

Run: `dotnet ef migrations script <previous-migration> AddAdminMilestoneTwo --idempotent --project BudgetBounder.API/BudgetBounder.Api -o deploy/somee/admin-milestone-2.sql`.
Inspect the script for only the four new tables/indexes, then apply it to Somee after action-time confirmation. Verify each admin route with the hosted API.

- [ ] **Step 6: Commit integration and deployment artifacts**

```powershell
git add BudgetBounder.Web BudgetBounder.API deploy/somee/admin-milestone-2.sql
git commit -m "feat: complete admin milestone two integration"
```

The Unity workspace at `C:/Unity dev/CreateWithCode/BudgetBounder` is a separate project directory and is verified separately; do not attempt to stage it in the desktop/API repository commit.
