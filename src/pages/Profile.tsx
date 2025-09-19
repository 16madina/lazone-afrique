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
import { useFileUpload } from "@/hooks/useFileUpload";
import AdminPanel from "@/components/AdminPanel";
import AdminSetup from "@/components/AdminSetup";
import { useFavorites } from "@/hooks/useFavorites";
import PropertyCard from "@/components/PropertyCard";
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
import SponsorButton from "@/components/SponsorButton";

const Profile = () => {
  const { user, profile, signOut, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { uploadFile, uploading } = useFileUpload();
  const { favorites, fetchFavorites } = useFavorites();
  const [favoriteListings, setFavoriteListings] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
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

  // Check if user is admin
  const checkAdminStatus = async () => {
    if (!user || !profile) return;
    
    // Automatically grant admin to the app owner
    if (profile.email === 'lazoneclient@gmail.com') {
      setIsAdmin(true);
      
      // Ensure they're in the admin_roles table
      try {
        await supabase
          .from('admin_roles')
          .upsert({ user_id: user.id }, { onConflict: 'user_id' });
      } catch (error) {
        console.error('Error adding to admin_roles:', error);
      }
      return;
    }
    
    // Check admin status for other users
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setIsAdmin(!!data && !error);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  // Fetch favorite listings
  const fetchFavoriteListings = async () => {
    if (favorites.length === 0) {
      setFavoriteListings([]);
      return;
    }

    setLoadingFavorites(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .in('id', favorites)
        .eq('status', 'published');

      if (error) {
        console.error('Error fetching favorite listings:', error);
      } else {
        setFavoriteListings(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Fetch properties when user is available
  useEffect(() => {
    if (user && profile) {
      fetchUserProperties();
      checkAdminStatus();
    }
  }, [user, profile]);

  // Fetch favorite listings when favorites change
  useEffect(() => {
    fetchFavoriteListings();
  }, [favorites]);

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    console.log('Starting avatar upload for user:', user.id);
    console.log('File:', file.name, file.size, file.type);

    try {
      const { url } = await uploadFile(file, 'avatars', `${user.id}/avatar`);
      
      console.log('Upload successful, URL:', url);
      
      const { error } = await updateProfile({ avatar_url: url });
      
      if (error) {
        console.error('Profile update error:', error);
        throw new Error(error);
      }

      console.log('Profile updated successfully');
      toast({
        title: 'Succès',
        description: 'Photo de profil mise à jour'
      });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de télécharger la photo: ${error.message}`,
        variant: 'destructive'
      });
    }
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

  const handleDeleteProperty = async (propertyId: string, propertyTitle: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'annonce "${propertyTitle}" ?\n\nCette action est irréversible.`
    );
    
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', propertyId)
        .eq('user_id', user.id); // Sécurité: s'assurer que l'utilisateur ne peut supprimer que ses propres annonces

      if (error) {
        console.error('Error deleting property:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'annonce",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Annonce supprimée avec succès",
        });
        // Recharger la liste des propriétés
        fetchUserProperties();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const { formatLocalPrice } = useCountry();

  const userStats = [
    { label: "Propriétés publiées", value: userProperties.length.toString(), icon: Home },
    { label: "Favoris", value: favoriteListings.length.toString(), icon: Heart },
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
        <Tabs defaultValue="profile" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="properties">Mes biens</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card className="animate-scale-in">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                          {getUserInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label htmlFor="avatar-upload">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="rounded-full w-8 h-8 cursor-pointer"
                          disabled={uploading}
                          asChild
                        >
                          <div>
                            <Camera className="w-4 h-4" />
                          </div>
                        </Button>
                      </label>
                    </div>
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
                const isClickable = stat.label === "Propriétés publiées" || stat.label === "Favoris";
                const tabValue = stat.label === "Propriétés publiées" ? "properties" : stat.label === "Favoris" ? "favorites" : null;
                
                return (
                  <Card 
                    key={stat.label} 
                    className={`animate-scale-in ${isClickable ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => isClickable && tabValue && setActiveTab(tabValue)}
                  >
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/add-property?edit=${property.id}`)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                      </div>
                      
                      {/* Delete Button */}
                      <div className="mt-2">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleDeleteProperty(property.id, property.title)}
                        >
                          Supprimer l'annonce
                        </Button>
                      </div>
                      
                      {/* Sponsor Button */}
                      <div className="mt-3">
                        <SponsorButton listingId={property.id} userId={property.user_id} />
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
            
            {loadingFavorites ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Chargement des favoris...</p>
              </div>
            ) : favoriteListings.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h4 className="text-lg font-semibold mb-2">Aucun favori</h4>
                <p className="text-muted-foreground">
                  Ajoutez des propriétés à vos favoris pour les retrouver facilement
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteListings.map((property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    title={property.title}
                    price={property.price}
                    currencyCode={(property as any).currency_code || 'XOF'}
                    location={property.city}
                    type={property.transaction_type === 'rent' ? 'rent' : 'sale'}
                    propertyType={property.property_type}
                    photos={property.photos}
                    image={property.image}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    surface={property.surface_area}
                    agent={{
                      name: 'Agent',
                      type: 'individual',
                      rating: 4.5,
                      verified: true
                    }}
                    features={property.features || []}
                    isSponsored={property.is_sponsored || false}
                    isFavorite={true}
                  />
                ))}
              </div>
            )}
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

          {/* Admin Tab */}
          <TabsContent value="admin">
            {isAdmin ? <AdminPanel /> : <AdminSetup />}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Profile;