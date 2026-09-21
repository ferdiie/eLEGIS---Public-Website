const FILE_BASE_URL = process.env.FILE_BASE_URL || "";

/**
 * Parses page/pageSize query params into a safe { from, to, page, pageSize }
 * range for use with Supabase's .range(from, to).
 */
export function parsePagination(query, { defaultPageSize = 10, maxPageSize = 50 } = {}) {
  let page = parseInt(query.page, 10);
  let pageSize = parseInt(query.pageSize, 10);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(pageSize) || pageSize < 1) pageSize = defaultPageSize;
  if (pageSize > maxPageSize) pageSize = maxPageSize;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

/**
 * PostgREST's `.or()` / `.ilike()` filters treat `%`, `,`, and `*` specially.
 * Strip anything that isn't a normal search character so a visitor can never
 * inject unexpected filter syntax through the search box.
 */
export function sanitizeSearchTerm(raw) {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[%,*()"\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

/** Validates a year query param, returning a number or null. */
export function parseYear(raw) {
  const year = parseInt(raw, 10);
  if (!Number.isInteger(year) || year < 1901 || year > 2155) return null;
  return year;
}

/** Validates an ISO date string (YYYY-MM-DD), returning it or null. */
export function parseDate(raw) {
  if (typeof raw !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  return raw;
}

// The municipality is in the Philippines (UTC+8, no DST). A "date" filter on a
// timestamptz column must mean that calendar day locally, not in UTC.
const LOCAL_UTC_OFFSET = "+08:00";

/**
 * Turns a YYYY-MM-DD string into a [start, end) range for filtering a column
 * to that whole day. `kind` is the column type: "date" columns compare against
 * plain dates, "timestamp" columns against local-midnight instants.
 */
export function dayRange(isoDate, kind = "timestamp") {
  const next = new Date(`${isoDate}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const nextDate = next.toISOString().slice(0, 10);
  if (kind === "date") return { start: isoDate, end: nextDate };
  return {
    start: `${isoDate}T00:00:00${LOCAL_UTC_OFFSET}`,
    end: `${nextDate}T00:00:00${LOCAL_UTC_OFFSET}`,
  };
}

/**
 * Resolves a stored filepath into an absolute URL the browser can hit
 * directly for preview/download, in case filepath is a relative Storage
 * object path rather than a full URL already.
 */
export function resolveFileUrl(filepath) {
  if (!filepath) return null;
  if (/^https?:\/\//i.test(filepath)) return filepath;
  if (!FILE_BASE_URL) return filepath;
  return `${FILE_BASE_URL.replace(/\/$/, "")}/${filepath.replace(/^\//, "")}`;
}
