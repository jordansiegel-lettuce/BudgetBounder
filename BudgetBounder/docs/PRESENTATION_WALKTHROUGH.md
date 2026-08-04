# BudgetBounder Presentation Walkthrough

Use this as a speaking guide. Do not try to show every file. The strongest presentation is: explain the architecture, demonstrate one complete feature from phone to database, then use shorter examples to prove the remaining requirements.

## One-minute opening

Say:

> BudgetBounder is a React Native personal-finance application. The user can register and sign in, record income and expenses, attach a receipt, tag a merchant location, set a monthly budget, manage saving goals, complete missions for XP, and schedule smart reminders. The mobile client communicates with a hosted ASP.NET Core Web API. The API uses JWT authentication, Entity Framework Core, and Microsoft SQL Server.

Draw or describe this flow:

```text
React Native app -> Axios + JWT -> ASP.NET Core controllers -> EF Core -> SQL Server
```

Point to:

- `BudgetBounderMobile/app/_layout.tsx`, lines 14-22: application providers.
- `BudgetBounderMobile/src/services/api.ts`, lines 7-23: Axios URL and JWT interceptor.
- `BudgetBounder.API/BudgetBounder.Api/Program.cs`, lines 17-35 and 45-77: controllers, SQL Server, JWT, and middleware.
- `BudgetBounder.API/BudgetBounder.Api/Data/BudgetBounderDbContext.cs`, lines 13-19: database tables.

## Recommended live-demo order

### 1. Authentication

Demonstrate registration or sign-in.

Say:

> Authentication is not only a visual form. The client calls the users API, receives a JWT, and stores it in the device's secure storage. Every later request automatically adds the token as a Bearer authorization header. Protected routes are unavailable without a token.

Point to:

- `BudgetBounderMobile/app/sign-in.tsx`, lines 8-21: controlled form, loading state, and error handling.
- `BudgetBounderMobile/src/auth/AuthProvider.tsx`, lines 19-37: restore and securely store the session.
- `BudgetBounderMobile/src/auth/AuthProvider.tsx`, lines 42-54: sign-in, registration, and sign-out.
- `BudgetBounderMobile/src/services/api.ts`, lines 17-23: automatic `Authorization: Bearer` header.
- `BudgetBounderMobile/app/_layout.tsx`, lines 39-55: public and authenticated route groups.
- `BudgetBounder.API/BudgetBounder.Api/Controllers/UsersController.cs`, lines 34-107: server registration, login, password checking, and JWT creation.
- `BudgetBounder.API/BudgetBounder.Api/Program.cs`, lines 45-64: JWT validation and the admin policy.

Likely question: **Why use SecureStore instead of normal state or AsyncStorage?**

Answer:

> React state disappears when the app closes. SecureStore persists the session using protected device storage and is more appropriate for a JWT than plain storage.

### 2. Dashboard

Open Home and identify the budget summary, recent activity, goal, mission, XP, level, and streak.

Say:

> The dashboard intentionally uses one aggregated endpoint. Instead of making many client requests, the API calculates the financial summary and returns the user's most relevant mission, goal, and recent transactions in one response.

Point to:

- `BudgetBounderMobile/app/(tabs)/index.tsx`, lines 10-31: dashboard request and loading/error states.
- `BudgetBounderMobile/app/(tabs)/index.tsx`, lines 33-77: rendering finance, mission, goal, and transaction data.
- `BudgetBounder.API/BudgetBounder.Api/Controllers/DashboardController.cs`, lines 18-52: authenticated aggregate endpoint.
- `BudgetBounder.API/BudgetBounder.Api/Services/FinancialSummaryService.cs`, lines 17-48: month filtering, totals, remaining budget, and category grouping.

Likely question: **Why is the calculation on the server?**

Answer:

> The server is the trusted data source. Keeping the calculation there avoids duplicating business rules across clients and lets the API filter only the authenticated user's records.

### 3. Add a transaction: your strongest end-to-end feature

Open Add Transaction. Enter an amount, select a category, capture a receipt, tag a location, and save.

Say:

> This demonstrates React state, validation, two native sensors, an authenticated API request, database persistence, and gamification in one flow.

