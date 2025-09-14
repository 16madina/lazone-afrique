import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, Star, TrendingUp, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCountry } from "@/contexts/CountryContext";

interface SponsorshipPackage {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price_usd: number;
  features: string[];
}

interface SponsorshipDialogProps {
  listingId: string;
  children: React.ReactNode;
}

const SponsorshipDialog = ({ listingId, children }: SponsorshipDialogProps) => {
  const [packages, setPackages] = useState<SponsorshipPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<SponsorshipPackage | null>(null);
  const { toast } = useToast();
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

      toast({
        title: "🎉 Annonce sponsorisée !",
        description: `Votre annonce sera mise en avant pendant ${pkg.duration_days} jours.`,
      });

      setSelectedPackage(null);
    } catch (error) {
      console.error('Error sponsoring listing:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du sponsoring.",
        variant: "destructive",
      });
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
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Booster votre annonce
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Mettez votre annonce en avant pour attirer plus d'acheteurs potentiels
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
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

          <div className="grid md:grid-cols-2 gap-4">
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
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    </div>
                    {index === 1 && (
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        Populaire
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(pkg.price_usd)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      pour {pkg.duration_days} jours
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Avantages inclus :</div>
                    <ul className="space-y-1">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPackage && (
            <div className="space-y-4">
              <Separator />
              <div className="bg-accent/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium">Récapitulatif de votre commande</h4>
                <div className="flex justify-between items-center">
                  <span>{selectedPackage.name}</span>
                  <span className="font-medium">{formatPrice(selectedPackage.price_usd)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Durée</span>
                  <span>{selectedPackage.duration_days} jours</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-medium">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(selectedPackage.price_usd)}</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleSponsor(selectedPackage)}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Traitement..." : "Confirmer le sponsoring"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SponsorshipDialog;