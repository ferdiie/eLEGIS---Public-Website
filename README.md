# Sangguniang Bayan ng Balilihan — Public Legislative Information Portal

Public, read-only website for the Legislative Records Management System (LRMS),
built to the `Public_Website_SRS.docx` in this repo. Stack: **React (Vite) +
Node.js/Express + Supabase (PostgreSQL)**.

```
├── backend/    Express API — talks to Supabase with the anon/publishable key
├── frontend/   React app — talks only to the Express API, never to Supabase directly
└── db/         SQL migration: schema additions + Row Level Security policies
```

## 1. Apply the database migration (do this first)

Open your Supabase project → **SQL Editor** → paste and run:

```
db/001_public_website_schema_and_rls.sql
```

This is idempotent (safe to re-run) and:
- Adds the columns/tables flagged as "Schema Gaps" in the SRS (Section 9):
  `announcements.is_public`, `announcements.category`,
  `calendar_events.is_public`, `ordinances.category`, `resolutions.category`,
  `session_minutes.status`, and a new `legislative_trivia` table.
- Enables Row Level Security on every table the site reads and adds
  `SELECT`-only policies scoped to published/public rows, and revokes
  write access from the `anon` role. This means even if the backend code
  has a bug, the public site can never see drafts or write anything.

**After running it**, go mark some real content as public so the site isn't
empty:
```sql
update announcements set is_public = true where id = ...;
update announcements set is_public = true, category = 'activity' where id = ...;
update calendar_events set is_public = true where id = ...;
update ordinances set status = 'published' where id = ...;
```

## 2. Run the backend

```bash
cd backend
cp .env.example .env   # already pre-filled with the Supabase URL/key you gave me
npm install
npm run dev             # http://localhost:4000
```

Visit `http://localhost:4000/api/health` — should return `{"status":"ok"}`.

## 3. Run the frontend

```bash
cd frontend
cp .env.example .env    # already pre-filled to point at localhost:4000
npm install
npm run dev              # http://localhost:5173
```

## Notes on decisions made while building this

- **No public login** — per your instruction, the site is fully anonymous.
  The logged-in avatar in the original mockups was treated as a staff
  preview artifact, not a feature.
- **Node/Express in the middle, not direct Supabase-from-React** — this
  gives a second enforcement point for "published-only" visibility (in
  code, on top of RLS), central place for rate-limiting/input sanitization,
  and room to add caching later without touching the frontend.
- **Category filter** for ordinances/resolutions is a free-text filter, not
  a fixed dropdown — your schema didn't define a category taxonomy, so I
  didn't invent one. If the office wants fixed categories (e.g.
  Environment, Public Safety, Finance...), tell me the list and I'll turn
  it into a proper dropdown backed by a `categories` table.
- **Trivia** rotates a random active fact from the new `legislative_trivia`
  table on each Home page load — add more rows any time via SQL or a
  future admin screen.
- **Session minutes `status` field** — the two schema documents you
  supplied disagreed on whether this column exists. The migration adds it
  if missing; if it already existed with different allowed values, check
  that migration section before running it in production.

## What's intentionally out of scope (per the SRS)

No create/edit/approve/delete of any record, no comments/reactions, no user
accounts. All of that stays in the internal LRMS.
