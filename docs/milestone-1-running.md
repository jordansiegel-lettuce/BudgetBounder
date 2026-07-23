# Running BudgetBounder Milestone 1

## 1. Configure the API

Set the SQL Server connection string and JWT settings using user-secrets or environment variables. Do not commit real secrets.

To create the first administrator, set:

```powershell
$env:BootstrapAdmin__Email = "admin@budgetbounder.app"
$env:BootstrapAdmin__Password = "replace-with-a-strong-local-secret"
```

Apply the additive migration:

```powershell
cd BudgetBounder\BudgetBounder.API\BudgetBounder.Api
dotnet ef database update
dotnet run
```

The API normally runs at `http://localhost:5292`.

## 2. Run the desktop admin

```powershell
cd BudgetBounder\BudgetBounder.Web\BudgetBounder-web
npm install
npm run dev
```

Open `http://localhost:5173` and sign in with the bootstrap administrator.

## 3. Run the mobile app

```powershell
cd BudgetBounder\BudgetBounderMobile
npm install
npm start
```

The default API URL is:

- iOS simulator/web: `http://localhost:5292/api`
- Android emulator: `http://10.0.2.2:5292/api`

For a physical device, set `EXPO_PUBLIC_API_URL` to the API URL reachable from the device.

## Verification

```powershell
dotnet test BudgetBounder\BudgetBounder.API\BudgetBounder.Api.Tests
cd BudgetBounder\BudgetBounderMobile
npm test
npx tsc --noEmit
npm run lint
cd ..\BudgetBounder.Web\BudgetBounder-web
npm test
npm run build
npm run lint
```
