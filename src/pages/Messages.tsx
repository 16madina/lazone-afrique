import { useState } from "react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, MessageCircle, Phone, Video, MoreVertical, Check, CheckCheck, Calendar } from "lucide-react";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppointmentManager } from "@/components/AppointmentManager";

const Messages = () => {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'appointments'>('messages');
  const { user } = useAuth();

  const {
    conversations,
    messages,
    selectedConversationId,
    setSelectedConversationId,
    loading,
    markConversationAsRead
  } = useRealTimeMessages();

  // Filter conversations based on unread filter
  const filteredConversations = showUnreadOnly 
    ? conversations.filter(conv => conv.unread_count > 0)
    : conversations;

  // Get selected conversation
  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);

  // Send message function
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !user || isSending) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Erreur lors de l\'envoi du message');
        return;
      }

      setNewMessage("");
      toast.success('Message envoyé');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Get display name for conversation participant (not current user)
  const getConversationDisplayName = (conversation: any) => {
    if (conversation.title) return conversation.title.replace(/^À propos de:\s*/i, "");
    
    const otherParticipant = conversation.participants.find((p: any) => p.user_id !== user?.id);
    if (otherParticipant?.profile) {
      return otherParticipant.profile.full_name || 
             `${otherParticipant.profile.first_name || ''} ${otherParticipant.profile.last_name || ''}`.trim() ||
             'Utilisateur';
    }
    return 'Conversation';
  };

  // Get avatar image URL for conversation
  const getConversationAvatarUrl = (conversation: any) => {
    const otherParticipant = conversation.participants.find((p: any) => p.user_id !== user?.id);
    const avatarUrl = otherParticipant?.profile?.avatar_url;
    console.log('Avatar URL for conversation:', conversation.id, 'URL:', avatarUrl);
    console.log('Other participant:', otherParticipant);
    return avatarUrl;
  };

  // Get avatar initials for conversation
  const getConversationAvatar = (conversation: any) => {
    const displayName = getConversationDisplayName(conversation);
    const words = displayName.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  // Format message time with smart display
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Si aujourd'hui, afficher l'heure
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si hier
    if (diffDays === 1) {
      return 'Hier';
    }
    
    // Si dans la semaine, afficher le jour
    if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    }
    
    // Sinon afficher jj/mm
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  // Check if message is from current user
  const isMyMessage = (senderId: string) => senderId === user?.id;

  // Check if participant is online (mock for now)
  const isParticipantOnline = (conversation: any) => {
    // For now, randomly return true/false. In a real app, you'd track this properly
    return Math.random() > 0.5;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des conversations...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connexion requise</h3>
            <p className="text-muted-foreground">Vous devez être connecté pour accéder aux messages.</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-muted/30">
      <Header />
      
      {/* Tab Navigation */}
      <div className="border-b border-border bg-background glass pt-16">
        <div className="flex">
          <Button
            variant={activeTab === 'messages' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('messages')}
            className="flex-1 rounded-none border-r"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Messages
          </Button>
          <Button
            variant={activeTab === 'appointments' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('appointments')}
            className="flex-1 rounded-none"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Rendez-vous
          </Button>
        </div>
      </div>
      
      {activeTab === 'appointments' ? (
        <div className="flex-1 overflow-hidden p-4">
          <AppointmentManager className="h-full" />
        </div>
      ) : (
        <main className="flex flex-1 overflow-hidden">
          {/* Conversations List */}
          <div className={`
            ${selectedConversationId ? 'hidden md:flex' : 'flex'} 
            flex-col w-full md:w-1/3 bg-background
          `}>
            {/* Header */}
            <div className="p-6 border-b border-border/50">
              <h1 className="text-3xl font-display font-bold text-foreground mb-4">Messages</h1>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Rechercher..." 
                  className="pl-10 glass border-0"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {showUnreadOnly ? "Aucun message non lu" : "Aucune conversation"}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversationId(conversation.id);
                      if (conversation.unread_count > 0) {
                        markConversationAsRead(conversation.id);
                      }
                    }}
                    className={`
                      glass-card p-4 cursor-pointer transition-all duration-300 ease-spring hover:shadow-elevation-3 hover:scale-[1.01]
                      ${selectedConversationId === conversation.id ? 'shadow-elevation-2 scale-[1.01]' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-14 h-14 ring-2 ring-background shadow-lg">
                          <AvatarImage 
                            src={conversation.participants.find((p: any) => p.user_id !== user?.id)?.profile?.avatar_url || ''} 
                            alt={getConversationDisplayName(conversation)}
                          />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                            {getConversationAvatar(conversation)}
                          </AvatarFallback>
                        </Avatar>
                        {isParticipantOnline(conversation) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-md" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-display font-bold text-base text-foreground">
                            {getConversationDisplayName(conversation)}
                          </h3>
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {formatMessageTime(conversation.updated_at)}
                          </span>
                        </div>

                        {/* Property Title */}
                        <p className="text-sm font-medium text-foreground/90 mb-2 line-clamp-1">
                          {conversation.property?.title || 'Conversation'}
                        </p>

                        {/* Last Message */}
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {conversation.latest_message?.content || "Commencer la conversation..."}
                        </p>

                        {/* Badge if unread */}
                        {conversation.unread_count > 0 && (
                          <div className="mt-2">
                            <Badge className="bg-primary text-primary-foreground shadow-md">
                              {conversation.unread_count} nouveau{conversation.unread_count > 1 ? 'x' : ''}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Property Thumbnail */}
                      {(conversation.property as any)?.image && (
                        <div className="flex-shrink-0 ml-2">
                          <img 
                            src={(conversation.property as any).image} 
                            alt={conversation.property.title}
                            className="w-16 h-16 rounded-lg object-cover shadow-md ring-1 ring-border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedConversationId && selectedConversation ? (
            <div className={`
              ${selectedConversationId ? 'flex' : 'hidden md:flex'} 
              flex-col flex-1
            `}>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-background/95 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedConversationId(null)}
                    className="md:hidden"
                  >
                    ←
                  </Button>
                  
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      {selectedConversation.participants.find((p: any) => p.user_id !== user?.id)?.profile?.avatar_url ? (
                        <AvatarImage 
                          src={selectedConversation.participants.find((p: any) => p.user_id !== user?.id)?.profile?.avatar_url} 
                          alt={getConversationDisplayName(selectedConversation)}
                        />
                      ) : null}
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        {getConversationAvatar(selectedConversation)}
                      </AvatarFallback>
                    </Avatar>
                    {isParticipantOnline(selectedConversation) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-background" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {getConversationDisplayName(selectedConversation)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isParticipantOnline(selectedConversation) ? 'En ligne' : 'Hors ligne'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      console.log('Appel vocal');
                      // Ici on peut ajouter la logique d'appel
                    }}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      console.log('Appel vidéo');
                      // Ici on peut ajouter la logique d'appel vidéo
                    }}
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Property Context */}
              {selectedConversation.property && (
                <Card className="mt-3 animate-slide-up">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      <Badge variant="outline">{selectedConversation.property.title}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun message dans cette conversation</p>
                  <p className="text-sm text-muted-foreground">Envoyez le premier message !</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`
                      flex animate-fade-in gap-3
                      ${isMyMessage(msg.sender_id) ? 'justify-end' : 'justify-start'}
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Avatar pour les messages reçus */}
                    {!isMyMessage(msg.sender_id) && (
                      <div className="flex-shrink-0 mt-auto mb-1">
                        <Avatar className="w-8 h-8">
                          {msg.sender_profile?.avatar_url ? (
                            <AvatarImage 
                              src={msg.sender_profile.avatar_url} 
                              alt={msg.sender_profile?.full_name || 'Avatar'}
                            />
                          ) : null}
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                            {msg.sender_profile?.full_name?.substring(0, 2)?.toUpperCase() ||
                             `${msg.sender_profile?.first_name?.[0] || ''}${msg.sender_profile?.last_name?.[0] || ''}`.toUpperCase() ||
                             'U'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}

                    <div className="flex flex-col">
                      {/* Nom de l'expéditeur pour les messages reçus */}
                      {!isMyMessage(msg.sender_id) && (
                        <p className="text-xs text-muted-foreground mb-1 ml-2">
                          {msg.sender_profile?.full_name || 
                           `${msg.sender_profile?.first_name || ''} ${msg.sender_profile?.last_name || ''}`.trim() ||
                           'Utilisateur'}
                        </p>
                      )}

                      <div className={`
                        max-w-[85%] px-3 py-2 rounded-2xl break-words
                        ${isMyMessage(msg.sender_id)
                          ? 'bg-gradient-primary text-primary-foreground rounded-br-md' 
                          : 'bg-muted text-foreground rounded-bl-md'
                        }
                      `}>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`
                            text-xs 
                            ${isMyMessage(msg.sender_id) ? 'text-primary-foreground/70' : 'text-muted-foreground'}
                          `}>
                            {formatMessageTime(msg.created_at)}
                          </p>
                          {isMyMessage(msg.sender_id) && (
                            <div className="ml-2">
                              <CheckCheck className="w-3 h-3 text-primary-foreground/50" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-6 pb-24 md:pb-6 border-t border-border bg-background/95 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Tapez votre message..."
                    className="min-h-[44px] border border-border/50 bg-background focus:bg-background focus:border-primary"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSending}
                  />
                </div>
                <Button 
                  size="icon" 
                  className="shrink-0 h-[44px] w-[44px]"
                  onClick={sendMessage}
                  disabled={isSending || !newMessage.trim()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          ) : (
            /* Empty State */
            <div className="hidden md:flex flex-1 items-center justify-center pb-20 md:pb-0">
              <div className="text-center space-y-4 animate-fade-in">
                <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Sélectionnez une conversation</h3>
                  <p className="text-muted-foreground">
                    Choisissez une conversation pour commencer à discuter
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default Messages;