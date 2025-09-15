import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Home, Map, Plus, MessageCircle, User } from "lucide-react";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { conversations } = useRealTimeMessages();

  // Calculer le total des messages non lus
  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);

  const navItems = [
    {
      icon: Home,
      label: "Accueil",
      path: "/",
      badge: null
    },
    {
      icon: Map,
      label: "Carte", 
      path: "/map",
      badge: null
    },
    {
      icon: Plus,
      label: "Publier",
      path: "/add-property",
      badge: null,
      isAction: true
    },
    {
      icon: MessageCircle,
      label: "Messages",
      path: "/messages",
      badge: totalUnreadCount > 0 ? totalUnreadCount : null
    },
    {
      icon: User,
      label: "Profil",
      path: "/profile", 
      badge: null
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden safe-bottom">
      <div className="flex items-center justify-around px-2 py-2 safe-left safe-right">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                relative flex flex-col items-center justify-center p-2 rounded-xl min-w-[60px] h-14
                transition-all duration-300 group
                ${isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
                ${item.isAction 
                  ? 'bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-warm' 
                  : ''
                }
              `}
            >
              {/* Icon */}
              <div className={`
                relative transition-transform duration-200
                ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                ${item.isAction ? 'bg-white/20 p-1 rounded-lg' : ''}
              `}>
                <Icon 
                  className={`
                    w-5 h-5 
                    ${item.isAction ? 'text-primary-foreground' : ''}
                  `}
                />
                
                {/* Badge */}
                {item.badge && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground animate-bounce-in">
                    {item.badge}
                  </Badge>
                )}
              </div>

              {/* Label */}
              <span className={`
                text-xs mt-1 font-medium transition-all duration-200
                ${isActive ? 'text-primary' : ''}
                ${item.isAction ? 'text-primary-foreground' : ''}
              `}>
                {item.label}
              </span>

              {/* Active Indicator */}
              {isActive && !item.isAction && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-t-full animate-slide-up" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;