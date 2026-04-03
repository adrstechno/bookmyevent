---
description: "Use when editing Event_backend Express controllers, routers, services, models, migrations, or utility code. Covers Node.js ES module patterns, backend boundaries, and server setup conventions."
applyTo: "Event_backend/**/*.js"
---
# Event Backend Guidelines

- Keep backend changes inside the existing feature folders unless a task explicitly needs a shared abstraction.
- Follow the existing Express layout: controllers handle request flow, models handle persistence, routers define endpoints, services wrap external integrations, and utils hold shared helpers.
- Preserve the ES module style already used throughout the backend.
- Treat `Event_backend/Server.js` as the main entrypoint and keep environment-loading or bootstrapping changes aligned with its current order of operations.
- Prefer small edits that fit the current naming and file organization instead of introducing new patterns.
- When changing API behavior, update the relevant router/controller pair together so the request path stays coherent.
- Use the backend scripts from `Event_backend/package.json` for validation when needed.
