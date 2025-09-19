import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecureProfiles } from '@/hooks/useSecureProfiles';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url?: string;
  created_at: string;
  updated_at: string;
  sender_profile?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  title?: string;
  property_id?: string;
  created_at: string;
  updated_at: string;
  participants: Array<{
    user_id: string;
    last_read_at?: string;
    profile: {
      first_name?: string;
      last_name?: string;
      full_name?: string;
      avatar_url?: string;
    };
  }>;
  latest_message?: Message;
  unread_count: number;
  property?: {
    title: string;
  };
}

export const useRealTimeMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getPublicProfile } = useSecureProfiles();

  // Fetch conversations for the current user
  const fetchConversations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          property_id,
          created_at,
          updated_at,
          conversation_participants!conversation_participants_conversation_id_fkey!inner (
            user_id,
            last_read_at
          ),
          listings!conversations_property_id_fkey (
            title
          )
        `)
        .eq('conversation_participants.user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Transform the data and get latest messages and unread counts
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv: any) => {
          // Get latest message
          // Get latest message and sender profile separately
          const { data: latestMessageData } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          let latestMessage = undefined;
          if (latestMessageData?.[0]) {
          const senderProfile = await getPublicProfile(latestMessageData[0].sender_id);

            latestMessage = {
              ...latestMessageData[0],
              sender_profile: senderProfile
            };
          }

          // Get unread count (messages after user's last_read_at)
          const userParticipant = conv.conversation_participants.find(
            (p: any) => p.user_id === user.id
          );
          
          let unreadCount = 0;
          if (userParticipant?.last_read_at) {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .gt('created_at', userParticipant.last_read_at);
            
            unreadCount = count || 0;
          } else {
            // If no last_read_at, count all messages
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id);
            
            unreadCount = count || 0;
          }

          return {
            id: conv.id,
            title: conv.title,
            property_id: conv.property_id,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            participants: await Promise.all(conv.conversation_participants.map(async (p: any) => {
              const profile = await getPublicProfile(p.user_id);
              return {
                user_id: p.user_id,
                last_read_at: p.last_read_at,
                profile: profile
              };
            })),
            latest_message: latestMessage,
            unread_count: unreadCount,
            property: conv.listings ? { title: conv.listings.title } : undefined
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, getPublicProfile]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Get sender profiles for all messages
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (msg: any) => {
          const senderProfile = await getPublicProfile(msg.sender_id);

          return {
            ...msg,
            sender_profile: senderProfile
          };
        })
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    }
  }, [toast, getPublicProfile]);

  // Send a new message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text'
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer le message",
          variant: "destructive",
        });
        return;
      }

      // Update last_read_at for the sender
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Mark conversation as read
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking conversation as read:', error);
        return;
      }

      // Refresh conversations to update unread counts
      await fetchConversations();
    } catch (error) {
      console.error('Error in markConversationAsRead:', error);
    }
  }, [fetchConversations]);

  // Create a new conversation with atomic transaction approach
  const createConversation = useCallback(async (
    participantIds: string[], 
    propertyId?: string, 
    title?: string
  ) => {
    try {
      console.log('🚀 Starting atomic conversation creation with:', { participantIds, propertyId, title });
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Current user:', user?.id);
      
      if (!user) {
        console.error('❌ No authenticated user found');
        return null;
      }

      // Prepare all participant IDs including the current user
      const allParticipantIds = [...new Set([user.id, ...participantIds])];
      console.log('👥 All participants will be:', allParticipantIds);

      // Create the conversation first
      console.log('📝 Creating conversation...');
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title,
          property_id: propertyId
        })
        .select()
        .single();

      if (convError) {
        console.error('❌ Error creating conversation:', convError);
        toast({
          title: "Erreur",
          description: `Erreur lors de la création: ${convError.message}`,
          variant: "destructive",
        });
        return null;
      }

      console.log('✅ Conversation created with ID:', conversation.id);

      // Immediately add the current user as the first participant
      // This ensures they can see the conversation for the SELECT policy
      console.log('👤 Adding current user as participant...');
      const { error: currentUserError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: user.id
        });

      if (currentUserError) {
        console.error('❌ Error adding current user as participant:', currentUserError);
        toast({
          title: "Erreur",
          description: `Erreur lors de l'ajout de l'utilisateur: ${currentUserError.message}`,
          variant: "destructive",
        });
        return null;
      }

      console.log('✅ Current user added as participant');

      // Now add other participants if any
      const otherParticipantIds = participantIds.filter(id => id !== user.id);
      if (otherParticipantIds.length > 0) {
        console.log('👥 Adding other participants:', otherParticipantIds);
        
        const otherParticipantsData = otherParticipantIds.map(userId => ({
          conversation_id: conversation.id,
          user_id: userId
        }));

        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .insert(otherParticipantsData);

        if (participantsError) {
          console.error('❌ Error adding other participants:', participantsError);
          toast({
            title: "Attention",
            description: `Conversation créée mais erreur ajout participants: ${participantsError.message}`,
            variant: "destructive",
          });
          // Don't return null here, conversation was created successfully
        } else {
          console.log('✅ All other participants added successfully');
        }
      }

      // Refresh conversations to show the new one
      await fetchConversations();
      console.log('🎉 Conversation creation completed successfully:', conversation.id);
      return conversation.id;
      
    } catch (error) {
      console.error('💥 Unexpected error in createConversation:', error);
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la création",
        variant: "destructive",
      });
      return null;
    }
  }, [fetchConversations, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    let messagesChannel: any;
    let conversationsChannel: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to new messages
      messagesChannel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            console.log('Message change:', payload);
            
            if (payload.eventType === 'INSERT') {
              const newMessage = payload.new as Message;
              
              // If this message is for the selected conversation, add it to messages
              if (newMessage.conversation_id === selectedConversationId) {
                fetchMessages(selectedConversationId);
              }
              
              // Always refresh conversations to update latest message and unread counts
              fetchConversations();
            }
          }
        )
        .subscribe();

      // Subscribe to conversation changes
      conversationsChannel = supabase
        .channel('conversations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations'
          },
          () => {
            fetchConversations();
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (messagesChannel) supabase.removeChannel(messagesChannel);
      if (conversationsChannel) supabase.removeChannel(conversationsChannel);
    };
  }, [selectedConversationId, fetchMessages, fetchConversations]);

  // Initial data load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId, fetchMessages]);

  return {
    conversations,
    messages,
    selectedConversationId,
    setSelectedConversationId,
    loading,
    sendMessage,
    createConversation,
    markConversationAsRead,
    refreshConversations: fetchConversations,
    refreshMessages: () => selectedConversationId && fetchMessages(selectedConversationId)
  };
};