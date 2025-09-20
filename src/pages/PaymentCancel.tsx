import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, ArrowLeft } from 'lucide-react';

export const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const transactionId = searchParams.get('transaction_id');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl">Paiement annulé</CardTitle>
              <CardDescription className="text-base">
                Votre transaction a été annulée. Aucun montant n'a été débité.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {transactionId && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium">Détails de la transaction</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID de transaction:</span>
                      <span className="font-mono">{transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut:</span>
                      <span className="text-red-600 font-medium">Annulée</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Vous pouvez réessayer le paiement à tout moment ou choisir une autre méthode de paiement.
                </p>
                
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Réessayer
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Retour à l'accueil
                  </Button>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Si vous rencontrez des difficultés avec le paiement, 
                  n'hésitez pas à contacter notre support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};