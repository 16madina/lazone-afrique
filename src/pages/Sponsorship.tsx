import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, Star, TrendingUp, Award, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCountry } from '@/contexts/CountryContext';
import { CinePayPaymentMethod } from '@/components/CinePayPaymentMethod';

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
  const { formatPrice, convertFromUSD, selectedCountry } = useCountry();

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

  const getPackageIcon = (index: number) => {
    const icons = [TrendingUp, Zap, Star, Award];
    const Icon = icons[index] || Zap;
    return <Icon className="h-6 w-6" />;
  };

  const handlePaymentSuccess = (transactionId: string) => {
    toast.success('Demande de sponsoring envoyée avec succès!');
    navigate('/');
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Erreur de paiement: ${error}`);
    setShowPayment(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 px-4 py-6 md:px-6">
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

          {showPayment && selectedPackage ? (
            <div className="max-w-4xl mx-auto">
              <Button
                onClick={() => setShowPayment(false)}
                variant="ghost"
                className="mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux packages
              </Button>
              
              <CinePayPaymentMethod
                amount={Math.round(convertFromUSD(selectedPackage?.price_usd || 0))}
                description={`Sponsoring - ${selectedPackage?.name}`}
                paymentType="sponsorship"
                relatedId={listingId}
                packageId={selectedPackage?.id}
                currency={selectedCountry?.currency.code || 'XOF'}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          ) : (
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
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Sponsorship;