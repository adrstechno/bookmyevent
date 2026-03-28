## Plan: Web-to-Expo Mobile Migration Blueprint

Migrate the existing web product into a production-ready Expo + React Native app inside `mobile-app/`, reusing current backend APIs without backend changes. The approach is domain-first (auth, catalog, booking, notifications, profile), with expo-router guarded navigation, centralized axios client, Redux Toolkit state orchestration, secure JWT storage, and mobile-native UX patterns (offline awareness, pull-to-refresh, infinite lists, skeletons, dark mode).

**Steps**
1. Phase 0: Baseline and Contracts
2. Map web personas, routes, and critical user journeys into a mobile route matrix (Public, User, Vendor, Admin-lite).
3. Freeze API contract from existing backend routers/controllers; define mobile DTO types and normalize field naming at service layer only (*blocks step 2 and step 3*).
4. Define scope split: MVP (auth + discovery + booking + notifications + profile/settings) vs deferred (full admin management tooling) to keep mobile delivery achievable without backend changes.

5. Phase 1: Platform Foundation (*depends on 1-4*)
6. Configure root app boot sequence in expo-router: session restore -> auth validation -> route-group redirect.
7. Finalize runtime config (`EXPO_PUBLIC_API_BASE_URL`, environment guards) with strict fail-fast validation in `config/env.ts`.
8. Establish app providers in root layout: Redux provider, theme provider, toast provider, and network status provider.
9. Create domain-aligned folder ownership conventions (app routes thin, screens orchestrate, services IO, store state, hooks behavior).

10. Phase 2: Navigation and Access Control (*depends on 6*)
11. Implement route groups with file-based guards:
12. `app/(auth)` for `login`, `signup`, `forgot-password`, `reset-password`.
13. `app/(tabs)` for authenticated shell with Home, Discover, Bookings, Notifications, Profile.
14. Add role-based entry redirect after login (`user`, `vendor`, `admin`) and protect deep links for authenticated screens.
15. Implement tab architecture using lazy screen loading and detached inactive tabs to reduce memory churn.

16. Phase 3: API and Auth Core (*parallelizable with Phase 2 after step 7*)
17. Build centralized axios client (`services/api/client.ts`) with:
18. request interceptor for Bearer token injection,
19. response interceptor for 401 handling and forced logout,
20. normalized error envelope mapping for UI.
21. Implement token lifecycle with `expo-secure-store` in `services/auth/tokenStorage.ts`:
22. save/access/clear access token,
23. startup restoration,
24. auto-login bootstrap path.
25. Build auth service + store integration for login/signup/logout/verify-session/change-password.
26. Keep backend cookie assumptions optional; mobile relies on Authorization header token from `/User/Login` response.

27. Phase 4: State Architecture with Redux Toolkit (*depends on 17-26*)
28. Configure store with slices:
29. `authSlice` (token, role, auth status),
30. `userSlice` (profile + preferences),
31. `appSlice` (global loading, global error, connectivity),
32. domain slices for `bookings`, `notifications`, `catalog` as needed.
33. Add typed hooks (`useAppDispatch`, `useAppSelector`) and side-effect thunks for API orchestration.
34. Persist minimal critical state only (auth/session metadata), avoid persisting stale list caches.

35. Phase 5: Screen Migration by Domain (*depends on 11-34; run in parallel by domain teams*)
36. Auth Domain
37. Rebuild Login/Signup/Forgot/Reset with `react-hook-form` and schema validation.
38. Add field-level and submit-level validation parity with web behavior.
39. Catalog Domain
40. Service categories, subservices, vendor lists, vendor detail, package display, availability lookup.
41. Introduce list pagination/infinite loading wrappers where backend supports page/limit; fallback to incremental client paging where backend lacks pagination.
42. Booking Domain
43. Create booking flow, booking list/detail, status filters, cancellation, vendor actions where role permits.
44. OTP/review flows integrated with existing `/otp/*` and `/reviews/*` endpoints.
45. Notification Domain
46. Notification list with backend pagination, unread counters, mark-read/archive/delete actions.
47. Profile/Settings Domain
48. User profile and vendor profile setup/update, theme toggle, logout, session diagnostics.

49. Phase 6: Mobile UX and Reliability Enhancements (*parallel with late Phase 5*)
50. Pull-to-refresh on all list/detail surfaces with shared `useRefresh` hook.
51. Infinite scrolling abstraction with cursor/page adapters and retry footer.
52. Skeleton loaders for initial fetch and list placeholders.
53. Offline-aware UI using NetInfo:
54. connection banner,
55. guarded actions when offline,
56. stale-cache read strategy for non-critical read-only screens.
57. Dark mode support finalized via theme tokens and system-mode fallback.
58. Toast notifications standardized for success/error/info.

59. Phase 7: Performance and Maintainability (*depends on implemented screens*)
60. Screen-level lazy imports and route splitting for heavy views.
61. Memoize expensive list items, stable callbacks, `keyExtractor` correctness, avoid anonymous inline renderers in large lists.
62. Image optimization strategy (thumbnail URLs where possible, caching hints, placeholder shimmer).
63. Instrument render and API latency checkpoints for regression detection.

