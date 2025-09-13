-- Create listings table for property listings
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  lat DECIMAL(10,6) NOT NULL,
  lng DECIMAL(11,6) NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  image TEXT,
  city TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'CI',
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing published listings
CREATE POLICY "Published listings are viewable by everyone" 
ON public.listings 
FOR SELECT 
USING (status = 'published');

-- Create policy for users to manage their own listings
CREATE POLICY "Users can manage their own listings" 
ON public.listings 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_listings_status_country ON public.listings (status, country_code);
CREATE INDEX idx_listings_location ON public.listings (lat, lng);
CREATE INDEX idx_listings_user_id ON public.listings (user_id);

-- Add function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for listings table
ALTER TABLE public.listings REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.listings;

-- Insert some sample data for Côte d'Ivoire and other African countries
INSERT INTO public.listings (title, price, lat, lng, city, country_code, image) VALUES
('Villa moderne Cocody', 85000000, 5.3364, -4.0267, 'Abidjan', 'CI', '/placeholder.svg'),
('Appartement Marcory', 350000, 5.2669, -4.0131, 'Abidjan', 'CI', '/placeholder.svg'),
('Terrain Bingerville', 45000000, 5.3553, -3.8947, 'Bingerville', 'CI', '/placeholder.svg'),
('Villa Dakar Almadies', 120000000, 14.7392, -17.5003, 'Dakar', 'SN', '/placeholder.svg'),
('Appartement Casablanca', 2500000, 33.5731, -7.5898, 'Casablanca', 'MA', '/placeholder.svg'),
('Maison Lagos VI', 85000000, 6.4281, 3.4219, 'Lagos', 'NG', '/placeholder.svg'),
('Villa Accra East Legon', 450000, 5.6037, -0.1870, 'Accra', 'GH', '/placeholder.svg'),
('Appartement Nairobi Westlands', 12500000, -1.2676, 36.8108, 'Nairobi', 'KE', '/placeholder.svg');