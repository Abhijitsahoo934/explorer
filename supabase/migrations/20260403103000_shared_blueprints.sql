BEGIN;

CREATE TABLE IF NOT EXISTS public.shared_blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL UNIQUE,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shared_blueprints_public_id_idx
  ON public.shared_blueprints (public_id);

ALTER TABLE public.shared_blueprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read shared blueprints" ON public.shared_blueprints;
DROP POLICY IF EXISTS "Users can insert own shared blueprints" ON public.shared_blueprints;
DROP POLICY IF EXISTS "Users can read own shared blueprints" ON public.shared_blueprints;
DROP POLICY IF EXISTS "Users can delete own shared blueprints" ON public.shared_blueprints;

CREATE POLICY "Public can read shared blueprints"
ON public.shared_blueprints
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Users can insert own shared blueprints"
ON public.shared_blueprints
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can read own shared blueprints"
ON public.shared_blueprints
FOR SELECT
TO authenticated
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete own shared blueprints"
ON public.shared_blueprints
FOR DELETE
TO authenticated
USING (auth.uid() = owner_user_id);

COMMIT;
