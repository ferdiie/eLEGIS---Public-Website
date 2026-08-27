import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail loudly and early rather than let every route throw a confusing error.
  // eslint-disable-next-line no-console
  console.error(
    "[supabaseClient] Missing SUPABASE_URL or SUPABASE_ANON_KEY. " +
      "Copy backend/.env.example to backend/.env and fill in your Supabase project values."
  );
  process.exit(1);
}

// Deliberately uses the anon/publishable key, never a service-role key.
// This backend has no more database access than the browser would have on
// its own — Row Level Security (see /db/001_public_website_schema_and_rls.sql)
// is what actually restricts visibility to published, public content.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
