-- Add supervisor column to team_members table
ALTER TABLE public.team_members 
ADD COLUMN supervisor text;