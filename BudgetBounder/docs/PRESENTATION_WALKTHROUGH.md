# BudgetBounder: Short Presentation Walkthrough

## 1. Opening and architecture

Say:

> BudgetBounder is a React Native personal-finance app built with Expo. Users can register, log transactions, attach receipts, tag locations, create budgets and saving goals, complete missions, earn XP, and schedule smart reminders. The client calls an ASP.NET Core Web API hosted on Somee. The API uses Entity Framework Core and SQL Server.

Show this flow:

```text
React Native screen
    -> Axios API service adds the JWT
    -> ASP.NET Core controller validates the user and request
    -> Entity Framework reads or writes SQL Server
    -> JSON response updates the screen
```

## 2. Directory: what activates what

```text
BudgetBounderMobile/
├── app/                         Expo Router screens
│   ├── _layout.tsx              Starts providers and protects routes
│   ├── (tabs)/_layout.tsx       Activates the five bottom tabs
│   ├── (tabs)/index.tsx         Home/dashboard
│   ├── (tabs)/transactions.tsx  Activity and saved receipts
│   ├── (tabs)/goals.tsx         Saving goals
│   ├── (tabs)/missions.tsx      Missions and completed rewards
│   └── modal.tsx                Add transaction + native tools
├── src/auth/AuthProvider.tsx    Login state and SecureStore
├── src/services/api.ts          All mobile-to-server requests
├── src/reminders/               Smart notification rules/service
└── src/components/BbUi.tsx      Shared design and animation

BudgetBounder.API/BudgetBounder.Api/
├── Program.cs                   Starts API, JWT, services and SQL Server
├── Controllers/                 HTTP endpoints called by the app
├── Models/                      Database entity definitions
├── Data/BudgetBounderDbContext  Tables, relationships and indexes
├── Services/                    Finance, XP, level and mission logic
└── Migrations/                  Database schema history
```

Activation sequence:

1. Expo starts `app/_layout.tsx`.
2. `AuthProvider` restores the JWT from SecureStore.
3. `RootNavigator` shows Sign In/Register without a token or the main app with a token.
4. Pressing a button navigates to a screen such as `modal.tsx`.
5. The screen calls `api.ts`; its interceptor adds the JWT.
6. ASP.NET routes the URL to a controller.
7. The controller uses `BudgetBounderDbContext` and returns JSON.
8. React state changes and the screen rerenders.

## 3. Four functions to explain

### Function 1: `RootNavigator`

File: `BudgetBounderMobile/app/_layout.tsx`, lines 39-57.

```tsx
<Stack.Protected guard={!token}>
  <Stack.Screen name="sign-in" />
  <Stack.Screen name="register" />
</Stack.Protected>

<Stack.Protected guard={Boolean(token)}>
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="modal" />
</Stack.Protected>
```

Explain:

- `useAuth()` supplies the stored JWT.
- Without a token, only authentication screens activate.
- With a token, Expo Router activates tabs and protected feature screens.
- `app/(tabs)/_layout.tsx`, lines 33-69, defines Home, Activity, Goals, Missions and Profile.

This proves React Native navigation, multiple screens, authentication and organized code.

### Function 2: `save`

File: `BudgetBounderMobile/app/modal.tsx`, lines 52-64.

```tsx
await api.post('/transactions', {
  amount: value,
  title,
  category,
  type,
  receiptImageDataUrl: receipt?.dataUrl,
  latitude: merchant?.latitude,
  longitude: merchant?.longitude,
});
```

Explain:

- React state stores the form values.
- The function rejects an amount that is zero or negative.
- `try/catch/finally` handles success, errors and loading state.
- `api.post` sends the transaction to the C# server.
- Camera: `modal.tsx`, lines 22-30.
- Gallery: `modal.tsx`, lines 32-40.
- Location and reverse geocoding: `modal.tsx`, lines 42-50.
- The Activity tab reloads on focus and shows the saved receipt image.

This proves React state, API communication, validation and three device capabilities.

### Function 3: `ReceiveTransaction`

File: `BudgetBounder.API/BudgetBounder.Api/Controllers/TransactionsController.cs`, lines 34-51.

Explain in order:

1. Read the authenticated user ID from the JWT.
2. Reject invalid amounts, coordinates or oversized receipt images.
3. Find the user and attach their ID to the transaction.
4. Add the transaction through Entity Framework.
5. Award 10 base XP and update the streak.
6. Update the matching income/expense mission.
7. Call `SaveChanges()` to persist everything together.

