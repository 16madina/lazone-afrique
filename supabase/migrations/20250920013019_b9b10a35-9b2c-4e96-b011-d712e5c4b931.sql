-- Permettre aux admins de voir tous les utilisateurs
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

-- Permettre aux admins de voir tous les listings  
CREATE POLICY "Admins can view all listings" 
ON public.listings 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));