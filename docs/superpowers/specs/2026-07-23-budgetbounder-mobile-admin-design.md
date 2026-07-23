# BudgetBounder Mobile and Admin Implementation Specification

## Objective

Implement the BudgetBounder user product as an Expo/React Native application and the operational control surface as a React desktop admin application. Both clients use the existing ASP.NET Core API and SQL Server database as their source of truth. The Figma file `TFiIlj0wbYjkiTVdB3U3M4` is the visual source of truth.

The implementation keeps working transaction, saving-goal, mission, authentication, and AI behavior. It extends those behaviors through additive migrations, explicit DTOs, policy-based authorization, testable domain services, and client-side state handling.

## Existing Project Structure

### API

Path: `BudgetBounder/BudgetBounder.API/BudgetBounder.Api`

- ASP.NET Core controllers with Entity Framework Core and SQL Server.
- JWT authentication already exists.
- Current entities: `User`, `Transaction`, `SavingGoal`, and `Mission`.
- Current services: static mission generation and level calculation.
- Current controllers: users, transactions, saving goals, missions, and AI chat.
- Existing migrations create users, transactions, goals, missions, and the AI-generated mission flag.
- Current authorization only requires an authenticated token; it does not enforce ownership or administrator roles.
- Several list endpoints currently expose all records to any authenticated user.

### Mobile

Path: `BudgetBounder/BudgetBounderMobile`

- Expo SDK 54, React Native 0.81, React 19, Expo Router 6.
- Five tab routes: Home, Transactions, Missions, Goals, and Profile.
- Secure Store, Axios, Expo Haptics, and Reanimated are installed.
- Early presentational components exist in `src/components/ScreenScaffold.tsx`.
- The current screens contain mostly static demonstration data and are not yet connected into a complete authenticated product flow.

### Desktop Web

Path: `BudgetBounder/BudgetBounder.Web/BudgetBounder-web`

- React 19, TypeScript, Vite, React Router, and Axios.
- Existing routes were originally shaped as a customer web application.
- Existing authentication context stores a JWT.
- Existing pages cover login, registration, dashboard, transactions, goals, missions, and AI.
- These pages are treated as reusable scaffolding where useful, but routes and copy become administrator-focused.

## Proposed Architecture

### Shared backend

The API remains the sole authority for identity, authorization, financial data, mission progress, XP, levels, streaks, achievements, rewards, and game results.

Controllers expose DTOs and delegate calculations to focused services:

- `ProgressionService`: level thresholds, XP awards, and streak updates.
- `FinancialSummaryService`: monthly income, expense, remaining budget, category totals, and goal contribution suggestions.
- `MissionProgressService`: updates mission progress from transaction and goal events.
- `AdminDashboardService`: aggregate operational metrics without exposing unnecessary financial detail.

Authorization uses JWT role claims plus ownership requirements:

- `User`: may read and mutate only their own profile, transactions, goals, missions, achievements, rewards, notifications, and game results.
- `Admin`: may access admin aggregate and management endpoints.
- Sensitive administrative actions produce audit entries.

### Mobile application

Expo Router provides authentication and setup stacks plus the five-tab main product. API calls live in typed service modules. Authentication state and the decoded current user live in a single provider backed by Secure Store. Screens use shared design tokens and reusable components instead of embedded one-off styling.

### Admin application

React Router provides protected administrator routes inside a persistent desktop shell. A typed API layer handles bearer tokens, normalized errors, and abortable loading. Admin pages use shared cards, tables, badges, charts, filters, state panels, drawers, and confirmation dialogs.

## Figma Design Contract

Source file: `https://www.figma.com/design/TFiIlj0wbYjkiTVdB3U3M4`

### Foundations

- Canvas: `#080D1B`
- Surface: `#111A2E`
- Raised surface: `#17233B`
- Primary text: `#F5F2E8`
- Secondary text: `#A8B3C7`
- Border: `#2B3B59`
- Positive/progress: `#35D58A`
- Reward/attention: `#F6C95F`
- AI: `#9B7BFF`
- Warning/error: `#FF7A72`
- Informational/admin: `#52D9FF`
- UI typography: Space Grotesk or the closest bundled/system-safe equivalent.
- Game and level typography: Press Start 2P only for short display moments.
- Data typography: JetBrains Mono or a platform monospace fallback.
- Base spacing: 8px. Primary radii: 10, 14, 18, 20, and 28px.
- Body contrast is at least 4.5:1; interactive targets are at least 44px.

### Mobile references

- Figma home dashboard node: `3:132`.
- Baseline viewport: 390×844.
- Horizontal content margin: 20px.
- Bottom navigation: 350×68 within the safe area.
- Primary hierarchy: financial status, current mission, saving goal, AI insight, recent activity.
- Shared components: level chip, finance summary card, progress bar, mission card, goal card, AI insight, transaction row, primary/secondary button, state panel, toast, and bottom navigation.

