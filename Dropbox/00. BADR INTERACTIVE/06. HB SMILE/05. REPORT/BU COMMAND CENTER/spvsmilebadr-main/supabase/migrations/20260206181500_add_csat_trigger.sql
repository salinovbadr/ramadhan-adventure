-- Trigger function to update survey status
CREATE OR REPLACE FUNCTION public.handle_new_response()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.csat_surveys
    SET status = 'completed',
        updated_at = now()
    WHERE id = NEW.survey_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger
DROP TRIGGER IF EXISTS on_new_response ON public.csat_responses;
CREATE TRIGGER on_new_response
    AFTER INSERT ON public.csat_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_response();
