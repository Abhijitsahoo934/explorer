BEGIN;

CREATE TABLE IF NOT EXISTS public.product_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  event_name text NOT NULL,
  metric_value double precision NOT NULL DEFAULT 0,
  metric_type text NOT NULL CHECK (metric_type IN ('web_vital', 'performance')),
  path text NOT NULL DEFAULT '/',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_events_user_created_idx
  ON public.product_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS product_events_name_created_idx
  ON public.product_events (event_name, created_at DESC);

ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own product events" ON public.product_events;
DROP POLICY IF EXISTS "Users can insert own product events" ON public.product_events;
DROP POLICY IF EXISTS "Users can update own product events" ON public.product_events;
DROP POLICY IF EXISTS "Users can delete own product events" ON public.product_events;

CREATE POLICY "Users can read own product events"
ON public.product_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own product events"
ON public.product_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product events"
ON public.product_events
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own product events"
ON public.product_events
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_rel pr
      JOIN pg_class c ON c.oid = pr.prrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_publication p ON p.oid = pr.prpubid
      WHERE p.pubname = 'supabase_realtime'
        AND n.nspname = 'public'
        AND c.relname = 'product_events'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.product_events;
    END IF;
  END IF;
END $$;

COMMIT;
