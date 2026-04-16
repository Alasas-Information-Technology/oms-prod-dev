import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Publishable key — works for Auth only
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Anon JWT key — works for Auth + all DB operations (select, insert, update, delete)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || (!supabaseAnonKey && !supabasePublishableKey)) {
  console.error(
    "CRITICAL ERROR: Supabase environment variables are missing. Auth and DB will fail.",
  );
}

// Use anon key — handles both auth and all database operations
export const supabase = createClient(
  supabaseUrl || "https://missing-url.supabase.co",
  supabaseAnonKey || supabasePublishableKey || "missing-key",
);
