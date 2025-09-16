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
import { Search, MessageCircle, Phone, Video, MoreVertical, Check, CheckCheck } from "lucide-react";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";
import { useAuth } from "@/contexts/AuthContext";

const Messages = () => {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
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

  // Get display name for conversation participant (not current user)
  const getConversationDisplayName = (conversation: any) => {
    if (conversation.title) return conversation.title;
    
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

  // Format message time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <main className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className={`
          ${selectedConversationId ? 'hidden md:flex' : 'flex'} 
          flex-col w-full md:w-1/3 border-r border-border
        `}>
          {/* Search and Filters */}
          <div className="p-4 border-b border-border">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Rechercher une conversation..." 
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={!showUnreadOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowUnreadOnly(false)}
              >
                Tous
              </Button>
              <Button 
                variant={showUnreadOnly ? "default" : "outline"}
                size="sm" 
                onClick={() => setShowUnreadOnly(true)}
              >
                Non lus
              </Button>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
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
                    // Marquer la conversation comme lue
                    if (conversation.unread_count > 0) {
                      markConversationAsRead(conversation.id);
                    }
                  }}
                  className={`
                    p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50
                    ${selectedConversationId === conversation.id ? 'bg-muted' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                     <div className="relative">
                       <Avatar className="w-12 h-12">
                         <AvatarImage 
                           src={getConversationAvatarUrl(conversation)} 
                           alt={getConversationDisplayName(conversation)}
                           onError={(e) => {
                             console.log('Avatar failed to load:', getConversationAvatarUrl(conversation));
                           }}
                         />
                         <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                           {getConversationAvatar(conversation)}
                         </AvatarFallback>
                       </Avatar>
                      {isParticipantOnline(conversation) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-background" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">
                          {getConversationDisplayName(conversation)}
                        </h3>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatMessageTime(conversation.updated_at)}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conversation.latest_message?.content || "Aucun message"}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {conversation.property?.title || 'Conversation'}
                        </Badge>
                        {conversation.unread_count > 0 && (
                          <Badge className="bg-primary text-primary-foreground">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
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
                      <AvatarImage 
                        src={getConversationAvatarUrl(selectedConversation)} 
                        alt={getConversationDisplayName(selectedConversation)}
                      />
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
                      <span>Discussion à propos de: </span>
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
                          <AvatarImage 
                            src={msg.sender_profile?.avatar_url} 
                            alt={msg.sender_profile?.full_name || 'Avatar'}
                          />
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
                        max-w-[70%] px-4 py-2 rounded-2xl
                        ${isMyMessage(msg.sender_id)
                          ? 'bg-gradient-primary text-primary-foreground rounded-br-md' 
                          : 'bg-muted text-foreground rounded-bl-md'
                        }
                      `}>
                        <p className="text-sm">{msg.content}</p>
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


      <BottomNavigation />
    </div>
  );
};

export default Messages;