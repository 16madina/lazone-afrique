import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeMessages } from './useRealTimeMessages';
import { toast } from 'sonner';
import { useState } from 'react';

export const useContactActions = () => {
  const { user } = useAuth();
  const { createConversation } = useRealTimeMessages();
  const [loading, setLoading] = useState(false);

  const handlePhoneContact = (phone?: string, agentName?: string) => {
    if (!phone) {
      toast.error('Numéro de téléphone non disponible');
      return;
    }
    
    // Format phone number for tel: link
    const cleanPhone = phone.replace(/\s+/g, '');
    window.location.href = `tel:${cleanPhone}`;
    
    toast.success(`Appel en cours vers ${agentName || 'le contact'}`);
  };

  const handleMessageContact = async (
    agentUserId: string, 
    propertyId: string, 
    propertyTitle: string,
    agentName: string
  ) => {
    if (!user) {
      toast.error('Vous devez être connecté pour envoyer un message');
      return;
    }

    if (user.id === agentUserId) {
      toast.error('Vous ne pouvez pas vous contacter vous-même');
      return;
    }

    setLoading(true);
    try {
      const conversationId = await createConversation(
        [agentUserId], 
        propertyId, 
        `Concernant: ${propertyTitle}`
      );
      
      if (conversationId) {
        // Redirect to messages page with conversation
        window.location.href = `/messages?conversation=${conversationId}`;
        toast.success(`Conversation créée avec ${agentName}`);
      } else {
        toast.error('Erreur lors de la création de la conversation');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
    } finally {
      setLoading(false);
    }
  };

  return {
    handlePhoneContact,
    handleMessageContact,
    loading
  };
};