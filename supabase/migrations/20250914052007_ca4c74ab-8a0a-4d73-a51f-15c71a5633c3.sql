-- Ajouter de nouveaux champs à la table listings pour stocker toutes les informations détaillées

-- Ajouter les nouveaux champs
ALTER TABLE public.listings 
ADD COLUMN transaction_type text,
ADD COLUMN property_type text,
ADD COLUMN bedrooms integer,
ADD COLUMN bathrooms integer,
ADD COLUMN surface_area numeric,
ADD COLUMN floor_number text,
ADD COLUMN land_type text,
ADD COLUMN land_shape text,
ADD COLUMN property_documents text[],
ADD COLUMN features text[],
ADD COLUMN is_negotiable boolean DEFAULT false;