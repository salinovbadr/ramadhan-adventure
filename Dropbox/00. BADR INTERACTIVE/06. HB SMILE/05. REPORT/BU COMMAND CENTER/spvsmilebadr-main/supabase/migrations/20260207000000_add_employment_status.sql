-- Add employment_status column to team_members table
ALTER TABLE team_members
ADD COLUMN employment_status text CHECK (employment_status IN ('Permanent', 'Contract', 'Freelance', 'Vendor'));

-- Add comment
COMMENT ON COLUMN team_members.employment_status IS 'Employment status of the team member (Permanent, Contract, Freelance)';