### Admin references

- Figma overview node: `4:65`.
- Baseline viewport: 1440×1024.
- Sidebar: 240px.
- Top navigation: 72px.
- Main content begins at 288px and uses a responsive card grid.
- Shared components: admin shell, sidebar item, top navigation, stat card, chart panel, review queue, data table, status badge, filter bar, drawer, modal, and pagination.

## Database Changes and Migrations

Milestone 1 uses one additive migration named `AddRolesBudgetsAndAdminOperations`.

### User changes

- `Role` string, required, default `User`; allowed values `User` and `Admin`.
- `IsActive` boolean, default `true`.
- `CreatedAt` datetime, default UTC creation time.
- `LastActiveAt` nullable datetime.
- `CurrentStreak` integer, default `0`.
- `LongestStreak` integer, default `0`.
- `LastActivityDate` nullable date.
- Unique index on normalized email if an equivalent index does not already exist.

### MonthlyBudget

- `Id`
- `UserId`
- `Month` stored as the first UTC day of the month
- `Amount`
- `CreatedAt`
- `UpdatedAt`
- Unique composite index on `UserId` and `Month`

### AdminAuditLog

- `Id`
- `AdminUserId`
- `Action`
- `TargetType`
- `TargetId`
- `Details`
- `CreatedAt`

### Existing entity refinements

- Add indexes for user/date transaction queries, user/deadline goal queries, and user/expiry mission queries.
- Preserve all existing rows and relationships.
- Do not rename or drop existing columns in milestone 1.

Milestone 2 adds achievements, user achievements, rewards, user rewards, notifications, game sessions/results, AI review records, and mission catalog/templates through separate additive migrations.

## API Endpoints

### Authentication and profile

- Modify `POST /api/users/register`: create active `User` accounts only; never accept a role from the request.
- Modify `POST /api/users/login`: reject inactive accounts; include role in the JWT and return a typed auth response.
- Modify `GET /api/users/{id}`: allow self or admin.
- Add `GET /api/users/me`: return current profile and progression.
- Add `PUT /api/users/me`: update display name and safe preferences.

### User finance

- Modify all transaction, goal, and mission endpoints to derive the user ID from JWT claims for normal user routes.
- Preserve legacy URL shapes temporarily only where the mobile scaffold already depends on them, but enforce ownership.
- Add `GET /api/dashboard/me?month=YYYY-MM`: financial summary, progression, mission, goal, and recent activity.
- Add `GET /api/transactions/me`.
- Add `POST /api/transactions`: validate ownership, amount, category, type, and date.
- Add `PUT /api/transactions/{id}` with owner/admin authorization.
- Modify `DELETE /api/transactions/{id}` with owner/admin authorization.
- Add `GET /api/budgets/me?month=YYYY-MM`.
- Add `PUT /api/budgets/me/{month}`.
- Add `GET /api/saving-goals/me`.
- Modify goal creation and progress updates with owner/admin authorization.
- Add `GET /api/missions/me`.
- Modify mission completion to validate ownership and award XP exactly once.
- Modify `POST /api/ai/chat` to use the authenticated user ID rather than accepting one from the body.

### Admin

Every endpoint below requires the `Admin` role:

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `GET /api/admin/users/{id}`
- `PATCH /api/admin/users/{id}/status`
- `GET /api/admin/missions`
- `POST /api/admin/missions`
- `PUT /api/admin/missions/{id}`
- `POST /api/admin/missions/{id}/publish`
- `GET /api/admin/ai-reviews`
- `POST /api/admin/ai-reviews/{id}/approve`
- `POST /api/admin/ai-reviews/{id}/reject`
- `GET /api/admin/analytics`
- `GET /api/admin/audit-log`

Milestone 2 adds admin endpoints for achievements, rewards, game results, suspicious scores, system health history, and export.

## Mobile Navigation and Screens

### Root stack

- Splash
- Onboarding
- Sign in
- Registration
- Setup quest
- Main tabs
- Add transaction modal
- Transaction detail
- Goal detail/create
- Mission detail/claim
- AI coach/action plan
- Game portal/WebView/results
- Notifications
- Settings

### Main tabs

- Home
- Activity
- Missions
- Goals
- Profile

### Milestone 1 screen coverage

- Authentication and first-run setup.
- Home dashboard with real API data.
- Add expense/income and success XP feedback.
- Transaction history, detail, filtering, edit, delete, empty/loading/error states.
- Monthly budget overview and category progress.
- Goals list, create goal, detail, and contribution.
- Missions list, detail, completion, and XP feedback.
- Profile and progression summary.
- AI coach using the authenticated user context.

