
-- Mise à jour des annonces sans images avec les images générées
UPDATE listings 
SET photos = ARRAY['/src/assets/villa-cocody-luxury.jpg']
WHERE id = '6a0917d2-6596-4123-997e-92969838108b';

UPDATE listings 
SET photos = ARRAY['/src/assets/appartement-plateau-standing.jpg']
WHERE id = '335f6a3c-71d4-447c-9530-6be17467ba78';

UPDATE listings 
SET photos = ARRAY['/src/assets/terrain-bingerville.jpg']
WHERE id = '38f37759-0ceb-4146-a0f9-7dc9026d6527';

UPDATE listings 
SET photos = ARRAY['/src/assets/villa-riviera-piscine.jpg']
WHERE id = '376f1dd3-c661-4f1e-b8ee-061422d1472e';

UPDATE listings 
SET photos = ARRAY['/src/assets/duplex-marcory.jpg']
WHERE id = '989c4b6a-acf2-41ce-97eb-52c996faa99c';
