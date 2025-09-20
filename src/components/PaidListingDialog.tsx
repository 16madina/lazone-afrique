import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Zap, ArrowRight } from 'lucide-react';
import { CinePayPaymentMethod } from '@/components/CinePayPaymentMethod';
import { useListingLimits } from '@/hooks/useListingLimits';
import { toast } from 'sonner';

interface PaidListingDialogProps {
  children: React.ReactNode;
  onPaymentSuccess?: () => void;
}

export const PaidListingDialog = ({ children, onPaymentSuccess }: PaidListingDialogProps) => {
  const [showPayment, setShowPayment] = useState(false);
  const { config } = useListingLimits();

  const pricePerListing = config?.price_per_extra_listing || 1000; // Prix par défaut en XOF

  const handlePaymentSuccess = (transactionId: string) => {
    toast.success('Paiement effectué avec succès! Vous pouvez maintenant publier votre annonce.');
    setShowPayment(false);
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Erreur de paiement: ${error}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Paiement pour annonce supplémentaire
          </DialogTitle>
        </DialogHeader>

        {!showPayment ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Vous avez atteint votre limite d'annonces gratuites pour ce mois.
              </p>
              <p className="text-sm text-muted-foreground">
                Payez pour publier une annonce supplémentaire ou souscrivez à un abonnement pour plus d'avantages.
              </p>
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Annonce supplémentaire</CardTitle>
                  </div>
                  <Badge variant="secondary">Paiement unique</Badge>
                </div>
                <CardDescription>
                  Publiez une annonce supplémentaire ce mois-ci
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                    }).format(pricePerListing)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    pour 1 annonce supplémentaire
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Ce que vous obtenez :</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Publication immédiate de votre annonce
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Visibilité standard dans les résultats
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Validité jusqu'à la fin du mois
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={() => setShowPayment(true)}
                  className="w-full"
                  size="lg"
                >
                  Procéder au paiement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Besoin de publier plus d'annonces régulièrement ?{' '}
                <Button variant="link" className="p-0 h-auto text-primary">
                  Découvrez nos abonnements
                </Button>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={() => setShowPayment(false)}
              variant="ghost"
              className="mb-4"
            >
              ← Retour
            </Button>

            <CinePayPaymentMethod
              amount={pricePerListing}
              description="Paiement pour annonce supplémentaire"
              paymentType="paid_listing"
              currency="XOF"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};