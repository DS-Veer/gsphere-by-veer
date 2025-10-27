-- Drop old columns and add new comprehensive UPSC analysis columns
ALTER TABLE articles 
DROP COLUMN IF EXISTS facts,
DROP COLUMN IF EXISTS issues,
DROP COLUMN IF EXISTS way_forward;

-- Add new comprehensive UPSC analysis columns
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS gs_syllabus_topics text[], -- Specific GS paper syllabus topics
ADD COLUMN IF NOT EXISTS one_liner text, -- Short one-line description
ADD COLUMN IF NOT EXISTS key_points text, -- 3-4 bullet points for easy recall
ADD COLUMN IF NOT EXISTS prelims_card text, -- Quick card for CSE prelims
ADD COLUMN IF NOT EXISTS static_explanation text; -- Detailed explanation of static topics

-- Update existing records to have empty arrays/nulls for new columns
UPDATE articles 
SET gs_syllabus_topics = ARRAY[]::text[]
WHERE gs_syllabus_topics IS NULL;