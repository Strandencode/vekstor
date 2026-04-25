# Vekstor — Autonomous Build Brief

You are building a multi-tenant SaaS lead-generation/CRM app called **Vekstor** from scratch, replacing legacy `leadflow-dev`. Run autonomously to completion. **Do not stop to ask for confirmation.** Commit early and often. Push to GitHub after every commit. Deploy to Vercel after each phase milestone.

If you hit an error 3 times trying the same approach, try a different approach. If truly stuck on something, write findings to `BLOCKERS.md` in the repo root and continue with the next task — don't sit idle.

---

## Phase 1 — Foundation (DO NOT SKIP AHEAD)

### 1.1 Bootstrap project
```bash
cd /root/projects/vekstor
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint --turbopack --use-npm --yes
```
(If it complains about non-empty dir, move CLAUDE.md/AGENT-BRIEF.md/.env.local/.claude aside, bootstrap, move them back.)

### 1.2 Install dependencies
```bash
npm install better-auth drizzle-orm @neondatabase/serverless @anthropic-ai/sdk resend zod lucide-react sonner
npm install -D drizzle-kit @types/node tsx
```

### 1.3 shadcn init + components
```bash
npx shadcn@latest init -y -d
npx shadcn@latest add button input card form label dialog dropdown-menu sonner separator sheet tabs badge select textarea table avatar skeleton checkbox switch
```
Use neutral/zinc base color, CSS variables.

### 1.4 Create Neon project
Use the Neon API (NEON_API_KEY in .env.local) to create a new project named `vekstor`:
```bash
curl -s https://console.neon.tech/api/v2/projects \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"project":{"name":"vekstor","pg_version":17,"region_id":"aws-eu-central-1"}}'
```
Extract the `connection_uris[0].connection_uri` from the response and write it as `DATABASE_URL=` in `.env.local`. Verify by querying with psql or a small node script.

### 1.5 Drizzle setup
- `src/db/schema.ts` — port the data model from `/root/projects/leadflow-dev/supabase-schema.sql`. Tables to create:
  - **Better Auth tables** (let `better-auth` CLI generate them): `user`, `session`, `account`, `verification`
  - **Domain tables**:
    - `workspaces` (id, name, ownerId → user.id, plan enum, trialStartedAt, createdAt, updatedAt)
    - `workspaceMembers` (id, workspaceId, userId, role enum: owner/admin/member, joinedAt; unique on (workspaceId, userId))
    - `workspaceInvites` (id, workspaceId, email, name, role, token unique, invitedBy, invitedAt, expiresAt, acceptedAt, acceptedBy)
    - `profiles` (userId PK → user.id, fullName, companyName, phone, defaultWorkspaceId)
    - `icpProfiles` (id, workspaceId unique, companyName, senderName, yourIndustry, whatYouSell, targetIndustries, companySize, minRevenue, targetRegion, problemYouSolve, decisionMakerTitle, decisionMakerDept)
    - `savedLists` (id, workspaceId, createdBy, name, filters jsonb, filterLabels, companies jsonb, totalResults)
    - `pipelineItems` (id, workspaceId, orgNumber, stageId enum: new/contacted/meeting/contract/won/lost, movedAt, name, industry, contactName, email, phone, municipality, notes jsonb; unique on (workspaceId, orgNumber))
    - `contactTracking` (id, workspaceId, orgNumber, emailed bool, emailedAt, called bool, calledAt; unique on (workspaceId, orgNumber))
    - `customers` (id, workspaceId, orgNumber, name, contactName, contactRole, email, phone, industry, municipality, revenue bigint, notes, status default 'won', wonDate, contracts jsonb, notesLog jsonb)
    - `emailTemplates` (id, workspaceId, createdBy, name, subject, body)
    - `usageCounters` (id, workspaceId, monthKey, enrichments int, emailsSent int, phonesViewed int; unique on (workspaceId, monthKey))
