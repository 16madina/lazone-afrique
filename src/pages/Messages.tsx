import { useState, useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send, Phone, Video, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";

const Messages = () => {
  const { user }: { user: User | null } = useAuth();
  const {
    conversations,
    messages,
    selectedConversationId,
    setSelectedConversationId,
    sendMessage,
    markConversationAsRead,
    loading,
  } = useRealTimeMessages();

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (selectedConversationId) {
      markConversationAsRead(selectedConversationId);
    }
  }, [selectedConversationId, markConversationAsRead]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    await sendMessage(selectedConversation.id, messageInput.trim());
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get avatar initials for conversation
  const getConversationAvatar = (conversation: any) => {
    console.log('🎭 Getting avatar for conversation:', conversation.id);
    console.log('👥 Participants:', conversation.participants);
    
    // Get the other participant (not the current user)
    const otherParticipant = conversation.participants.find((p: any) => p.user_id !== user?.id);
    console.log('👤 Other participant:', otherParticipant);

    // Use participant's name for initials, not the conversation title
    if (otherParticipant?.profile) {
      const fullName =
        otherParticipant.profile.full_name ||
        `${otherParticipant.profile.first_name || ""}${otherParticipant.profile.last_name || ""}`.trim();

      if (fullName) {
        const words = fullName.split(" ");
        if (words.length >= 2) {
          return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return fullName.substring(0, 2).toUpperCase();
      }
    }

    // Final fallback: return '?' if no participant info available
    return "??";
  };

  // Get conversation display name
  const getConversationDisplayName = (conversation: any) => {
    return conversation.title.replace(/^À propos de:\s*/i, "");
  };

  // Get conversation subtitle (participant name)
  const getConversationSubtitle = (conversation: any) => {
    console.log('📝 Getting subtitle for conversation:', conversation.id);
    const otherParticipant = conversation.participants.find((p: any) => p.user_id !== user?.id);
    console.log('👤 Subtitle participant:', otherParticipant);
    if (otherParticipant?.profile) {
      return (
        otherParticipant.profile.full_name ||
        `${otherParticipant.profile.first_name || ""} ${otherParticipant.profile.last_name || ""}`.trim() ||
        "Utilisateur"
      );
    }
    return "Utilisateur";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden pt-16 pb-20 md:pb-0">
        {/* Conversations List */}
        <div className={`${selectedConversation ? "hidden md:block" : "block"} w-full md:w-80 border-r bg-card`}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Messages</h2>
          </div>
          
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Aucune conversation
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors border-b ${
                    selectedConversationId === conversation.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>{getConversationAvatar(conversation)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold truncate">{getConversationDisplayName(conversation)}</h3>
                        {conversation.unread_count > 0 && (
                          <span className="flex-shrink-0 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {getConversationSubtitle(conversation)}
                      </p>
                      {conversation.latest_message && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.latest_message.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConversationId("")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>{getConversationAvatar(selectedConversation)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{getConversationDisplayName(selectedConversation)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getConversationSubtitle(selectedConversation)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-card">
              <div className="flex items-center gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
            <p>Sélectionnez une conversation pour commencer</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Messages;
