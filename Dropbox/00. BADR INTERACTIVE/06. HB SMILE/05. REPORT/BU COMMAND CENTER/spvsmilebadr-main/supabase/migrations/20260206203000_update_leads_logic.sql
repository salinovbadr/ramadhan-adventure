-- Revert and Re-apply
DROP TRIGGER IF EXISTS on_lead_won ON public.leads;
DROP FUNCTION IF EXISTS public.handle_won_lead;

-- Function to handle Won Leads
CREATE OR REPLACE FUNCTION public.handle_won_lead()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if stage changed to 'won'
    IF NEW.stage = 'won' AND (OLD.stage IS NULL OR OLD.stage != 'won') THEN
        INSERT INTO public.projects (name, budget, actual_cost, cogs, status)
        VALUES (
            NEW.project_name, 
            NEW.estimated_value, 
            0, 
            0, 
            'On Track'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger logic
CREATE TRIGGER on_lead_won
    AFTER UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_won_lead();
