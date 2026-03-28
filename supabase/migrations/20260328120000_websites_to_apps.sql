-- Workspace OS: rename bookmarks table to apps + workspace metadata
-- Run in Supabase SQL Editor (or supabase db push) BEFORE deploying the new client.

BEGIN;

-- Rename legacy table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'websites'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'apps'
  ) THEN
    ALTER TABLE public.websites RENAME TO apps;
  END IF;
END $$;

-- New installs: create apps if missing (skip if rename above ran)
CREATE TABLE IF NOT EXISTS public.apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  icon text,
  description text,
  folder_id uuid REFERENCES public.folders(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_opened_at timestamptz,
  is_pinned boolean NOT NULL DEFAULT false
);

ALTER TABLE public.apps
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS last_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;

-- Enable Realtime (Dashboard → Database → Replication, or):
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.apps;

COMMENT ON TABLE public.apps IS 'Workspace apps (OS-level tools), not generic bookmarks';

COMMIT;
