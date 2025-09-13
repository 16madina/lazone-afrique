-- Update existing listings to have uppercase country codes
UPDATE public.listings 
SET country_code = UPPER(country_code) 
WHERE country_code = 'ci';