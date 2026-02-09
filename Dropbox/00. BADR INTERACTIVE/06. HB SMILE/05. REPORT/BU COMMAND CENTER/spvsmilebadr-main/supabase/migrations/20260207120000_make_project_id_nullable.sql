-- Make project_id nullable in project_team_allocations table
ALTER TABLE project_team_allocations ALTER COLUMN project_id DROP NOT NULL;

-- Remove the unique constraint that includes project_id
ALTER TABLE project_team_allocations DROP CONSTRAINT IF EXISTS project_team_allocations_project_id_team_member_id_month_key;

-- Add a new unique constraint that handles nullable project_id (using a partial index or just rely on application logic if complex unique constraints are needed for nulls in postgres < 15 without NULLS NOT DISTINCT)
-- For simplicity and standard postgres behavior, we can just add a unique index that allows multiple NULLs if that's desired, OR if we want to ensure only one allocation per member per month regardless of project (which might be too strict if they are allocated to multiple projects), OR one allocation per member/month/project (where project can be null).
-- In this case, if project is NULL (OPEX), we probably still want to check uniqueness for that member/month/NULL-project.
-- Postgres unique constraints treat NULLs as distinct by default. 
-- However, for OPEX, maybe we only want one OPEX entry per member per month? Or is it combined?
-- Let's assume we want to enforce uniqueness on (team_member_id, month, project_id) where project_id can be null.
-- To properly handle uniqueness with NULLs in older Postgres versions (pre-15), we need unique index.
-- But let's check if we can just re-add the constraint. If the user is on modern Supabase (Postgres 15+), `UNIQUE NULLS NOT DISTINCT` works.
-- Safer bet for now: Just drop the constraint and rely on app logic or add a unique index.
-- Let's try to add a unique index which is the standard way to enforce uniqueness.

CREATE UNIQUE INDEX IF NOT EXISTS unique_allocation_per_project_member_month 
ON project_team_allocations (team_member_id, month, COALESCE(project_id, '00000000-0000-0000-0000-000000000000'));
