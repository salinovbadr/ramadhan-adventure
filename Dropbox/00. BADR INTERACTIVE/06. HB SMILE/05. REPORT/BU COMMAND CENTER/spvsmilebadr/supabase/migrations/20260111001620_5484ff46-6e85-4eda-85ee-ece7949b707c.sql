-- Add cost_type field to project_team_allocations table (HPP = COGS, OPEX = Operating Expense)
ALTER TABLE public.project_team_allocations 
ADD COLUMN cost_type TEXT DEFAULT 'hpp' CHECK (cost_type IN ('hpp', 'opex'));