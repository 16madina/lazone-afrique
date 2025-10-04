-- Migration: Secure images in Supabase Storage
-- This migration updates listings to use Supabase Storage URLs instead of local asset paths

-- Note: The actual file uploads to Supabase Storage bucket 'property-photos' must be done manually
-- Once files are uploaded with the following structure:
--   - demo/villa-cocody-luxury.jpg
--   - demo/appartement-plateau-standing.jpg  
--   - demo/terrain-bingerville.jpg
--   - demo/villa-riviera-piscine.jpg
--   - demo/duplex-marcory.jpg
-- 
-- These URLs will be accessible at:
-- https://ldlytdqspngpvfwtpula.supabase.co/storage/v1/object/public/property-photos/demo/{filename}

-- Update listings with Supabase Storage URLs
UPDATE listings 
SET photos = ARRAY['https://ldlytdqspngpvfwtpula.supabase.co/storage/v1/object/public/property-photos/demo/villa-cocody-luxury.jpg']
WHERE id = '6a0917d2-6596-4123-997e-92969838108b';

UPDATE listings 
SET photos = ARRAY['https://ldlytdqspngpvfwtpula.supabase.co/storage/v1/object/public/property-photos/demo/appartement-plateau-standing.jpg']
WHERE id = '335f6a3c-71d4-447c-9530-6be17467ba78';

UPDATE listings 
SET photos = ARRAY['https://ldlytdqspngpvfwtpula.supabase.co/storage/v1/object/public/property-photos/demo/terrain-bingerville.jpg']
WHERE id = '38f37759-0ceb-4146-a0f9-7dc9026d6527';

UPDATE listings 
SET photos = ARRAY['https://ldlytdqspngpvfwtpula.supabase.co/storage/v1/object/public/property-photos/demo/villa-riviera-piscine.jpg']
WHERE id = '376f1dd3-c661-4f1e-b8ee-061422d1472e';

UPDATE listings 
SET photos = ARRAY['https://ldlytdqspngpvfwtpula.supabase.co/storage/v1/object/public/property-photos/demo/duplex-marcory.jpg']
WHERE id = '989c4b6a-acf2-41ce-97eb-52c996faa99c';