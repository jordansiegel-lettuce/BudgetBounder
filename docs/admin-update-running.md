# Running the admin/mobile update

Source checkout: C:\Users\jordi_vyuby09\Desktop\BudgetBounder
Branch: codex/admin-missions-analytics

## Database/API

Apply the new additive migrations to the intended API database, then deploy/build the API:

```powershell
cd C:\Users\jordi_vyuby09\Desktop\BudgetBounder\BudgetBounder\BudgetBounder.API\BudgetBounder.Api
dotnet ef database update
dotnet run
```

For managed hosting, docs/admin-update-migrations.sql is an idempotent script from AddAdminMilestoneTwo through AddLevelHistory. It preserves current data. Incomplete legacy AI missions enter Draft; completed missions keep their XP. Use the configured connection string for the intended environment. The script was generated and reviewed, not applied to the hosted database.

## Admin

```powershell
cd C:\Users\jordi_vyuby09\Desktop\BudgetBounder\BudgetBounder\BudgetBounder.Web\BudgetBounder-web
$env:VITE_API_URL='http://localhost:5292/api'
npm run dev
```

Open http://localhost:5173. Sign in with an existing administrator account. Omit the environment override to use the configured hosted API after deploying the backend update.

Missions: Create mission; User ID 0 assigns a general mission to all currently active users. Use Draft + AI filters for pending review. Editing an AI mission returns it to Draft. Progressed/completed missions cannot be rewritten. Approve publishes; reject/withdraw removes availability without deleting history.

Analytics: choose dates (inclusive UTC days), optional user ID and account state, Apply filters, then Export CSV. CSV exports the displayed report. Account statistics describe current access, not online presence. Saved level history and dated contributions begin with this update.

## Expo Go, without an Expo login

```powershell
cd C:\Users\jordi_vyuby09\Desktop\BudgetBounder\BudgetBounder\BudgetBounderMobile
npm start
```

This runs expo start --go --offline (LAN is implicit). Scan the terminal QR on a phone connected to the same Wi-Fi. Expo CLI offline mode avoids Expo login/tunnel prompts; the app can still access its configured backend over the internet. BudgetBounder's own email/password login is still required for personal financial data. Do not enter Expo credentials into BudgetBounder.

For a local API on a real phone, set EXPO_PUBLIC_API_URL to http://YOUR-PC-LAN-IP:5292/api and run the API bound to that interface. For the hosted API, retain the existing .env after deploying the update. Expo Go must support SDK 57. If another network prevents LAN access, dev:tunnel remains an optional command requiring its own tunnel setup; dev:online uses normal online Expo CLI mode.

Mobile: Profile/Home -> AI financial coach; Goals -> AI savings plan and contribution totals; Profile -> milestone badges. New AI quests display a pending-review notice and appear after approval.
