-- Add admin role to user_type enum
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'admin';

-- Create user_actions table to track admin actions
CREATE TABLE IF NOT EXISTS public.user_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('ban_user', 'unban_user', 'delete_listing', 'send_email', 'send_sms')),
  target_user_id UUID REFERENCES auth.users(id),
  target_listing_id UUID REFERENCES listings(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add banned status to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;

-- Enable RLS on user_actions
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage user actions
CREATE POLICY "Only admins can view user actions" 
ON public.user_actions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  )
);

CREATE POLICY "Only admins can insert user actions" 
ON public.user_actions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  )
);