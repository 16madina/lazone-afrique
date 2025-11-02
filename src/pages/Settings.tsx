import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, User, Bell, Lock, Globe, Eye, Save, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newListingAlerts: true,
    priceDropAlerts: true,
    messageAlerts: true,
    language: "fr",
    currency: "FCFA",
    theme: "system",
    profileVisibility: "public",
  });

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour accéder aux paramètres",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSave = async () => {
    setLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour avec succès",
      });
      setLoading(false);
    }, 1500);
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-24 pb-32">
        <div className="glass-card rounded-2xl p-8 mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Paramètres
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Personnalisez votre expérience et gérez vos préférences
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="account" className="ripple">
              <User className="w-4 h-4 mr-2" />
              Compte
            </TabsTrigger>
            <TabsTrigger value="notifications" className="ripple">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="ripple">
              <Lock className="w-4 h-4 mr-2" />
              Confidentialité
            </TabsTrigger>
            <TabsTrigger value="preferences" className="ripple">
              <Globe className="w-4 h-4 mr-2" />
              Préférences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Informations du compte</CardTitle>
                <CardDescription>Gérez vos informations personnelles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email}
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={profile?.phone}
                    placeholder="+225 XX XX XX XX XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full-name">Nom complet</Label>
                  <Input
                    id="full-name"
                    type="text"
                    defaultValue={profile?.full_name}
                    placeholder="Votre nom complet"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notif">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des emails pour les mises à jour importantes
                    </p>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={settings.emailNotifications}
                    onCheckedChange={() => handleToggle("emailNotifications")}
                    aria-label="Activer les notifications par email"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notif">Notifications push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des notifications en temps réel sur votre appareil
                    </p>
                  </div>
                  <Switch
                    id="push-notif"
                    checked={settings.pushNotifications}
                    onCheckedChange={() => handleToggle("pushNotifications")}
                    aria-label="Activer les notifications push"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notif">Notifications SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des SMS pour les événements critiques
                    </p>
                  </div>
                  <Switch
                    id="sms-notif"
                    checked={settings.smsNotifications}
                    onCheckedChange={() => handleToggle("smsNotifications")}
                    aria-label="Activer les notifications SMS"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertes spécifiques</CardTitle>
                <CardDescription>Configurez les types d'alertes que vous souhaitez recevoir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="new-listing">Nouvelles annonces</Label>
                  <Switch
                    id="new-listing"
                    checked={settings.newListingAlerts}
                    onCheckedChange={() => handleToggle("newListingAlerts")}
                    aria-label="Activer les alertes pour les nouvelles annonces"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="price-drop">Baisses de prix</Label>
                  <Switch
                    id="price-drop"
                    checked={settings.priceDropAlerts}
                    onCheckedChange={() => handleToggle("priceDropAlerts")}
                    aria-label="Activer les alertes pour les baisses de prix"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="messages">Messages</Label>
                  <Switch
                    id="messages"
                    checked={settings.messageAlerts}
                    onCheckedChange={() => handleToggle("messageAlerts")}
                    aria-label="Activer les alertes pour les messages"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Confidentialité et sécurité</CardTitle>
                <CardDescription>Contrôlez qui peut voir vos informations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibilité du profil</Label>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, profileVisibility: value }))
                    }
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue placeholder="Choisir la visibilité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>Public</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          <span>Privé</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="contacts">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Contacts uniquement</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Définissez qui peut voir votre profil et vos annonces
                  </p>
                </div>

                <div className="glass p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Eye className="w-5 h-5" />
                    <h3 className="font-semibold">Données collectées</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nous collectons uniquement les données nécessaires au fonctionnement de la plateforme. 
                    Vos informations sont protégées et ne sont jamais vendues à des tiers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Préférences générales</CardTitle>
                <CardDescription>Personnalisez votre expérience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Choisir la langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Choisir la devise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FCFA">FCFA (XOF)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">Dollar US (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Thème</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, theme: value }))
                    }
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Choisir le thème" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            disabled={loading}
            size="lg"
            className="ripple"
            aria-label="Sauvegarder les paramètres"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les paramètres
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
