# Pulse

Pulse is a multi-account social workspace built with React, TanStack Start, Vite, and Nitro. The existing visual design is retained. The production build targets a standard Node.js server.

## Development

Use Node.js 22 or newer and Bun (the repository includes `bun.lock`):

```sh
bun install --frozen-lockfile
Copy-Item .env.example .env
bun run dev
```

The local default uses browser storage so the UI can be explored without a backend. This data is private to that browser and is not suitable for customer accounts.

## Build and run on a Node server

```sh
bun install --frozen-lockfile
bun run build
bun run start
```

The server listens on the port provided by Nitro (`PORT`, default 3000). Run behind HTTPS at a reverse proxy or hosting provider that supports a long-running Node.js process. Set `HOST=0.0.0.0` when the host requires binding on all interfaces. The app's server entry and CSRF protection are in `src/server.ts` and `src/start.ts`.

For a container image, build from this directory with `docker build --build-arg VITE_API_BASE_URL=https://api.example.com -t pulse .` and run it with `docker run --rm -p 3000:3000 pulse`. Omit the build argument when the API will share the app's origin. The production image uses API mode and intentionally cannot fall back to browser-only customer data.

## Connect the future backend

Set these build-time public variables for a production build:

```env
VITE_PERSISTENCE_MODE=api
# Optional. Omit this to use the app's own origin.
VITE_API_BASE_URL=https://api.example.com
```

Production builds default to API mode unless `VITE_PERSISTENCE_MODE=browser` is explicitly set. This is deliberate: a missing API must show an error instead of silently storing different customer workspaces in browser storage. `VITE_API_BASE_URL` is public configuration, never a place for secrets.

The frontend expects the backend to implement `GET` and `PUT` at `/api/v1/workspace`:

- `GET` returns the authenticated user's workspace as JSON with `accounts`, `conversations`, and `scheduledPosts` arrays. Return empty arrays for a new workspace.
- `PUT` accepts that same JSON shape, validates it, and saves it to the workspace belonging to the authenticated session. Return the saved workspace as JSON, or `204 No Content` after a successful save.
- Return `401` for an unauthenticated request, `403` for a forbidden workspace, and an appropriate `4xx` response for invalid input. The frontend includes same-origin cookies (`credentials: include`) and reports failed loads/saves with a retry action.

The backend must derive the workspace owner from its authenticated session; never trust a client-supplied user or workspace ID. Use secure, HTTP-only, SameSite cookies over HTTPS. If the API is cross-origin, configure an exact origin allowlist and credentialed CORS. Protect the API's writes against CSRF, validate request sizes and every field, and apply per-user limits. The included TanStack CSRF middleware protects TanStack server functions; it does not automatically protect a separately hosted API.

The current data contract uses the TypeScript models in `src/lib/social-data.ts`. `Account.connected` currently means enabled for local scheduling, not authenticated with a social network. Implement provider authorization and connection status in the backend before presenting it as a live network connection. Scheduled posts and inbox replies remain local workspace records until platform workers/adapters are implemented.

## Public customer launch requirements

This repository now has a deployable Node server build and an API integration seam, but it does not include the backend or external social integrations. Before onboarding customers, provide:

1. Authentication, tenant isolation, database persistence, migrations, authorization checks, backups, and account deletion/export controls.
2. Platform app registrations, OAuth callbacks, encrypted token storage, and approved scopes.
3. Server-side publishing, messaging, analytics, retries, rate-limit handling, token refresh, webhooks, and delivery/audit status.
4. Privacy policy, terms, data-retention policy, monitoring, incident handling, and production secrets/domain configuration.

No platform secrets belong in the browser or in `VITE_*` variables. Build-time API URL and mode are the only client configuration expected here.
