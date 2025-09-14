-- Enable realtime for favorites table
ALTER TABLE public.favorites REPLICA IDENTITY FULL;

-- Add favorites table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.favorites;