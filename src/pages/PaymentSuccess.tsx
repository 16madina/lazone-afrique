import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, Home, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'loading';

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    if (transactionId) {
      checkPaymentStatus();
    } else {
      setStatus('failed');
    }
  }, [transactionId]);

  const checkPaymentStatus = async () => {
    if (!transactionId) return;

    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-cinetpay-payment', {
        body: { transaction_id: transactionId }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.status === 'completed') {
        setStatus('completed');
        toast.success('Paiement confirmé avec succès!');
      } else if (data?.status === 'failed') {
        setStatus('failed');
        toast.error('Le paiement a échoué.');
      } else {
        setStatus('pending');
      }

      // Récupérer les détails de la transaction
      const { data: transaction } = await supabase
        .rpc('get_payment_status', { transaction_id: transactionId });
      
      if (transaction && transaction.length > 0) {
        setTransactionDetails(transaction[0]);
      }

    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('failed');
      toast.error('Erreur lors de la vérification du paiement');
    } finally {
      setChecking(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <RefreshCw className="h-16 w-16 text-blue-500 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return {
          title: 'Paiement réussi!',
          description: 'Votre transaction a été traitée avec succès.',
          badge: { text: 'Confirmé', variant: 'default' as const }
        };
      case 'pending':
        return {
          title: 'Paiement en attente',
          description: 'Votre paiement est en cours de traitement. Vous recevrez une confirmation sous peu.',
          badge: { text: 'En cours', variant: 'secondary' as const }
        };
      case 'failed':
        return {
          title: 'Paiement échoué',
          description: 'Une erreur s\'est produite lors du traitement de votre paiement.',
          badge: { text: 'Échoué', variant: 'destructive' as const }
        };
      default:
        return {
          title: 'Vérification du paiement...',
          description: 'Nous vérifions le statut de votre paiement.',
          badge: { text: 'Vérification', variant: 'outline' as const }
        };
    }
  };

  const getPaymentTypeLabel = (paymentType: string) => {
    switch (paymentType) {
      case 'sponsorship':
        return 'Sponsorisation d\'annonce';
      case 'subscription':
        return 'Abonnement';
      case 'paid_listing':
        return 'Annonce payante';
      default:
        return 'Paiement';
    }
  };

  const statusInfo = getStatusText();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <CardTitle className="text-2xl">{statusInfo.title}</CardTitle>
              <CardDescription className="text-base">
                {statusInfo.description}
              </CardDescription>
              <Badge variant={statusInfo.badge.variant} className="w-fit mx-auto mt-2">
                {statusInfo.badge.text}
              </Badge>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {transactionDetails && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium">Détails de la transaction</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID de transaction:</span>
                      <span className="font-mono">{transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{getPaymentTypeLabel(transactionDetails.payment_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Montant:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: transactionDetails.currency,
                        }).format(transactionDetails.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{new Date(transactionDetails.created_at).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              )}

              {status === 'pending' && (
                <div className="text-center">
                  <Button
                    onClick={checkPaymentStatus}
                    disabled={checking}
                    variant="outline"
                    className="mb-4"
                  >
                    {checking ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Vérifier à nouveau
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Retour à l'accueil
                </Button>
                
                {(status === 'completed' || status === 'pending') && transactionDetails?.payment_type === 'sponsorship' && (
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="outline"
                  >
                    Voir mes annonces
                  </Button>
                )}
                
                {status === 'failed' && (
                  <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                  >
                    Réessayer
                  </Button>
                )}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Si vous avez des questions concernant cette transaction, 
                  contactez notre support avec l'ID de transaction.
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