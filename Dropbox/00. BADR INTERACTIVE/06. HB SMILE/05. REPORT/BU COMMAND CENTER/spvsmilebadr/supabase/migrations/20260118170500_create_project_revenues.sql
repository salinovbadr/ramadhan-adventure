-- Create project_revenues table
CREATE TABLE IF NOT EXISTS project_revenues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamp WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE project_revenues ENABLE ROW LEVEL SECURITY;

-- Simple policy for authenticated users (same as others)
CREATE POLICY "Enable all for authenticated users" ON project_revenues
  FOR ALL USING (auth.role() = 'authenticated');
