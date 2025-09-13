import { useState } from "react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, MessageCircle, Phone, Video, MoreVertical, Send, Smile, Paperclip, Check, CheckCheck } from "lucide-react";

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const [message, setMessage] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const conversations = [
    {
      id: "1",
      name: "Kouadio Immobilier",
      lastMessage: "La villa est toujours disponible",
      time: "14:30",
      unread: 2,
      avatar: "KI",
      online: true,
      property: "Villa Cocody"
    },
    {
      id: "2", 
      name: "Marie Adjoua",
      lastMessage: "Merci pour votre intérêt",
      time: "Hier",
      unread: 0,
      avatar: "MA",
      online: false,
      property: "Maison Marcory"
    },
    {
      id: "3",
      name: "Fofana Properties",
      lastMessage: "Le prix est négociable",
      time: "Lun",
      unread: 1,
      avatar: "FP", 
      online: true,
      property: "Terrain Bingerville"
    },
    {
      id: "4",
      name: "Urban Living",
      lastMessage: "Visite programmée demain",
      time: "Dim",
      unread: 0,
      avatar: "UL",
      online: false,
      property: "Studio Plateau"
    }
  ];

  const messages = [
    {
      id: "1",
      sender: "other",
      text: "Bonjour, je suis intéressé par votre villa à Cocody",
      time: "14:25",
      read: true
    },
    {
      id: "2", 
      sender: "me",
      text: "Bonjour ! Merci pour votre intérêt. La villa est effectivement disponible.",
      time: "14:26",
      read: true,
      delivered: true
    },
    {
      id: "3",
      sender: "other", 
      text: "Serait-il possible d'organiser une visite cette semaine ?",
      time: "14:28",
      read: true
    },
    {
      id: "4",
      sender: "me",
      text: "Bien sûr ! Je suis disponible mercredi ou vendredi après-midi. Quelle heure vous conviendrait le mieux ?",
      time: "14:29",
      read: true,
      delivered: true
    },
    {
      id: "5",
      sender: "other",
      text: "Mercredi 15h serait parfait. La villa est toujours disponible ?",
      time: "14:30",
      read: false
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you would typically add the message to your state/database
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const filteredConversations = showUnreadOnly 
    ? conversations.filter(conv => conv.unread > 0)
    : conversations;

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 flex animate-fade-in">
        {/* Conversations List */}
        <div className={`
          ${selectedChat ? 'hidden md:block' : 'block'} 
          w-full md:w-80 border-r border-border bg-background
        `}>
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher une conversation..." className="pl-10" />
            </div>

            {/* Filter Tabs */}
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
                Non lus {conversations.filter(c => c.unread > 0).length > 0 && (
                  <Badge className="ml-1 bg-destructive text-destructive-foreground w-5 h-5 p-0 flex items-center justify-center text-xs">
                    {conversations.filter(c => c.unread > 0).length}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="sm">Favoris</Button>
            </div>
          </div>

          {/* Conversations */}
          <div className="overflow-y-auto">
            {filteredConversations.map((conversation, index) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedChat(conversation.id)}
                className={`
                  p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50
                  ${selectedChat === conversation.id ? 'bg-primary/5 border-r-2 border-r-primary' : ''}
                  animate-fade-in
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        {conversation.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-accent rounded-full border-2 border-background" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm truncate">{conversation.name}</h4>
                      <span className="text-xs text-muted-foreground">{conversation.time}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {conversation.lastMessage}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {conversation.property}
                      </Badge>
                      {conversation.unread > 0 && (
                        <Badge className="bg-destructive text-destructive-foreground w-5 h-5 p-0 flex items-center justify-center text-xs">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedChat && selectedConversation ? (
          <div className={`
            ${selectedChat ? 'flex' : 'hidden md:flex'} 
            flex-col flex-1 pb-20 md:pb-0
          `}>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-background/95 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden"
                  >
                    ←
                  </Button>
                  
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        {selectedConversation.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {selectedConversation.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-background" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold">{selectedConversation.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.online ? 'En ligne' : 'Hors ligne'}
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
              <Card className="mt-3 animate-slide-up">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span>Discussion à propos de: </span>
                    <Badge variant="outline">{selectedConversation.property}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 pb-8 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`
                    flex animate-fade-in
                    ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`
                    max-w-[70%] px-4 py-2 rounded-2xl
                    ${msg.sender === 'me' 
                      ? 'bg-gradient-primary text-primary-foreground rounded-br-md' 
                      : 'bg-muted text-foreground rounded-bl-md'
                    }
                  `}>
                    <p className="text-sm">{msg.text}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`
                        text-xs 
                        ${msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}
                      `}>
                        {msg.time}
                      </p>
                      {msg.sender === 'me' && (
                        <div className="ml-2">
                          {msg.read ? (
                            <CheckCheck className="w-3 h-3 text-accent" />
                          ) : msg.delivered ? (
                            <CheckCheck className="w-3 h-3 text-primary-foreground/50" />
                          ) : (
                            <Check className="w-3 h-3 text-primary-foreground/50" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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

      {/* Message Input - Always visible */}
      <div className="p-4 border-t border-border bg-background/95 backdrop-blur-sm fixed bottom-16 md:bottom-0 left-0 right-0 md:sticky z-[60]">
        <div className="flex items-end gap-3 max-w-full">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mb-1 flex-shrink-0"
            onClick={() => {
              console.log('Ouvrir sélecteur de fichier');
              // Ici on peut ajouter l'ouverture d'un input file
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*,document/*';
              input.click();
            }}
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </Button>
          
          <div className="flex-1 relative min-w-0">
            <Input
              placeholder={selectedConversation ? "Tapez votre message..." : "Sélectionnez une conversation pour commencer"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="pr-12 py-3 rounded-full border-2 w-full"
              disabled={!selectedConversation}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => {
                console.log('Ouvrir sélecteur d\'emoji');
                // Ici on peut ajouter un emoji picker
                const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                setMessage(prev => prev + randomEmoji);
              }}
            >
              <Smile className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || !selectedConversation}
            className="rounded-full w-12 h-12 p-0 bg-gradient-primary hover:bg-gradient-primary/90 disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Messages;