# Phase 1 Complete

**Deployed:** https://vekstor-strandencodes-projects.vercel.app  
**GitHub:** https://github.com/Strandencode/vekstor  
**Date:** 2026-04-25

## What's working

- Next.js 15 (App Router, Turbopack) with TypeScript strict
- Neon Postgres (vekstor database on existing project)
- Drizzle ORM with full domain schema (all tables pushed to Neon)
- Better Auth: email/password + magic link, session management
- Resend: transactional email (magic links, invites, password reset)
- Auth pages: sign-in, sign-up, forgot-password, reset-password, invite/[token]
- App shell: sidebar navigation + user menu + workspace context
- Placeholder pages for all 8 routes
- Settings page: Profil, Arbeidsområde, Medlemmer, Konto tabs (fully functional server actions)
- Middleware: redirects unauthed users to /sign-in

## Env vars on Vercel

- DATABASE_URL
- BETTER_AUTH_SECRET
- BETTER_AUTH_URL (set to production URL)
- NEXT_PUBLIC_BETTER_AUTH_URL
- RESEND_API_KEY
- ANTHROPIC_API_KEY
- EMAIL_FROM

## Known issues / notes

- `middleware.ts` deprecation warning (Next.js 16 prefers `proxy.ts`) — not yet supported by Turbopack, left as-is
- Deployment protection (Vercel SSO) disabled to allow public access
