import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { sanitizeSearchTerm, resolveFileUrl } from "../lib/helpers.js";

export const councilorsRouter = Router();

function matchesSearch(member, term) {
  if (!term) return true;
  const needle = term.toLowerCase();
  return (
    (member.full_name || "").toLowerCase().includes(needle) ||
    (member.position || "").toLowerCase().includes(needle)
  );
}

// FR-14: Display Current Council + FR-16: Search/Filter Councilors
councilorsRouter.get("/current", async (req, res, next) => {
  try {
    const search = sanitizeSearchTerm(req.query.search || "");

    const { data, error } = await supabase
      .from("sb_council_member_terms")
      .select(
        `id, term_period, term_start, term_end, status, is_reelected, position, council_member_id,
         sb_council_members ( id, full_name, photo, photo_path )`
      )
      .eq("status", "active");

    if (error) throw error;

    // A term row whose council_member_id no longer matches any row in
    // sb_council_members (an archived/deleted member) leaves
    // sb_council_members null — drop those before mapping, not after,
    // since spreading null still produces a truthy {} that would otherwise
    // slip through as a nameless, id-less "member".
    const members = (data || [])
      .filter((t) => t.sb_council_members)
      .map((t) => ({ ...t.sb_council_members, position: t.position, term_period: t.term_period, term_id: t.id }))
      .filter((m) => matchesSearch(m, search))
      .map((m) => ({ ...m, photo_url: m.photo || resolveFileUrl(m.photo_path) }));

    res.json({ data: members });
  } catch (err) {
    next(err);
  }
});

// FR-15: Display Previous Councils, grouped by term period + FR-16 search
councilorsRouter.get("/previous", async (req, res, next) => {
  try {
    const search = sanitizeSearchTerm(req.query.search || "");

    const { data, error } = await supabase
      .from("sb_council_member_terms")
      .select(
        `id, term_period, term_start, term_end, status, is_reelected, position, council_member_id,
         sb_council_members ( id, full_name, photo, photo_path )`
      )
      .neq("status", "active")
      .order("term_start", { ascending: false });

    if (error) throw error;

    const groups = new Map();
    for (const t of data || []) {
      const member = t.sb_council_members;
      const enriched = member && { ...member, position: t.position };
      if (!enriched || !matchesSearch(enriched, search)) continue;
      const key = t.term_period || "Unspecified Term";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({
        ...enriched,
        photo_url: enriched.photo || resolveFileUrl(enriched.photo_path),
        is_reelected: t.is_reelected,
        term_start: t.term_start,
        term_end: t.term_end,
      });
    }

    const result = [...groups.entries()].map(([term_period, members]) => ({
      term_period,
      members,
    }));

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// FR-17/FR-18: Councilor profile + authored legislative records
councilorsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: member, error: memberErr } = await supabase
      .from("sb_council_members")
      .select("id, full_name, photo, photo_path")
      .eq("id", id)
      .single();

    if (memberErr || !member) {
      return res.status(404).json({ error: "Councilor not found." });
    }

    const { data: terms, error: termsErr } = await supabase
      .from("sb_council_member_terms")
      .select("id, term_period, term_start, term_end, status, is_reelected, position")
      .eq("council_member_id", id)
      .order("term_start", { ascending: false });
    if (termsErr) throw termsErr;

    // position is a per-term attribute (see the management system's
    // 002_add_council_id_and_position_to_terms.sql) — use the active term's,
    // falling back to the most recent term.
    const activeTerm = (terms || []).find((t) => t.status === "active") || (terms || [])[0] || null;

    const { data: ordinanceLinks, error: ordErr } = await supabase
      .from("ordinance_officials")
      .select("ordinances ( id, ordinance_number, title, year, status )")
      .eq("official_id", id);
    if (ordErr) throw ordErr;

    const { data: resolutionLinks, error: resErr } = await supabase
      .from("resolution_officials")
      .select("resolutions ( id, resolution_number, title, year, status )")
      .eq("official_id", id);
    if (resErr) throw resErr;

    const ordinances = (ordinanceLinks || [])
      .map((l) => l.ordinances)
      .filter((o) => o && o.status === "published");
    const resolutions = (resolutionLinks || [])
      .map((l) => l.resolutions)
      .filter((r) => r && r.status === "published");

    res.json({
      data: {
        ...member,
        position: activeTerm?.position || null,
        photo_url: member.photo || resolveFileUrl(member.photo_path),
        terms,
        authored_ordinances: ordinances,
        authored_resolutions: resolutions,
      },
    });
  } catch (err) {
    next(err);
  }
});
