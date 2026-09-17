-- ============================================================================
-- Public Website — Expose sb_schedules (reverses 002's lockout)
-- Sangguniang Bayan ng Balilihan — shared Supabase project with ThesisSystem/my-backend
--
-- Run this once in the Supabase SQL Editor. Idempotent — safe to re-run.
--
-- Schedules were previously kept internal-only (see
-- 002_content_posts_and_schedules_rls.sql, which granted RLS on this table
-- with zero policies for anon, denying all access by default). That
-- decision is reversed here: sb_schedules events are now shown in the
-- public /feed page (rendered as a regular post), so the anon key needs
-- published-only SELECT access — the same pattern already used for
-- content_posts, ordinances, resolutions, etc.
--
-- The ThesisSystem admin backend always connects with the service_role key
-- and is completely unaffected by RLS either way.
-- ============================================================================

-- 002 revoked SELECT entirely; grant it back before adding the policy,
-- since a permissive RLS policy has no effect without the base privilege.
GRANT SELECT ON public.sb_schedules TO anon;

DROP POLICY IF EXISTS public_read_sb_schedules ON public.sb_schedules;
CREATE POLICY public_read_sb_schedules ON public.sb_schedules
  FOR SELECT TO anon
  USING (published = true);

-- Still no write access — belt-and-suspenders, matches every other public table.
REVOKE INSERT, UPDATE, DELETE ON public.sb_schedules FROM anon;
