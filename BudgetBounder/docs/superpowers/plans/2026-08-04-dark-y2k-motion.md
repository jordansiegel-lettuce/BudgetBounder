# Dark Y2K Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a readable dark Y2K BudgetBounder theme with soft bevels, floating background boxes, and accessible entrance motion.

**Architecture:** Centralize visual constants in the existing theme token module. Add motion once at the shared `Screen` boundary and keep decorative layers non-interactive, allowing every screen to inherit the behavior without changing its data flow.

**Tech Stack:** React Native, Expo Router, React Native Animated, Jest, TypeScript, ESLint

## Global Constraints

- Use React Native's built-in Animated API; add no runtime animation dependency.
- Respect the operating system reduced-motion preference.
- Keep decorative elements behind content and set `pointerEvents="none"`.
- Use off-white for page titles; reserve yellow for accents and compact labels.
- Preserve all current application behavior and API interactions.

---

### Task 1: Dark theme tokens

**Files:**
- Modify: `BudgetBounderMobile/src/theme/tokens.test.ts`
- Modify: `BudgetBounderMobile/src/theme/tokens.ts`

**Interfaces:**
- Consumes: existing `bb` token object
- Produces: dark `bb.colors`, softened `bb.radius`, and motion constants used by shared UI

- [ ] **Step 1: Write the failing test**

Assert that canvas and surface are dark, title text is off-white, orange/yellow remain accents, and radii are at least 10 pixels for cards.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/theme/tokens.test.ts --runInBand`

Expected: FAIL because the current canvas is `#7A8ABA` and card radius is 6.

- [ ] **Step 3: Write minimal implementation**

Replace light palette values with dark navy values, add a dedicated title color and translucent decorative colors, and increase component radii.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/theme/tokens.test.ts --runInBand`

Expected: PASS.

### Task 2: Shared ambient motion and soft components

**Files:**
- Modify: `BudgetBounderMobile/src/components/BbUi.tsx`

**Interfaces:**
- Consumes: `bb` tokens and `AccessibilityInfo.isReduceMotionEnabled()`
- Produces: animated `Screen`, static reduced-motion fallback, floating background boxes, softened shared cards/buttons/progress bars

- [ ] **Step 1: Add a failing shared-component test or configuration assertion**

Assert exported ambient motion configuration uses small translation values and decorative layers are non-interactive.

- [ ] **Step 2: Run the targeted test and verify expected failure**

Run: `npm test -- --runInBand`

Expected: FAIL because ambient motion configuration does not exist.

- [ ] **Step 3: Implement the shared animation**

Use `Animated.Value`, parallel entrance animation, looping alternating drift, cleanup via `stopAnimation`, and a reduced-motion static path. Add three low-opacity absolute boxes behind the scroll content.

- [ ] **Step 4: Soften shared component styling**

Apply 10–16 pixel radii, dark surfaces, subtle highlights, readable text, and gentler shadows to the chrome shell, cards, labels, buttons, and progress bars.

- [ ] **Step 5: Run the full test suite**

Run: `npm test -- --runInBand`

Expected: all suites pass.

### Task 3: Screen contrast audit

**Files:**
- Modify: `BudgetBounderMobile/app/**/*.tsx` only where hard-coded yellow title or light-surface colors remain

**Interfaces:**
- Consumes: `bb.colors.title`, `bb.colors.text`, `bb.colors.surface`, and existing screen components
- Produces: readable titles and controls on every route

- [ ] **Step 1: Search for hard-coded yellow title and light palette values**

Run: `rg "navGold|gold|#E48600|#ECAB37|#DEDEDE|#FFFFFF" BudgetBounderMobile/app BudgetBounderMobile/src`

- [ ] **Step 2: Replace title-specific yellow with the title token**

Keep yellow only on small labels, active navigation, progress accents, and deliberate utility indicators.

- [ ] **Step 3: Verify statically**

Run: `npx tsc --noEmit && npm run lint`

Expected: both commands exit 0.

### Task 4: Production verification

**Files:**
- Verify only

**Interfaces:**
- Consumes: completed mobile code
- Produces: fresh evidence that tests, types, lint, and bundling succeed

- [ ] **Step 1: Run tests**

Run: `npm test -- --runInBand`

- [ ] **Step 2: Run TypeScript and lint**

Run: `npx tsc --noEmit` and `npm run lint`

- [ ] **Step 3: Export the web build**

Run: `npx expo export --platform web`

- [ ] **Step 4: Check the diff**

Run: `git diff --check`

