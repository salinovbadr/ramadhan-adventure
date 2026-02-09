-- Create document categories enum
CREATE TYPE public.document_category AS ENUM ('sop', 'aturan', 'keputusan', 'panduan', 'lainnya');

-- Create document status enum  
CREATE TYPE public.document_status AS ENUM ('draft', 'published', 'archived');

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category document_category NOT NULL DEFAULT 'lainnya',
  status document_status NOT NULL DEFAULT 'draft',
  public_slug TEXT UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document versions table for history tracking
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  change_notes TEXT,
  edited_by UUID REFERENCES auth.users(id),
  edited_by_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_id, version_number)
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for documents
CREATE POLICY "Authenticated users can view all documents"
ON public.documents FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public documents accessible via slug"
ON public.documents FOR SELECT
USING (is_public = true AND public_slug IS NOT NULL);

CREATE POLICY "Admins can manage documents"
ON public.documents FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS policies for document_versions
CREATE POLICY "Authenticated users can view versions"
ON public.document_versions FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public can view versions of public documents"
ON public.document_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d 
    WHERE d.id = document_id AND d.is_public = true
  )
);

CREATE POLICY "Admins can manage versions"
ON public.document_versions FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique public slug
CREATE OR REPLACE FUNCTION public.generate_public_slug()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(8), 'hex');
END;
$$;