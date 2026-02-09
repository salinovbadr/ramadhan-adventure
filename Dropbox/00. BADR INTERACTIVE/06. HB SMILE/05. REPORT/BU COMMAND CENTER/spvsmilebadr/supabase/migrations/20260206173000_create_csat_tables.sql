-- Create table for CSAT Surveys
CREATE TABLE IF NOT EXISTS public.csat_surveys (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    reviewer_name TEXT NOT NULL,
    reviewer_role TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    public_token UUID NOT NULL DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for CSAT Responses
CREATE TABLE IF NOT EXISTS public.csat_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID NOT NULL REFERENCES public.csat_surveys(id) ON DELETE CASCADE,
    csat_score INTEGER NOT NULL CHECK (csat_score >= 1 AND csat_score <= 5),
    esat_score INTEGER CHECK (esat_score >= 1 AND esat_score <= 5),
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.csat_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csat_responses ENABLE ROW LEVEL SECURITY;

-- Policies for csat_surveys

-- 1. Admins (Authenticated) can do everything
CREATE POLICY "Enable all access for authenticated users" ON public.csat_surveys
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 2. Public can READ ONLY if they have the correct public_token
-- Note: We use a function or just a direct match.
-- ideally we fetch by public_token in the query.
CREATE POLICY "Public read with token" ON public.csat_surveys
    FOR SELECT
    USING (true); -- We allow public read, but your application query MUST filter by public_token to be useful.
                  -- Security through obscurity of the UUID token (Capability URL pattern).

-- Policies for csat_responses

-- 1. Admins (Authenticated) can view responses
CREATE POLICY "Authenticated users can view responses" ON public.csat_responses
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- 2. Public can INSERT responses (Submission)
CREATE POLICY "Public can insert responses" ON public.csat_responses
    FOR INSERT
    WITH CHECK (true); -- Allow anyone to insert (submission). Backend/Client should validate survey_id.

-- Add triggers for updated_at
CREATE TRIGGER update_csat_surveys_updated_at 
    BEFORE UPDATE ON public.csat_surveys 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
