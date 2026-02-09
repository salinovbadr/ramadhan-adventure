-- Fix RLS policies: Replace public access with authenticated user access
-- Authenticated users can view, admins can write

-- Drop existing public policies
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all operations on monthly_data" ON public.monthly_data;
DROP POLICY IF EXISTS "Allow all operations on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all operations on team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow all operations on lead_history" ON public.lead_history;
DROP POLICY IF EXISTS "Allow all operations on project_team_allocations" ON public.project_team_allocations;
DROP POLICY IF EXISTS "Allow all operations on team_member_esat" ON public.team_member_esat;
DROP POLICY IF EXISTS "Allow all operations on survey_data" ON public.survey_data;
DROP POLICY IF EXISTS "Allow all operations on csat_data" ON public.csat_data;

-- leads table: Authenticated read, admin write
CREATE POLICY "Authenticated users can view leads"
ON public.leads FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage leads"
ON public.leads FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
ON public.leads FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads"
ON public.leads FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- monthly_data table: Authenticated read, admin write
CREATE POLICY "Authenticated users can view monthly_data"
ON public.monthly_data FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage monthly_data"
ON public.monthly_data FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update monthly_data"
ON public.monthly_data FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete monthly_data"
ON public.monthly_data FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- projects table: Authenticated read, admin write
CREATE POLICY "Authenticated users can view projects"
ON public.projects FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage projects"
ON public.projects FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projects"
ON public.projects FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projects"
ON public.projects FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- team_members table: Authenticated read, admin write
CREATE POLICY "Authenticated users can view team_members"
ON public.team_members FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage team_members"
ON public.team_members FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team_members"
ON public.team_members FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete team_members"
ON public.team_members FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- lead_history table: Authenticated read, admin write
CREATE POLICY "Authenticated users can view lead_history"
ON public.lead_history FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage lead_history"
ON public.lead_history FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update lead_history"
ON public.lead_history FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete lead_history"
ON public.lead_history FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- project_team_allocations table: Authenticated read, admin write
CREATE POLICY "Authenticated users can view project_team_allocations"
ON public.project_team_allocations FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage project_team_allocations"
ON public.project_team_allocations FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update project_team_allocations"
ON public.project_team_allocations FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete project_team_allocations"
ON public.project_team_allocations FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- team_member_esat table: Authenticated read, admin write
CREATE POLICY "Authenticated users can view team_member_esat"
ON public.team_member_esat FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage team_member_esat"
ON public.team_member_esat FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team_member_esat"
ON public.team_member_esat FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete team_member_esat"
ON public.team_member_esat FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- survey_data table: Authenticated read, admin write
CREATE POLICY "Authenticated users can view survey_data"
ON public.survey_data FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage survey_data"
ON public.survey_data FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update survey_data"
ON public.survey_data FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete survey_data"
ON public.survey_data FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- csat_data table: Authenticated read, admin write
CREATE POLICY "Authenticated users can view csat_data"
ON public.csat_data FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage csat_data"
ON public.csat_data FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update csat_data"
ON public.csat_data FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete csat_data"
ON public.csat_data FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));