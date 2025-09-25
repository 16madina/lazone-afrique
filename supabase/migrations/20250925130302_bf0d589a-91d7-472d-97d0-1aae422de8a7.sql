-- Create appointments table for property visits
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  visitor_user_id UUID NOT NULL,
  owner_user_id UUID NOT NULL,
  requested_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  visit_type TEXT NOT NULL DEFAULT 'physical',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  CONSTRAINT valid_visit_type CHECK (visit_type IN ('physical', 'virtual', 'video_call'))
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create appointment requests"
ON public.appointments FOR INSERT
WITH CHECK (auth.uid() = visitor_user_id);

CREATE POLICY "Users can view their own appointments"
ON public.appointments FOR SELECT
USING (auth.uid() = visitor_user_id OR auth.uid() = owner_user_id);

CREATE POLICY "Property owners can update appointment status"
ON public.appointments FOR UPDATE
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

-- Create virtual tours table
CREATE TABLE public.virtual_tours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  tour_type TEXT NOT NULL DEFAULT '360_photos',
  tour_data JSONB NOT NULL DEFAULT '{}',
  title TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_tour_type CHECK (tour_type IN ('360_photos', 'video_tour', 'interactive_3d'))
);

-- Enable RLS
ALTER TABLE public.virtual_tours ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active virtual tours"
ON public.virtual_tours FOR SELECT
USING (is_active = true);

CREATE POLICY "Property owners can manage their virtual tours"
ON public.virtual_tours FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.listings l
  WHERE l.id = virtual_tours.listing_id AND l.user_id = auth.uid()
));

-- Create geospatial search views and functions
CREATE OR REPLACE FUNCTION public.search_listings_by_location(
  search_lat NUMERIC,
  search_lng NUMERIC,
  radius_km NUMERIC DEFAULT 10,
  property_types TEXT[] DEFAULT NULL,
  min_price NUMERIC DEFAULT NULL,
  max_price NUMERIC DEFAULT NULL,
  transaction_type_filter TEXT DEFAULT NULL
) RETURNS TABLE(
  id UUID,
  title TEXT,
  price NUMERIC,
  lat NUMERIC,
  lng NUMERIC,
  city TEXT,
  property_type TEXT,
  transaction_type TEXT,
  distance_km NUMERIC,
  photos TEXT[],
  bedrooms INTEGER,
  bathrooms INTEGER
) LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    l.id,
    l.title,
    l.price,
    l.lat,
    l.lng,
    l.city,
    l.property_type,
    l.transaction_type,
    -- Calculate distance using Haversine formula
    (6371 * acos(cos(radians(search_lat)) * cos(radians(l.lat)) * 
     cos(radians(l.lng) - radians(search_lng)) + 
     sin(radians(search_lat)) * sin(radians(l.lat)))) as distance_km,
    l.photos,
    l.bedrooms,
    l.bathrooms
  FROM public.listings l
  WHERE l.status = 'published'
    AND (property_types IS NULL OR l.property_type = ANY(property_types))
    AND (min_price IS NULL OR l.price >= min_price)
    AND (max_price IS NULL OR l.price <= max_price)
    AND (transaction_type_filter IS NULL OR l.transaction_type = transaction_type_filter)
    AND (6371 * acos(cos(radians(search_lat)) * cos(radians(l.lat)) * 
         cos(radians(l.lng) - radians(search_lng)) + 
         sin(radians(search_lat)) * sin(radians(l.lat)))) <= radius_km
  ORDER BY distance_km ASC;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_virtual_tours_updated_at
BEFORE UPDATE ON public.virtual_tours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();