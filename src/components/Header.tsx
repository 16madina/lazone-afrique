import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCapacitor } from "@/hooks/useCapacitor";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CountrySelector from "@/components/CountrySelector";
import { Bell, User, Menu, LogOut, Settings } from "lucide-react";
import lazoneLogo from "@/assets/lazone-logo.png";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { unreadCount, resetCount } = useUnreadNotifications();
  const { user, profile, signOut } = useAuth();
  const { isAndroid, isNative } = useCapacitor();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const getUserTypeLabel = () => {
    switch (profile?.user_type) {
      case 'proprietaire':
        return 'Propriétaire';
      case 'demarcheur':
        return 'Démarcheur';
      case 'agence':
        return 'Agence';
      default:
        return '';
    }
  };

  // Determine the correct safe area class based on platform
  const getSafeAreaClass = () => {
    if (!isNative) return ''; // No safe area needed for web
    if (isAndroid) return 'header-safe-area-android';
    return 'header-safe-area'; // iOS
  };

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 
        transition-all duration-300 ease-smooth
        ${scrolled 
          ? 'glass shadow-elevation-2 h-14' 
          : 'bg-background/60 backdrop-blur-sm h-16'
        }
        border-b border-border/50
        ${getSafeAreaClass()}
      `}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
        <button
          className="flex items-center space-x-2 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 min-h-[44px] ripple" 
          onClick={() => navigate('/')}
          aria-label="Aller à l'accueil"
        >
          <img 
            src={lazoneLogo} 
            alt="LaZone" 
            className={`transition-all duration-300 ${scrolled ? 'w-7 h-7' : 'w-8 h-8'}`} 
          />
          <span className={`font-display font-bold bg-gradient-primary bg-clip-text text-transparent transition-all duration-300 ${scrolled ? 'text-lg' : 'text-xl'}`}>
            LaZone
          </span>
        </button>

        {/* Country Selector */}
        <div className="hidden md:block">
          <CountrySelector />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          {user && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hover:bg-accent/50 transition-all duration-200 active:scale-95" 
                  onClick={() => navigate('/profile?tab=notifications')}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary animate-bounce-in">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 glass-card animate-scale-in" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-medium">Notifications</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetCount}
                      className="text-xs"
                      disabled={unreadCount === 0}
                    >
                      Tout marquer comme lu
                    </Button>
                  </div>
                  
                  {unreadCount > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Vous avez {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-accent/50 transition-all duration-200" 
                        onClick={() => navigate('/profile?tab=notifications')}
                      >
                        Voir toutes les notifications
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <div>Aucune notification</div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Profile or Login */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 min-h-[44px] min-w-[44px] p-2 hover:bg-accent/50 transition-all duration-200 active:scale-95"
                  aria-label="Menu utilisateur"
                >
                  <Avatar className={`transition-all duration-300 ${scrolled ? 'w-9 h-9' : 'w-10 h-10'}`}>
                    {profile?.avatar_url && (
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'Utilisateur'} />
                    )}
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className={`font-medium transition-all duration-300 ${scrolled ? 'text-xs' : 'text-sm'}`}>
                      {profile?.full_name || 'Utilisateur'}
                    </div>
                    <div className="text-xs text-muted-foreground">{getUserTypeLabel()}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card animate-scale-in">
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer transition-colors duration-200"
                >
                  <User className="w-4 h-4 mr-2" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer transition-colors duration-200"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="text-destructive cursor-pointer transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => navigate('/auth')} 
              variant="default"
              className="bg-gradient-primary hover:opacity-90 transition-all duration-200 active:scale-95"
            >
              Se connecter
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
