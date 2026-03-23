-- Database webhook trigger: auto-extract text from uploaded files
-- Uses pg_net to call the Supabase Edge Function asynchronously

-- Ensure pg_net extension is available
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION trigger_file_extraction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for new uploads that need extraction
  IF NEW.extraction_status IS NULL OR NEW.extraction_status = 'pending' THEN
    PERFORM net.http_post(
      url := 'https://yuatpwpiystkkieehrmx.supabase.co/functions/v1/extract-text',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-webhook-secret', 'airoles_webhook_secret_2026'
      ),
      body := jsonb_build_object(
        'type', 'INSERT',
        'record', jsonb_build_object(
          'id', NEW.id,
          'name', NEW.name,
          'storage_path', NEW.storage_path,
          'file_type', NEW.file_type,
          'extraction_status', NEW.extraction_status
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_file_upload_extract ON files;

-- Create trigger
CREATE TRIGGER on_file_upload_extract
  AFTER INSERT ON files
  FOR EACH ROW
  EXECUTE FUNCTION trigger_file_extraction();
