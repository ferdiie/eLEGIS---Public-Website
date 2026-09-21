import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import {
  parsePagination,
  sanitizeSearchTerm,
  parseYear,
  parseDate,
  dayRange,
  resolveFileUrl,
} from "../lib/helpers.js";

export const legislativeRouter = Router();

// Config describing how each legislative record type maps onto the schema.
// This is the single place that encodes the FR-21 "published-only" rule.
const RECORD_TYPES = {
  ordinances: {
    table: "ordinances",
    numberField: "ordinance_number",
    titleField: "title",
    listFields:
      "id, ordinance_number, title, year, category, filename, filetype, filepath, uploaded_at, status",
    detailFields:
      "id, ordinance_number, title, year, category, filename, filetype, filepath, uploaded_at, extracted_text, status",
    officialsTable: "ordinance_officials",
    officialsFK: "ordinance_id",
    dateField: "uploaded_at",
    dateKind: "timestamp",
    yearField: "year",
    categoryField: "category",
    searchFields: ["title", "ordinance_number", "category"],
  },
  resolutions: {
    table: "resolutions",
    numberField: "resolution_number",
    titleField: "title",
    listFields:
      "id, resolution_number, title, year, category, filename, filetype, filepath, uploaded_at, status",
    detailFields:
      "id, resolution_number, title, year, category, filename, filetype, filepath, uploaded_at, extracted_text, status",
    officialsTable: "resolution_officials",
    officialsFK: "resolution_id",
    dateField: "uploaded_at",
    dateKind: "timestamp",
    yearField: "year",
    categoryField: "category",
    searchFields: ["title", "resolution_number", "category"],
  },
  "session-minutes": {
    table: "session_minutes",
    numberField: "session_number",
    titleField: "agenda",
    listFields:
      "id, session_number, session_date, session_type, venue, agenda, filename, filetype, status",
    detailFields:
      "id, session_number, session_date, session_type, venue, agenda, minutes_text, filename, filetype, status",
    officialsTable: null,
    officialsFK: null,
    dateField: "session_date",
    dateKind: "date",
    // session_minutes has no `year` or `category` column — the year is
    // derived from session_date, and there is no category to filter on.
    yearField: null,
    categoryField: null,
    searchFields: ["agenda", "session_number", "venue"],
  },
};

function getConfigOr404(req, res) {
  const config = RECORD_TYPES[req.params.type];
  if (!config) {
    res.status(404).json({ error: `Unknown record type "${req.params.type}".` });
    return null;
  }
  return config;
}

/**
 * Resolves an `author` search term to a set of record ids by looking up
 * matching council members, then the join table linking them to records.
 * Returns `null` when there is no author filter to apply, or an array of
 * ids (possibly empty) when there is.
 */
async function resolveAuthorFilterIds(config, authorTerm) {
  if (!authorTerm || !config.officialsTable) return null;

  const { data: members, error: memberErr } = await supabase
    .from("sb_council_members")
    .select("id")
    .ilike("full_name", `%${authorTerm}%`);
  if (memberErr) throw memberErr;
  if (!members || members.length === 0) return [];

  const memberIds = members.map((m) => m.id);
  const { data: links, error: linkErr } = await supabase
    .from(config.officialsTable)
    .select(config.officialsFK)
    .in("official_id", memberIds);
  if (linkErr) throw linkErr;

  return [...new Set((links || []).map((l) => l[config.officialsFK]))];
}

// FR-5/FR-6/FR-7: View All Records, with FR-8 search + FR-9 filter + FR-13 pagination
legislativeRouter.get("/:type", async (req, res, next) => {
  try {
    const config = getConfigOr404(req, res);
    if (!config) return;

    const { page, pageSize, from, to } = parsePagination(req.query);
    const search = sanitizeSearchTerm(req.query.search || "");
    const year = parseYear(req.query.year);
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const date = parseDate(req.query.date);
    const author = sanitizeSearchTerm(req.query.author || "");

    let query = supabase
      .from(config.table)
      .select(config.listFields, { count: "exact" })
      .eq("status", "published"); // FR-21: published-only, always applied

    if (search) {
      query = query.or(config.searchFields.map((f) => `${f}.ilike.%${search}%`).join(","));
    }
    if (year) {
      if (config.yearField) {
        query = query.eq(config.yearField, year);
      } else {
        query = query.gte(config.dateField, `${year}-01-01`).lt(config.dateField, `${year + 1}-01-01`);
      }
    }
    if (category && category.toLowerCase() !== "all" && config.categoryField) {
      query = query.eq(config.categoryField, category);
    }
    if (date) {
      const { start, end } = dayRange(date, config.dateKind);
      query = query.gte(config.dateField, start).lt(config.dateField, end);
    }

    if (author) {
      const ids = await resolveAuthorFilterIds(config, author);
      if (ids !== null) {
        if (ids.length === 0) {
          return res.json({ data: [], count: 0, page, pageSize });
        }
        query = query.in("id", ids);
      }
    }

    query = query.order(config.dateField, { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ data, count, page, pageSize });
  } catch (err) {
    next(err);
  }
});

// FR-10: View Legislative Record Details (metadata + associated officials)
legislativeRouter.get("/:type/:id", async (req, res, next) => {
  try {
    const config = getConfigOr404(req, res);
    if (!config) return;

    const { data: record, error } = await supabase
      .from(config.table)
      .select(config.detailFields)
      .eq("id", req.params.id)
      .eq("status", "published") // FR-21
      .single();

    if (error || !record) {
      return res.status(404).json({ error: "Record not found or not yet published." });
    }

    let officials = [];
    if (config.officialsTable) {
      const { data: links, error: linkErr } = await supabase
        .from(config.officialsTable)
        .select(`official_id, sb_council_members ( id, full_name, photo_path )`)
        .eq(config.officialsFK, record.id);
      if (linkErr) throw linkErr;
      officials = (links || []).map((l) => l.sb_council_members).filter(Boolean);
    }

    res.json({
      data: {
        ...record,
        file_url: resolveFileUrl(record.filepath),
        officials,
      },
    });
  } catch (err) {
    next(err);
  }
});

// FR-12: Download Legislative Documents
legislativeRouter.get("/:type/:id/download", async (req, res, next) => {
  try {
    const config = getConfigOr404(req, res);
    if (!config) return;

    const { data: record, error } = await supabase
      .from(config.table)
      .select(`filepath, filename, status, ${config.numberField}, ${config.titleField}`)
      .eq("id", req.params.id)
      .eq("status", "published") // FR-21
      .single();

    if (error || !record) {
      return res.status(404).json({ error: "Record not found or not yet published." });
    }

    const url = resolveFileUrl(record.filepath);
    if (!url) {
      return res.status(404).json({ error: "No document is attached to this record." });
    }

    // Supabase Storage's public object endpoint honors a `download` query
    // param to set Content-Disposition's filename — used here so the saved
    // file is named after the record's title instead of its random storage
    // key (e.g. "1782918079786.pdf").
    const ext = (record.filename || record.filepath).split(".").pop();
    const baseName = record[config.titleField] || record[config.numberField] || "document";
    const safeName = baseName.replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 150) || "document";
    const downloadName = `${safeName}.${ext}`;

    const downloadUrl = `${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(downloadName)}`;
    res.redirect(downloadUrl);
  } catch (err) {
    next(err);
  }
});
