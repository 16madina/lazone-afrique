import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Home, DollarSign, BarChart3, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import AdminPanel from "@/components/AdminPanel";
import AdminSponsorshipPanel from "@/components/AdminSponsorshipPanel";
import { ListingLimitsAdmin } from "@/components/admin/ListingLimitsAdmin";

export default function Admin() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Accès refusé",
        description: "Veuillez vous connecter pour accéder à cette page",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Check if user is admin - you may need to add an is_admin field to profiles table
    // For now, we'll skip this check or you can add admin emails to check
    const adminEmails = ["admin@lazone.com"]; // Add your admin emails here
    
    if (!adminEmails.includes(user.email || "")) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour accéder à cette page",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setLoading(false);
  }, [user, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-24 pb-32">
        <div className="glass-card rounded-2xl p-8 mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Administration
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Gérez les utilisateurs, les annonces et les statistiques de la plateforme
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="overview" className="ripple">
              <BarChart3 className="w-4 h-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="listings" className="ripple">
              <Home className="w-4 h-4 mr-2" />
              Annonces
            </TabsTrigger>
            <TabsTrigger value="sponsorship" className="ripple">
              <DollarSign className="w-4 h-4 mr-2" />
              Parrainages
            </TabsTrigger>
            <TabsTrigger value="limits" className="ripple">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Limites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Utilisateurs actifs", value: "1,234", icon: Users, color: "text-blue-500" },
                { title: "Annonces publiées", value: "856", icon: Home, color: "text-green-500" },
                { title: "Revenus mensuels", value: "45,000 FCFA", icon: DollarSign, color: "text-primary" },
                { title: "Taux de conversion", value: "12.5%", icon: BarChart3, color: "text-purple-500" },
              ].map((stat, index) => (
                <Card key={index} className="hover:shadow-elevation-4 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>Gérez les aspects clés de la plateforme</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-auto py-4 ripple">
                  <Users className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Gérer les utilisateurs</div>
                    <div className="text-sm text-muted-foreground">Approuver, bloquer ou modifier</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-4 ripple">
                  <Home className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Modérer les annonces</div>
                    <div className="text-sm text-muted-foreground">Approuver ou rejeter</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="animate-fade-in">
            <AdminPanel />
          </TabsContent>

          <TabsContent value="sponsorship" className="animate-fade-in">
            <AdminSponsorshipPanel />
          </TabsContent>

          <TabsContent value="limits" className="animate-fade-in">
            <ListingLimitsAdmin />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
