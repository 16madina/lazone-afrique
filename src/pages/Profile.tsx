import { useState } from "react";
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
  MapPin
} from "lucide-react";

const Profile = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const userStats = [
    { label: "Propriétés publiées", value: "12", icon: Home },
    { label: "Favoris", value: "8", icon: Heart },
    { label: "Notes moyennes", value: "4.8", icon: Star },
    { label: "Vues profil", value: "245", icon: Eye }
  ];

  const recentProperties = [
    {
      id: "1",
      title: "Villa moderne Cocody",
      price: "85M FCFA",
      status: "Publié",
      views: 24
    },
    {
      id: "2", 
      title: "Appartement Marcory",
      price: "250K FCFA/mois",
      status: "En attente",
      views: 12
    }
  ];

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
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <h2 className="text-2xl font-bold">Jean Dupont</h2>
                      <Badge className="bg-accent text-accent-foreground">
                        <Shield className="w-3 h-3 mr-1" />
                        Vérifié
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">Agent immobilier • Particulier</p>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Abidjan, Côte d'Ivoire
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-african-gold" />
                        4.8/5 (24 avis)
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
                    <Label>Email</Label>
                    <div className="flex">
                      <div className="bg-muted px-3 py-2 border border-r-0 rounded-l-md">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Input value="jean.dupont@email.com" className="rounded-l-none" readOnly />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <div className="flex">
                      <div className="bg-muted px-3 py-2 border border-r-0 rounded-l-md">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Input value="+225 01 02 03 04 05" className="rounded-l-none" />
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Mettre à jour les informations
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Mes propriétés</h3>
              <Button className="bg-gradient-primary">
                <Home className="w-4 h-4 mr-2" />
                Nouvelle annonce
              </Button>
            </div>

            <div className="space-y-4">
              {recentProperties.map((property, index) => (
                <Card key={property.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{property.title}</h4>
                        <p className="text-primary font-bold">{property.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={property.status === "Publié" ? "default" : "secondary"}>
                            {property.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {property.views} vues
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                
                <Button variant="destructive" className="w-full justify-start">
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