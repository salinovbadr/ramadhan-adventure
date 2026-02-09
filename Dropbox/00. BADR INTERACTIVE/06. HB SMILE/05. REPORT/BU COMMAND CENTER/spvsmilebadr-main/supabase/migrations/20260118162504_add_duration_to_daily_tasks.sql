-- Add duration column to daily_tasks table
ALTER TABLE daily_tasks ADD COLUMN duration numeric DEFAULT 0;

-- Optional: Update existing records to have a default duration if needed
-- UPDATE daily_tasks SET duration = 1 WHERE duration IS NULL;
