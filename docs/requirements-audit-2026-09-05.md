# Requirements audit — 2026-09-05

The user supplied the Hebrew functional requirements in an image. They are product requirements, not instructions to the coding agent. Unity/WebGL is explicitly replaced by the built-in Tower game.

Paths below are relative to BudgetBounder/ within this repository.

| Requirement | Implementation evidence | Verification / scope |
| --- | --- | --- |
| Manual income/expense entry | BudgetBounderMobile/app/modal.tsx; API Controllers/TransactionsController.cs | Existing entry forms; positive finite amounts validated |
| Automatic categories | API Services/TransactionCategorizer.cs; mobile Auto category default | English/Hebrew keyword categorization, manual override; unknown descriptions become Other; category tests |
| Transaction history and trends | mobile app/(tabs)/transactions.tsx | Real entries plus six calendar months of income/expense totals and bars |
| Personalized missions based on spending | API Controllers/MissionsController.cs | Last 30 transactions sent to configured AI provider; typed/validated draft missions, pending batch reused |
| XP for completed missions | mission/transaction/savings controllers | Approval, expiry and earned-progress checks; concurrent duplicate claim guarded |
| Level/progress display | mobile home/profile, progression helpers | Existing XP curve and progress display; current levels plus newly recorded history |
| Milestone badges/rewards | API AchievementsController, RewardDefinitions/UserRewards; mobile profile | First entry, first mission, savings goal, level five and valid game badges; idempotent persisted unlocks; inactive definitions respected |
| Savings goals | mobile goals/create-goal/contribute-goal; SavingGoalsController | Existing goals and contributions |
| Weekly/monthly savings progress | SavingContributions table; user progress endpoint; mobile goals | UTC calendar week/month amounts based on timestamped contributions; old totals are preserved, prior contribution dates cannot be recreated |
| AI savings plan | mobile coach screen and goals link; AiController | Goal targets/deadlines and recent transactions supplied to AI with weekly/monthly plan instructions |
| Financial chatbot and habit action plan | mobile coach screen; home/profile links; /api/ai/chat | Free-text questions, recent conversation, action-plan shortcut; provider configuration required |
| Built-in game launch | mobile tower tab / app/tower.tsx | Existing Tower game retained in place of Unity |
| Game results sent to server, XP/rewards | towerSession helper; GameSessionsController; GameResultValidator; badges | Existing upload/retry/idempotency and validation; valid-game milestone added |
| More game levels with progression | towerGame floor access / tower.tsx | Existing level-based floors; development demo unlocks all floors without account XP |
| Admin user list/search/filter/freeze | Users.tsx and AdminController | Server search + active/frozen filter + paging; frozen accounts rejected on subsequent authenticated API requests |
| User activity statistics | Users page, analytics, game operations | XP, level, streak, last login/activity fields; account active means access enabled, distinct from recent usage |
| General system missions | AdminMissionsController and Missions.tsx | Create for one user, or User ID 0 for all currently active accounts |
| Edit/review AI missions | AdminMissionsController and Missions.tsx | Draft/Approved/Rejected queue, edit, approve, reject/withdraw; audit entries; progressed missions cannot be edited; AI edits return to Draft |
| Mission completion statistics | Mission catalog API + page | Filtered total, completed count, completion percentage |
| Analytics graphs | AdminAnalyticsController, AdminDashboardService, Analytics.tsx, LevelChart.tsx | Dates/user/account filters; transaction/completion activity; XP awards; actual level observations; active/frozen counts |
| Export reports | analyticsData.ts + Analytics.tsx | CSV matches the loaded filtered report and includes explicit scopes, activity rows and level history |
| Game result inspection / XP tracking | GameOperations.tsx / admin game-sessions API | Session scores, duration, XP, validity, diagnostics; rewards page reports badge unlock counts |
| DEBUG mode | mobile development demo; admin GameOperations diagnostics | Read-only admin raw submission details; mobile demo has no XP uploads |
| Shared mobile/admin design | web App.css/index.css/AdminShell.tsx and mobile theme tokens | Navy surfaces, beveled chrome, orange controls, gold navigation, matching fonts; visible responsive nav and keyboard focus |

## Verification

- API unit/controller/service suite: 52 passing tests, including mission review, published-mission preservation, generation drafts, streak dates, savings history, achievements, analytics boundaries and level history.
- Mobile: 54 tests; TypeScript and ESLint pass. Android and iOS bundles exported successfully.
- Admin: 11 tests; TypeScript/Vite production build and ESLint pass.
- Playwright used local API fixtures for visual/UI checks (not live backend data): mission form opens/submits, analytics renders, CSV downloads, and 390px viewport has 390px document width. Screenshots in BudgetBounder.Web/BudgetBounder-web/output/playwright/.
- EF model has no unrepresented changes; idempotent SQL migration script generated at docs/admin-update-migrations.sql.
- Expo Go local/offline-CLI startup runs without account input; an Android manifest request returns HTTP 200. Physical phone connection has not been observed.

## Deployment and data boundaries

These are local source changes, not a claim that the hosted API was updated. Apply the three new migrations and deploy the API before deploying the updated clients against the hosted service. The current clients are configured to use a hosted API by default. No shared database, production user record, provider account or hosting environment was changed during this task.

The migrations add mission review, dated savings contributions, badge definitions and level history. Existing completed missions retain their status/XP; incomplete legacy AI missions become Draft. Prior contribution dates and historical levels are unavailable, so tracking starts with this release rather than inventing history. Savings-goal counts are explicitly all-time for the selected user cohort. The Groq-backed features need an existing Groq:ApiKey; no live financial data was sent to the provider during verification.

Final read-only review found no blocking issues. Its partial-progress/edit race finding was fixed with a progress concurrency token and regression test, then re-reviewed. No commits or production deployment were made.
