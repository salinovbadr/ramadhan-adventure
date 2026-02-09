-- Make document-attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'document-attachments';

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view attachments" ON storage.objects;

-- Create policy for authenticated users to view attachments
CREATE POLICY "Authenticated users can view attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'document-attachments' 
  AND auth.uid() IS NOT NULL
);