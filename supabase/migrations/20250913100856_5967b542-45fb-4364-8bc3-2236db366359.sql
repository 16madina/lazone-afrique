-- Create policy for anonymous and authenticated users to read published listings
CREATE POLICY "read_published_listings"
ON public.listings 
FOR SELECT 
TO anon, authenticated
USING (status = 'published');