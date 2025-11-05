-- Create function to delete newspaper files from storage when newspaper is deleted
CREATE OR REPLACE FUNCTION public.delete_newspaper_files()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, storage
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete the main newspaper PDF file
  DELETE FROM storage.objects
  WHERE bucket_id = 'newspapers'
    AND name = OLD.file_path;
  
  -- Delete all split page files for this newspaper
  DELETE FROM storage.objects
  WHERE bucket_id = 'newspapers'
    AND name LIKE OLD.user_id::text || '/' || OLD.id::text || '_page_%';
  
  RETURN OLD;
END;
$$;

-- Create trigger to run the function when a newspaper is deleted
DROP TRIGGER IF EXISTS on_newspaper_deleted ON public.newspapers;

CREATE TRIGGER on_newspaper_deleted
  BEFORE DELETE ON public.newspapers
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_newspaper_files();

-- Also add cascade deletion for articles
ALTER TABLE public.articles
DROP CONSTRAINT IF EXISTS articles_newspaper_id_fkey;

ALTER TABLE public.articles
ADD CONSTRAINT articles_newspaper_id_fkey
FOREIGN KEY (newspaper_id)
REFERENCES public.newspapers(id)
ON DELETE CASCADE;