import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Phone, CreditCard, Building2, Smartphone, Zap } from 'lucide-react';
import { CinePayPaymentMethod } from '@/components/CinePayPaymentMethod';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requiresPhone?: boolean;
  requiresCard?: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
  onPhoneNumberChange: (phone: string) => void;
  onCardNumberChange: (cardNumber: string) => void;
  onConfirm: () => void;
  loading: boolean;
  amount: number;
  formatPrice?: (amount: number) => string;
  // Nouvelles props pour CinePay
  description?: string;
  paymentType?: 'sponsorship' | 'subscription' | 'paid_listing';
  relatedId?: string;
  packageId?: string;
  subscriptionType?: string;
  currency?: string;
  onPaymentSuccess?: (transactionId: string) => void;
  // Props pour l'ancien système
  phoneNumber?: string;
  cardNumber?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'cinetpay_mobile',
    name: 'Mobile Money (CinePay)',
    description: 'Orange Money, Wave, MTN, Moov Money',
    icon: <Phone className="h-5 w-5 text-orange-500" />,
    requiresPhone: false // Géré par le composant CinePay
  },
  {
    id: 'card',
    name: 'Carte Visa/Mastercard',
    description: 'Paiement par carte bancaire via Stripe',
    icon: <CreditCard className="h-5 w-5 text-gray-600" />,
    requiresCard: true
  },
  {
    id: 'bank_transfer',
    name: 'Virement bancaire',
    description: 'Paiement par virement',
    icon: <Building2 className="h-5 w-5 text-green-600" />
  }
];

export const PaymentMethodSelector = ({
  selectedMethod,
  onMethodSelect,
  onPhoneNumberChange,
  onCardNumberChange,
  onConfirm,
  loading,
  amount,
  formatPrice = (amount) => `${amount} FCFA`,
  description = 'Paiement',
  paymentType = 'sponsorship',
  relatedId,
  packageId,
  subscriptionType,
  currency = 'XOF',
  onPaymentSuccess,
  phoneNumber = '',
  cardNumber = ''
}: PaymentMethodSelectorProps) => {

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
  const canConfirm = selectedMethod && 
    (!selectedPaymentMethod?.requiresPhone || phoneNumber.trim()) &&
    (!selectedPaymentMethod?.requiresCard || cardNumber.trim());

  // Si CinePay mobile money est sélectionné, afficher le composant CinePay
  if (selectedMethod === 'cinetpay_mobile') {
    return (
      <CinePayPaymentMethod
        amount={amount}
        description={description}
        paymentType={paymentType}
        relatedId={relatedId}
        packageId={packageId}
        subscriptionType={subscriptionType}
        currency={currency}
        onSuccess={onPaymentSuccess}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Méthode de paiement</CardTitle>
        <CardDescription>
          Choisissez votre méthode de paiement préférée pour {formatPrice(amount)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Sélectionnez une méthode de paiement</Label>
          <RadioGroup 
            value={selectedMethod} 
            onValueChange={onMethodSelect}
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

        {selectedMethod && selectedMethod !== 'cinetpay_mobile' && (
          <>
            {paymentMethods.find(m => m.id === selectedMethod)?.requiresPhone && (
              <div>
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ex: +225 01 02 03 04 05"
                  value={phoneNumber}
                  onChange={(e) => onPhoneNumberChange(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}

            {paymentMethods.find(m => m.id === selectedMethod)?.requiresCard && (
              <div>
                <Label htmlFor="card">Numéro de carte</Label>
                <Input
                  id="card"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => onCardNumberChange(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}

            {selectedMethod === 'bank_transfer' && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Instructions de virement</h4>
                <p className="text-sm text-muted-foreground">
                  Effectuez le virement sur le compte suivant :<br />
                  IBAN: CI05 CI000000000000000000<br />
                  Titulaire: LAZONE SARL<br />
                  Référence: Votre email
                </p>
              </div>
            )}

            <Button
              onClick={onConfirm}
              disabled={!canConfirm || loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Traitement..." : `Confirmer ${formatPrice(amount)}`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;