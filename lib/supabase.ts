// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Graceful fallback — game works fully without Supabase configured
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Submit a completed game score to the leaderboard */
export async function submitScore(params: {
  userId: string;
  puzzleSeed: number;
  difficulty: string;
  timeSeconds: number;
  mistakes: number;
  hintsUsed: number;
  score: number;
  isDaily: boolean;
  city?: string;
  country?: string;
}): Promise<void> {
  if (!supabase) return;

  await supabase.from("scores").insert({
    user_id: params.userId,
    puzzle_seed: params.puzzleSeed,
    difficulty: params.difficulty,
    time_secs: params.timeSeconds,
    mistakes: params.mistakes,
    hints_used: params.hintsUsed,
    score: params.score,
    is_daily: params.isDaily,
    completed: true,
    city: params.city ?? "Unknown",
    country: params.country ?? "Unknown",
    played_at: new Date().toISOString(),
  });
}

/** Fetch today's daily leaderboard */
export async function getDailyLeaderboard(seed: number) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("v_daily_leaderboard")
    .select("*")
    .eq("puzzle_seed", seed)
    .order("rank", { ascending: true })
    .limit(100);

  if (error) {
    console.error("getDailyLeaderboard:", error.message);
    return [];
  }
  return data ?? [];
}

/** Fetch global all-time leaderboard */
export async function getGlobalLeaderboard(difficulty?: string) {
  if (!supabase) return [];

  let query = supabase
    .from("v_global_leaderboard")
    .select("*")
    .order("rank", { ascending: true })
    .limit(50);

  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getGlobalLeaderboard:", error.message);
    return [];
  }
  return data ?? [];
}

/** Fetch leaderboard filtered by city */
export async function getCityLeaderboard(city: string, difficulty?: string) {
  if (!supabase) return [];

  let query = supabase
    .from("v_city_leaderboard")
    .select("*")
    .eq("city", city)
    .order("city_rank", { ascending: true })
    .limit(50);

  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getCityLeaderboard:", error.message);
    return [];
  }
  return data ?? [];
}

/** Get a user profile by ID */
export async function getProfile(userId: string) {
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data;
}

/** Update or create a user profile */
export async function updateProfile(
  userId: string,
  updates: Record<string, unknown>
) {
  if (!supabase) return;

  await supabase.from("profiles").upsert({
    id: userId,
    updated_at: new Date().toISOString(),
    ...updates,
  });
}
