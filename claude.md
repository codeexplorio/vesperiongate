# VesperionGate Project Notes

## Architecture

### Middleware
- Middleware logic is in `src/proxy.ts` (not the standard `middleware.ts`)
- Handles authentication checks for `/billing/*` routes
- Public billing routes: `/billing/login`, `/billing/forgot-password`, `/billing/reset-password`

### Authentication
- Uses Better Auth (`better-auth` library)
- Auth API routes: `src/app/api/auth/[...all]/route.ts`
- Server config: `src/lib/better-auth.ts`
- Client config: `src/lib/auth-client.ts`
- Cookie prefix: `vesperion`

### Databases
- Main app database: PostgreSQL (LensCherry)
- Auth database: Separate PostgreSQL database (`vesperiongate_prod`)
