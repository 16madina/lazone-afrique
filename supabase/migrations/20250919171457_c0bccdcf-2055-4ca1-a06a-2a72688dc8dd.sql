-- Ajouter une colonne pour la devise dans les listings
ALTER TABLE listings ADD COLUMN currency_code TEXT NOT NULL DEFAULT 'XOF';

-- Ajouter une colonne pour indiquer que le prix est en devise locale
ALTER TABLE listings ADD COLUMN price_currency TEXT NOT NULL DEFAULT 'XOF';

-- Créer un index pour les recherches par devise
CREATE INDEX idx_listings_currency ON listings(currency_code);

-- Mettre à jour les listings existants pour utiliser XOF (FCFA) par défaut
UPDATE listings SET currency_code = 'XOF', price_currency = 'XOF' WHERE currency_code IS NULL;