64. Phase 8: QA, Hardening, and Release Readiness (*depends on all prior phases*)
65. Functional regression checklist mapped from web journeys by persona.
66. API contract smoke tests for critical endpoints (auth, booking create, notification fetch, profile).
67. Offline/online transition tests and token-expiry logout behavior.
68. Navigation tests: protected route access, deep link behavior, tab state persistence.
69. Build verification: Expo Go/dev-client, Android/iOS release builds, environment switch validation.
70. Production readiness checklist: crash boundaries, empty/error states, accessibility basics, secure storage checks.

**Relevant files**
- `mobile-app/app/_layout.tsx` — root providers, bootstrap flow, auth gate orchestration.
- `mobile-app/app/index.tsx` — startup redirect logic.
- `mobile-app/app/(auth)/_layout.tsx` — auth stack shell.
- `mobile-app/app/(auth)/login.tsx` — JWT login screen with form validation.
- `mobile-app/app/(auth)/register.tsx` — signup and role-aware onboarding entry.
- `mobile-app/app/(tabs)/_layout.tsx` — bottom tabs, lazy/detach options.
- `mobile-app/app/(tabs)/index.tsx` — post-login home dashboard entry.
- `mobile-app/services/api/client.ts` — axios instance + interceptors.
- `mobile-app/services/api/endpoints.ts` — centralized endpoint constants.
- `mobile-app/services/auth/authService.ts` — auth API operations.
- `mobile-app/services/auth/tokenStorage.ts` — secure token persistence wrapper.
- `mobile-app/store/store.ts` — Redux store setup.
- `mobile-app/store/slices/authSlice.ts` — auth state and async thunks.
- `mobile-app/store/slices/userSlice.ts` — user profile state.
- `mobile-app/store/slices/appSlice.ts` — global loading/errors/connectivity.
- `mobile-app/hooks/useAuth.ts` — auth helpers and state selectors.
- `mobile-app/hooks/useApi.ts` — reusable loading/error request hook.
- `mobile-app/hooks/useRefresh.ts` — pull-to-refresh behavior.
- `mobile-app/hooks/usePagination.ts` — infinite list orchestration.
- `mobile-app/config/env.ts` — environment parsing and validation.
- `mobile-app/utils/errorHandler.ts` — normalized API error mapping for toasts/forms.
- `mobile-app/components/ui/Skeleton.tsx` — shared loading skeletons.
- `mobile-app/Frontend/src/App.jsx` — source route map for screen parity reference.
- `Event_backend/Server.js` — backend route registration reference for API mapping.
- `Event_backend/Router/UserRouter.js` — auth/user endpoints contract.
- `Event_backend/Router/BookingRouter.js` — booking endpoints contract.
- `Event_backend/Router/NotificationRoute.js` — notification pagination/actions contract.
- `Event_backend/Router/VendorRouter.js` — vendor profile/list/shift/package APIs.
- `Event_backend/Router/SubserviceRouter.js` — service-subservice mapping/search APIs.

**Verification**
1. Route protection validation: unauthenticated access to `(tabs)` redirects to login; authenticated user cannot access auth screens except reset flows.
2. Auth lifecycle test: login -> app restart -> auto-login from secure storage -> logout -> token removed.
3. API interceptor test: inject Bearer token on protected endpoints and enforce logout on simulated 401.
4. Form validation tests: login/signup/reset/password change and booking forms reject invalid payloads before request.
5. List behavior checks: pull-to-refresh, pagination/infinite scroll, empty state, error retry.
6. Offline checks: disable network and verify offline banner, disabled mutating actions, cached read-only fallback behavior.
7. Theming checks: system dark/light + manual override reflected across core screens.
8. Performance checks: large vendor/booking list scroll smoothness, no excessive rerenders on tab switch.
9. Build checks: `npm run lint`, `npm run typecheck` (if configured), `npx expo start`, platform test on Android and iOS.

**Decisions**
- Backend remains untouched; all adaptation happens in mobile service and mapping layers.
- Mobile auth uses JWT in Authorization header as primary mechanism; cookie-based web session behavior is not relied upon.
- Admin experience on mobile is scoped to high-value monitoring/approval actions first; full admin CRUD parity is secondary unless explicitly required.
- Endpoint inconsistencies (legacy GET for delete, mixed response shapes) are normalized in client adapters, not by backend edits.
- Use Redux Toolkit for global orchestration and keep route files slim; avoid business logic in route components.

**Further Considerations**
1. Endpoint standardization debt: track inconsistent HTTP semantics and unpaginated endpoints as backend tech debt items for future hardening.
2. UX improvement over web: replace modal-heavy flows with mobile-native sheets and progressive disclosure to reduce cognitive load.
3. Mobile-first optimization: default to optimistic read interactions, defer non-critical data, and progressively hydrate heavy detail views.