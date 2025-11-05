
-- Add total_pages column to newspapers table
ALTER TABLE public.newspapers 
ADD COLUMN IF NOT EXISTS total_pages integer DEFAULT 0;
