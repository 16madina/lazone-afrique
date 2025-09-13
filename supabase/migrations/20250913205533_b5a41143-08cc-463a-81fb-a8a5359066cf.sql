-- Supprimer complètement toutes les politiques RLS problématiques sur conversation_participants
DROP POLICY IF EXISTS "Users can add participants to conversations they're in" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.conversation_participants;

-- Créer une fonction SECURITY DEFINER pour vérifier si un utilisateur peut ajouter des participants
CREATE OR REPLACE FUNCTION public.can_user_add_participant(target_conversation_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- L'utilisateur peut s'ajouter lui-même ou ajouter d'autres s'il est déjà dans la conversation
  SELECT 
    auth.uid() = target_user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp 
      WHERE cp.conversation_id = target_conversation_id 
      AND cp.user_id = auth.uid()
    )
$$;

-- Créer une fonction SECURITY DEFINER pour vérifier si un utilisateur peut voir les participants
CREATE OR REPLACE FUNCTION public.can_user_view_participants(target_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = target_conversation_id 
    AND cp.user_id = auth.uid()
  )
$$;

-- Créer de nouvelles politiques RLS simples utilisant les fonctions SECURITY DEFINER
CREATE POLICY "Users can add participants safely" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK (public.can_user_add_participant(conversation_id, user_id));

CREATE POLICY "Users can view participants safely" 
ON public.conversation_participants 
FOR SELECT 
USING (public.can_user_view_participants(conversation_id));

CREATE POLICY "Users can update their own participation safely" 
ON public.conversation_participants 
FOR UPDATE 
USING (auth.uid() = user_id);