-- ESAT Survey System Tables (REVISED - Public Link Approach)
-- Employee Satisfaction Survey with public access via unique token

-- Table 1: ESAT Surveys
CREATE TABLE IF NOT EXISTS esat_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  period TEXT NOT NULL, -- e.g., 'H1 2026', 'H2 2026'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  access_token TEXT UNIQUE, -- Public token for survey access
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Table 2: ESAT Responses (No team_member_id - public survey)
CREATE TABLE IF NOT EXISTS esat_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES esat_surveys(id) ON DELETE CASCADE,
  respondent_name TEXT NOT NULL, -- Manual input dari responden
  respondent_position TEXT, -- Optional: posisi/role
  respondent_squad TEXT, -- Optional: squad/tim
  submitted_at TIMESTAMPTZ,
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: ESAT Answers
CREATE TABLE IF NOT EXISTS esat_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES esat_responses(id) ON DELETE CASCADE,
  question_code TEXT NOT NULL, -- e.g., 'scope_1', 'workload_2'
  category TEXT NOT NULL CHECK (category IN ('scope', 'workload', 'collaboration', 'process', 'pm_direction', 'open_ended')),
  answer_value INTEGER CHECK (answer_value BETWEEN 1 AND 5), -- 1-5 for Likert, NULL for open-ended
  answer_text TEXT, -- For open-ended questions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_esat_surveys_status ON esat_surveys(status);
CREATE INDEX IF NOT EXISTS idx_esat_surveys_period ON esat_surveys(period);
CREATE INDEX IF NOT EXISTS idx_esat_surveys_token ON esat_surveys(access_token);
CREATE INDEX IF NOT EXISTS idx_esat_responses_survey ON esat_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_esat_responses_name ON esat_responses(respondent_name);
CREATE INDEX IF NOT EXISTS idx_esat_answers_response ON esat_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_esat_answers_category ON esat_answers(category);

-- RLS Policies
ALTER TABLE esat_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE esat_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE esat_answers ENABLE ROW LEVEL SECURITY;

-- Authenticated users can do everything (for admin interface)
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

-- Public can view active surveys (for public form access)
CREATE POLICY "Public can view active surveys" ON esat_surveys
  FOR SELECT USING (status = 'active');

-- Public can insert responses (anonymous survey)
CREATE POLICY "Public can insert responses" ON esat_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view own responses" ON esat_responses
  FOR SELECT USING (true);

CREATE POLICY "Public can update own responses" ON esat_responses
  FOR UPDATE USING (true);

-- Public can manage answers
CREATE POLICY "Public can insert answers" ON esat_answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view answers" ON esat_answers
  FOR SELECT USING (true);

CREATE POLICY "Public can update answers" ON esat_answers
  FOR UPDATE USING (true);

-- Function to generate unique access token
CREATE OR REPLACE FUNCTION generate_survey_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 12-character token
    token := encode(gen_random_bytes(9), 'base64');
    token := replace(token, '/', '_');
    token := replace(token, '+', '-');
    token := substring(token, 1, 12);
    
    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM esat_surveys WHERE access_token = token) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate token when survey is created
CREATE OR REPLACE FUNCTION set_survey_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.access_token IS NULL THEN
    NEW.access_token := generate_survey_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER esat_surveys_set_token
  BEFORE INSERT ON esat_surveys
  FOR EACH ROW
  EXECUTE FUNCTION set_survey_token();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_esat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER esat_surveys_updated_at
  BEFORE UPDATE ON esat_surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_esat_updated_at();

CREATE TRIGGER esat_responses_updated_at
  BEFORE UPDATE ON esat_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_esat_updated_at();
