-- ============================================================================
-- Public Website — RLS for content_posts & sb_schedules
-- Sangguniang Bayan ng Balilihan — shared Supabase project with ThesisSystem/my-backend
--
-- Run this once in the Supabase SQL Editor (or via `supabase db push`).
-- Idempotent — safe to re-run.
--
-- Both tables are owned and written by the ThesisSystem admin backend's
-- Content Management module, which always connects with the service_role key
-- and so is completely unaffected by RLS either way.
--
-- content_posts (Announcements/Activities) IS read by the public website
-- (via the anon key), so it gets a published-only SELECT policy — that's
-- what keeps unpublished drafts private even if the Express route code has
-- a bug.
--
-- sb_schedules (Public Schedule) is NOT exposed to the public website by
-- design — schedules stay internal to the ThesisSystem only. Enabling RLS
-- with no policy for anon denies it access by default, so the anon key
-- can't read this table even by querying Supabase directly, regardless of
-- what the Express backend does or doesn't call.
-- ============================================================================

ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sb_schedules  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_read_content_posts ON public.content_posts;
CREATE POLICY public_read_content_posts ON public.content_posts
  FOR SELECT TO anon
  USING (published = true);

-- Deliberately no SELECT policy for anon on sb_schedules — RLS with zero
-- policies denies all access to non-owner roles by default.
DROP POLICY IF EXISTS public_read_sb_schedules ON public.sb_schedules;

-- Belt-and-suspenders: the anon/publishable role should never be able to
-- write to either table, regardless of RLS policy state.
REVOKE INSERT, UPDATE, DELETE ON public.content_posts, public.sb_schedules FROM anon;
REVOKE SELECT ON public.sb_schedules FROM anon;
