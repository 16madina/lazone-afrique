-- Create storage buckets for property media
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('property-photos', 'property-photos', true),
  ('property-videos', 'property-videos', true);

-- Add media fields to listings table
ALTER TABLE public.listings 
ADD COLUMN photos TEXT[], -- Array of photo URLs
ADD COLUMN video_url TEXT; -- Single video URL

-- Storage policies for property photos
CREATE POLICY "Property photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'property-photos');

CREATE POLICY "Users can upload their own property photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'property-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own property photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'property-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own property photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'property-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for property videos
CREATE POLICY "Property videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'property-videos');

CREATE POLICY "Users can upload their own property videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'property-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own property videos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'property-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own property videos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'property-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);