Point to `AutoCompleteMission`, lines 103-130, for mission progress and reward XP.

This is the best function for explaining the complete client -> API -> database -> XP flow.

### Function 4: `buildReminderPlan`

File: `BudgetBounderMobile/src/reminders/reminderRules.ts`, lines 44-87.

Explain:

- Inputs are user preferences plus budget, spending, goal and mission data.
- It creates only enabled reminders.
- It supports daily logging, budget threshold, weekly goal and mission-expiry reminders.
- Each reminder includes a URL so tapping it opens the correct screen.
- `notificationService.ts`, lines 10-25, converts the plan into device notifications.
- The rules are separated from the device API so they can be unit tested.

This proves notifications, original business logic and testable design.

## 4. Requirement checklist

### 1. Work in pairs

Administrative requirement. Be ready to explain each partner's contribution, but both partners should understand these four functions.

### 2. React Native or React

Met with React Native and Expo.

- `BudgetBounderMobile/package.json`: React Native/Expo packages.
- `BudgetBounderMobile/app/`: React Native screens.

### 3. At least seven screens

Exceeded with 12 screens:

- Five tabs: Home, Activity, Goals, Missions and Profile.
- Sign In, Register, Add Transaction, Smart Reminders, Create Goal, Goal Contribution and Monthly Budget.

Show `app/_layout.tsx`, lines 43-55, and `app/(tabs)/_layout.tsx`, lines 33-69.

### 4. Database through a C# Web API

Exceeded with ASP.NET Core, EF Core, SQL Server and seven tables.

- `Program.cs`, lines 17-35: controllers and SQL Server registration.
- `Program.cs`, lines 45-77: JWT and controller middleware.
- `BudgetBounderDbContext.cs`, lines 13-19: Users, Transactions, SavingGoals, Missions, MonthlyBudgets, AdminAuditLogs and ReminderPreferences.
- `Migrations/`: reproducible database schema.

### 5. At least three plugins/native capabilities

Met:

1. Camera receipt capture: `modal.tsx`, lines 22-30.
2. Gallery image selection: `modal.tsx`, lines 32-40.
3. Location/reverse geocoding: `modal.tsx`, lines 42-50.
4. Notifications: `notificationService.ts`, lines 10-30.

SecureStore and haptic tabs are additional native features.

### 6. Proper UI and a design library

Met:

- React Native Paper provider: `app/_layout.tsx`, lines 14-22.
- Central design tokens: `src/theme/tokens.ts`.
- Reusable cards, buttons, progress bars and state panels: `src/components/BbUi.tsx`, lines 98-120.
- Dark theme, consistent spacing, animation and reduced-motion accessibility.

### 7. Narrated Balsamiq/Figma video

Not a code item. Make sure the spreadsheet contains the project/student details and narrated screen-design video link.

### 8. Real device and hosted API

Met:

- Run the app with Expo Go on the phone.
- `.env.example` points to `https://budgetbounder.somee.com/api`.
- `src/services/api.ts`, lines 7-23, configures the URL and JWT.
- Somee hosts the ASP.NET API and SQL database.

### 9. Git link with client and server

The same repository contains:

- `BudgetBounderMobile/`: client.
- `BudgetBounder.API/BudgetBounder.Api/`: server.

Confirm the public Git link is submitted, current changes are pushed, and no secrets are tracked.

## 5. High-grade points

Say:

> We went beyond the baseline through JWT authentication, 12 screens, seven database tables, camera/gallery/location/notifications, receipt persistence, smart reminders, budgets, saving goals, missions, XP, levels, streaks, validation, tests, hosted deployment and an accessible animated design system.

Strong evidence:

- Complexity: transaction, budget, goal, mission and progression systems work together.
- Code quality: controllers, services, reusable UI, central API client and central theme are separated.
- Edge cases: client and server validation, ownership checks, permission denial, loading and error states.
- Innovation: smart data-driven reminders, gamification, native receipt/location data and animation.
- Tests: 23 API tests and 20 mobile tests currently pass.

## 6. Final presentation order

1. Read the opening paragraph.
2. Show the directory and activation flow.
3. Demonstrate Sign In -> Home -> Add Transaction.
4. Use `save` and `ReceiveTransaction` to explain the full data flow.
5. Show the saved receipt, updated XP and completed mission.
6. Open Goals and Smart Reminders.
7. Finish with the requirement checklist and high-grade sentence.

Final sentence:

> BudgetBounder is a complete mobile product: native React screens, a protected hosted C# API, persistent SQL data, device integrations and business logic all work together.
