-- Fix PUBLIC_DATA_EXPOSURE: Restrict sensitive data to admins only
-- Drop existing permissive SELECT policies and replace with admin-only policies

-- 1. leads table - contains contact details, competitor info
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
CREATE POLICY "Admins can view leads" 
  ON public.leads 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. opex_budget table - financial allocations, KPIs
DROP POLICY IF EXISTS "Authenticated users can view opex_budget" ON public.opex_budget;
CREATE POLICY "Admins can view opex_budget" 
  ON public.opex_budget 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. opex_consumption table - quarterly financial consumption
DROP POLICY IF EXISTS "Authenticated users can view opex_consumption" ON public.opex_consumption;
CREATE POLICY "Admins can view opex_consumption" 
  ON public.opex_consumption 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. monthly_data table - revenue, OPEX, COGS figures
DROP POLICY IF EXISTS "Authenticated users can view monthly_data" ON public.monthly_data;
CREATE POLICY "Admins can view monthly_data" 
  ON public.monthly_data 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. team_member_esat table - individual employee satisfaction scores
DROP POLICY IF EXISTS "Authenticated users can view team_member_esat" ON public.team_member_esat;
CREATE POLICY "Admins can view team_member_esat" 
  ON public.team_member_esat 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. daily_tasks table - detailed work assignments
DROP POLICY IF EXISTS "Authenticated users can view daily_tasks" ON public.daily_tasks;
CREATE POLICY "Admins can view daily_tasks" 
  ON public.daily_tasks 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. csat_data table - customer satisfaction with reviewer details
DROP POLICY IF EXISTS "Authenticated users can view csat_data" ON public.csat_data;
CREATE POLICY "Admins can view csat_data" 
  ON public.csat_data 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. projects table - budget and actual costs
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
CREATE POLICY "Admins can view projects" 
  ON public.projects 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 9. project_team_allocations table - allocation percentages and costs
DROP POLICY IF EXISTS "Authenticated users can view project_team_allocations" ON public.project_team_allocations;
CREATE POLICY "Admins can view project_team_allocations" 
  ON public.project_team_allocations 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 10. survey_data table - satisfaction survey results
DROP POLICY IF EXISTS "Authenticated users can view survey_data" ON public.survey_data;
CREATE POLICY "Admins can view survey_data" 
  ON public.survey_data 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 11. team_members table - employee info (contains email)
DROP POLICY IF EXISTS "Authenticated users can view team_members" ON public.team_members;
CREATE POLICY "Admins can view team_members" 
  ON public.team_members 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 12. lead_history table - lead progression history
DROP POLICY IF EXISTS "Authenticated users can view lead_history" ON public.lead_history;
CREATE POLICY "Admins can view lead_history" 
  ON public.lead_history 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 13. squads table - team structure info
DROP POLICY IF EXISTS "Authenticated users can view squads" ON public.squads;
CREATE POLICY "Admins can view squads" 
  ON public.squads 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));