import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCapacitor } from "@/hooks/useCapacitor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CountrySelector from "@/components/CountrySelector";
import { Bell, User, Menu, LogOut, Settings } from "lucide-react";
import lazoneLogo from "@/assets/lazone-logo.png";

const Header = () => {
  const [notifications, setNotifications] = useState(3);
  const { user, profile, signOut } = useAuth();
  const { isAndroid, isNative } = useCapacitor();
  const navigate = useNavigate();

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
    <header className={`sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border ${getSafeAreaClass()}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={lazoneLogo} alt="LaZone" className="w-8 h-8" />
          <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
            LaZone
          </span>
        </div>

        {/* Country Selector */}
        <CountrySelector />

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          {user && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Notifications</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setNotifications(0)}
                      className="text-xs"
                    >
                      Tout marquer comme lu
                    </Button>
                  </div>
                  
                  {notifications > 0 ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50 text-sm">
                        <div className="font-medium text-foreground">Nouvelle demande de contact</div>
                        <div className="text-muted-foreground">Un utilisateur souhaite vous contacter pour une propriété</div>
                        <div className="text-xs text-muted-foreground mt-1">Il y a 2 heures</div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-muted/50 text-sm">
                        <div className="font-medium text-foreground">Sponsoring activé</div>
                        <div className="text-muted-foreground">Votre annonce est maintenant sponsorisée</div>
                        <div className="text-xs text-muted-foreground mt-1">Il y a 5 heures</div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-muted/50 text-sm">
                        <div className="font-medium text-foreground">Nouveau message</div>
                        <div className="text-muted-foreground">Vous avez reçu un nouveau message</div>
                        <div className="text-xs text-muted-foreground mt-1">Hier</div>
                      </div>
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
                <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                  <Avatar className="w-8 h-8">
                    {profile?.avatar_url && (
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'Utilisateur'} />
                    )}
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{profile?.full_name || 'Utilisateur'}</div>
                    <div className="text-xs text-muted-foreground">{getUserTypeLabel()}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/auth')} variant="default">
              Se connecter
            </Button>
          )}

        </div>
      </div>
    </header>
  );
};

export default Header;