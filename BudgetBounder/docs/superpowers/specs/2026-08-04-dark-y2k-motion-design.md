# Dark Y2K Motion Design

## Goal

Turn the existing Nintendo.com-2001-inspired BudgetBounder mobile interface into a readable dark-mode variant with softer geometry and lightweight ambient motion.

## Visual system

- Use a deep navy-black canvas and blue-black surfaces while preserving chrome-blue bevels.
- Render page titles in high-contrast off-white. Yellow is reserved for accents, active navigation, and compact labels.
- Keep orange as the primary action color with dark, high-contrast button text.
- Increase corner radii to 10–16 pixels and soften hard bevels with translucent highlights and low-elevation shadows.
- Preserve the retro console identity; do not introduce Nintendo logos, characters, or other protected artwork.

## Motion

- Add decorative floating boxes behind screen content. They must ignore pointer events, remain low contrast, and drift with small translation/rotation values.
- Add a short fade-and-rise entrance to screen content.
- Respect the operating system's reduced-motion preference by showing the final static state without continuous animation.
- Use React Native's built-in Animated API to avoid a new runtime dependency.

## Architecture

Theme values remain centralized in `src/theme/tokens.ts`. Shared presentation and motion live in `src/components/BbUi.tsx`, allowing all screens using `Screen`, `Card`, `PixelLabel`, `PrimaryButton`, and `Progress` to inherit the new treatment. Screen-specific hard-coded title and surface colors are audited and replaced where necessary.

## Validation

- Theme tests assert dark canvas/surface colors, readable title color, accent colors, and softened radii.
- Motion helpers are covered through their exported configuration and reduced-motion behavior where practical.
- Run Jest, TypeScript, ESLint, and an Expo web export.

