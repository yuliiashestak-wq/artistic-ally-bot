/*
# Add episode_unlocks table for tracking unlocked episodes by series key

## Summary
Creates a simpler unlocks table that uses a text series_key (e.g. "neon-forest")
instead of a UUID FK, so it works with both hardcoded catalog series and
database-backed series.

## New Tables
- `episode_unlocks`: Tracks which user has unlocked which episode of a series.
  - `id` (uuid PK)
  - `user_id` (uuid FK -> auth.users)
  - `series_key` (text, the series identifier - can be a slug or UUID string)
  - `episode_number` (integer, default 1)
  - `unlocked_at` (timestamptz)
  - UNIQUE(user_id, series_key, episode_number)

## Security
- RLS enabled.
- SELECT/INSERT only by the owner (user_id = auth.uid()).
*/

CREATE TABLE IF NOT EXISTS public.episode_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  series_key text NOT NULL,
  episode_number integer NOT NULL DEFAULT 1,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, series_key, episode_number)
);

ALTER TABLE public.episode_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_episode_unlocks" ON public.episode_unlocks;
CREATE POLICY "select_own_episode_unlocks"
  ON public.episode_unlocks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_episode_unlocks" ON public.episode_unlocks;
CREATE POLICY "insert_own_episode_unlocks"
  ON public.episode_unlocks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);