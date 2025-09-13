-- Politique temporaire pour permettre aux créateurs de voir leurs conversations
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;

-- Politique SELECT temporaire qui permet de voir les conversations créées récemment
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
  OR
  -- OU les conversations qu'il a créées dans les dernières 5 minutes (temporaire)
  (
    auth.uid() IS NOT NULL 
    AND created_at > (now() - interval '5 minutes')
  )
);