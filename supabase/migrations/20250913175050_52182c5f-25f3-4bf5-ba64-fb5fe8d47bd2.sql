-- Add current user as admin
INSERT INTO public.admin_roles (user_id, granted_by) 
VALUES ('89b5a236-2e09-4484-b414-6262a0c7b36a', '89b5a236-2e09-4484-b414-6262a0c7b36a')
ON CONFLICT (user_id) DO NOTHING;