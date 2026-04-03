---
description: "Use when editing Frontend React, Vite, Tailwind, MUI, routing, hooks, or UI component code. Covers the frontend file layout and implementation conventions."
applyTo: "Frontend/src/**/*.{js,jsx,ts,tsx}"
---
# Frontend Guidelines

- Follow the existing React and Vite patterns already established in `Frontend/src/`.
- Keep components focused and prefer local state and hooks patterns that match the surrounding code.
- Match the current UI stack: React, Vite, Tailwind, MUI, and the existing icon and animation libraries already in use.
- Avoid introducing new architectural layers unless the feature clearly needs them.
- Preserve existing component boundaries and naming conventions.
- Prefer linking to `Frontend/README.md` for setup or usage details instead of repeating them here.
- Use the frontend scripts from `Frontend/package.json` for build, lint, and preview checks when needed.
