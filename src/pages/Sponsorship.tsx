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
import PaymentMethodSelector from "@/components/PaymentMethodSelector";

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
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
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

  const handlePackageSelect = (pkg: SponsorshipPackage) => {
    setSelectedPackage(pkg);
    setShowPayment(true);
  };

  const handlePayment = async () => {
    if (!listingId || !selectedPackage) return;
    
    setLoading(true);
    try {
      // Create transaction record with pending approval status
      const { data: transaction, error: transactionError } = await supabase
        .from('sponsorship_transactions')
        .insert({
          listing_id: listingId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          package_id: selectedPackage.id,
          amount_paid: selectedPackage.price_usd,
          payment_status: 'completed',
          payment_method: selectedPaymentMethod,
          approval_status: 'pending' // New: requires admin approval
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Don't update the listing immediately - wait for admin approval
      toast.success(`💰 Paiement confirmé ! Votre demande de sponsoring est en attente d'approbation par l'administrateur. Vous recevrez une notification une fois approuvée.`);

      // Retourner à la page précédente
      navigate(-1);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Une erreur est survenue lors du paiement.");
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

          {!showPayment ? (
            <>
              {/* Packages */}
              <div className="grid md:grid-cols-2 gap-6">
                {packages.map((pkg, index) => (
                  <Card 
                    key={pkg.id} 
                    className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
                      index === 1 ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handlePackageSelect(pkg)}
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
                      
                      <Button className="w-full" size="lg">
                        Choisir ce package
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Payment Method Selection */}
              <Button 
                variant="ghost" 
                onClick={() => setShowPayment(false)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux packages
              </Button>
              
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onMethodSelect={setSelectedPaymentMethod}
                phoneNumber={phoneNumber}
                onPhoneNumberChange={setPhoneNumber}
                cardNumber={cardNumber}
                onCardNumberChange={setCardNumber}
                onConfirm={handlePayment}
                loading={loading}
                amount={selectedPackage?.price_usd || 0}
                formatPrice={formatPrice}
              />
            </>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Sponsorship;