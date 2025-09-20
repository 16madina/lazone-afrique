import React, { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Users, ArrowLeft } from 'lucide-react';
import { CinePayPaymentMethod } from '@/components/CinePayPaymentMethod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic_monthly',
    name: 'Basic',
    description: 'Pour les particuliers',
    price: 5000,
    currency: 'XOF',
    duration: 'mois',
    features: [
      '10 annonces gratuites par mois',
      'Visibilité standard',
      'Support client de base',
      'Notifications par email'
    ],
    color: 'text-blue-600'
  },
  {
    id: 'pro_monthly',
    name: 'Pro',
    description: 'Pour les professionnels',
    price: 15000,
    currency: 'XOF',
    duration: 'mois',
    features: [
      '50 annonces gratuites par mois',
      'Mise en avant des annonces',
      'Statistiques détaillées',
      'Support prioritaire',
      'Badge professionnel'
    ],
    popular: true,
    color: 'text-orange-600'
  },
  {
    id: 'unlimited_monthly',
    name: 'Illimité',
    description: 'Pour les agences',
    price: 30000,
    currency: 'XOF',
    duration: 'mois',
    features: [
      'Annonces illimitées',
      'Priorité maximale',
      'Analytics avancées',
      'Support dédié 24/7',
      'API d\'intégration',
      'Formation personnalisée'
    ],
    color: 'text-purple-600'
  }
];

export const SubscriptionPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const navigate = useNavigate();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const getPlanIcon = (index: number) => {
    const icons = [Users, Crown, Zap];
    const Icon = icons[index] || Users;
    return <Icon className="h-6 w-6" />;
  };

  const handlePaymentSuccess = (transactionId: string) => {
    toast.success('Abonnement activé avec succès!');
    navigate('/profile');
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Erreur lors du paiement: ${error}`);
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {showPayment && selectedPlan ? (
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={() => setShowPayment(false)}
              variant="ghost"
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux plans
            </Button>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Paiement - {selectedPlan.name}</h2>
              <p className="text-muted-foreground">
                {formatPrice(selectedPlan.price, selectedPlan.currency)} / {selectedPlan.duration}
              </p>
            </div>

            <CinePayPaymentMethod
              amount={selectedPlan.price}
              description={`Abonnement ${selectedPlan.name} - ${selectedPlan.duration}`}
              paymentType="subscription"
              subscriptionType={selectedPlan.id}
              currency={selectedPlan.currency}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        ) : (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Plans d'abonnement</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choisissez le plan qui correspond le mieux à vos besoins pour booster vos annonces
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {subscriptionPlans.map((plan, index) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      Populaire
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className={`mx-auto mb-4 p-3 rounded-full bg-muted ${plan.color}`}>
                      {getPlanIcon(index)}
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    
                    <div className="mt-4">
                      <span className="text-3xl font-bold">
                        {formatPrice(plan.price, plan.currency)}
                      </span>
                      <span className="text-muted-foreground">/{plan.duration}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      Choisir ce plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground">
                Tous les plans incluent une période d'essai gratuite de 7 jours
              </p>
            </div>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};