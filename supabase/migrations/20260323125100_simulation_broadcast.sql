-- Simulation broadcast function
-- The Railway worker calls this to send messages to connected clients via Realtime

-- Note: realtime.send() may not be available on all Supabase plans.
-- If it fails, the worker still saves messages to the database,
-- and the frontend falls back to polling or postgres_changes subscription.

CREATE OR REPLACE FUNCTION broadcast_simulation_message(
  p_chat_id UUID,
  p_role_slug TEXT,
  p_role_name TEXT,
  p_content TEXT
) RETURNS void AS $$
BEGIN
  -- Try to use realtime.send for instant broadcast
  -- If realtime.send doesn't exist, this will fail gracefully
  BEGIN
    PERFORM realtime.send(
      jsonb_build_object(
        'type', 'simulation_message',
        'chat_id', p_chat_id,
        'role_slug', p_role_slug,
        'role_name', p_role_name,
        'content', p_content,
        'timestamp', now()
      ),
      'simulation_message',
      'simulation:' || p_chat_id::text,
      true
    );
  EXCEPTION WHEN OTHERS THEN
    -- realtime.send not available — messages still saved to DB
    -- Frontend uses postgres_changes subscription as fallback
    RAISE NOTICE 'realtime.send not available: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
