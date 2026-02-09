-- Fix ESAT RLS Policies
-- Replace admin-only policies with authenticated user policies to match the rest of the application

-- Drop old admin-only policies
DROP POLICY IF EXISTS "Admin full access to esat_surveys" ON esat_surveys;
DROP POLICY IF EXISTS "Admin full access to esat_responses" ON esat_responses;
DROP POLICY IF EXISTS "Admin full access to esat_answers" ON esat_answers;

-- Create new authenticated user policies
CREATE POLICY "Enable all access for authenticated users on esat_surveys" ON esat_surveys
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users on esat_responses" ON esat_responses
  FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users on esat_answers" ON esat_answers
  FOR ALL 
  USING (auth.role() = 'authenticated');
