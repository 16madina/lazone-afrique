-- Create admin_roles table instead of modifying enum
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

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

-- Enable RLS on tables
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- Admin roles policies
CREATE POLICY "Only admins can view admin roles" 
ON public.admin_roles 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
);

-- User actions policies
CREATE POLICY "Only admins can view user actions" 
ON public.user_actions 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Only admins can insert user actions" 
ON public.user_actions 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
);

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = user_uuid
  )
$$;