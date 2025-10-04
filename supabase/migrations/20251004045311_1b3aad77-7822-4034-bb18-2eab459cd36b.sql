
-- Ajouter les images aux annonces démo
UPDATE listings 
SET photos = ARRAY[
  'https://ldlytdqspngpvfwtpula.supabase.co/storage/v1/object/public/property-photos/demo/villa-cocody-luxury.jpg'
]
WHERE title = 'Villa moderne Cocody' AND country_code = 'CI';

UPDATE listings 
SET photos = ARRAY[
  'https://ldlytdqspngpvfwtpula.supabase.co/storage/v1/object/public/property-photos/demo/duplex-marcory.jpg'
]
WHERE title = 'Appartement Marcory' AND country_code = 'CI';

UPDATE listings 
SET photos = ARRAY[
  'https://ldlytdqspngpvfwtpula.supabase.co/storage/v1/object/public/property-photos/demo/terrain-bingerville.jpg'
]
WHERE title = 'Terrain Bingerville' AND country_code = 'CI';
