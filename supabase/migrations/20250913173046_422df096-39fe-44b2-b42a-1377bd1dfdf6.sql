-- First commit the transaction to add admin to enum safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = 'public.user_type'::regtype) THEN
        ALTER TYPE public.user_type ADD VALUE 'admin';
    END IF;
END$$;

-- Create user_actions table to track admin actions
CREATE TABLE IF NOT EXISTS public.user_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('ban_user', 'unban_user', 'delete_listing', 'send_email', 'send_sms')),
  target_user_id UUID,
  target_listing_id UUID,
  reason TEXT,
  message TEXT,
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