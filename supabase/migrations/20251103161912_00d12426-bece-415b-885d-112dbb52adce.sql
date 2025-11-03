-- Add neighborhood column to listings table for precise geolocation
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS neighborhood TEXT;