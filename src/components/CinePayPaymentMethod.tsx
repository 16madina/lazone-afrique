import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Phone, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  country: string;
}

interface CinePayPaymentMethodProps {
  amount: number;
  description: string;
  paymentType: 'sponsorship' | 'subscription' | 'paid_listing';
  relatedId?: string;
  packageId?: string;
  subscriptionType?: string;
  currency?: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'ORANGE_MONEY_CI',
    name: 'Orange Money (Côte d\'Ivoire)',
    description: 'Paiement via Orange Money CI',
    icon: <Phone className="h-5 w-5 text-orange-500" />,
    country: 'CI'
  },
  {
    id: 'ORANGE_MONEY_SN',
    name: 'Orange Money (Sénégal)',
    description: 'Paiement via Orange Money SN',
    icon: <Phone className="h-5 w-5 text-orange-500" />,
    country: 'SN'
  },
  {
    id: 'WAVE_CI',
    name: 'Wave (Côte d\'Ivoire)',
    description: 'Paiement via Wave CI',
    icon: <Phone className="h-5 w-5 text-blue-500" />,
    country: 'CI'
  },
  {
    id: 'WAVE_SN',
    name: 'Wave (Sénégal)',
    description: 'Paiement via Wave SN',
    icon: <Phone className="h-5 w-5 text-blue-500" />,
    country: 'SN'
  },
  {
    id: 'MOOV_CI',
    name: 'Moov Money (Côte d\'Ivoire)',
    description: 'Paiement via Moov Money CI',
    icon: <Phone className="h-5 w-5 text-blue-600" />,
    country: 'CI'
  },
  {
    id: 'MTN_CI',
    name: 'MTN Mobile Money (Côte d\'Ivoire)',
    description: 'Paiement via MTN Mobile Money CI',
    icon: <Phone className="h-5 w-5 text-yellow-500" />,
    country: 'CI'
  }
];

export const CinePayPaymentMethod = ({
  amount,
  description,
  paymentType,
  relatedId,
  packageId,
  subscriptionType,
  currency = 'XOF',
  onSuccess,
  onError
}: CinePayPaymentMethodProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const validatePhoneNumber = (phone: string, countryCode: string) => {
    // Validation basique selon le pays
    const cleanPhone = phone.replace(/\s+/g, '');
    
    if (countryCode === 'CI') {
      // Format ivoirien: +225 ou 225 suivi de 8-10 chiffres
      return /^(\+?225)?[0-9]{8,10}$/.test(cleanPhone);
    } else if (countryCode === 'SN') {
      // Format sénégalais: +221 ou 221 suivi de 7-9 chiffres
      return /^(\+?221)?[0-9]{7,9}$/.test(cleanPhone);
    }
    
    return /^(\+?[0-9]{1,4})?[0-9]{7,15}$/.test(cleanPhone);
  };

  const handlePayment = async () => {
    if (!selectedMethod || !phoneNumber) {
      toast.error('Veuillez sélectionner une méthode de paiement et saisir votre numéro');
      return;
    }

    const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
    if (!selectedPaymentMethod) {
      toast.error('Méthode de paiement invalide');
      return;
    }

    if (!validatePhoneNumber(phoneNumber, selectedPaymentMethod.country)) {
      toast.error('Numéro de téléphone invalide pour ce pays');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-cinetpay-payment', {
        body: {
          amount,
          description,
          payment_type: paymentType,
          related_id: relatedId,
          package_id: packageId,
          subscription_type: subscriptionType,
          currency,
          payment_method: selectedMethod,
          phone_number: phoneNumber
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.payment_url) {
        // Rediriger vers la page de paiement CinePay
        window.open(data.payment_url, '_blank');
        
        if (onSuccess) {
          onSuccess(data.transaction_id);
        }
        
        toast.success('Redirection vers la page de paiement...');
      } else {
        throw new Error('URL de paiement non reçue');
      }

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du paiement';
      toast.error(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const canProceed = selectedMethod && phoneNumber && !loading;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paiement Mobile Money
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Montant à payer: <span className="font-semibold">{formatAmount(amount, currency)}</span>
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="payment-methods">Choisir votre méthode de paiement</Label>
          <RadioGroup
            value={selectedMethod}
            onValueChange={setSelectedMethod}
            className="mt-2"
          >
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-2">
                <RadioGroupItem value={method.id} id={method.id} />
                <Label
                  htmlFor={method.id}
                  className="flex items-center gap-2 cursor-pointer flex-1 p-2 rounded-lg hover:bg-accent"
                >
                  {method.icon}
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-xs text-muted-foreground">{method.description}</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {selectedMethod && (
          <div>
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Ex: +225 01 02 03 04 05"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Entrez le numéro associé à votre compte mobile money
            </p>
          </div>
        )}

        <Button
          onClick={handlePayment}
          disabled={!canProceed}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            `Payer ${formatAmount(amount, currency)}`
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Paiement sécurisé par CinePay</p>
          <p>Vous serez redirigé vers votre application mobile money</p>
        </div>
      </CardContent>
    </Card>
  );
};