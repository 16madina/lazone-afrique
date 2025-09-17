import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, Smartphone, Building, Wallet } from "lucide-react";

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requiresPhone?: boolean;
  requiresCard?: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodSelect: (methodId: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (phone: string) => void;
  cardNumber: string;
  onCardNumberChange: (card: string) => void;
  onConfirm: () => void;
  loading: boolean;
  amount: number;
  formatPrice: (amount: number) => string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "orange_money",
    name: "Orange Money",
    description: "Paiement via Orange Money",
    icon: <Smartphone className="h-5 w-5 text-orange-500" />,
    requiresPhone: true,
  },
  {
    id: "mtn_money",
    name: "MTN Mobile Money",
    description: "Paiement via MTN Mobile Money",
    icon: <Smartphone className="h-5 w-5 text-yellow-500" />,
    requiresPhone: true,
  },
  {
    id: "moov_money",
    name: "Moov Money",
    description: "Paiement via Moov Money",
    icon: <Smartphone className="h-5 w-5 text-blue-500" />,
    requiresPhone: true,
  },
  {
    id: "wave",
    name: "Wave",
    description: "Paiement via Wave",
    icon: <Wallet className="h-5 w-5 text-purple-500" />,
    requiresPhone: true,
  },
  {
    id: "visa_mastercard",
    name: "Carte bancaire",
    description: "Visa, Mastercard",
    icon: <CreditCard className="h-5 w-5 text-blue-600" />,
    requiresCard: true,
  },
  {
    id: "bank_transfer",
    name: "Virement bancaire",
    description: "Virement bancaire direct",
    icon: <Building className="h-5 w-5 text-gray-600" />,
  },
];

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  phoneNumber,
  onPhoneNumberChange,
  cardNumber,
  onCardNumberChange,
  onConfirm,
  loading,
  amount,
  formatPrice,
}) => {
  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
  const canConfirm = selectedMethod && 
    (!selectedPaymentMethod?.requiresPhone || phoneNumber.trim()) &&
    (!selectedPaymentMethod?.requiresCard || cardNumber.trim());

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Choisir un mode de paiement
        </CardTitle>
        <CardDescription>
          Sélectionnez votre mode de paiement préféré pour {formatPrice(amount)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedMethod} onValueChange={onMethodSelect}>
          <div className="grid gap-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-3">
                <RadioGroupItem value={method.id} id={method.id} />
                <Label
                  htmlFor={method.id}
                  className="flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  {method.icon}
                  <div className="flex-1">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {/* Phone number input for mobile money */}
        {selectedPaymentMethod?.requiresPhone && (
          <div className="space-y-2">
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Exemple: +225 07 12 34 56 78"
              value={phoneNumber}
              onChange={(e) => onPhoneNumberChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Entrez le numéro associé à votre compte {selectedPaymentMethod.name}
            </p>
          </div>
        )}

        {/* Card number input for card payments */}
        {selectedPaymentMethod?.requiresCard && (
          <div className="space-y-2">
            <Label htmlFor="card">Numéro de carte</Label>
            <Input
              id="card"
              type="text"
              placeholder="**** **** **** ****"
              value={cardNumber}
              onChange={(e) => onCardNumberChange(e.target.value)}
              maxLength={19}
            />
            <p className="text-sm text-muted-foreground">
              Entrez les 16 chiffres de votre carte bancaire
            </p>
          </div>
        )}

        {/* Bank transfer instructions */}
        {selectedMethod === "bank_transfer" && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Instructions pour le virement</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p><strong>Bénéficiaire:</strong> LaZone Real Estate</p>
              <p><strong>Compte:</strong> 123456789</p>
              <p><strong>Banque:</strong> Banque Atlantique CI</p>
              <p><strong>Montant:</strong> {formatPrice(amount)}</p>
            </div>
          </div>
        )}

        <Button
          onClick={onConfirm}
          disabled={loading || !canConfirm}
          className="w-full"
          size="lg"
        >
          {loading ? "Traitement en cours..." : `Payer ${formatPrice(amount)}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;