import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// TODO: yahan future me typesafe client (generated types) plug kar sakte ho
export const supabase = createClient(supabaseUrl, supabaseAnonKey);