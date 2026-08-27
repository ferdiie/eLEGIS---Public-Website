import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";

export const homeRouter = Router();

const PRIORITY_ORDER = { urgent: 0, high: 1, normal: 2, low: 3 };

// FR-1: Display Public Announcements
homeRouter.get("/announcements", async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("announcements")
      .select("id, title, body, priority, expires_at, created_at")
      .eq("is_public", true)
      .eq("category", "announcement")
      .or(`expires_at.is.null,expires_at.gte.${today}`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const sorted = [...(data || [])].sort(
      (a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
    );
    res.json({ data: sorted });
  } catch (err) {
    next(err);
  }
});

// FR-2: Display Activities / Happenings
homeRouter.get("/activities", async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("announcements")
      .select("id, title, body, priority, expires_at, created_at")
      .eq("is_public", true)
      .eq("category", "activity")
      .or(`expires_at.is.null,expires_at.gte.${today}`)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
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
    const { data, error } = await supabase
      .from("calendar_events")
      .select(
        "id, title, description, location, start_date, start_time, end_date, end_time, all_day, color"
      )
      .eq("is_public", true)
      .eq("is_admin_event", false)
      .gte("start_date", today)
      .order("start_date", { ascending: true })
      .limit(10);

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
