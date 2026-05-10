-- =============================================================================
-- SudokuMind — Complete Database Schema v2
-- Run this in your Supabase SQL editor (Project → SQL Editor).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  city          TEXT DEFAULT 'Unknown',
  country       TEXT DEFAULT 'Unknown',
  is_pro        BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'player_' || LEFT(NEW.id::TEXT, 6)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Player')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- PLAYER STATS
-- =============================================================================
CREATE TABLE IF NOT EXISTS player_stats (
  user_id           UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  games_played      INTEGER DEFAULT 0,
  games_completed   INTEGER DEFAULT 0,
  total_solve_time  INTEGER DEFAULT 0,
  total_errors      INTEGER DEFAULT 0,
  hints_used        INTEGER DEFAULT 0,
  best_time_easy    INTEGER,
  best_time_medium  INTEGER,
  best_time_hard    INTEGER,
  best_time_expert  INTEGER,
  rooms_created     INTEGER DEFAULT 0,
  coop_wins         INTEGER DEFAULT 0,
  races_played      INTEGER DEFAULT 0,
  races_won         INTEGER DEFAULT 0,
  daily_streak      INTEGER DEFAULT 0,
  longest_streak    INTEGER DEFAULT 0,
  last_daily_date   DATE,
  total_score       BIGINT DEFAULT 0,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.init_player_stats()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.player_stats (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.init_player_stats();

-- =============================================================================
-- SCORES
-- =============================================================================
CREATE TABLE IF NOT EXISTS scores (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  puzzle_seed   BIGINT NOT NULL,
  difficulty    TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  is_daily      BOOLEAN DEFAULT FALSE,
  score         INTEGER NOT NULL,
  time_secs     INTEGER NOT NULL,
  mistakes      INTEGER DEFAULT 0,
  hints_used    INTEGER DEFAULT 0,
  completed     BOOLEAN DEFAULT TRUE,
  city          TEXT DEFAULT 'Unknown',
  country       TEXT DEFAULT 'Unknown',
  played_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scores_user_idx   ON scores(user_id);
CREATE INDEX IF NOT EXISTS scores_daily_idx  ON scores(is_daily, puzzle_seed);
CREATE INDEX IF NOT EXISTS scores_rank_idx   ON scores(score DESC, time_secs ASC);

-- =============================================================================
-- FRIENDSHIPS
-- =============================================================================
CREATE TABLE IF NOT EXISTS friendships (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

CREATE INDEX IF NOT EXISTS friendships_req_idx  ON friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS friendships_addr_idx ON friendships(addressee_id, status);

-- =============================================================================
-- ROOMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS rooms (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code          TEXT UNIQUE NOT NULL,
  host_id       UUID REFERENCES profiles(id),
  mode          TEXT DEFAULT 'coop' CHECK (mode IN ('coop', 'race')),
  difficulty    TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  puzzle_seed   BIGINT NOT NULL,
  board_state   JSONB,
  solution      JSONB,
  status        TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  max_players   INTEGER DEFAULT 4,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  started_at    TIMESTAMPTZ,
  finished_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS rooms_code_idx   ON rooms(code);
CREATE INDEX IF NOT EXISTS rooms_status_idx ON rooms(status, created_at DESC);
CREATE INDEX IF NOT EXISTS rooms_host_idx   ON rooms(host_id);

-- =============================================================================
-- ROOM PLAYERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS room_players (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id       UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  color         TEXT NOT NULL DEFAULT '#6d5dfc',
  is_host       BOOLEAN DEFAULT FALSE,
  is_ready      BOOLEAN DEFAULT FALSE,
  race_board    JSONB,
  progress      INTEGER DEFAULT 0,
  finished_at   TIMESTAMPTZ,
  rank          INTEGER,
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS rp_room_idx ON room_players(room_id);
CREATE INDEX IF NOT EXISTS rp_user_idx ON room_players(user_id);

-- =============================================================================
-- MOVES
-- =============================================================================
CREATE TABLE IF NOT EXISTS moves (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id       UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id),
  row_idx       INTEGER NOT NULL CHECK (row_idx BETWEEN 0 AND 8),
  col_idx       INTEGER NOT NULL CHECK (col_idx BETWEEN 0 AND 8),
  value         INTEGER CHECK (value BETWEEN 1 AND 9),
  is_note       BOOLEAN DEFAULT FALSE,
  note_values   INTEGER[],
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS moves_room_idx ON moves(room_id, created_at);

-- =============================================================================
-- ROOM CHAT
-- =============================================================================
CREATE TABLE IF NOT EXISTS room_chat (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id       UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id),
  username      TEXT NOT NULL,
  message       TEXT,
  emoji         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_room_idx ON room_chat(room_id, created_at);

-- =============================================================================
-- DAILY CHALLENGES
-- =============================================================================
CREATE TABLE IF NOT EXISTS daily_challenges (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date          DATE UNIQUE NOT NULL,
  seed          BIGINT NOT NULL,
  difficulty    TEXT NOT NULL DEFAULT 'medium',
  player_count  INTEGER DEFAULT 0,
  top_score     INTEGER DEFAULT 0
);

-- =============================================================================
-- VIEWS
-- =============================================================================

CREATE OR REPLACE VIEW v_global_leaderboard AS
SELECT
  p.id, p.username, p.display_name, p.avatar_url, p.city, p.country,
  s.difficulty,
  MAX(s.score)     AS best_score,
  MIN(s.time_secs) AS best_time,
  COUNT(*)         AS games_played,
  ROW_NUMBER() OVER (PARTITION BY s.difficulty ORDER BY MAX(s.score) DESC, MIN(s.time_secs) ASC) AS rank
FROM scores s
JOIN profiles p ON s.user_id = p.id
WHERE s.completed = TRUE
GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.city, p.country, s.difficulty;

CREATE OR REPLACE VIEW v_daily_leaderboard AS
SELECT
  p.id, p.username, p.display_name, p.avatar_url, p.city,
  s.puzzle_seed, s.score, s.time_secs, s.mistakes, s.hints_used, s.played_at,
  ROW_NUMBER() OVER (PARTITION BY s.puzzle_seed ORDER BY s.score DESC, s.time_secs ASC) AS rank
FROM scores s
JOIN profiles p ON s.user_id = p.id
WHERE s.is_daily = TRUE AND s.completed = TRUE;

CREATE OR REPLACE VIEW v_city_leaderboard AS
SELECT
  p.city, p.id, p.username, p.display_name, p.avatar_url,
  s.difficulty,
  MAX(s.score)     AS best_score,
  MIN(s.time_secs) AS best_time,
  COUNT(*)         AS games_played,
  ROW_NUMBER() OVER (PARTITION BY s.difficulty, p.city ORDER BY MAX(s.score) DESC) AS city_rank
FROM scores s
JOIN profiles p ON s.user_id = p.id
WHERE s.completed = TRUE
GROUP BY p.city, p.id, p.username, p.display_name, p.avatar_url, s.difficulty;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code  TEXT := '';
  i     INTEGER;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM rooms WHERE rooms.code = code);
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION update_solo_stats(
  p_user_id    UUID,
  p_difficulty TEXT,
  p_time_secs  INTEGER,
  p_errors     INTEGER,
  p_hints      INTEGER,
  p_score      INTEGER,
  p_completed  BOOLEAN
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO player_stats (user_id) VALUES (p_user_id) ON CONFLICT DO NOTHING;
  UPDATE player_stats SET
    games_played     = games_played + 1,
    games_completed  = games_completed + (CASE WHEN p_completed THEN 1 ELSE 0 END),
    total_solve_time = total_solve_time + p_time_secs,
    total_errors     = total_errors + p_errors,
    hints_used       = hints_used + p_hints,
    total_score      = total_score + p_score,
    best_time_easy   = CASE WHEN p_difficulty='easy'   AND p_completed THEN LEAST(COALESCE(best_time_easy,9999999),   p_time_secs) ELSE best_time_easy   END,
    best_time_medium = CASE WHEN p_difficulty='medium' AND p_completed THEN LEAST(COALESCE(best_time_medium,9999999), p_time_secs) ELSE best_time_medium END,
    best_time_hard   = CASE WHEN p_difficulty='hard'   AND p_completed THEN LEAST(COALESCE(best_time_hard,9999999),   p_time_secs) ELSE best_time_hard   END,
    best_time_expert = CASE WHEN p_difficulty='expert' AND p_completed THEN LEAST(COALESCE(best_time_expert,9999999), p_time_secs) ELSE best_time_expert END,
    updated_at       = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves        ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_chat    ENABLE ROW LEVEL SECURITY;

-- Profiles (public read)
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Player stats (public read)
CREATE POLICY "stats_select" ON player_stats FOR SELECT USING (TRUE);
CREATE POLICY "stats_update" ON player_stats FOR UPDATE USING (auth.uid() = user_id);

-- Scores (public read, own insert)
CREATE POLICY "scores_select" ON scores FOR SELECT USING (TRUE);
CREATE POLICY "scores_insert" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Friendships (own read/write)
CREATE POLICY "friends_select" ON friendships FOR SELECT
  USING (auth.uid() IN (requester_id, addressee_id));
CREATE POLICY "friends_insert" ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "friends_update" ON friendships FOR UPDATE
  USING (auth.uid() IN (requester_id, addressee_id));
CREATE POLICY "friends_delete" ON friendships FOR DELETE
  USING (auth.uid() IN (requester_id, addressee_id));

-- Rooms (public read, host write)
CREATE POLICY "rooms_select" ON rooms FOR SELECT USING (TRUE);
CREATE POLICY "rooms_insert" ON rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "rooms_update" ON rooms FOR UPDATE USING (auth.uid() = host_id);

-- Room players (public read, own write)
CREATE POLICY "rp_select" ON room_players FOR SELECT USING (TRUE);
CREATE POLICY "rp_insert" ON room_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rp_update" ON room_players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "rp_delete" ON room_players FOR DELETE USING (auth.uid() = user_id);

-- Moves (public read, own insert)
CREATE POLICY "moves_select" ON moves FOR SELECT USING (TRUE);
CREATE POLICY "moves_insert" ON moves FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat (public read, own insert)
CREATE POLICY "chat_select" ON room_chat FOR SELECT USING (TRUE);
CREATE POLICY "chat_insert" ON room_chat FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- REALTIME SUBSCRIPTIONS
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE moves;
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_chat;
