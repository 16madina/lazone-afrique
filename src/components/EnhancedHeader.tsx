import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCountry } from "@/contexts/CountryContext";
import CountrySelector from "@/components/CountrySelector";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Globe, Menu, Plus, User, Settings, LogOut, BarChart3, Heart, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import lazoneLogo from "@/assets/lazone-logo.png";

export const EnhancedHeader = () => {
  const { user, profile, signOut } = useAuth();
  const { selectedCountry } = useCountry();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const menuItems = [
    { href: "/", label: "Accueil", icon: Globe },
    { href: "/map", label: "Carte", icon: Globe },
    ...(user ? [
      { href: "/messages", label: "Messages", icon: MessageCircle },
      { href: "/profile", label: "Mon Profil", icon: User },
    ] : [])
  ];

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={lazoneLogo} alt="LaZone" className="h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Accueil
          </Link>
          <Link 
            to="/map" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Carte
          </Link>
          {user && (
            <Link 
              to="/messages" 
              className="text-sm font-medium hover:text-primary transition-colors relative"
            >
              Messages
            </Link>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Country Selector */}
          <div className="hidden sm:block">
            <CountrySelector />
          </div>

          {/* Add Property Button */}
          {user && (
            <Button 
              size="sm" 
              onClick={() => navigate("/add-property")}
              className="hidden sm:flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Publier
            </Button>
          )}

          {/* Notifications */}
          {user && <NotificationCenter />}

          {/* User Menu or Auth Buttons */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || "Utilisateur"}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      {profile?.user_type && (
                        <Badge variant="outline" className="text-xs">
                          {profile.user_type === 'proprietaire' ? 'Particulier' : 
                           profile.user_type === 'agence' ? 'Agence' : 'Courtier'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate("/profile?tab=dashboard")}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate("/profile?tab=favorites")}>
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Favoris</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate("/messages")}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  <span>Messages</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => navigate("/profile?tab=settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                Connexion
              </Button>
              <Button size="sm" onClick={() => navigate("/auth")}>
                S'inscrire
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <div className="flex flex-col gap-4 mt-8">
                {/* Country Selector Mobile */}
                <div className="px-2">
                  <CountrySelector />
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.href}
                        variant="ghost"
                        className="justify-start"
                        onClick={() => {
                          navigate(item.href);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>

                {/* Add Property Button Mobile */}
                {user && (
                  <Button 
                    onClick={() => {
                      navigate("/add-property");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Publier une annonce
                  </Button>
                )}

                {/* Auth Buttons Mobile */}
                {!user && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Connexion
                    </Button>
                    <Button 
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                    >
                      S'inscrire
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};