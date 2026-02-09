-- Create storage bucket for document attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('document-attachments', 'document-attachments', true);

-- Storage policies for document attachments
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'document-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'document-attachments');

CREATE POLICY "Admins can delete attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'document-attachments' AND has_role(auth.uid(), 'admin'));

-- Add attachments column to documents table (JSON array to store file references)
ALTER TABLE public.documents ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;

-- Create FAQ table for documents
CREATE TABLE public.document_faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on FAQ table
ALTER TABLE public.document_faqs ENABLE ROW LEVEL SECURITY;

-- RLS policies for FAQ
CREATE POLICY "Authenticated users can view FAQs"
ON public.document_faqs FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage FAQs"
ON public.document_faqs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view FAQs of public documents"
ON public.document_faqs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM documents d
  WHERE d.id = document_faqs.document_id
  AND d.is_public = true
));