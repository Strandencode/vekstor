# Task: Design parity with legacy leadflow-dev

The user has logged in and verified the new vekstor app works, but the app shell and Dashboard look different from the legacy `leadflow-dev` Vite app they're used to. They want the new app to mirror the legacy structure exactly.

## Step 1 — Read reference files

Before changing anything:
- `/root/projects/leadflow-dev/src/components/Sidebar.jsx` (sidebar layout, sections, user card)
- `/root/projects/leadflow-dev/src/pages/DashboardPage.jsx` (dashboard structure)
- `/root/projects/leadflow-dev/src/config/brand.js` (color palette, typography)
- `/root/projects/leadflow-dev/src/components/Logo.jsx` (logo mark)

## Step 2 — Restructure sidebar (`src/components/app-sidebar.tsx`)

Match the legacy sidebar exactly:

**Top:**
- Logo mark + "vekstor" wordmark (bottom of logo, sans-serif)

**Navigation (with section labels in small caps):**
- "Home" — Dashboard (no section label, top item)
- **LEADS** section:
  - Prospektering (replaces "Søk") — currently `/search`
  - E-postmaler (replaces "E-post") — currently `/email`
  - Lagrede lister (replaces "Lagrede") — currently `/saved`
- **KUNDER** section:
  - Pipeline — currently `/pipeline`
  - Kunder (replaces "Customers") — currently `/customers`
- **INNSIKT** section:
  - ICP-analyse (replaces "ICP") — currently `/icp`
  - Analytics (replaces "Analyse") — currently `/analytics`

**Bottom (above user card):**
- Innstillinger — `/settings`
- Aktivitet (with badge counter showing recent activity count) — link to activity log or pipeline activity

**User card (very bottom):**
- Avatar circle with initials (SS) on dark background
- User full name
- Plan tier in small caps below name (e.g. "PROFESSIONAL")
- Dropdown chevron on right (opens menu: switch workspace, sign out, etc.)

## Step 3 — Rebuild Dashboard (`src/app/(app)/dashboard/page.tsx`)

Match the legacy DashboardPage layout:

**Header:**
- Small caps overline label "OVERSIKT"
- Page title "Dashboard" (large, serif font)
- Subtitle: "Velkommen tilbake, {firstName}." (sans-serif, muted color)
- Top-right action buttons (3 in a row):
  - "Bytt mal" (outline button with refresh/swap icon) — opens workspace switcher
  - "Nytt søk" (outline button with magnifying glass icon) — links to /search
  - "+ Finn Leads" (primary dark/black button) — links to /search

**Stat cards row (4 cards, equal width, with subtle border):**
- TOTALT LEADS (number + small subtitle "X lister") + people icon top-right
- E-POSTER SENDT (number + percentage subtitle) + envelope icon top-right
- SAMTALER (number + percentage subtitle) + phone icon top-right
- KONTAKTRATE (percentage + "X av Y" subtitle) + chart icon top-right — **this card is highlighted dark (black bg, light text)**

All stat card labels are small caps, big number is serif/bold, subtitle is muted.

**Quick links row (3 cards in a row):**
- Prospektering — "Søk i Brønnøysundregistrene" — search icon — links to /search
- Pipeline — "Administrer salgsprosessen" — kanban icon — links to /pipeline
- Analytics — "Oversikt og metrikker" — trending-up icon — links to /analytics

Each card: icon in left column, title + description in right, arrow on far right.

**Two-column row at bottom:**
- **Left (wider, ~2/3):** Leadlister table
  - Section title "Leadlister" with "Se alle" link top-right
  - Columns: LISTE | LEADS | SENDT | RINGT | FREMGANG (small caps headers)
  - Each row: list name, lead count, sent count, called count, progress bar with percentage
  - Pull from saved_lists + contact_tracking data
- **Right (narrower, ~1/3):** Siste aktivitet panel
  - Section title "Siste aktivitet"
  - List of recent actions (e.g. "Ringt 1001 NATT AS", "1d" ago)
  - Green dot indicators per item

## Step 4 — Apply consistent styling to ALL other pages

For each of these pages, add the same header pattern (small caps overline + serif title + subtitle):
- `/search` → overline "LEADS", title "Prospektering", subtitle describes what to do
- `/icp` → overline "INNSIKT", title "ICP-analyse"
- `/pipeline` → overline "KUNDER", title "Pipeline"
- `/customers` → overline "KUNDER", title "Kunder"
- `/email` → overline "LEADS", title "E-postmaler"
- `/saved` → overline "LEADS", title "Lagrede lister"
- `/analytics` → overline "INNSIKT", title "Analytics"
- `/settings` → overline "KONTO", title "Innstillinger"

Use parchment/cream background everywhere (already in spec). Make sure cards/tables have subtle borders, generous padding, serif for h1/h2 headings, sans-serif for body, small caps for category labels.

## Step 5 — Commit, push, deploy

After each major change (sidebar done, dashboard done, other pages updated): commit + push. Vercel auto-deploys via GitHub integration.

When everything is in: `vercel --prod --yes` to force a clean prod deploy. Verify https://vekstor.vercel.app shows the new design.

Write a brief `DESIGN-PARITY-COMPLETE.md` summarizing what changed when done.

Begin now. Use TodoWrite to track progress.