Point to the mobile side:

- `BudgetBounderMobile/app/modal.tsx`, lines 12-17: form and native-data state.
- `BudgetBounderMobile/app/modal.tsx`, lines 19-25: camera permission, camera launch, and Base64 receipt.
- `BudgetBounderMobile/app/modal.tsx`, lines 27-35: foreground location and reverse geocoding.
- `BudgetBounderMobile/app/modal.tsx`, lines 37-48: validation, POST request, error handling, and loading cleanup.
- `BudgetBounderMobile/app/modal.tsx`, lines 51-61: rendered form, native-tool buttons, preview, and save action.

Then point to the API side:

- `BudgetBounder.API/BudgetBounder.Api/Controllers/TransactionsController.cs`, lines 33-46: user ownership, amount/coordinate/image validation, persistence, and mission update.
- `BudgetBounder.API/BudgetBounder.Api/Controllers/TransactionsController.cs`, lines 99-125: mission progress and XP/level update.
- `BudgetBounder.API/BudgetBounder.Api/Models/Transaction.cs`, lines 1-23: persisted transaction fields, including receipt and merchant position.
- `BudgetBounder.API/BudgetBounder.Api/Migrations/20260804191606_AddReceiptAndMerchantLocation.cs`, lines 8-44: schema migration for the native data.

Likely question: **Why request permissions at button press?**

Answer:

> Camera and location are optional. Permission is requested only when the user chooses that feature, and denial does not prevent manual transaction entry.

Likely question: **Why reduce image quality to 0.35?**

Answer:

> A receipt only needs to remain readable. Compression reduces request size and database/storage pressure. The API also rejects images above its maximum size.

### 4. Budgets and saving goals

Demonstrate setting a monthly budget, creating a goal, and adding a contribution.

Say:

> These screens reuse shared validation and authenticated API services. The API also validates the values, because client-side validation improves usability but cannot be trusted for security or data integrity.

Point to:

- `BudgetBounderMobile/app/budget.tsx`, lines 9-14: validate and save the current month's budget.
- `BudgetBounderMobile/app/create-goal.tsx`, lines 9-18: create a goal with a positive target and future deadline.
- `BudgetBounderMobile/app/contribute-goal.tsx`, lines 9-14: add positive progress to a goal.
- `BudgetBounderMobile/src/validation/financeForms.ts`, lines 1-13: reusable client validation.
- `BudgetBounder.API/BudgetBounder.Api/Controllers/BudgetsController.cs`, lines 26-47: validated budget upsert.
- `BudgetBounder.API/BudgetBounder.Api/Controllers/SavingGoalController.cs`, lines 32-72: goal creation, ownership, contribution validation, and completion.

### 5. Missions and gamification

Open Missions, then Profile to show XP, level, and streak.

Say:

> Gamification makes the finance workflow more engaging. Missions are linked to real actions. When a matching transaction is saved, the server increments mission progress and awards XP after completion. This cannot be safely controlled only by the client.

Point to:

- `BudgetBounderMobile/app/(tabs)/missions.tsx`, lines 10-22: fetch and display active missions and progress.
- `BudgetBounderMobile/app/(tabs)/profile.tsx`, lines 7-27: display account progression and provide reminder/budget actions.
- `BudgetBounder.API/BudgetBounder.Api/Controllers/TransactionsController.cs`, lines 99-125: automatic mission completion.
- `BudgetBounder.API/BudgetBounder.Api/Services/ProgressionService.cs`, lines 5-26: XP and streak business rules.
- `BudgetBounder.API/BudgetBounder.Api/Services/LevelService.cs`, lines 3-8: level calculation.

### 6. Smart push reminders

Open Smart Reminders and explain the four reminder types.

Say:

> The reminder feature is smart because the schedule is derived from current financial data and user preferences. It supports a daily logging reminder, a budget threshold warning, a weekly goal check-in, and a mission-expiry warning. Notification taps deep-link to the relevant screen.

Point to:

