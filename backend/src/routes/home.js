import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { parsePagination, sanitizeSearchTerm } from "../lib/helpers.js";

export const homeRouter = Router();

// content_posts (Announcements/Activities) is owned by the ThesisSystem admin
// backend's Content Management module, in the same Supabase project. RLS
// (see /db/002_content_posts_and_schedules_rls.sql) restricts the anon key
// to published=true rows only.
//
// Note: sb_schedules (Public Schedule) is deliberately NOT exposed here —
// schedules stay internal to the ThesisSystem only.

// Feed — searchable/filterable browse of published content_posts
// (Announcements + Activities) and active legislative_trivia facts, merged
// into one feed for the /feed page. Both sources are small enough (a
// municipal office's occasional posts, a handful of trivia facts) that
// merging and paginating in application code is simpler than a SQL-level
// UNION, and keeps each source's own filter logic (search, category)
// straightforward.
homeRouter.get("/feed", async (req, res, next) => {
  try {
    const { page, pageSize } = parsePagination(req.query, { defaultPageSize: 9 });
    const search = sanitizeSearchTerm(req.query.search || "");
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "all";
    const sort = req.query.sort === "oldest" ? "oldest" : "newest";

    const items = [];

    // "posts" means announcements+activities but NOT trivia — used by the
    // Home page's photo-first bento grid, which has no sensible tile for a
    // text-only trivia fact. "all" (the /feed page's default) includes it.
    if (["all", "posts", "announcement", "activity"].includes(category)) {
      let query = supabase
        .from("content_posts")
        .select("id, title, body, category, pinned, images, created_at")
        .eq("published", true);

      if (category === "announcement" || category === "activity") query = query.eq("category", category);
      if (search) query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      items.push(...(data || []));
    }

    if (category === "all" || category === "trivia") {
      let query = supabase.from("legislative_trivia").select("id, fact_text, created_at").eq("is_active", true);
      if (search) query = query.ilike("fact_text", `%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      items.push(
        ...(data || []).map((t) => ({
          id: `trivia-${t.id}`,
          title: "Did you know?",
          body: t.fact_text,
          category: "trivia",
          pinned: false,
          images: [],
          created_at: t.created_at,
        }))
      );
    }

    items.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const diff = new Date(a.created_at) - new Date(b.created_at);
      return sort === "oldest" ? diff : -diff;
    });

    const count = items.length;
    const from = (page - 1) * pageSize;
    const data = items.slice(from, from + pageSize);

    res.json({ data, count, page, pageSize });
  } catch (err) {
    next(err);
  }
});

// Hero stat counters — live published-record counts for the home page.
homeRouter.get("/stats", async (req, res, next) => {
  try {
    const [ordinances, resolutions, sessionMinutes] = await Promise.all([
      supabase.from("ordinances").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("resolutions").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("session_minutes").select("id", { count: "exact", head: true }).eq("status", "published"),
    ]);

    if (ordinances.error) throw ordinances.error;
    if (resolutions.error) throw resolutions.error;
    if (sessionMinutes.error) throw sessionMinutes.error;

    res.json({
      data: {
        ordinances: ordinances.count || 0,
        resolutions: resolutions.count || 0,
        sessionMinutes: sessionMinutes.count || 0,
      },
    });
  } catch (err) {
    next(err);
  }
});
