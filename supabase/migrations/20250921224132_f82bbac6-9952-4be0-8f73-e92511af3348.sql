-- Corriger le problème d'autorisation admin en mettant à jour le granted_by
-- On va utiliser NULL ou un autre admin valide pour éviter le problème de self-granted admin
UPDATE admin_roles 
SET granted_by = NULL 
WHERE user_id = '89b5a236-2e09-4484-b414-6262a0c7b36a' 
  AND granted_by = '89b5a236-2e09-4484-b414-6262a0c7b36a';

-- Optionnel : Ajouter une contrainte pour empêcher les futurs self-granted admins
-- ALTER TABLE admin_roles ADD CONSTRAINT no_self_granted CHECK (user_id != granted_by OR granted_by IS NULL);