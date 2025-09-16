import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, Star, TrendingUp, Award, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCountry } from "@/contexts/CountryContext";

interface SponsorshipPackage {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price_usd: number;
  features: string[];
}

const Sponsorship = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<SponsorshipPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<SponsorshipPackage | null>(null);
  const { formatPrice } = useCountry();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('sponsorship_packages')
      .select('*')
      .eq('is_active', true)
      .order('price_usd');

    if (error) {
      console.error('Error fetching packages:', error);
      return;
    }

    setPackages(data || []);
  };

  const handleSponsor = async (pkg: SponsorshipPackage) => {
    if (!listingId) return;
    
    setLoading(true);
    try {
      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('sponsorship_transactions')
        .insert({
          listing_id: listingId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          package_id: pkg.id,
          amount_paid: pkg.price_usd,
          payment_status: 'completed', // Simplified for demo
          payment_method: 'demo'
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update listing with sponsorship
      const sponsorUntil = new Date();
      sponsorUntil.setDate(sponsorUntil.getDate() + pkg.duration_days);

      const { error: updateError } = await supabase
        .from('listings')
        .update({
          is_sponsored: true,
          sponsored_until: sponsorUntil.toISOString(),
          sponsor_amount: pkg.price_usd,
          sponsored_at: new Date().toISOString()
        })
        .eq('id', listingId);

      if (updateError) throw updateError;

      toast.success(`🎉 Annonce sponsorisée ! Votre annonce sera mise en avant pendant ${pkg.duration_days} jours.`);

      // Retourner à la page précédente
      navigate(-1);
    } catch (error) {
      console.error('Error sponsoring listing:', error);
      toast.error("Une erreur est survenue lors du sponsoring.");
    } finally {
      setLoading(false);
    }
  };

  const getPackageIcon = (index: number) => {
    const icons = [TrendingUp, Zap, Star, Award];
    const Icon = icons[index] || Zap;
    return <Icon className="h-6 w-6" />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Navigation */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Booster votre annonce</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Mettez votre annonce en avant pour attirer plus d'acheteurs potentiels
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                ✨ Position prioritaire
              </span>
              <span className="flex items-center gap-1">
                🎯 Visibilité accrue
              </span>
              <span className="flex items-center gap-1">
                📈 Plus de contacts
              </span>
            </div>
          </div>

          <Separator />

          {/* Packages */}
          <div className="grid md:grid-cols-2 gap-6">
            {packages.map((pkg, index) => (
              <Card 
                key={pkg.id} 
                className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  selectedPackage?.id === pkg.id ? 'ring-2 ring-primary' : ''
                } ${index === 1 ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPackageIcon(index)}
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    </div>
                    {index === 1 && (
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        Populaire
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-base">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">
                      {formatPrice(pkg.price_usd)}
                    </div>
                    <div className="text-base text-muted-foreground">
                      pour {pkg.duration_days} jours
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-base font-medium">Avantages inclus :</div>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          {selectedPackage && (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Récapitulatif de votre commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>{selectedPackage.name}</span>
                  <span className="font-medium">{formatPrice(selectedPackage.price_usd)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Durée</span>
                  <span>{selectedPackage.duration_days} jours</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-medium text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(selectedPackage.price_usd)}</span>
                </div>
                
                <Button 
                  onClick={() => handleSponsor(selectedPackage)}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Traitement..." : "Confirmer le sponsoring"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Sponsorship;