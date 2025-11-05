-- Update the trigger function to correctly match file patterns
CREATE OR REPLACE FUNCTION public.delete_newspaper_files()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, storage
LANGUAGE plpgsql
AS $$
DECLARE
  file_basename text;
BEGIN
  -- Extract just the filename without the user_id prefix from file_path
  -- file_path format: user_id/2025-11-03-filename.pdf
  file_basename := regexp_replace(OLD.file_path, '^[^/]+/', '');
  
  -- Delete the main newspaper PDF file
  DELETE FROM storage.objects
  WHERE bucket_id = 'newspapers'
    AND name = OLD.file_path;
  
  -- Delete all split page files for this newspaper
  -- Pattern: user_id/2025-11-03-filename_page_N.pdf
  DELETE FROM storage.objects
  WHERE bucket_id = 'newspapers'
    AND name LIKE OLD.user_id::text || '/' || regexp_replace(file_basename, '\.pdf$', '') || '_page_%';
  
  RETURN OLD;
END;
$$;