- `src/db/index.ts` — Drizzle client using `@neondatabase/serverless` http driver
- `drizzle.config.ts` — point at `./src/db/schema.ts`, dialect `postgresql`, dbCredentials from DATABASE_URL
- Add scripts to package.json: `db:generate`, `db:push`, `db:studio`
- Run `npm run db:push` to apply schema

### 1.6 Better Auth
- `src/lib/auth.ts` — Better Auth config:
  - drizzleAdapter pointed at our db + schema
  - emailAndPassword enabled (requireEmailVerification: false for dev)
  - magicLink plugin (sends via Resend)
  - secret from BETTER_AUTH_SECRET
  - baseURL from BETTER_AUTH_URL
  - sendResetPassword + sendVerificationEmail via Resend
  - hooks: onSignUp → create personal workspace + workspaceMembers (owner) + profile row
- `src/lib/auth-client.ts` — client-side createAuthClient
- `src/app/api/auth/[...all]/route.ts` — Better Auth route handler
- `src/middleware.ts` — protect /(app) routes, redirect unauthed to /sign-in

### 1.7 Resend integration
- `src/lib/email.ts` — Resend client + helpers (sendMagicLink, sendInvite, sendPasswordReset)
- All emails use `EMAIL_FROM` env var (default `onboarding@resend.dev` for dev)

### 1.8 Auth pages (in `src/app/(auth)/` route group, no sidebar layout)
- `/sign-in` — email + password OR magic link toggle
- `/sign-up` — name, email, company name, password → creates user + personal workspace
- `/forgot-password` — request reset link
- `/reset-password` — set new password (token in query)
- `/invite/[token]` — read invite, prompt sign-in or sign-up, accept on auth, redirect to dashboard

### 1.9 App shell (in `src/app/(app)/` route group, with sidebar layout)
- `src/app/(app)/layout.tsx` — sidebar + top user menu, requires auth, loads current workspace into context
- Sidebar links: Dashboard, Søk (Search), ICP, Pipeline, Kunder (Customers), E-post (Email), Lagrede (Saved), Analyse (Analytics), Innstillinger (Settings)
- User menu: profile name/email, switch workspace, sign out
- Workspace context: provides current workspace + member role, hook `useWorkspace()`

### 1.10 Placeholder pages (Phase 1 just renders empty states)
For each route, create a page with a clean header and an "under utvikling" empty state. Real implementations come in Phase 2.
- `(app)/dashboard/page.tsx`
- `(app)/search/page.tsx`
- `(app)/icp/page.tsx`
- `(app)/pipeline/page.tsx`
- `(app)/customers/page.tsx`
- `(app)/email/page.tsx`
- `(app)/saved/page.tsx`
- `(app)/analytics/page.tsx`

### 1.11 Settings page (MUST WORK in Phase 1)
`(app)/settings/page.tsx` with tabs:
- **Profil**: edit fullName, companyName, phone
- **Arbeidsområde**: edit workspace name, see current plan, list members with roles
- **Medlemmer**: invite by email + role, list pending invites, revoke invite, remove member, change member role (owner only)
- **Konto**: sign out, delete account (with confirmation)

All operations via server actions. Use shadcn dialogs for confirmations.

### 1.12 Initial deploy
- `git init` and add proper .gitignore (node_modules, .next, .env.local, .vercel)
- `gh repo create Strandencode/vekstor --public --source=. --remote=origin --push`
- First commit: "feat: bootstrap vekstor with Next.js 15 + Better Auth + Drizzle + Neon"
- `vercel link --yes` (project name: vekstor)
- Add env vars to Vercel: `vercel env add DATABASE_URL production` (and all others from .env.local)
- `vercel deploy --prod`
- Update `BETTER_AUTH_URL` in Vercel env to the deployed URL
- Redeploy

