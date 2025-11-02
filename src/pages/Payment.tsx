import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const transactionId = searchParams.get("transaction_id");
  const [processing, setProcessing] = useState(false);

  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          title: "Paiement réussi",
          description: "Votre paiement a été traité avec succès",
          badge: "Confirmé",
          badgeVariant: "default" as const,
        };
      case "failed":
        return {
          icon: XCircle,
          color: "text-red-500",
          title: "Paiement échoué",
          description: "Une erreur s'est produite lors du traitement de votre paiement",
          badge: "Échoué",
          badgeVariant: "destructive" as const,
        };
      case "pending":
        return {
          icon: Loader2,
          color: "text-yellow-500 animate-spin",
          title: "Paiement en cours",
          description: "Votre paiement est en cours de traitement",
          badge: "En attente",
          badgeVariant: "secondary" as const,
        };
      default:
        return {
          icon: CreditCard,
          color: "text-primary",
          title: "Paiements",
          description: "Gérez vos transactions et méthodes de paiement",
          badge: "Actif",
          badgeVariant: "outline" as const,
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const handleRetry = () => {
    setProcessing(true);
    setTimeout(() => {
      toast({
        title: "Redirection",
        description: "Redirection vers la page de paiement...",
      });
      setProcessing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-24 pb-32">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 ripple"
          aria-label="Retour"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="glass-card rounded-2xl p-8 mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Paiements
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Gérez vos transactions et méthodes de paiement en toute sécurité
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="text-center animate-fade-in" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="glass-button p-4 rounded-full">
                  <StatusIcon className={`w-16 h-16 ${config.color}`} />
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 mb-2">
                <CardTitle className="text-2xl">{config.title}</CardTitle>
                <Badge variant={config.badgeVariant}>{config.badge}</Badge>
              </div>
              <CardDescription className="text-base">{config.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {transactionId && (
                <div className="glass p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">ID de transaction</p>
                  <p className="font-mono font-semibold">{transactionId}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {status === "failed" && (
                  <Button
                    onClick={handleRetry}
                    disabled={processing}
                    className="ripple"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Réessayer le paiement
                      </>
                    )}
                  </Button>
                )}
                {status === "success" && (
                  <Button onClick={() => navigate("/")} className="ripple">
                    Retour à l'accueil
                  </Button>
                )}
                {!status && (
                  <Button onClick={() => navigate("/profile")} className="ripple">
                    Voir mes transactions
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {!status && (
            <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <CardHeader>
                <CardTitle>Méthodes de paiement disponibles</CardTitle>
                <CardDescription>Nous acceptons plusieurs modes de paiement sécurisés</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "CinetPay", description: "Mobile Money, Cartes bancaires" },
                  { name: "Orange Money", description: "Paiement mobile instantané" },
                  { name: "MTN Mobile Money", description: "Paiement mobile rapide" },
                  { name: "Moov Money", description: "Transfert mobile sécurisé" },
                ].map((method, index) => (
                  <div
                    key={index}
                    className="glass-button p-4 rounded-lg flex items-center justify-between hover:shadow-elevation-3 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                  >
                    <div>
                      <p className="font-semibold">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
