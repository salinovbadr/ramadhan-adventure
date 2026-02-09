-- Drop the existing constraint
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_employment_status_check;

-- Add the updated constraint including 'Vendor'
ALTER TABLE team_members 
ADD CONSTRAINT team_members_employment_status_check 
CHECK (employment_status IN ('Permanent', 'Contract', 'Freelance', 'Vendor'));
