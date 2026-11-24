20261125000001_outbox_helpers.sqlALTER TABLE public.outbox_events
  ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_outbox_pending
  ON public.outbox_events (created_at ASC)
  WHERE status = 'pending';

-- Allows backend transactions under withRls() to safely enqueue domain events
-- while keeping direct INSERT on outbox_events blocked by RLS.
CREATE OR REPLACE FUNCTION public.enqueue_outbox_event(
  p_aggregate_type TEXT,
  p_aggregate_id UUID,
  p_event_type TEXT,
  p_payload JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to enqueue outbox event';
  END IF;

  INSERT INTO public.outbox_events (aggregate_type, aggregate_id, event_type, payload, status)
  VALUES (p_aggregate_type, p_aggregate_id, p_event_type, p_payload, 'pending')
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_outbox_event(TEXT, UUID, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enqueue_outbox_event(TEXT, UUID, TEXT, JSONB) TO authenticated;