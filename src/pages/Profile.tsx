import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCountry } from "@/contexts/CountryContext";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Settings, 
  Heart, 
  Home, 
  Star, 
  Shield, 
  Bell, 
  Globe, 
  CreditCard, 
  HelpCircle,
  LogOut,
  Camera,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  Building2,
  Users
} from "lucide-react";

const Profile = () => {
  const { user, profile, signOut, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [contactForm, setContactForm] = useState({
    full_name: '',
    phone: '',
    company_name: '',
    license_number: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setContactForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        company_name: profile.company_name || '',
        license_number: profile.license_number || ''
      });
    }
  }, [profile]);

  // Fetch user properties
  const fetchUserProperties = async () => {
    if (!user) return;
    
    setLoadingProperties(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
      } else {
        setUserProperties(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  // Fetch properties when user is available
  useEffect(() => {
    if (user) {
      fetchUserProperties();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    const { error } = await updateProfile(contactForm);
    
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
    }
    
    setIsUpdating(false);
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

  const getUserTypeIcon = () => {
    switch (profile?.user_type) {
      case 'proprietaire':
        return User;
      case 'demarcheur':
        return Users;
      case 'agence':
        return Building2;
      default:
        return User;
    }
  };

  const { formatLocalPrice } = useCountry();

  const userStats = [
    { label: "Propriétés publiées", value: userProperties.length.toString(), icon: Home },
    { label: "Favoris", value: "0", icon: Heart },
    { label: "Notes moyennes", value: "0", icon: Star },
    { label: "Vues profil", value: "0", icon: Eye }
  ];

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const UserTypeIcon = getUserTypeIcon();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 animate-fade-in">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="properties">Mes biens</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card className="animate-scale-in">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <h2 className="text-2xl font-bold">{profile.full_name || 'Utilisateur'}</h2>
                      <Badge className="bg-accent text-accent-foreground">
                        <Shield className="w-3 h-3 mr-1" />
                        Vérifié
                      </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
                      <UserTypeIcon className="w-4 h-4" />
                      {getUserTypeLabel()}
                      {profile.company_name && ` • ${profile.company_name}`}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Côte d'Ivoire
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-african-gold" />
                        Nouveau membre
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Modifier
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardContent className="p-4 text-center">
                      <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Contact Info */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom complet</Label>
                    <Input 
                      value={contactForm.full_name}
                      onChange={(e) => setContactForm({ ...contactForm, full_name: e.target.value })}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex">
                      <div className="bg-muted px-3 py-2 border border-r-0 rounded-l-md">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Input value={profile.email} className="rounded-l-none" readOnly />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <div className="flex">
                      <div className="bg-muted px-3 py-2 border border-r-0 rounded-l-md">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Input 
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="+225 XX XX XX XX XX"
                        className="rounded-l-none" 
                      />
                    </div>
                  </div>

                  {profile.user_type === 'agence' && (
                    <div className="space-y-2">
                      <Label>Nom de l'agence</Label>
                      <Input 
                        value={contactForm.company_name}
                        onChange={(e) => setContactForm({ ...contactForm, company_name: e.target.value })}
                        placeholder="Nom de votre agence"
                      />
                    </div>
                  )}

                  {profile.user_type !== 'proprietaire' && (
                    <div className="space-y-2">
                      <Label>Numéro de licence</Label>
                      <Input 
                        value={contactForm.license_number}
                        onChange={(e) => setContactForm({ ...contactForm, license_number: e.target.value })}
                        placeholder="Votre numéro de licence"
                      />
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleUpdateProfile} 
                  className="w-full" 
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Mise à jour...' : 'Mettre à jour les informations'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Mes propriétés</h3>
              <Button className="bg-gradient-primary" onClick={() => navigate('/add-property')}>
                <Home className="w-4 h-4 mr-2" />
                Nouvelle annonce
              </Button>
            </div>

            {loadingProperties ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Chargement...</p>
              </div>
            ) : userProperties.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <Home className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h4 className="text-lg font-semibold mb-2">Aucune propriété</h4>
                <p className="text-muted-foreground mb-4">
                  Commencez par publier votre première annonce
                </p>
                <Button onClick={() => navigate('/add-property')}>
                  Créer une annonce
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProperties.map((property) => (
                  <Card key={property.id} className="animate-scale-in overflow-hidden">
                    <div className="aspect-video relative">
                      {property.photos && property.photos.length > 0 ? (
                        <img 
                          src={property.photos[0]} 
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Home className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <Badge 
                        className={`absolute top-2 right-2 ${
                          property.status === 'published' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-yellow-500 text-white'
                        }`}
                      >
                        {property.status === 'published' ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold truncate">{property.title}</h4>
                      <p className="text-sm text-muted-foreground">{property.city}</p>
                      <p className="text-lg font-bold text-primary">
                        {formatLocalPrice(property.price)}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/listing/${property.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <h3 className="text-xl font-semibold">Mes favoris</h3>
            
            <div className="text-center py-12 animate-fade-in">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h4 className="text-lg font-semibold mb-2">Aucun favori</h4>
              <p className="text-muted-foreground">
                Ajoutez des propriétés à vos favoris pour les retrouver facilement
              </p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h3 className="text-xl font-semibold">Paramètres</h3>

            {/* Notifications */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des alertes sur votre appareil
                    </p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nouvelles propriétés</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertes pour les nouveaux biens
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications de nouveaux messages
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Apparence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mode sombre</Label>
                    <p className="text-sm text-muted-foreground">
                      Interface en couleurs sombres
                    </p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span>Français (FR)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Actions du compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gestion des paiements
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Aide et support
                </Button>
                
                <Separator />
                
                <Button variant="destructive" className="w-full justify-start" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Profile;