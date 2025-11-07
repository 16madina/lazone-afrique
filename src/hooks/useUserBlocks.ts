import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUserBlocks = () => {
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_blocks')
        .select('blocked_id')
        .eq('blocker_id', user.id);

      if (error) throw error;

      setBlockedUsers(data?.map(b => b.blocked_id) || []);
    } catch (error) {
      console.error('Erreur chargement blocages:', error);
    }
  };

  const blockUser = async (userId: string, reason?: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: userId,
          reason: reason
        });

      if (error) throw error;

      setBlockedUsers([...blockedUsers, userId]);
      toast.success('Utilisateur bloqué avec succès');
      return true;
    } catch (error: any) {
      console.error('Erreur blocage:', error);
      toast.error('Erreur lors du blocage');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (userId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId);

      if (error) throw error;

      setBlockedUsers(blockedUsers.filter(id => id !== userId));
      toast.success('Utilisateur débloqué avec succès');
      return true;
    } catch (error: any) {
      console.error('Erreur déblocage:', error);
      toast.error('Erreur lors du déblocage');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isUserBlocked = (userId: string) => {
    return blockedUsers.includes(userId);
  };

  return { blockUser, unblockUser, isUserBlocked, blockedUsers, loading };
};