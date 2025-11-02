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
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/30 pb-safe md:hidden shadow-elevation-5 backdrop-blur-2xl"
      role="navigation"
      aria-label="Navigation principale mobile"
    >
      <div className="flex items-center justify-around px-2 py-2.5">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`
                relative flex flex-col items-center justify-center p-2.5 rounded-2xl min-w-[64px] h-16
                transition-all duration-300 ease-spring group active:scale-90 ripple
                ${isActive 
                  ? 'text-primary bg-gradient-to-br from-primary/20 to-primary/10 shadow-elevation-2 scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-white/10'
                }
                ${item.isAction 
                  ? 'bg-gradient-to-br from-[hsl(48,100%,70%)] via-[hsl(45,100%,58%)] to-[hsl(42,95%,48%)] text-[hsl(25,40%,15%)] hover:opacity-95 shadow-elevation-4 scale-115 hover:scale-120 font-bold' 
                  : ''
                }
              `}
            >
              {/* Icon Container */}
              <div className={`
                relative transition-all duration-300
                ${isActive ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105 group-hover:-translate-y-0.5'}
                ${item.isAction ? 'bg-white/20 p-1.5 rounded-xl shadow-inner' : ''}
              `}>
                <Icon 
                  className={`
                    w-5 h-5 
                    ${item.isAction ? 'text-[hsl(25,40%,15%)]' : ''}
                    ${isActive ? 'drop-shadow-lg' : ''}
                  `}
                  aria-hidden="true"
                />
                
                {/* Badge with animation */}
                {item.badge && (
                  <Badge 
                    className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground animate-bounce-in shadow-elevation-3 ring-2 ring-background"
                    aria-label={`${item.badge} notifications non lues`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>

              {/* Label */}
              <span className={`
                text-xs mt-1.5 font-semibold transition-all duration-300
                ${isActive ? 'text-primary scale-105' : ''}
                ${item.isAction ? 'text-[hsl(25,40%,15%)] font-bold' : ''}
              `}>
                {item.label}
              </span>

              {/* Active Indicator with glow */}
              {isActive && !item.isAction && (
                <div className="absolute bottom-0 w-10 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-t-full animate-slide-up shadow-warm" />
              )}
              
              {/* Ripple glow effect for action button */}
              {item.isAction && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;