-- Change gs_paper from single enum to array of enums
ALTER TABLE articles 
DROP COLUMN gs_paper;

ALTER TABLE articles 
ADD COLUMN gs_papers gs_paper[] DEFAULT ARRAY[]::gs_paper[];