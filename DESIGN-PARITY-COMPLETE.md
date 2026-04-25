# Design Parity Complete

App shell and all pages now match the legacy leadflow-dev visual structure exactly.

## What changed

### Fonts
- Added **Work Sans** (display/headings) and **Outfit** (body) via `next/font/google`
- `font-display` CSS variable wired to Work Sans, applied to all h1 headings
- `font-body` / `font-sans` wired to Outfit, applied to body

### Brand palette (globals.css)
Full Granskog Noir token set added to `@theme inline` and `:root`:
- `ink` / `ink-soft` / `ink-muted` / `ink-subtle`
- `canvas` / `canvas-warm` / `canvas-soft`
- `sage` / `sage-bright` / `sage-soft`
- `bdr` (border), `ember`, `err`
- shadcn CSS vars updated to match (background → canvas, primary → ink, etc.)

### Sidebar (`src/components/app-sidebar.tsx`)
- Grouped nav sections with small-caps labels: **Leads**, **Kunder**, **Innsikt**
- Nav items: Prospektering, E-postmaler, Lagrede lister / Pipeline, Kunder / ICP-analyse, Analytics
- Active state: `bg-ink text-canvas` (dark fill, white text)
- Divider + Innstillinger below
- Aktivitet link above user card
- User card: dark square initials, name, plan tier in small caps, chevron
- Dropdown: user info header, Innstillinger, Logg ut (red)

### Dashboard
- Sticky header: "OVERSIKT" overline, Work Sans h1, subtitle with first name
- 3 action buttons (Bytt mal / Nytt søk / Finn Leads)
- 4 stat cards: Totalt leads, E-poster sendt, Samtaler, Kontaktrate (hero dark card with sage-bright number)
- 3 quick action cards: Prospektering / Pipeline / Analytics
- Empty state: Target icon + CTA buttons
- Filled state: Leadlister table (2/3) + Siste aktivitet (1/3)

### All pages — consistent sticky header
Each page now has a sticky `px-8 py-5` header with:
- Small-caps overline (LEADS / KUNDER / INNSIKT / KONTO)
- Work Sans 1.7rem h1
- Muted subtitle
- Optional action buttons (right side)

Pages updated: Search, ICP, Pipeline, Customers, Email, Saved, Analytics, Settings

## Deploy
Production: https://vekstor-1zay5xhdd-strandencodes-projects.vercel.app
