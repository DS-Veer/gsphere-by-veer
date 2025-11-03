-- Add page_number to articles table to track which page each article came from
ALTER TABLE public.articles 
ADD COLUMN page_number INTEGER,
ADD COLUMN page_file_path TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.articles.page_number IS 'The page number in the original newspaper where this article appears';
COMMENT ON COLUMN public.articles.page_file_path IS 'Storage path to the individual page PDF file';