- `BudgetBounderMobile/app/reminders.tsx`, lines 11-40: load/save preferences, request permission, and synchronize reminders.
- `BudgetBounderMobile/src/reminders/reminderRules.ts`, lines 28-42: next daily and weekly times.
- `BudgetBounderMobile/src/reminders/reminderRules.ts`, lines 44-87: data-driven reminder plan.
- `BudgetBounderMobile/src/reminders/notificationService.ts`, lines 6-25: permission check, Android channel, cancellation, and scheduling.
- `BudgetBounderMobile/app/_layout.tsx`, lines 26-36: notification-tap deep linking and listener cleanup.
- `BudgetBounder.API/BudgetBounder.Api/Controllers/ReminderPreferencesController.cs`, lines 15-37: per-user preference persistence and range validation.

Likely question: **Why separate reminder rules from notification scheduling?**

Answer:

> The rules are pure TypeScript and can be tested without a phone. The notification service handles the device-specific side effects. This separation improves maintainability and testability.

## Assignment requirements: evidence map

### Requirement 1: work in pairs

This is an administrative requirement, not a code requirement.

Be ready to say each partner's responsibilities. Both partners must understand the complete project because the teacher may question either person separately. Use a truthful split such as mobile UI/native features versus API/database, but mention shared integration and testing.

### Requirement 2: React Native or React

Status: **Met with React Native and Expo.**

Point to:

- `BudgetBounderMobile/package.json`, lines 2-8 and 18-41: Expo/React Native application and dependencies.
- `BudgetBounderMobile/app.json`, lines 2-9: Expo mobile configuration.
- Any screen file containing React Native components, for example `BudgetBounderMobile/app/modal.tsx`, lines 1-8 and 51-62.

### Requirement 3: at least seven screens

Status: **Exceeded. There are 12 user-facing screens.**

Five main tabs:

1. Home - `app/(tabs)/index.tsx`
2. Activity - `app/(tabs)/transactions.tsx`
3. Goals - `app/(tabs)/goals.tsx`
4. Missions - `app/(tabs)/missions.tsx`
5. Profile - `app/(tabs)/profile.tsx`

Seven stack/modal screens:

6. Sign in - `app/sign-in.tsx`
7. Register - `app/register.tsx`
8. Add transaction - `app/modal.tsx`
9. Smart reminders - `app/reminders.tsx`
10. Create goal - `app/create-goal.tsx`
11. Goal contribution - `app/contribute-goal.tsx`
12. Monthly budget - `app/budget.tsx`

Point to `BudgetBounderMobile/app/_layout.tsx`, lines 43-55, and `BudgetBounderMobile/app/(tabs)/_layout.tsx`, lines 33-69, to show how Expo Router registers them.

### Requirement 4: database through a C# Web API

Status: **Exceeded. ASP.NET Core, EF Core, SQL Server, and seven tables are implemented.**

Point to:

- `Program.cs`, lines 17-35: controller and SQL Server registration.
- `Program.cs`, lines 74-78: authentication/authorization pipeline and controller mapping.
- `BudgetBounderDbContext.cs`, lines 13-19: Users, Transactions, SavingGoals, Missions, MonthlyBudgets, AdminAuditLogs, and ReminderPreferences.
- `BudgetBounderDbContext.cs`, lines 21-50: unique indexes, query indexes, and relationship behavior.
- `BudgetBounder.API/BudgetBounder.Api/Migrations/`: version-controlled schema history.
- `Controllers/`: REST endpoints for each feature.

### Requirement 5: at least three plugins/native capabilities

Status: **Met with three clear capabilities, plus secure storage and haptics.**

1. Camera/receipt capture: `app/modal.tsx`, lines 19-25.
2. Location/reverse geocoding: `app/modal.tsx`, lines 27-35.
3. Push/local notifications: `src/reminders/notificationService.ts`, lines 6-30.

Configuration and permission text:

- `BudgetBounderMobile/app.json`, lines 43-57.
- `BudgetBounderMobile/package.json`, lines 27-30.

Bonus native integrations:

- Secure token storage: `src/auth/AuthProvider.tsx`, lines 25-36 and 52-54.
- Haptic tab feedback: `components/haptic-tab.tsx`, lines 1-20.

