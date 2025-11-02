import { useNavigate } from "react-router-dom";
import { LogIn, Lock, Heart, MessageCircle, Home, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AuthPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: "favorite" | "message" | "listing" | "general";
  title?: string;
  description?: string;
}

export const AuthPrompt = ({ 
  open, 
  onOpenChange, 
  action = "general",
  title,
  description 
}: AuthPromptProps) => {
  const navigate = useNavigate();

  const config = {
    favorite: {
      icon: Heart,
      color: "text-red-500",
      defaultTitle: "Sauvegarder vos favoris",
      defaultDescription: "Connectez-vous pour sauvegarder vos biens préférés et y accéder à tout moment",
    },
    message: {
      icon: MessageCircle,
      color: "text-blue-500",
      defaultTitle: "Envoyer des messages",
      defaultDescription: "Connectez-vous pour contacter les propriétaires et échanger en toute sécurité",
    },
    listing: {
      icon: Home,
      color: "text-green-500",
      defaultTitle: "Publier une annonce",
      defaultDescription: "Connectez-vous pour publier vos biens immobiliers et toucher des milliers d'acheteurs",
    },
    general: {
      icon: Lock,
      color: "text-primary",
      defaultTitle: "Connexion requise",
      defaultDescription: "Vous devez être connecté pour accéder à cette fonctionnalité",
    },
  };

  const currentConfig = config[action];
  const Icon = currentConfig.icon;
  const displayTitle = title || currentConfig.defaultTitle;
  const displayDescription = description || currentConfig.defaultDescription;

  const handleLogin = () => {
    onOpenChange(false);
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-primary/20 max-w-md p-0 overflow-hidden">
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 rounded-full glass-button z-10 ripple"
            onClick={() => onOpenChange(false)}
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </Button>

          <DialogHeader className="relative pt-8 px-8 pb-4">
            <div className="flex justify-center mb-6 animate-scale-in">
              <div className="relative">
                <div className={`absolute inset-0 ${currentConfig.color} rounded-full blur-2xl opacity-30 animate-pulse`} />
                <div className="glass-strong rounded-full p-6 relative z-10">
                  <Icon className={`w-12 h-12 ${currentConfig.color}`} />
                </div>
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              {displayTitle}
            </DialogTitle>
          </DialogHeader>

          <CardContent className="relative px-8 pb-8 space-y-6">
            <p className="text-center text-muted-foreground text-base leading-relaxed">
              {displayDescription}
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleLogin}
                className="w-full ripple text-base py-6"
                size="lg"
                aria-label="Se connecter"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Se connecter
              </Button>

              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full ripple"
                size="lg"
                aria-label="Annuler"
              >
                Annuler
              </Button>
            </div>

            {/* Benefits list */}
            <div className="glass rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-center mb-3">Avec un compte LaZone, vous pouvez :</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Sauvegarder vos biens préférés</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Contacter directement les propriétaires</span>
                </li>
                <li className="flex items-start gap-2">
                  <Home className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Publier vos propres annonces</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Inline version for use within pages (non-modal)
export const AuthPromptInline = ({ 
  action = "general",
  title,
  description 
}: Omit<AuthPromptProps, "open" | "onOpenChange">) => {
  const navigate = useNavigate();

  const config = {
    favorite: {
      icon: Heart,
      color: "text-red-500",
      defaultTitle: "Sauvegarder vos favoris",
      defaultDescription: "Connectez-vous pour sauvegarder vos biens préférés et y accéder à tout moment",
    },
    message: {
      icon: MessageCircle,
      color: "text-blue-500",
      defaultTitle: "Envoyer des messages",
      defaultDescription: "Connectez-vous pour contacter les propriétaires et échanger en toute sécurité",
    },
    listing: {
      icon: Home,
      color: "text-green-500",
      defaultTitle: "Publier une annonce",
      defaultDescription: "Connectez-vous pour publier vos biens immobiliers et toucher des milliers d'acheteurs",
    },
    general: {
      icon: Lock,
      color: "text-primary",
      defaultTitle: "Connexion requise",
      defaultDescription: "Vous devez être connecté pour accéder à cette fonctionnalité",
    },
  };

  const currentConfig = config[action];
  const Icon = currentConfig.icon;
  const displayTitle = title || currentConfig.defaultTitle;
  const displayDescription = description || currentConfig.defaultDescription;

  return (
    <Card className="glass-card border-primary/20 max-w-2xl mx-auto animate-fade-in">
      <CardContent className="py-12 px-8 space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className={`absolute inset-0 ${currentConfig.color} rounded-full blur-2xl opacity-30 animate-pulse`} />
            <div className="glass-strong rounded-full p-6 relative z-10">
              <Icon className={`w-12 h-12 ${currentConfig.color}`} />
            </div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            {displayTitle}
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
            {displayDescription}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={() => navigate("/auth")}
            className="ripple"
            size="lg"
            aria-label="Se connecter"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Se connecter
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="ripple"
            size="lg"
            aria-label="Retour à l'accueil"
          >
            Retour à l'accueil
          </Button>
        </div>

        {/* Benefits list */}
        <div className="glass rounded-lg p-4 space-y-2 max-w-md mx-auto">
          <p className="text-sm font-semibold text-center mb-3">Avec un compte LaZone, vous pouvez :</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Heart className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <span>Sauvegarder vos biens préférés</span>
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <span>Contacter directement les propriétaires</span>
            </li>
            <li className="flex items-start gap-2">
              <Home className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <span>Publier vos propres annonces</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
