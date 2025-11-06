-- Keep project_id first line in config.toml separate (handled elsewhere)

-- Update delete function to match current storage paths and use newspaper id
CREATE OR REPLACE FUNCTION public.delete_newspaper_files()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'storage'
AS $function$
BEGIN
  -- Delete the main newspaper PDF file
  DELETE FROM storage.objects
  WHERE bucket_id = 'newspapers'
    AND name = OLD.file_path;

  -- Delete all split page files for this newspaper
  -- Pattern: user_id/pages/<newspaper_id>_page_N.pdf
  DELETE FROM storage.objects
  WHERE bucket_id = 'newspapers'
    AND name LIKE OLD.user_id::text || '/pages/' || OLD.id::text || '_page_%';

  RETURN OLD;
END;
$function$;

-- Create trigger to clean up storage files on newspaper deletion (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_delete_newspaper_files'
  ) THEN
    CREATE TRIGGER trg_delete_newspaper_files
    AFTER DELETE ON public.newspapers
    FOR EACH ROW
    EXECUTE FUNCTION public.delete_newspaper_files();
  END IF;
END$$;

-- Enable realtime replication for incremental UI updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.newspapers;