### Phase 1 Acceptance Criteria
Verify each before moving to Phase 2 (write a PHASE-1-CHECKLIST.md as you go):
- [ ] Live URL on Vercel returns 200
- [ ] Sign up with email/password creates user + personal workspace + profile + member row
- [ ] Sign in with email/password works
- [ ] Magic link email sent via Resend, click logs you in
- [ ] Forgot/reset password works end-to-end
- [ ] Invite a teammate (use a 2nd email you own) — they receive email, click link, accept, both see same workspace
- [ ] Settings → Profil edit persists
- [ ] Settings → Arbeidsområde rename persists
- [ ] Settings → Medlemmer can invite, revoke invite, remove member, change role
- [ ] All sidebar links route correctly
- [ ] Sign out clears session, redirects to /sign-in
- [ ] Session persists across browser refresh
- [ ] Drizzle schema matches design (run `npm run db:studio` to verify)
- [ ] Repo at github.com/Strandencode/vekstor with green initial commit

After all checks pass, commit `PHASE-1-COMPLETE.md` summarizing what works and what's deployed.

---

## Phase 2 — Port pages with business logic (after Phase 1 verified)

Port from `/root/projects/leadflow-dev/src/pages/*.jsx`. Rewrite idiomatically in Next.js + TS — do NOT copy code wholesale. Match feature behavior, not implementation.

Order:
1. **DashboardPage** — current month usage stats, quick links, recent pipeline activity
2. **ICPPage** — ICP profile editor (form bound to icpProfiles row), AI extraction from website URL (Phase 3 unlocks this; for now just the form)
3. **SearchPage** — Norwegian business registry (BRREG) search with filters, results table, save selected to a list, add to pipeline. BRREG API: https://data.brreg.no/enhetsregisteret/api/enheter (no auth needed). Reference: `/root/projects/leadflow-dev/src/api/brreg.js`
4. **PipelinePage** — kanban board with 6 stages, drag-and-drop (use `@dnd-kit/core`), notes per item
5. **CustomersPage** — won customers list, detail view, contracts, notes log
6. **EmailPage** — template editor (subject + body), template list, composer modal that fills template and "sends" (just records sent for now)
7. **SavedPage** — saved searches and saved lead lists, restore search filters, delete
8. **AnalyticsPage** — pipeline conversion funnel, win rate, monthly usage trend (recharts or chartjs)

After each page: commit + push. After all pages done: deploy + write PHASE-2-COMPLETE.md.

---

## Phase 3 — AI features

1. **ICP extraction from website URL** — port `/root/projects/leadflow-dev/api/extract-icp.js` to a Next.js route handler in `src/app/api/icp/extract/route.ts`. Use Anthropic SDK with prompt caching (system prompt cached). Stream the response.
2. **Lead enrichment** — port `/root/projects/leadflow-dev/api/scrape-website.js`. Fetch + parse a website, extract relevant signals.
3. **Email draft generation** — given a lead + ICP, generate a personalized cold email. Use prompt caching for the ICP block.
4. **Usage tracking** — increment usageCounters on each AI call. Enforce plan limits.

Commit + push + deploy. Write PHASE-3-COMPLETE.md.

---

## Workflow rules
- Use TodoWrite to track progress within each phase
- Commit after every meaningful unit of work (max 30 min between commits)
- Push to remote after every commit
- Run `npm run build` before any deploy to catch type errors
- Use `vercel --prod` for production deploys
- After deploys, fetch the URL and verify 200 status
- Stuck? Try a different angle. Stuck after 3 angles? Write to BLOCKERS.md, continue.
- Plan-based gating: trialing users get 14 days, professional/business/enterprise have different quotas (port from `/root/projects/leadflow-dev/src/config/plans.js`)

## Brand
Read `/root/projects/leadflow-dev/src/config/brand.js` for color palette and typography. Vekstor uses the same parchment/paper aesthetic — warm off-white backgrounds, ink-dark text, subtle accents. Apply via Tailwind theme + shadcn CSS variables.

## Start now
1. Read this brief end-to-end (DONE if you're reading this)
2. Read CLAUDE.md
3. Skim `/root/projects/leadflow-dev/supabase-schema.sql` and `/root/projects/leadflow-dev/src/App.jsx`
4. Begin Phase 1.1 — bootstrap Next.js
5. Continue without stopping until Phase 3 complete or you hit a hard blocker

**GO.**
