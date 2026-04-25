# Vekstor

Multi-tenant SaaS for Norwegian B2B sales prospecting and CRM. Successor to `leadflow-dev` (legacy Vite + Supabase). Built from scratch with modern Next.js stack.

## Stack
- Next.js 15 (App Router, RSC, server actions, Turbopack)
- TypeScript strict
- Better Auth (better-auth.com) — email/password, magic link, invite flow
- Neon Postgres (serverless)
- Drizzle ORM + drizzle-kit
- shadcn/ui + Tailwind CSS
- Lucide icons, Sonner toasts
- Anthropic SDK (with prompt caching for ICP extraction & email gen)
- Resend (transactional email)

## Commands
- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` — prod build
- `npm run db:generate` — generate Drizzle migrations
- `npm run db:push` — apply schema to Neon (dev convenience)
- `npm run db:studio` — Drizzle Studio
- `vercel --prod` — production deploy

## Architecture
- **Multi-tenancy**: every business resource scoped to `workspace_id`. Every query filters by current workspace.
- **Workspaces**: user owns their personal workspace on signup; can create more; can be invited to others. `workspace_members` table with roles (owner/admin/member).
- **Plans**: trialing/professional/business/enterprise. Plan lives on workspace, not user. Owner pays once, all members get same gating.
- **Auth**: Better Auth handles users + sessions + magic links + password reset. Invite acceptance hooks into signup.
- **Data access**: server components fetch via Drizzle directly. Mutations go through server actions (or route handlers for AI streaming).

## Conventions
- TypeScript strict; no `any` unless documented
- Server components by default; `"use client"` only when truly interactive
- Server actions for mutations (`"use server"`)
- Drizzle for all DB access; raw SQL only inside migration files
- Multi-tenancy enforced via workspace check in every query
- Tailwind only; shadcn components extended (don't replace)
- Lucide for icons, Sonner for toasts
- Norwegian language for user-facing copy
- No comments unless WHY is non-obvious
- No emoji in code or commits unless requested
- Commits: imperative, short ("add invite flow", "fix session refresh")

## Reference (read-only — do NOT modify)
- `/root/projects/leadflow-dev/` — legacy implementation (Vite + Supabase + JS) — source of truth for features
- `/root/projects/leadflow-dev/supabase-schema.sql` — original DB schema (port to Drizzle)
- `/root/projects/leadflow-dev/src/pages/` — pages to port
- `/root/projects/leadflow-dev/src/hooks/` — data layer (rewrite as server actions/RSC)
- `/root/projects/leadflow-dev/src/config/brand.js` — brand colors + typography
- `/root/projects/leadflow-dev/api/` — serverless endpoints (port to route handlers)
