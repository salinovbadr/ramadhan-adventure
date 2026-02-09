-- Tambahkan value baru ke enum lead_stage
ALTER TYPE public.lead_stage ADD VALUE IF NOT EXISTS 'gathering_requirement' BEFORE 'proposal';
ALTER TYPE public.lead_stage ADD VALUE IF NOT EXISTS 'prototype' BEFORE 'proposal';