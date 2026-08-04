# BudgetBounder Mobile

BudgetBounder is an Expo SDK 54 React Native finance coach backed by the BudgetBounder C# Web API and SQL Server. It combines budgeting, savings goals, transaction tracking, personalized missions, XP progression, receipt capture, merchant location tagging, and smart reminders.

## Course requirement coverage

| Requirement | Evidence |
| --- | --- |
| React Native application | Expo + React Native with Expo Router |
| At least 7 screens | 12 screens: sign in, register, home, activity, add transaction, goals, create goal, contribution, missions, profile, monthly budget, reminder center |
| C# Web API and database | ASP.NET Core controllers, Entity Framework Core, SQL Server, migrations, JWT authentication |
| At least 3 plugins | `expo-notifications`, `expo-image-picker`, and `expo-location`; additionally Secure Store and Haptics |
| UI library | React Native Paper is configured globally and used for accessible native switches |
| Real-device support | Expo development build/Expo Go-compatible local features with configurable API URL |

## Native feature demonstration

1. Open **Profile → Smart Reminders**, enable rules, and tap **Save & Schedule**. Local notifications deep-link to the relevant screen.
2. Open **Activity → Add**, then use **Capture receipt** to attach a compressed receipt photo.
3. In the same form, use **Tag merchant** to capture foreground location and reverse-geocode the address. Saved locations open in the device maps browser.

Permissions are requested only after the user initiates a feature. Receipt and location access are optional; manual transaction entry continues when permission is denied.

## Run locally

```bash
npm install
npx expo start
```

The mobile app resolves the API in this order:

1. `EXPO_PUBLIC_API_URL` when configured (recommended for a hosted API).
2. The Expo development server's LAN host on port `5292` for a physical device.
3. `10.0.2.2:5292` on Android emulator or `localhost:5292` elsewhere.

Production hosted configuration:

```bash
$env:EXPO_PUBLIC_API_URL='https://budgetbounder.somee.com/api'
npx expo start
```

Apply the latest EF Core migrations before testing reminder preferences or receipt/location fields.

## Verification

```bash
npm test
npm run lint
npx tsc --noEmit
npx expo export --platform web
```

From the repository root, verify the API with:

```bash
dotnet test BudgetBounder.API/BudgetBounder.Api.Tests/BudgetBounder.Api.Tests.csproj
dotnet build BudgetBounder.API/BudgetBounder.Api/BudgetBounder.Api.csproj
```

For the course defense, demonstrate registration/login, monthly budget creation, a receipt-and-location transaction, a savings goal contribution, an AI mission, and the Reminder Center.