### Requirement 6: proper design and a UI library such as Paper

Status: **Met.**

Point to:

- `app/_layout.tsx`, lines 6 and 17-22: React Native Paper's dark theme provider.
- `src/theme/tokens.ts`, lines 3-33: centralized palette, typography, spacing, radius, and motion values.
- `src/components/BbUi.tsx`, lines 17-93: shared animated screen and accessible reduced-motion behavior.
- `src/components/BbUi.tsx`, lines 98-120: reusable labels, cards, buttons, progress, and state panels.
- `src/components/BbUi.tsx`, lines 123-148: consistent styling and softened Y2K visual language.

Say:

> Paper provides the application-level design system integration. Our own shared components and tokens build a consistent branded layer on top, so colors and interaction patterns are not copied independently into every screen.

### Requirement 7: narrated Balsamiq/Figma screen video by July 1

Status: **Cannot be proven from the repository. Prepare this separately.**

Before presenting, confirm that the spreadsheet contains:

- Project name and student information.
- Link to the narrated design/screens video.
- The required screen-design link if separate.

Do not claim the code satisfies this item. Show the spreadsheet/video link if asked.

### Requirement 8: real device and hosted API

Status: **Code/configuration supports both. The hosted API was reachable on August 4, 2026.**

Point to:

- `.env.example`, line 1: `https://budgetbounder.somee.com/api`.
- `src/services/apiUrl.ts`, lines 1-14: hosted URL, Expo LAN host, iOS, Android emulator, and fallback behavior.
- `src/services/api.ts`, lines 7-15: resolved API base URL.
- `src/services/apiUrl.test.ts`, lines 3-18: physical iPhone and Android URL tests.

The protected endpoint `https://budgetbounder.somee.com/api/dashboard/me` currently returns HTTP 401 without a token. That is positive evidence: the hosted server is reachable and correctly protects the endpoint.

For the live presentation, run the app on the phone with Expo Go and keep the hosted URL configured. Take screenshots/video as a backup in case classroom Wi-Fi fails.

### Requirement 9: Git link containing client and server code

Status: **Repository structure is correct; submission of the link is administrative.**

Show the repository root and these two folders:

- `BudgetBounderMobile/` - React Native client.
- `BudgetBounder.API/BudgetBounder.Api/` - ASP.NET Core server.

Before the deadline, make sure the submitted remote branch contains current commits and that secrets are not committed. The assignment says the Git link must be in the spreadsheet by 08:00 on August 5, 2026.

## How this targets the higher-grade criteria

### Project complexity and workload

Evidence:

- Full authentication and role-based authorization.
- Twelve screens and seven database tables.
- Transactions, budgets, saving goals, missions, XP, levels, streaks, reminders, and admin functionality.
- End-to-end camera and merchant-location persistence.
- Aggregated dashboard and monthly financial calculations.

Best files: `DashboardController.cs`, `FinancialSummaryService.cs`, `TransactionsController.cs`, `MissionsController.cs`, and `AdminController.cs`.

### Code quality, standards, and efficiency

Evidence:

- Dependency injection in `Program.cs`, lines 27-32.
- Business calculation extracted to `FinancialSummaryService.cs`, lines 15-49.
- Reusable mobile API service in `src/services/api.ts`, lines 7-25.
- Central theme instead of repeated magic colors in `src/theme/tokens.ts`, lines 3-33.
- Shared UI components in `src/components/BbUi.tsx`, lines 98-120.
- Efficient filtered queries in `DashboardController.cs`, lines 27-43, and database indexes in `BudgetBounderDbContext.cs`, lines 25-44.

### Completeness, edge cases, validation, and exception handling

Evidence:

- Client validation: `src/validation/financeForms.ts`, lines 1-13.
- Server validation: `TransactionsController.cs`, lines 36-42; `BudgetsController.cs`, lines 33-34; `SavingGoalController.cs`, lines 35-37 and 59-65.
- Authorization/ownership checks: `TransactionsController.cs`, lines 49-67.
- Loading and `try/catch/finally`: `app/modal.tsx`, lines 37-48.
- Permission-denial fallback: `app/modal.tsx`, lines 20-21 and 28-29.
- Notification listener cleanup: `app/_layout.tsx`, lines 32-36.
- Reduced-motion accessibility: `src/components/BbUi.tsx`, lines 22-73.

