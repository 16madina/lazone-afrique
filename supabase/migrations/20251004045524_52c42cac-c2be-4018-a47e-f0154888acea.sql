
-- Mettre à jour les URLs des images pour les annonces démo avec des chemins d'assets locaux
UPDATE listings 
SET photos = ARRAY['/demo-images/villa-cocody-luxury.jpg']
WHERE title = 'Villa moderne Cocody' AND country_code = 'CI';

UPDATE listings 
SET photos = ARRAY['/demo-images/duplex-marcory.jpg']
WHERE title = 'Appartement Marcory' AND country_code = 'CI';

UPDATE listings 
SET photos = ARRAY['/demo-images/terrain-bingerville.jpg']
WHERE title = 'Terrain Bingerville' AND country_code = 'CI';