### Milestone 2 screen coverage

- Analytics, achievements, rewards, notifications, level map, complete AI action plans, Unity game portal/results, settings depth, and celebration variants.

## Admin Routes and Permissions

- `/login`: anonymous.
- `/`: redirects to `/overview`.
- `/overview`: administrator only.
- `/users`: administrator only.
- `/users/:id`: administrator only.
- `/missions`: administrator only.
- `/missions/new`: administrator only.
- `/missions/:id`: administrator only.
- `/ai-review`: administrator only.
- `/analytics`: administrator only.
- `/game`: administrator only, milestone 2 data.
- `/rewards`: administrator only, milestone 2 data.
- `/monitoring`: administrator only.
- `/audit-log`: administrator only.

The client rejects non-admin tokens before rendering the shell. The API independently rejects them with HTTP 403.

## Unity WebGL Integration

The Unity game remains outside React Native’s render tree and is loaded in a WebView.

- Native game portal requests a short-lived game-session token from the API.
- WebView URL includes only the opaque session token, not the JWT.
- A strict message bridge supports `READY`, `PAUSE`, `RESUME`, `RESULT`, and `ERROR`.
- The API validates score limits, session ownership, duration, and one-time result submission before awarding XP or coins.
- Native chrome owns exit, pause, sound, connectivity, loading, error, and confirmation states.
- Milestone 1 creates the typed client boundary and representative placeholder portal.
- Milestone 2 adds game-session persistence, result validation, rewards, suspicious-score review, and production WebGL host configuration.

## Loading, Empty, Success, and Error States

Every network-backed screen must distinguish:

- Initial loading with skeleton or progress treatment.
- Empty data with a useful next action.
- Recoverable error with retry.
- Offline state where applicable.
- Mutation-in-progress state that prevents duplicate submission.
- Success feedback for transactions, goals, missions, level-ups, and admin changes.

API errors use a consistent problem-details shape. Clients translate technical messages into supportive user or operator copy.

## Automated Testing

### API

- Registration cannot self-assign the admin role.
- Inactive users cannot log in.
- User routes reject access to another user’s records.
- User tokens receive 403 on all admin endpoints.
- Admin tokens may access admin endpoints.
- Monthly totals treat income and expenses correctly.
- Budget remaining and category totals are correct.
- Mission progress updates once per qualifying event.
- Mission completion and goal completion award XP exactly once.
- Level calculation is deterministic at boundaries.
- Streak updates handle same-day, consecutive-day, and broken-streak activity.

### Mobile

- Auth state restores and clears securely.
- Dashboard view model formats Israeli currency correctly.
- Transaction submission sends the authenticated contract and handles success/error.
- Mission completion updates progression feedback.
- Empty/loading/error components expose accessible labels.

### Admin

- Non-admin tokens cannot render protected routes.
- Overview maps API metrics to the correct cards.
- User status changes require confirmation and show errors.
- Mission editor validates required fields and reward ranges.
- Critical loading, empty, and error states render.

## Milestone Checklist

### Milestone 1 — Functional core

- [ ] Add API test project and test infrastructure.
- [ ] Add roles, account status, streaks, budgets, and audit schema migration.
- [ ] Add policy-based self/admin authorization.
- [ ] Secure existing finance endpoints against cross-user access.
- [ ] Add progression, financial summary, and mission progress services.
- [ ] Add authenticated dashboard and budget endpoints.
- [ ] Add admin overview, user management, mission management, and audit endpoints.
- [ ] Build shared mobile tokens/components and authenticated navigation.
- [ ] Connect mobile dashboard, transactions, budgets, goals, missions, AI, and profile.
- [ ] Convert the web application into the protected admin shell.
- [ ] Implement admin overview, users, missions, AI review shell, analytics shell, and monitoring.
- [ ] Add loading, empty, success, error, and confirmation states.
- [ ] Pass API tests, mobile type/lint checks, and admin tests/build.

### Milestone 2 — Product depth

- [ ] Add achievements and badge progression.
- [ ] Add reward currency, safe cosmetic rewards, and redemption history.
- [ ] Add persisted notifications and preferences.
- [ ] Add AI recommendation review and action-plan persistence.
- [ ] Add Unity game sessions, results, validation, and admin review.
- [ ] Add detailed analytics and report export.
- [ ] Add level map, celebration states, responsive refinements, motion, haptics, and accessibility polish.
- [ ] Complete end-to-end critical-flow tests.

## Non-Goals

- No real-money rewards, gambling mechanics, or rewards for spending.
- No replacement of SQL Server or the existing API stack.
- No destructive database migration.
- No full Unity game implementation inside this repository.
- No unrelated rewrite of working API behavior.

