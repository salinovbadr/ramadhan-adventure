-- Create enum for lead stages
CREATE TYPE public.lead_stage AS ENUM ('proposal', 'negotiation', 'review', 'won', 'lost');

-- Create enum for lead sources
CREATE TYPE public.lead_source AS ENUM ('referral', 'website', 'cold_call', 'event', 'social_media', 'other');

-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  budget BIGINT NOT NULL DEFAULT 0,
  actual_cost BIGINT NOT NULL DEFAULT 0,
  cogs BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'on-track',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Monthly financial data table
CREATE TABLE public.monthly_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  revenue BIGINT NOT NULL DEFAULT 0,
  opex BIGINT NOT NULL DEFAULT 0,
  cogs BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Survey data table
CREATE TABLE public.survey_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  csat NUMERIC(4,1) NOT NULL DEFAULT 0,
  esat NUMERIC(4,1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leads pipeline table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  estimated_value BIGINT NOT NULL DEFAULT 0,
  probability INTEGER NOT NULL DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  stage lead_stage NOT NULL DEFAULT 'proposal',
  source lead_source NOT NULL DEFAULT 'other',
  proposal_date DATE,
  expected_close_date DATE,
  closed_date DATE,
  loss_reason TEXT,
  loss_details TEXT,
  win_factors TEXT,
  competitor TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (public access for now, can add auth later)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (for admin dashboard without auth)
CREATE POLICY "Allow all operations on projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on monthly_data" ON public.monthly_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on survey_data" ON public.survey_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_monthly_data_updated_at BEFORE UPDATE ON public.monthly_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_survey_data_updated_at BEFORE UPDATE ON public.survey_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();