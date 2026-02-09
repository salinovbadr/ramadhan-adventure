-- Create separate CSAT data table with reviewer name
CREATE TABLE public.csat_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  csat_score numeric NOT NULL DEFAULT 0,
  reviewer_name text,
  reviewer_company text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on CSAT table
ALTER TABLE public.csat_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for CSAT
CREATE POLICY "Allow all operations on csat_data"
ON public.csat_data FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_csat_data_updated_at
  BEFORE UPDATE ON public.csat_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();