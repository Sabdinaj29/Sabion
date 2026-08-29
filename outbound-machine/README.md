# Gold Studios Outbound Machine

A local web app for running brand partnership outbound: source prospects, generate
personalized outreach, and track the pipeline through to close. Focus vertical:
Asian brands (China/Korea/Japan) entering the UK/Western Europe.

This is **Phase 1** of the build brief: the Prospect data model, a CSV seed script,
a filterable list view, and an add/edit form. Later phases (Kanban pipeline view,
AI outreach generator, follow-up nudges) are not built yet.

## Stack

- Next.js (App Router) + TypeScript
- SQLite via Prisma (single file DB, zero setup)
- Tailwind CSS

## Getting started

```bash
npm install
cp .env.example .env      # already points at ./prisma/dev.db
npx prisma migrate dev    # creates prisma/dev.db and applies the schema
npm run db:seed           # imports prisma/seed-data/leads.csv
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll see the 8 sample
prospects from the seed CSV.

## Importing your own leads

Edit or replace `prisma/seed-data/leads.csv` (or pass a different path), then run:

```bash
npm run db:seed                          # uses prisma/seed-data/leads.csv
npx tsx prisma/seed.ts path/to/other.csv # or import a different file
```

The importer is additive — re-running it appends rows, it doesn't clear existing
data. To start over, delete `prisma/dev.db` and re-run `npx prisma migrate dev`.

Expected CSV columns (only the first four are required):

```
company_name, sector, origin_country, target_market,
contact_name, contact_email, contact_role, source,
stage, next_follow_up_date, notes
```

`stage` must be one of: `Sourced`, `Contacted`, `Replied`, `Meeting`, `Proposal`,
`Closed Won`, `Closed Lost` (defaults to `Sourced` if left blank).
`next_follow_up_date` should be an ISO date like `2026-09-05`.

## What's here

- `prisma/schema.prisma` — the `Prospect` model
- `prisma/seed.ts` + `prisma/seed-data/leads.csv` — CSV import
- `src/app/page.tsx` — prospect list, filterable by stage and sector
- `src/app/prospects/new` — add prospect form
- `src/app/prospects/[id]` — prospect detail / edit form
- `src/app/actions.ts` — server actions backing both forms
- `src/lib/stages.ts` — the fixed set of pipeline stages

## Other scripts

```bash
npm run db:migrate  # prisma migrate dev
npm run db:studio    # browse the DB in Prisma Studio
npm run lint
npm run build
```
