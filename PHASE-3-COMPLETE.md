# Phase 3 Complete

All AI features live in production.

## AI Route Handlers

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/icp/extract` | POST | Streams ICP field suggestions from Claude Haiku (prompt-cached system prompt) |
| `/api/enrich` | GET | Scrapes company website for emails and phones, increments usage counter |
| `/api/email/generate` | POST | Streams cold email draft (subject + body) from Claude Haiku |

## UI Integration

- **ICP page**: "Fyll ut med AI" button calls `/api/icp/extract` and populates all ICP fields from the JSON response
- **Email page**: "AI-utkast" button in template editor calls `/api/email/generate` and populates subject + body
- **Search page**: Sparkles icon on each result row opens enrichment dialog; auto-fills website from BRREG `hjemmeside` field; shows found emails + phones with copy buttons

## Usage Tracking

- `src/lib/usage.ts` — `incrementUsage(workspaceId, field)` upserts into `usage_counters` with month-key bucketing
- Enrichment endpoint increments `enrichments` counter
- Email generation endpoint increments `emailsSent` counter
- Analytics page shows 6-month usage history

## Model

claude-haiku-4-5-20251001 (fast, cheap) with `cache_control: { type: "ephemeral" }` on the system prompt for prompt caching.

## Deploy

Production URL: https://vekstor-j0n51n1mz-strandencodes-projects.vercel.app
