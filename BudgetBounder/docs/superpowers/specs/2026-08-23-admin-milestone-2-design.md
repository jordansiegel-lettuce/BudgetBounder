# BudgetBounder Admin Milestone 2 Design

## Goal

Replace the desktop admin portal's "Milestone 2" placeholders with useful, persistent, API-backed operations while preserving the existing dark arcade-style design and `AdminOnly` authorization.

## Scope

### Analytics

Create a real analytics page backed by `GET /api/admin/analytics`. It will show the existing overview totals, progression and engagement values using summary cards and compact data sections. No new analytics storage is introduced in this phase; values remain derived from the hosted SQL data by `AdminDashboardService`.

### Audit log

Create a searchable audit-log page backed by `GET /api/admin/audit-log`. Entries will show time, administrator, action, target, and details. The existing API returns the latest 200 entries, so filtering is performed client-side for this bounded dataset.

### AI recommendation review

Add persistent `AiRecommendations` records with draft, approved, and rejected states. Add admin endpoints to list recommendations and approve or reject them. Approval records the reviewing administrator and timestamp; it does not silently execute financial actions. The admin page will provide status filters and explicit review controls.

### Game operations

Add persistent `GameSessions` records for Unity results, including score, XP awarded, completion time, result time, and validation state. Add an authenticated result-submission endpoint and admin list endpoint. The admin page will show recent sessions and flag suspicious results using conservative server-side validation limits. Existing Unity code will remain playable even when the API cannot be reached.

### Rewards and achievements

Add persistent reward definitions and per-user unlock records. Admin endpoints will list and create or enable/disable safe cosmetic rewards. The portal will show definitions and unlock counts. This phase will not add monetary prizes, purchases, or arbitrary code-driven rewards.

### Monitoring

Replace the hard-coded Unity value `Milestone 2` with a meaningful operational status derived from whether game-session storage is available. Monitoring continues to report API, database, AI, and Unity integration status without implying that a label is executable.

## Architecture and Data Flow

The React portal will continue to call the shared authenticated API client in `src/services/api.ts`. Each route gets its own page component with loading, empty, success, and error states using the existing admin UI components.

ASP.NET Core controllers remain protected by the `AdminOnly` policy for administrative reads and mutations. New persistence is added through EF Core entities, `BudgetBounderDbContext`, and one migration. Unity/mobile result submission uses the authenticated user identity from the JWT instead of accepting a caller-supplied user ID.

The hosted Somee database is updated only through the generated, reviewed EF migration or an equivalent idempotent deployment script. Secrets and deployment credentials are not stored in the repository.

## Error Handling and Security

- Return validation errors as `400`, missing records as `404`, and unauthorized access as `401/403`.
- Never trust user IDs, XP awards, or review identities supplied by clients.
- Validate game values and cap XP on the server.
- Audit AI decisions and reward-definition mutations.
- Keep approval/rejection operations explicit; no bulk destructive actions.
- Display retryable portal errors without discarding the current page state.

## Files and Components

Expected backend changes:

- `Models/` entities for AI recommendations, game sessions, reward definitions, and user rewards.
- `Dtos/` request/response contracts.
- `Data/BudgetBounderDbContext.cs` mappings.
- `Controllers/AdminController.cs` or focused admin controllers for the new operations.
- A new EF Core migration.
- Backend tests covering authorization, validation, persistence, and state transitions.

Expected desktop changes:

- Replace `pages/admin/Placeholder.tsx` route usage with `Analytics.tsx`, `AuditLog.tsx`, `AiReview.tsx`, `GameOperations.tsx`, and `Rewards.tsx`.
- Extend `services/api.ts` with typed endpoint methods.
- Reuse `components/admin/AdminUi.tsx` and existing CSS tokens.
- Update `App.tsx` routes.
- Add component/service tests for success, empty, and error states.

Expected Unity changes:

- Connect the existing result JSON flow to the authenticated game-session endpoint.
- Preserve offline behavior and avoid blocking replay when submission fails.

## Verification

- Run all ASP.NET Core tests and build the API in Release mode.
- Apply the migration to a disposable/local database before producing the Somee deployment script.
- Run desktop unit tests, lint, and production build.
- Verify administrator authorization and each new route against the hosted API.
- Verify a Unity result can be recorded once and appears in Game Operations.
- Confirm AI review and reward mutations create audit-log entries.

## Delivery Order

1. Shared data model and migration.
2. Analytics and audit-log pages using existing endpoints.
3. AI review persistence and UI.
4. Game-session ingestion and operations UI.
5. Reward definitions/unlocks and UI.
6. Unity result submission, monitoring status, and end-to-end verification.

