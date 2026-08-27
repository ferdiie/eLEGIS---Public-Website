-- ============================================================================
-- Public Website — Schema Additions & Row Level Security (RLS)
-- Sangguniang Bayan ng Balilihan — Legislative Records Management System
--
-- Run this once in the Supabase SQL Editor (or via `supabase db push`) BEFORE
-- starting the backend. It is idempotent — safe to re-run.
--
-- What this does:
--   1. Adds the columns/tables the Public Website SRS flagged as "Schema Gaps"
--      (Section 9): announcements/calendar_events public-visibility flags,
--      an activity/announcement category, and a legislative_trivia table.
--   2. Ensures ordinances/resolutions/session_minutes have a normalized
--      `status` column with a `published` state to filter on.
--   3. Enables Row Level Security on every table the public site touches and
--      adds SELECT-only policies scoped to "published" / "public" content,
--      so that even if the Express backend has a bug, the anon/publishable
--      key can never read drafts, pending items, or internal-only data —
--      and can never write anything at all.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SCHEMA ADDITIONS (Section 9 "Schema Gap" rows)
-- ----------------------------------------------------------------------------

-- announcements: public-visibility flag + category (announcement vs activity)
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'announcement';

DO $$ BEGIN
  ALTER TABLE public.announcements
    ADD CONSTRAINT announcements_category_check
    CHECK (category IN ('announcement', 'activity'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- calendar_events: public-visibility flag (distinct from is_admin_event)
ALTER TABLE public.calendar_events
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- legislative_trivia: new table backing the Home page "Did you know?" card
CREATE TABLE IF NOT EXISTS public.legislative_trivia (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fact_text text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ordinances / resolutions: optional category, referenced by the "Category"
-- filter shown in the site mockups but absent from the supplied schema.
ALTER TABLE public.ordinances
  ADD COLUMN IF NOT EXISTS category text;

ALTER TABLE public.resolutions
  ADD COLUMN IF NOT EXISTS category text;

-- ordinances / resolutions / session_minutes: normalize a `status` column
-- with a `published` state (ordinances/resolutions likely already have this;
-- session_minutes was ambiguous between the two schema documents supplied).
ALTER TABLE public.ordinances
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.resolutions
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.session_minutes
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

DO $$ BEGIN
  ALTER TABLE public.session_minutes
    ADD CONSTRAINT session_minutes_status_check
    CHECK (status IN ('pending', 'ready_to_publish', 'published'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed a couple of starter trivia facts so the Home page has content on day one.
INSERT INTO public.legislative_trivia (fact_text, is_active)
SELECT * FROM (VALUES
  ('A legislative resolution is a formal expression of opinion or will by a legislative body, distinct from a law (ordinance). Resolutions often express appreciation, provide for internal procedural matters, or ask another branch of government to take action.', true),
  ('An ordinance has the force and effect of law within the municipality once published, while a resolution generally does not carry the same binding legal weight.', true)
) AS seed(fact_text, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.legislative_trivia);

-- ----------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

ALTER TABLE public.announcements          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legislative_trivia     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordinances             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolutions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_minutes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordinance_officials    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolutions_officials  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sb_council_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sb_council_member_terms ENABLE ROW LEVEL SECURITY;

-- Drop-then-create so this script is safely re-runnable.
DROP POLICY IF EXISTS public_read_announcements ON public.announcements;
CREATE POLICY public_read_announcements ON public.announcements
  FOR SELECT TO anon
  USING (is_public = true AND (expires_at IS NULL OR expires_at >= current_date));

DROP POLICY IF EXISTS public_read_calendar_events ON public.calendar_events;
CREATE POLICY public_read_calendar_events ON public.calendar_events
  FOR SELECT TO anon
  USING (is_public = true AND is_admin_event = false);

DROP POLICY IF EXISTS public_read_trivia ON public.legislative_trivia;
CREATE POLICY public_read_trivia ON public.legislative_trivia
  FOR SELECT TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS public_read_ordinances ON public.ordinances;
CREATE POLICY public_read_ordinances ON public.ordinances
  FOR SELECT TO anon
  USING (status = 'published');

DROP POLICY IF EXISTS public_read_resolutions ON public.resolutions;
CREATE POLICY public_read_resolutions ON public.resolutions
  FOR SELECT TO anon
  USING (status = 'published');

DROP POLICY IF EXISTS public_read_session_minutes ON public.session_minutes;
CREATE POLICY public_read_session_minutes ON public.session_minutes
  FOR SELECT TO anon
  USING (status = 'published');

DROP POLICY IF EXISTS public_read_ordinance_officials ON public.ordinance_officials;
CREATE POLICY public_read_ordinance_officials ON public.ordinance_officials
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.ordinances o
      WHERE o.id = ordinance_officials.ordinance_id AND o.status = 'published'
    )
  );

DROP POLICY IF EXISTS public_read_resolutions_officials ON public.resolutions_officials;
CREATE POLICY public_read_resolutions_officials ON public.resolutions_officials
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.resolutions r
      WHERE r.id = resolutions_officials.resolution_id AND r.status = 'published'
    )
  );

DROP POLICY IF EXISTS public_read_council_members ON public.sb_council_members;
CREATE POLICY public_read_council_members ON public.sb_council_members
  FOR SELECT TO anon
  USING (COALESCE(is_archived, false) = false);

DROP POLICY IF EXISTS public_read_council_member_terms ON public.sb_council_member_terms;
CREATE POLICY public_read_council_member_terms ON public.sb_council_member_terms
  FOR SELECT TO anon
  USING (true);

-- Belt-and-suspenders: the anon/publishable role should never be able to
-- write to any of these tables, regardless of RLS policy state.
REVOKE INSERT, UPDATE, DELETE ON
  public.announcements,
  public.calendar_events,
  public.legislative_trivia,
  public.ordinances,
  public.resolutions,
  public.session_minutes,
  public.ordinance_officials,
  public.resolutions_officials,
  public.sb_council_members,
  public.sb_council_member_terms
FROM anon;

-- ----------------------------------------------------------------------------
-- 3. STORAGE (documents & photos)
-- ----------------------------------------------------------------------------
-- If legislative documents / councilor photos are stored in a Supabase
-- Storage bucket, mirror the same published-only rule there, e.g.:
--
--   CREATE POLICY public_read_published_documents ON storage.objects
--     FOR SELECT TO anon
--     USING (bucket_id = 'legislative-documents');
--
-- Adjust the bucket_id/path check to match how you namespace uploaded files.
-- If filepath values are plain HTTPS URLs already, this section can be skipped.
