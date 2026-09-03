---
id: 1b47ca75-41d1-4fef-86fe-eed169d2d47e
title: Budget Dash source
version: 1
---

```
You are helping me build the Unity mini-game for my final software engineering project called **BudgetBounder**.

I want you to actively build the game inside the Unity Editor using the capabilities available to you. Do not only give me tutorials or tell me what buttons to click unless something genuinely requires manual user action.

# Project Context

BudgetBounder is a mobile financial management app focused on:

* tracking expenses and income
* savings goals
* personalized financial tasks
* XP and levels
* achievements and badges
* AI-generated financial recommendations
* gamification that motivates users to improve financial habits

The main application is being developed separately in **React Native**.

The Unity game is a **mini-game inside the BudgetBounder app**.

It will eventually be exported as **Unity WebGL** and embedded inside the React Native app using a **WebView**.

The game should therefore be:

* lightweight
* mobile-friendly
* fast to load
* suitable for short play sessions
* WebGL-compatible
* visually polished
* easy to understand
* connected conceptually to saving money and avoiding unnecessary spending

# Game Name

Use the working title:

**Budget Dash**

# Core Game Concept

Create a polished 2D side-scrolling platform game where the player is trying to reach a savings goal.

The player moves through a level collecting financially positive items while avoiding unnecessary expenses and financial traps.

The gameplay should communicate the idea:

**good financial decisions = progress and rewards**

while

**bad financial decisions = setbacks**

The game should feel like a real casual mobile game rather than an educational quiz.

Do NOT make the financial theme overly serious or boring.

The experience should be fun first, with the financial concepts represented through the gameplay.

# Player

Create a 2D player character.

The player must be able to:

* move left
* move right
* jump
* land correctly on platforms
* collide with obstacles
* collect items

Controls must work using both:

Desktop testing:

* A / Left Arrow = move left
* D / Right Arrow = move right
* Space = jump

Mobile:

* left touch button
* right touch button
* jump touch button

Movement should feel responsive and satisfying.

Avoid overly floaty physics.

# Player Lives

The player starts with:

**3 lives**

Display the lives clearly in the HUD.

If the player loses all lives, show the Game Over state.

# Positive Collectibles

Create the following collectible types.

## Coin

Represents money saved.

Effect:

* +10 score
* satisfying pickup animation
* small floating +10 visual
* sound hook prepared for later

## Savings Star

Represents reaching a financial milestone.

Effect:

* +50 score
* visually more valuable than normal coins
* uncommon compared with coins

## Budget Shield

Represents having a financial safety buffer.

Effect:

* protects the player from the next harmful obstacle
* disappears after absorbing one hit
* show a visible shield indicator in the HUD

# Negative Financial Obstacles

Create several types.

## Impulse Purchase

Examples visually could include:

* shopping bag
* unnecessary gadget
* takeaway drink
* expensive purchase

Effect:

* subtract 20 score

## Subscription Trap

Represents forgotten recurring subscriptions.

Effect:

* temporarily slows player movement

## Debt Obstacle

Represents debt or financial mistakes.

Effect:

* remove one life

If Budget Shield is active, the shield should absorb the damage instead.

# Level

Create one complete prototype level first.

The level should contain:

* ground
* platforms
* gaps
* collectible paths
* positive and negative items
* increasing challenge
* a clear finish point

The player should be able to complete the entire level.

Target playtime:

approximately **60–90 seconds** for the first level.

Do not make the level extremely difficult.

# Savings Goal

The level should have a visible savings target.

For example:

Savings Goal: 500

The HUD should visually show progress toward this target.

Use a progress bar or similar clear indicator.

Collecting positive items should visibly increase progress.

# HUD

During gameplay display:

* Score
* Savings progress
* Lives
* Coins collected
* Active Budget Shield if applicable
* Level timer
* Pause button

Keep the interface clean and mobile-friendly.

Do not clutter the screen.

# Game Flow

Implement this flow:

1. Main Menu
2. Start Game
3. Short instruction overlay
4. Gameplay
5. Pause
6. Level Complete OR Game Over
7. Results Screen
8. Restart / Play Again

# Scenes

Create:

Assets/Scenes/MainMenu.unity

Assets/Scenes/GameLevel.unity

Assets/Scenes/Results.unity

Make sure they are correctly configured for builds.

# Results Screen

Show:

* Final Score
* XP Earned
* Coins Collected
* Savings Stars Collected
* Financial mistakes / unnecessary expenses hit
* Remaining Lives
* Completion Time
* Whether the savings goal was achieved
* 1–3 star performance rating

# XP System

Use this initial calculation:

Base XP = Final Score / 10

Round to a whole number.

Add bonuses for:

* completing the level
* completing the level with all 3 lives
* collecting all Savings Stars
* reaching the savings goal

Keep the values exposed so they can be adjusted later.

# Visual Direction

The game should visually match a modern gamified finance application.

Style:

* polished 2D
* modern mobile game
* slightly playful
* soft pixel-art influence is acceptable
* clean and attractive UI
* designed primarily for young adults

Use:

* dark navy / dark purple backgrounds
* rich purple accent tones
* green for savings / success
* gold for rewards / money
* orange or red for financial danger

Avoid making the UI look like:

* a children's educational game
* a corporate banking dashboard
* a generic Unity tutorial
* an unfinished student prototype

I want something visually enticing.

Use rounded UI panels where appropriate.

Add small animations such as:

* collectible bounce
* coin pickup
* floating score numbers
* button feedback
* progress bar animation
* level completion feedback

You may use temporary/generated placeholder assets during the prototype.

Design the code and prefabs so assets can easily be replaced later.

# Mobile Layout

Target primarily:

**Landscape mobile**

Make all UI responsive.

Configure Canvas Scaler correctly.

Make buttons touch-friendly.

Account for different screen aspect ratios and mobile safe areas.

The game will eventually run inside a mobile WebView.

# Project Organization

Keep the Unity project VERY organized because I need to be able to understand and explain it during my final project presentation.

Use this structure:

Assets/
Art/
Characters/
Environment/
Collectibles/
UI/
Audio/
Music/
SFX/
Animations/
Materials/
Prefabs/
Player/
Collectibles/
Obstacles/
Environment/
UI/
Scenes/
Scripts/
Player/
Gameplay/
Managers/
UI/
Integration/
ScriptableObjects/

Do not dump everything into one folder.

# Code Requirements

Use clean C#.

I need to be able to explain the code later.

Therefore:

* use clear class names
* use clear variable names
* separate responsibilities
* avoid enormous scripts
* add useful comments
* expose configurable gameplay values in the Inspector
* avoid unnecessary complexity
* avoid advanced design patterns unless they provide real value
* do not use unnecessary third-party libraries

Prefer straightforward Unity architecture.

# Suggested Scripts

Create appropriate scripts such as:

PlayerController
PlayerHealth
PlayerInputController

GameManager
ScoreManager
LevelManager

Collectible
CoinCollectible
SavingsStarCollectible
BudgetShieldCollectible

Obstacle
ImpulsePurchaseObstacle
SubscriptionTrapObstacle
DebtObstacle

UIManager
HUDController
PauseMenu

ResultsManager
GameResultData

WebGLBridge

You may reorganize these if there is a cleaner architecture, but keep it understandable.

# Prefabs

Create reusable prefabs wherever appropriate.

For example:

Player

Coin

Savings Star

Budget Shield

Impulse Purchase

Subscription Trap

Debt Obstacle

Platforms

Level Finish Trigger

Do not duplicate objects manually when a prefab is appropriate.

# WebGL Integration

This is extremely important.

The finished game will send the result back to the BudgetBounder application.

Create a clean integration layer called something like:

WebGLBridge

The game result should be represented as structured data containing at least:

score
xpEarned
coinsCollected
savingsStarsCollected
unnecessaryExpensesHit
remainingLives
completionTime
savingsGoalReached
levelCompleted

Create a serializable result object.

Generate JSON from it.

During Editor development:

log the JSON clearly to the Unity Console.

For WebGL:

prepare the architecture so it can later communicate with the page hosting the game, such as through a JavaScript bridge / parent window postMessage.

Do not require a working BudgetBounder backend yet.

The Unity game must still work completely by itself during development.

# Performance

Since this will run as WebGL inside a mobile app:

avoid unnecessary performance-heavy systems.

Be careful with:

* large textures
* excessive particle systems
* expensive shaders
* unnecessary physics
* excessive instantiated objects
* large audio files
* unnecessary Update methods

Use lightweight solutions.

# First Development Goal

I want you to build a COMPLETE PLAYABLE PROTOTYPE before spending large amounts of time polishing graphics.

The first milestone must include:

1. Proper project folder structure
2. MainMenu scene
3. GameLevel scene
4. Results scene
5. Player controller
6. Platforms and level geometry
7. Camera following player
8. Mobile and keyboard controls
9. Coins
10. Savings Stars
11. Budget Shield
12. Impulse Purchase obstacle
13. Subscription Trap
14. Debt obstacle
15. Score system
16. Lives system
17. Savings progress system
18. Timer
19. HUD
20. Pause
21. Level finish
22. Game Over
23. Results screen
24. XP calculation
25. Result JSON generation
26. WebGL bridge preparation
27. Restart / replay functionality

The prototype must be playable from:

Main Menu → Gameplay → Finish → Results → Replay

# How I Want You to Work

You are not acting only as a tutor.

You are acting as a Unity development agent.

When you have the ability to create or modify something directly inside the project, DO IT.

Do not constantly ask me to create basic GameObjects, folders, components, scripts or scenes myself if you can create them.

Work incrementally and keep the project in a playable state.

Before moving on from a major system:

* check references
* check components
* check obvious Unity errors
* check that scripts compile
* make sure required GameObjects exist

If something cannot be done automatically and genuinely requires me to do something manually, tell me exactly what action is required.

# Important

Do NOT attempt to build all final art before gameplay works.

Priority:

1. Working gameplay
2. Complete game loop
3. Mobile compatibility
4. WebGL compatibility
5. Clean architecture
6. Visual polish
7. Final assets and animation

Start now by inspecting the current Unity project and building the first playable version of **Budget Dash**.

Do not stop after creating a plan.

Begin implementing it.
```
