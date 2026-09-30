/*
# Add Series, Unlocks, Follows, Likes tables, coin_earnings column, and deduct_coins RPC

## Summary
This migration adds the data model needed for the Tonera platform's coin-based
episode unlocking, creator stats (followers, total likes, coin earnings),
published series, drafts, and an atomic coin-deduction function.

## New Tables

1. `series` — Published animated series created by users.
   - `id` (uuid PK)
   - `user_id` (uuid FK → auth.users, the creator)
   - `title` (text)
   - `description` (text)
   - `genre` (text)
   - `cover_image` (text, URL or asset path)
   - `status` (text: 'published' or 'draft')
   - `episode_count` (integer, default 1)
   - `coin_price` (integer, default 5 — coins to unlock an episode)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

2. `unlocks` — Tracks which user has unlocked which series episode.
   - `id` (uuid PK)
   - `user_id` (uuid FK → auth.users)
   - `series_id` (uuid FK → series)
   - `episode_number` (integer, default 1)
   - `unlocked_at` (timestamptz)
   - UNIQUE constraint on (user_id, series_id, episode_number)

3. `follows` — Follower relationships between users.
   - `id` (uuid PK)
   - `follower_id` (uuid FK → auth.users)
   - `following_id` (uuid FK → auth.users)
   - `created_at` (timestamptz)
   - UNIQUE constraint on (follower_id, following_id)

4. `series_likes` — Likes on a series by users.
   - `id` (uuid PK)
   - `user_id` (uuid FK → auth.users)
   - `series_id` (uuid FK → series)
   - `created_at` (timestamptz)
   - UNIQUE constraint on (user_id, series_id)

## Modified Tables

- `profiles`: Added `coin_earnings` column (integer, default 0) — total coins
  earned from unlocks and donations.

## New Functions

- `deduct_coins(amount integer)` — SECURITY DEFINER function that atomically
  deducts coins from the calling user's profile. Checks balance >= amount,
  deducts, and returns the new balance. Returns NULL if insufficient balance.
  Also enforces a minimum of 0 balance.

- `add_coins(amount integer)` — SECURITY DEFINER function that atomically
  adds coins to the calling user's profile (used for top-up purchases).
  Returns the new balance.

## Security (RLS)

- `series`: SELECT is public to authenticated users; INSERT/UPDATE/DELETE
  only by the owner (user_id = auth.uid()).
- `unlocks`: SELECT and INSERT only by the owner (user_id = auth.uid()).
- `follows`: SELECT is public to authenticated; INSERT/DELETE only by
  the follower (follower_id = auth.uid()).
- `series_likes`: SELECT is public to authenticated; INSERT/DELETE only
  by the liker (user_id = auth.uid()).
- `profiles`: Updated INSERT policy so new users can have a profile row
  created (already handled by trigger, but policy added for completeness).
- `deduct_coins` and `add_coins`: SECURITY DEFINER, executable by authenticated.
  Uses auth.uid() internally — no parameters needed for user identification.
*/

-- ============================================================
-- 1. Add coin_earnings column to profiles
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'coin_earnings'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN coin_earnings integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ============================================================
-- 2. Create series table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  genre text NOT NULL DEFAULT 'Fantasy',
  cover_image text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  episode_count integer NOT NULL DEFAULT 1,
  coin_price integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_series_public" ON public.series;
CREATE POLICY "select_series_public"
  ON public.series FOR SELECT TO authenticated
  USING (status = 'published' OR user_id = auth.uid());

DROP POLICY IF EXISTS "insert_own_series" ON public.series;
CREATE POLICY "insert_own_series"
  ON public.series FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_series" ON public.series;
CREATE POLICY "update_own_series"
  ON public.series FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_series" ON public.series;
CREATE POLICY "delete_own_series"
  ON public.series FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 3. Create unlocks table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id uuid NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  episode_number integer NOT NULL DEFAULT 1,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, series_id, episode_number)
);

ALTER TABLE public.unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_unlocks" ON public.unlocks;
CREATE POLICY "select_own_unlocks"
  ON public.unlocks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_unlocks" ON public.unlocks;
CREATE POLICY "insert_own_unlocks"
  ON public.unlocks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. Create follows table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_follows_public" ON public.follows;
CREATE POLICY "select_follows_public"
  ON public.follows FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "insert_own_follow" ON public.follows;
CREATE POLICY "insert_own_follow"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "delete_own_follow" ON public.follows;
CREATE POLICY "delete_own_follow"
  ON public.follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- ============================================================
-- 5. Create series_likes table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.series_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id uuid NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, series_id)
);

ALTER TABLE public.series_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_likes_public" ON public.series_likes;
CREATE POLICY "select_likes_public"
  ON public.series_likes FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "insert_own_like" ON public.series_likes;
CREATE POLICY "insert_own_like"
  ON public.series_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_like" ON public.series_likes;
CREATE POLICY "delete_own_like"
  ON public.series_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 6. deduct_coins RPC — atomic coin deduction with balance check
-- ============================================================
CREATE OR REPLACE FUNCTION public.deduct_coins(amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  IF amount IS NULL OR amount <= 0 THEN
    RETURN NULL;
  END IF;

  SELECT tokens INTO current_balance
  FROM public.profiles
  WHERE id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF current_balance < amount THEN
    RETURN NULL;
  END IF;

  new_balance := current_balance - amount;

  UPDATE public.profiles
  SET tokens = new_balance
  WHERE id = auth.uid();

  RETURN new_balance;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.deduct_coins(integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.deduct_coins(integer) TO authenticated;

-- ============================================================
-- 7. add_coins RPC — atomic coin addition (for top-up purchases)
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_coins(amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  IF amount IS NULL OR amount <= 0 THEN
    RETURN NULL;
  END IF;

  SELECT tokens INTO current_balance
  FROM public.profiles
  WHERE id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  new_balance := current_balance + amount;

  UPDATE public.profiles
  SET tokens = new_balance
  WHERE id = auth.uid();

  RETURN new_balance;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.add_coins(integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.add_coins(integer) TO authenticated;

-- ============================================================
-- 8. Add INSERT policy for profiles (for completeness)
-- ============================================================
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
