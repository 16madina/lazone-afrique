-- Add approval status to sponsorship transactions
ALTER TABLE public.sponsorship_transactions 
ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'pending';

-- Add admin notes column
ALTER TABLE public.sponsorship_transactions
ADD COLUMN admin_notes TEXT;

-- Add approved_by column to track which admin approved
ALTER TABLE public.sponsorship_transactions
ADD COLUMN approved_by UUID REFERENCES auth.users(id);

-- Add approval_date column
ALTER TABLE public.sponsorship_transactions
ADD COLUMN approval_date TIMESTAMP WITH TIME ZONE;

-- Create admin notifications table
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN DEFAULT FALSE
);

-- Enable RLS on admin notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for admin notifications - only admins can view
CREATE POLICY "Only admins can view notifications" 
ON public.admin_notifications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admin_roles 
  WHERE user_id = auth.uid()
));

-- Policy for admin notifications - only admins can update (mark as read)
CREATE POLICY "Only admins can update notifications" 
ON public.admin_notifications 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.admin_roles 
  WHERE user_id = auth.uid()
));

-- Create function to create admin notification
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT,
  related_transaction_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, related_id)
  VALUES (notification_type, notification_title, notification_message, related_transaction_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Create trigger function for new sponsorship requests
CREATE OR REPLACE FUNCTION public.notify_admin_new_sponsorship()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  listing_title TEXT;
  user_name TEXT;
  package_name TEXT;
BEGIN
  -- Get listing title
  SELECT title INTO listing_title
  FROM public.listings
  WHERE id = NEW.listing_id;
  
  -- Get user name
  SELECT COALESCE(full_name, email) INTO user_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;
  
  -- Get package name
  SELECT name INTO package_name
  FROM public.sponsorship_packages
  WHERE id = NEW.package_id;
  
  -- Create notification for admins
  PERFORM public.create_admin_notification(
    'sponsorship_request',
    'Nouvelle demande de sponsoring',
    format('L''utilisateur %s souhaite sponsoriser l''annonce "%s" avec le package "%s" (montant: %s USD)',
           COALESCE(user_name, 'Inconnu'),
           COALESCE(listing_title, 'Annonce inconnue'),
           COALESCE(package_name, 'Package inconnu'),
           NEW.amount_paid
    ),
    NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new sponsorship transactions
CREATE TRIGGER trigger_notify_admin_new_sponsorship
  AFTER INSERT ON public.sponsorship_transactions
  FOR EACH ROW
  WHEN (NEW.approval_status = 'pending')
  EXECUTE FUNCTION public.notify_admin_new_sponsorship();