### Technology, sensors, and independently learned features

Evidence:

- Camera, location, reverse geocoding, notifications, secure storage, haptics, and deep links.
- Smart reminder rules based on live finance/goal/mission data.
- Gamification linked to real server-side actions.
- Accessible animated UI using the React Native Animated API.
- JWT and role-based admin policy.

### User interface quality

Evidence:

- Paper provider: `app/_layout.tsx`, lines 17-22.
- Central theme: `src/theme/tokens.ts`, lines 3-33.
- Reusable UI: `src/components/BbUi.tsx`, lines 98-148.
- Dark-mode contrast, softened cards, animated floating boxes, readable state panels, touch targets, and reduced-motion support.

## Testing section

Say:

> The project contains automated tests for business rules that are easy to break: form validation, reminder scheduling, API URL behavior on real devices/emulators, and theme/motion contracts.

Point to:

- `src/validation/financeForms.test.ts`, lines 3-14.
- `src/reminders/reminderRules.test.ts`, lines 14-55.
- `src/services/apiUrl.test.ts`, lines 3-18.
- `src/theme/tokens.test.ts`, lines 3-39.

Commands to know:

```powershell
cd BudgetBounderMobile
npm test
npx tsc --noEmit
npm run lint
```

Do not say that tests prove the complete application works. Say they protect important deterministic rules, while the physical-device demonstration verifies the native integrations.

## Fast answers to likely code questions

**What causes a React screen to update?**

State changes through `useState`, or fetched data is stored in state. React re-renders the component and displays the latest values.

**What is `useEffect` doing?**

It performs side effects after rendering: loading data, subscribing to notification events, or starting animation. Its cleanup prevents leaked listeners and animations.

**Why use `async/await`?**

API, SecureStore, camera, location, and notification operations are asynchronous. Await keeps the sequence readable and allows errors to be handled with `try/catch/finally`.

**What is dependency injection in the API?**

ASP.NET Core creates services such as the database context and current-user service, then supplies them to controllers. This reduces coupling and improves testing/maintenance.

**What is Entity Framework Core?**

It maps C# models and LINQ queries to SQL Server tables and queries. Migrations version changes to the database schema.

**What is JWT?**

After login, the server signs a token containing identity claims. The app sends it with each request. ASP.NET validates its issuer, audience, lifetime, and signature before protected controllers execute.

**How do you stop one user reading another user's data?**

The API gets the user ID from the validated JWT and filters queries by that ID. Ownership checks return `Forbid` when another user's resource is requested.

**Why have validation on both sides?**

Client validation gives immediate feedback. Server validation protects the database because a malicious or outdated client can bypass the mobile checks.

**How does the animation respect accessibility?**

`BbUi.tsx` asks `AccessibilityInfo` whether reduced motion is enabled. When enabled, it sets the final static values and does not start the looping drift animation.

## Final 20-second closing

Say:

> BudgetBounder meets the baseline requirements and goes beyond them through secure authentication, seven database entities, twelve screens, three required native capabilities, smart data-driven reminders, gamification, validation, tests, hosted deployment, and a consistent accessible design system. The main engineering idea is that mobile interactions, API authorization, business rules, and database persistence work together as one complete product.

## Night-before checklist

- Confirm both partners can explain authentication, transaction saving, and one native plugin.
- Confirm the phone is signed in and the main screens contain useful demo data.
- Test camera, location, and notification permissions on the actual phone.
- Open `https://budgetbounder.somee.com/api/dashboard/me`; expect 401 without a token, not a connection error.
- Confirm the SQL script/migrations have been applied to the hosted database.
- Push the latest client and server code to Git.
- Confirm the Git link and narrated Balsamiq/Figma video link are in the assignment spreadsheet.
- Bring a charger and prepare a screen recording/screenshots in case the network fails.
- Do not expose the JWT signing key, database password, or real access token during the presentation.
