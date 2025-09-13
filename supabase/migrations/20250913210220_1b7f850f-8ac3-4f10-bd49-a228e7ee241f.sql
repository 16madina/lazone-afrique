-- Supprimer et recréer la politique INSERT pour les conversations
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Créer une nouvelle politique INSERT plus explicite
CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (
  -- L'utilisateur doit être authentifié
  auth.uid() IS NOT NULL
);

-- S'assurer que la politique SELECT permet de voir les conversations créées
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;

CREATE POLICY "Users can view conversations they participate in" 
ON public.conversations 
FOR SELECT 
USING (
  -- L'utilisateur peut voir les conversations où il est participant
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = conversations.id 
    AND cp.user_id = auth.uid()
  )
);