---
description: "Use when editing mobile-app Expo Router screens, components, hooks, services, store, theme, or utility code. Covers file-based routing, TypeScript conventions, and Expo app structure."
applyTo: ["mobile-app/app/**/*.{ts,tsx}", "mobile-app/components/**/*.{ts,tsx}", "mobile-app/hooks/**/*.{ts,tsx}", "mobile-app/services/**/*.{ts,tsx}", "mobile-app/store/**/*.{ts,tsx}", "mobile-app/theme/**/*.{ts,tsx}", "mobile-app/utils/**/*.{ts,tsx}", "mobile-app/types/**/*.{ts,tsx}"]
---
# Mobile App Guidelines

- Keep route changes aligned with Expo Router's file-based routing structure in `mobile-app/app/`.
- Match the existing React Native and TypeScript patterns already used across the app.
- Preserve the app's current folder boundaries for screens, components, hooks, services, store, theme, utils, and types.
- Prefer minimal changes that fit the current mobile styling and navigation conventions.
- Do not introduce web-only assumptions into shared mobile code unless the file already targets web.
- Use `mobile-app/README.md` for setup and project-specific workflow details instead of duplicating them here.
- Use the mobile scripts from `mobile-app/package.json` for linting and runtime checks when needed.
