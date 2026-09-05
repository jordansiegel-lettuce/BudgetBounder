# Admin alignment, mission review, analytics and Expo implementation plan

Goal: implement the approved design and audit the supplied functional requirements, using the built-in game.
Architecture: React admin consumes authenticated ASP.NET endpoints; mission publication is enforced in the API. Expo local startup must work without requiring an Expo account.
Spec: user-approved design in this task (2026-09-05).

Constraints: preserve existing uncommitted mobile work; no additional approval gates; no publishing or real user messages. Work on a feature branch in the existing checkout so the current mobile fixes and installed dependencies remain available.

- [x] Mission workflow: add Draft/Approved/Rejected status and migration; generate drafts without destroying approved missions; deny draft/expired/unearned completion and progress; admin create/edit/review with audit records, user selection and source/status filters; mobile pending-review feedback. Verify through controller tests and mobile checks.
- [x] Analytics: server-side date and user filtering, trend charts and filtered CSV export; input validation and explicit metric semantics. Add query and export tests; verify web/API checks.
- [x] Design: align admin typography, navy surfaces, beveled panels, orange/gold controls and navigation with mobile tokens; preserve responsive accessible navigation.
- [x] Requirements: inspect every supplied mobile/admin requirement and document concrete code evidence and any gaps; fix practical gaps within the approved scope.
- [x] Expo: trace installed CLI login calls, verify anonymous LAN startup, provide robust local startup and actionable instructions. Preserve application authentication.
- [x] Integration: run API, admin and mobile tests/builds/lints, inspect UI, review changes and document remaining environment limitations.

Progress ledger: implementation started. No commits or migrations against shared databases without validating the changes first.

Final ledger: mission workflow, analytics, mobile/admin design and requirements additions implemented. Expo default is anonymous local CLI startup. API52/admin11/mobile54 tests pass; admin build/lint, mobile typecheck/lint and Android/iOS bundles pass. EF model matches migrations. Browser fixture checks include mission form, CSV and 390px responsive layout. Review completed; progress/edit race fixed and re-reviewed. Hosted deployment remains outside this local source update; run guide and idempotent SQL supplied.
