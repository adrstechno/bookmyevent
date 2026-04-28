# Project Guidelines

## Scope
- This repository is a multi-app workspace: `Event_backend/`, `Frontend/`, and `mobile-app/`.
- Keep changes focused on the owning app unless the task explicitly spans an integration boundary.
- Prefer small, local edits over cross-cutting refactors.

## Code Style
- Backend code uses Node.js ES modules and Express. Follow the existing `Controllers/`, `Models/`, `Router/`, `Services/`, and `Utils/` layout.
- Frontend code uses React with Vite, Tailwind, MUI, and ESLint. Follow the current component and hook patterns already in `Frontend/src/`.
- Mobile code uses Expo Router, React Native, and TypeScript. Keep route and screen changes aligned with the file-based routing structure in `mobile-app/app/`.
- Match the existing naming, formatting, and module boundaries in each area instead of introducing new conventions.

## Architecture
- Backend entrypoint: `Event_backend/Server.js`.
- Frontend app: `Frontend/`.
- Mobile app: `mobile-app/`.
- Backend code is organized by responsibility: controllers handle request flow, models handle persistence, routers define endpoints, services wrap external integrations, and utils hold shared helpers.
- Use the app READMEs for setup details and user-facing documentation instead of duplicating those instructions here.

## Build and Test
- Backend: `cd Event_backend && npm install && npm start`
- Backend dev watch: `cd Event_backend && npm run start2`
- Backend tests: `cd Event_backend && npm test` (currently a placeholder script)
- Frontend dev: `cd Frontend && npm install && npm run dev`
- Frontend build: `cd Frontend && npm run build`
- Frontend lint: `cd Frontend && npm run lint`
- Frontend preview: `cd Frontend && npm run preview`
- Mobile start: `cd mobile-app && npm install && npm start`
- Mobile platform runs: `npm run android`, `npm run ios`, `npm run web`
- Mobile lint: `cd mobile-app && npm run lint`
- Mobile reset helper: `cd mobile-app && npm run reset-project`
- Prefer the smallest command that validates the change you made.

## Conventions
- Keep backend changes inside the existing feature folders unless a task requires a new shared abstraction.
- Avoid renaming existing files or directories unless the change explicitly needs it; several files already have legacy naming.
- Link to existing documentation rather than copying it. The main app docs are [Frontend/README.md](../Frontend/README.md) and [mobile-app/README.md](../mobile-app/README.md).
- Do not add duplicate workspace instructions in subfolders unless the repo grows enough to justify nested overrides.
- Treat framework and linter defaults as the source of truth when they already enforce a rule.
