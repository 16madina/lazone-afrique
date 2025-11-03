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
import { Globe, Menu, Plus, User, Settings, LogOut, BarChart3, Heart, MessageCircle, ChevronDown, Map } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import lazoneLogo from "@/assets/lazone-logo.png";

export const EnhancedHeader = () => {
  const { user, profile, signOut } = useAuth();
  const { selectedCountry, setSelectedCountry, countries } = useCountry();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCountryMapNavigation = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      navigate("/map");
    }
  };

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
          
          {/* Map with Country Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-sm font-medium hover:text-primary hover:bg-accent transition-colors flex items-center gap-1.5 h-auto px-3 py-2"
              >
                <Map className="w-4 h-4" />
                <span>Carte</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-96 overflow-y-auto bg-background z-[200]">
              <DropdownMenuLabel className="flex items-center gap-2 text-base">
                <Globe className="w-4 h-4" />
                Sélectionner un pays
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {countries.map((country) => (
                  <DropdownMenuItem
                    key={country.code}
                    onClick={() => handleCountryMapNavigation(country.code)}
                    className="flex items-center gap-3 cursor-pointer py-2.5 px-3"
                  >
                    <span className="text-xl">{country.flag}</span>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <span className="font-medium">{country.name}</span>
                      <span className="text-xs text-muted-foreground">{country.currency.code}</span>
                    </div>
                    {selectedCountry.code === country.code && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        ✓
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
              size="default" 
              onClick={() => navigate("/add-property")}
              className="hidden sm:flex items-center gap-2 ripple"
              aria-label="Publier une annonce"
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
                <Button 
                  variant="ghost" 
                  className="relative h-11 w-11 min-h-[44px] min-w-[44px] rounded-full ripple"
                  aria-label="Menu utilisateur"
                >
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
              <Button 
                variant="ghost" 
                size="default" 
                onClick={() => navigate("/auth")}
                className="ripple"
                aria-label="Se connecter"
              >
                Connexion
              </Button>
              <Button 
                size="default" 
                onClick={() => navigate("/auth")}
                className="ripple"
                aria-label="S'inscrire"
              >
                S'inscrire
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                className="ripple"
                aria-label="Ouvrir le menu"
              >
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

export default EnhancedHeader;