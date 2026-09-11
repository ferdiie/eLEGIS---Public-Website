import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";

export const homeRouter = Router();

const MGMT_API_BASE_URL = (process.env.MGMT_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

// Announcements/activities and schedules are managed by the separate SB Office
// system (SB_OFFICE_SYSTEM/my-backend). That backend locks the anon Supabase
// key out of content_posts/sb_schedules and instead exposes its own
// published-only public endpoints for this site to consume.
async function fetchMgmtJson(path) {
  const res = await fetch(`${MGMT_API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Management API request to ${path} failed (${res.status})`);
  }
  return res.json();
}

const mapContentPost = (p) => ({
  id: p.id,
  title: p.title,
  body: p.body,
  pinned: p.pinned,
  images: p.images || [],
  author: p.author ? { name: p.author.name, photo: p.author.photo } : null,
  created_at: p.created_at,
  updated_at: p.updated_at,
});

// FR-1: Display Public Announcements
homeRouter.get("/announcements", async (req, res, next) => {
  try {
    const posts = await fetchMgmtJson("/api/content-posts/public");
    const data = (posts || [])
      .filter((p) => p.category === "announcement")
      .slice(0, 20)
      .map(mapContentPost);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// FR-2: Display Activities / Happenings
homeRouter.get("/activities", async (req, res, next) => {
  try {
    const posts = await fetchMgmtJson("/api/content-posts/public");
    const data = (posts || [])
      .filter((p) => p.category === "activity")
      .slice(0, 10)
      .map(mapContentPost);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// FR-3: Display Legislative Trivia ("Did you know?")
homeRouter.get("/trivia", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("legislative_trivia")
      .select("id, fact_text")
      .eq("is_active", true);

    if (error) throw error;

    // Serve one at random so repeat visitors see variety.
    const pick = data && data.length ? data[Math.floor(Math.random() * data.length)] : null;
    res.json({ data: pick });
  } catch (err) {
    next(err);
  }
});

// FR-4: Display Public Schedules
homeRouter.get("/schedules", async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const events = await fetchMgmtJson("/api/schedules");
    const data = (events || [])
      .filter((e) => e.event_date >= today)
      .slice(0, 10)
      .map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        location: e.location,
        event_date: e.event_date,
        event_time: e.event_time,
      }));
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
