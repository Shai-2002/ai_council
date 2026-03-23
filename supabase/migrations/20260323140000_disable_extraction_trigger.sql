-- Disable the auto-extraction trigger to prevent race condition with inline extraction.
-- The upload API route handles extraction synchronously before returning.
-- The Edge Function + trigger_file_extraction() function remain available for manual batch re-extraction.
DROP TRIGGER IF EXISTS on_file_upload_extract ON files;
