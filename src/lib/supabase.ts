import { createClient } from "@supabase/supabase-js";

// Provide fallback values so the UI doesn't crash during development if .env is missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dummy-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "dummy-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
