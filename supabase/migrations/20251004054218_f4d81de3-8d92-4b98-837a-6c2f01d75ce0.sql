-- Politique pour permettre l'upload des images démo dans property-photos/demo/
-- Accessible à tous les utilisateurs authentifiés

CREATE POLICY "Allow authenticated users to upload demo images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-photos' 
  AND (storage.foldername(name))[1] = 'demo'
);