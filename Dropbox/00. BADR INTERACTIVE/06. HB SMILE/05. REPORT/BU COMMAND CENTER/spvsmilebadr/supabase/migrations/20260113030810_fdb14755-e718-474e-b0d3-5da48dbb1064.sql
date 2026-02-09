-- Create squads table to store squad data
CREATE TABLE public.squads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view squads" 
ON public.squads 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage squads" 
ON public.squads 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update squads" 
ON public.squads 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete squads" 
ON public.squads 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_squads_updated_at
BEFORE UPDATE ON public.squads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create opex_budget table for BAGIAN A (OPEX items with monthly budget)
CREATE TABLE public.opex_budget (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  squad TEXT,
  okr TEXT,
  kpi TEXT,
  account TEXT,
  year INTEGER NOT NULL DEFAULT 2025,
  jan BIGINT NOT NULL DEFAULT 0,
  feb BIGINT NOT NULL DEFAULT 0,
  mar BIGINT NOT NULL DEFAULT 0,
  apr BIGINT NOT NULL DEFAULT 0,
  may BIGINT NOT NULL DEFAULT 0,
  jun BIGINT NOT NULL DEFAULT 0,
  jul BIGINT NOT NULL DEFAULT 0,
  aug BIGINT NOT NULL DEFAULT 0,
  sep BIGINT NOT NULL DEFAULT 0,
  oct BIGINT NOT NULL DEFAULT 0,
  nov BIGINT NOT NULL DEFAULT 0,
  "dec" BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.opex_budget ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view opex_budget" 
ON public.opex_budget 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage opex_budget" 
ON public.opex_budget 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update opex_budget" 
ON public.opex_budget 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete opex_budget" 
ON public.opex_budget 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_opex_budget_updated_at
BEFORE UPDATE ON public.opex_budget
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create opex_consumption table for BAGIAN D (consumption records)
CREATE TABLE public.opex_consumption (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opex_budget_id UUID REFERENCES public.opex_budget(id) ON DELETE CASCADE,
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  year INTEGER NOT NULL DEFAULT 2025,
  allocation_description TEXT NOT NULL,
  usage_description TEXT,
  amount BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.opex_consumption ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view opex_consumption" 
ON public.opex_consumption 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage opex_consumption" 
ON public.opex_consumption 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update opex_consumption" 
ON public.opex_consumption 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete opex_consumption" 
ON public.opex_consumption 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_opex_consumption_updated_at
BEFORE UPDATE ON public.opex_consumption
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();