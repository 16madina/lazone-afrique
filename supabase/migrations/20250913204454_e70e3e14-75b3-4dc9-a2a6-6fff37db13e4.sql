-- Corriger la politique RLS qui cause la récursion infinie
DROP POLICY IF EXISTS "Users can add participants to conversations they're in" ON public.conversation_participants;

-- Créer une politique corrigée pour permettre l'ajout de participants
CREATE POLICY "Users can add participants to conversations they're in" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK (
  -- L'utilisateur peut s'ajouter lui-même
  auth.uid() = user_id 
  OR 
  -- Ou l'utilisateur est déjà participant d'une conversation existante et peut ajouter d'autres
  EXISTS (
    SELECT 1 FROM public.conversation_participants existing_cp 
    WHERE existing_cp.conversation_id = conversation_participants.conversation_id 
    AND existing_cp.user_id = auth.uid()
  )
);

-- Ajouter une foreign key manquante entre conversation_participants et profiles
ALTER TABLE public.conversation_participants 
ADD CONSTRAINT fk_conversation_participants_profiles 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

-- Ajouter une foreign key entre conversations et listings pour éviter les erreurs
ALTER TABLE public.conversations 
ADD CONSTRAINT fk_conversations_listings 
FOREIGN KEY (property_id) REFERENCES public.listings(id);