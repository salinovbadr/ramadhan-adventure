-- Fix function search path for generate_public_slug
CREATE OR REPLACE FUNCTION public.generate_public_slug()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(gen_random_bytes(8), 'hex');
END;
$$;