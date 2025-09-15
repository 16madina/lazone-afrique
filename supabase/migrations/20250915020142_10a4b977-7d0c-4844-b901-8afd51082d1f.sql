-- Create only the missing public read policy for avatars
CREATE POLICY "Avatar images are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');